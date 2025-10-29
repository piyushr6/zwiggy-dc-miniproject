"""
Replica Databases

Handle read operations with eventual consistency.
Replicas receive updates from primary database with some lag,
demonstrating eventual consistency in distributed systems.
"""

import sqlite3
import threading
import time
import json
from typing import Dict, List, Any, Optional
from pathlib import Path

class ReplicaDatabase:
    """Replica database for read operations"""
    
    def __init__(self, replica_id: int, db_path: str = None):
        self.replica_id = replica_id
        self.db_path = db_path or f"replica_{replica_id}_food_delivery.db"
        self.connection = None
        self.lock = threading.Lock()
        self.last_sync_timestamp = 0
        self.replication_lag_ms = 0
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize replica database with same schema as primary"""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        
        # Create same schema as primary
        self._create_schema()
        
        print(f"✓ Replica {self.replica_id} initialized: {self.db_path}")
    
    def _create_schema(self):
        """Create database schema (same as primary)"""
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
        
        self.connection.commit()
    
    def read(self, table: str, conditions: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """
        Read from replica (eventual consistency)
        
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
            print(f"Error reading from replica {self.replica_id}: {e}")
            return []
    
    def replicate_write(self, write_record: Dict) -> bool:
        """
        Apply write from primary to replica
        
        Args:
            write_record: Write operation details
        
        Returns:
            bool: Success status
        """
        with self.lock:
            try:
                start_time = time.time()
                
                cursor = self.connection.cursor()
                operation = write_record['operation']
                table = write_record['table']
                data = write_record['data']
                
                if operation == 'INSERT':
                    # Insert into replica
                    columns = ', '.join(data.keys())
                    placeholders = ', '.join(['?' for _ in data])
                    query = f"INSERT OR REPLACE INTO {table} ({columns}) VALUES ({placeholders})"
                    cursor.execute(query, list(data.values()))
                
                elif operation == 'UPDATE':
                    # Update replica
                    record_id = write_record['record_id']
                    set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
                    query = f"UPDATE {table} SET {set_clause} WHERE id = ?"
                    values = list(data.values()) + [record_id]
                    cursor.execute(query, values)
                
                self.connection.commit()
                
                # Update sync timestamp and calculate lag
                self.last_sync_timestamp = write_record['timestamp']
                self.replication_lag_ms = (time.time() - write_record['timestamp']) * 1000
                
                return True
            
            except Exception as e:
                print(f"Error replicating to replica {self.replica_id}: {e}")
                self.connection.rollback()
                return False
    
    def sync_from_primary(self, primary_db, async_mode: bool = True):
        """
        Sync data from primary database
        
        Args:
            primary_db: Primary database instance
            async_mode: If True, simulate async replication with delay
        """
        if async_mode:
            # Simulate network delay for eventual consistency
            time.sleep(0.05)  # 50ms delay
        
        # Get writes since last sync
        writes = primary_db.get_write_log(since_timestamp=self.last_sync_timestamp)
        
        for write in writes:
            self.replicate_write(write)
        
        print(f"✓ Replica {self.replica_id} synced: {len(writes)} operations, "
              f"lag: {self.replication_lag_ms:.1f}ms")
    
    def get_replication_lag(self) -> float:
        """Get current replication lag in milliseconds"""
        return self.replication_lag_ms
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """Execute custom SQL query (read-only)"""
        if not query.strip().upper().startswith('SELECT'):
            raise ValueError("Only SELECT queries allowed on replicas")
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            print(f"Error executing query on replica {self.replica_id}: {e}")
            return []
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print(f"✓ Replica {self.replica_id} connection closed")


# Global replica database instances
replica_dbs = [
    ReplicaDatabase(replica_id=1),
    ReplicaDatabase(replica_id=2),
    ReplicaDatabase(replica_id=3)
]
