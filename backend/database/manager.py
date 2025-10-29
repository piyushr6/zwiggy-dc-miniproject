"""
Database Manager

Coordinates operations between primary and replica databases.
Implements different consistency models and handles replication.
"""

import threading
import time
from typing import Dict, List, Any, Optional
from enum import Enum

class ConsistencyLevel(Enum):
    """Consistency levels for read operations"""
    STRONG = "strong"          # Read from primary
    EVENTUAL = "eventual"      # Read from replica
    READ_YOUR_WRITES = "read_your_writes"  # Read from primary if recent write


class DatabaseManager:
    """Manages primary-replica database operations"""
    
    def __init__(self, primary_db, replica_dbs):
        self.primary = primary_db
        self.replicas = replica_dbs
        self.current_replica_index = 0
        self.lock = threading.Lock()
        self.recent_writes = {}  # Track recent writes per session
        
        # Start background replication thread
        self.replication_thread = threading.Thread(
            target=self._replication_worker,
            daemon=True
        )
        self.replication_thread.start()
    
    def write(self, table: str, data: Dict[str, Any], 
              consistency: str = "strong") -> bool:
        """
        Write data to primary database
        
        Args:
            table: Table name
            data: Data to write
            consistency: "strong" for sync replication, "eventual" for async
        
        Returns:
            bool: Success status
        """
        # Always write to primary
        success = self.primary.write(table, data)
        
        if success:
            # Track write timestamp for read-your-writes
            session_id = threading.current_thread().ident
            if session_id not in self.recent_writes:
                self.recent_writes[session_id] = []
            
            self.recent_writes[session_id].append({
                'table': table,
                'timestamp': time.time()
            })
            
            # Strong consistency: replicate immediately
            if consistency == "strong":
                for replica in self.replicas:
                    replica.sync_from_primary(self.primary, async_mode=False)
            # Eventual consistency: async replication (done by background thread)
        
        return success
    
    def update(self, table: str, record_id: str, updates: Dict[str, Any],
               id_column: str = 'id', consistency: str = "strong") -> bool:
        """
        Update record in primary database
        
        Args:
            table: Table name
            record_id: Record identifier
            updates: Updates to apply
            id_column: ID column name
            consistency: Consistency level
        
        Returns:
            bool: Success status
        """
        success = self.primary.update(table, record_id, updates, id_column)
        
        if success:
            session_id = threading.current_thread().ident
            if session_id not in self.recent_writes:
                self.recent_writes[session_id] = []
            
            self.recent_writes[session_id].append({
                'table': table,
                'timestamp': time.time()
            })
            
            if consistency == "strong":
                for replica in self.replicas:
                    replica.sync_from_primary(self.primary, async_mode=False)
        
        return success
    
    def read(self, table: str, conditions: Optional[Dict[str, Any]] = None,
             consistency: ConsistencyLevel = ConsistencyLevel.EVENTUAL) -> List[Dict]:
        """
        Read data with specified consistency level
        
        Args:
            table: Table name
            conditions: WHERE conditions
            consistency: Consistency level
        
        Returns:
            List of records
        """
        if consistency == ConsistencyLevel.STRONG:
            # Strong consistency: read from primary
            return self.primary.read(table, conditions)
        
        elif consistency == ConsistencyLevel.READ_YOUR_WRITES:
            # Check if this session has recent writes
            session_id = threading.current_thread().ident
            recent_writes = self.recent_writes.get(session_id, [])
            
            # If recent write to this table, read from primary
            recent_threshold = time.time() - 1.0  # 1 second
            has_recent_write = any(
                w['table'] == table and w['timestamp'] > recent_threshold
                for w in recent_writes
            )
            
            if has_recent_write:
                return self.primary.read(table, conditions)
            else:
                # No recent writes, can read from replica
                return self._read_from_replica(table, conditions)
        
        else:  # EVENTUAL consistency
            # Read from replica
            return self._read_from_replica(table, conditions)
    
    def _read_from_replica(self, table: str, 
                          conditions: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """Read from replica using round-robin"""
        with self.lock:
            replica = self.replicas[self.current_replica_index]
            self.current_replica_index = (self.current_replica_index + 1) % len(self.replicas)
        
        return replica.read(table, conditions)
    
    def _replication_worker(self):
        """Background thread for async replication"""
        while True:
            try:
                # Sync all replicas periodically
                for replica in self.replicas:
                    replica.sync_from_primary(self.primary, async_mode=True)
                
                # Sleep before next sync
                time.sleep(0.1)  # Sync every 100ms
            
            except Exception as e:
                print(f"Error in replication worker: {e}")
                time.sleep(1)
    
    def get_replication_status(self) -> Dict:
        """Get replication status for all replicas"""
        return {
            'primary': {
                'status': 'healthy',
                'write_log_size': len(self.primary.write_log)
            },
            'replicas': [
                {
                    'replica_id': replica.replica_id,
                    'lag_ms': replica.get_replication_lag(),
                    'last_sync': replica.last_sync_timestamp
                }
                for replica in self.replicas
            ]
        }
    
    def close_all(self):
        """Close all database connections"""
        self.primary.close()
        for replica in self.replicas:
            replica.close()


# Global database manager instance
from .primary_db import primary_db
from .replica_db import replica_dbs

db_manager = DatabaseManager(primary_db, replica_dbs)