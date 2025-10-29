"""
Primary Database

Handles all write operations and serves as the source of truth.
All writes go through the primary database first, then replicated
to replica databases asynchronously or synchronously depending on
consistency requirements.
"""

import sqlite3
import threading
import time
import json
from typing import Dict, List, Any, Optional
from pathlib import Path

class PrimaryDatabase:
    """Primary database for all write operations"""
    
    def __init__(self, db_path: str = "primary_food_delivery.db"):
        self.db_path = db_path
        self.connection = None
        self.lock = threading.Lock()
        self.write_log = []  # Track all writes for replication
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database with schema"""
        # Create database file if it doesn't exist
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        
        # Read and execute schema
        schema_path = Path(__file__).parent / "migrations" / "init_schema.sql"
        
        if schema_path.exists():
            with open(schema_path, 'r') as f:
                schema_sql = f.read()
                self.connection.executescript(schema_sql)
                self.connection.commit()
        else:
            # Inline schema if file doesn't exist
            self._create_inline_schema()
        
        print(f"✓ Primary database initialized: {self.db_path}")
    
    def _create_inline_schema(self):
        """Create schema inline if migration file doesn't exist"""
        cursor = self.connection.cursor()
        
        # Restaurants table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS restaurants (
                restaurant_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                cuisine TEXT NOT NULL,
                rating REAL DEFAULT 0.0,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Menu items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS menu_items (
                item_id INTEGER PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                quantity_available INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
            )
        """)
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                restaurant_id INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                logical_timestamp INTEGER NOT NULL,
                processed_by_node INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
            )
        """)
        
        # Order items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                item_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id)
            )
        """)
        
        # Delivery agents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS delivery_agents (
                agent_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                is_available INTEGER DEFAULT 1,
                current_location TEXT,
                assigned_order_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Event log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                node_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                description TEXT,
                logical_time INTEGER NOT NULL,
                physical_time REAL NOT NULL,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Replication log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS replication_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation TEXT NOT NULL,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                data TEXT NOT NULL,
                replicated_to TEXT,
                timestamp REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.connection.commit()
        print("✓ Database schema created")
    
    def write(self, table: str, data: Dict[str, Any]) -> bool:
        """
        Write data to primary database
        
        Args:
            table: Table name
            data: Dictionary of column:value pairs
        
        Returns:
            bool: Success status
        """
        with self.lock:
            try:
                cursor = self.connection.cursor()
                
                # Build INSERT query
                columns = ', '.join(data.keys())
                placeholders = ', '.join(['?' for _ in data])
                query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
                
                cursor.execute(query, list(data.values()))
                self.connection.commit()
                
                # Log write for replication
                write_record = {
                    'operation': 'INSERT',
                    'table': table,
                    'data': data,
                    'timestamp': time.time()
                }
                self.write_log.append(write_record)
                
                # Store in replication log
                self._log_replication(write_record)
                
                return True
            
            except Exception as e:
                print(f"Error writing to primary database: {e}")
                self.connection.rollback()
                return False
    
    def update(self, table: str, record_id: str, updates: Dict[str, Any], 
               id_column: str = 'id') -> bool:
        """
        Update record in primary database
        
        Args:
            table: Table name
            record_id: Record identifier
            updates: Dictionary of column:value pairs to update
            id_column: Name of ID column
        
        Returns:
            bool: Success status
        """
        with self.lock:
            try:
                cursor = self.connection.cursor()
                
                # Build UPDATE query
                set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
                query = f"UPDATE {table} SET {set_clause} WHERE {id_column} = ?"
                
                values = list(updates.values()) + [record_id]
                cursor.execute(query, values)
                self.connection.commit()
                
                # Log write for replication
                write_record = {
                    'operation': 'UPDATE',
                    'table': table,
                    'record_id': record_id,
                    'data': updates,
                    'timestamp': time.time()
                }
                self.write_log.append(write_record)
                self._log_replication(write_record)
                
                return True
            
            except Exception as e:
                print(f"Error updating primary database: {e}")
                self.connection.rollback()
                return False
    
    def read(self, table: str, conditions: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """
        Read from primary database (strong consistency)
        
        Args:
            table: Table name
            conditions: WHERE conditions
        
        Returns:
            List of records as dictionaries
        """
        try:
            cursor = self.connection.cursor()
            
            query = f"SELECT * FROM {table}"
            
            if conditions:
                where_clause = ' AND '.join([f"{k} = ?" for k in conditions.keys()])
                query += f" WHERE {where_clause}"
                cursor.execute(query, list(conditions.values()))
            else:
                cursor.execute(query)
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            print(f"Error reading from primary database: {e}")
            return []
    
    def _log_replication(self, write_record: Dict):
        """Log write operation for replication tracking"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("""
                INSERT INTO replication_log (operation, table_name, record_id, data, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (
                write_record['operation'],
                write_record['table'],
                write_record.get('record_id', ''),
                json.dumps(write_record['data']),
                write_record['timestamp']
            ))
            self.connection.commit()
        except Exception as e:
            print(f"Error logging replication: {e}")
    
    def get_write_log(self, since_timestamp: float = 0) -> List[Dict]:
        """Get write log for replication"""
        return [w for w in self.write_log if w['timestamp'] > since_timestamp]
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """Execute custom SQL query"""
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            
            if query.strip().upper().startswith('SELECT'):
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
            else:
                self.connection.commit()
                return []
        
        except Exception as e:
            print(f"Error executing query: {e}")
            return []
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("✓ Primary database connection closed")


# Global primary database instance
primary_db = PrimaryDatabase()