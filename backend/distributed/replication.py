"""
Data Replication Manager

Handles replication of data across nodes for fault tolerance and availability.
"""

from typing import List, Dict, Any
import time
import threading

class ReplicationManager:
    """Manages data replication across nodes"""
    
    def __init__(self, primary_node_id: int):
        self.primary_node_id = primary_node_id
        self.replica_nodes = []
        self.replication_log = []
        self.lock = threading.Lock()
    
    def add_replica(self, node_id: int):
        """Add replica node"""
        with self.lock:
            if node_id not in self.replica_nodes:
                self.replica_nodes.append(node_id)
    
    def remove_replica(self, node_id: int):
        """Remove replica node"""
        with self.lock:
            if node_id in self.replica_nodes:
                self.replica_nodes.remove(node_id)
    
    def replicate(self, data: Dict[str, Any], sync: bool = False) -> Dict:
        """
        Replicate data to all replica nodes
        
        Args:
            data: Data to replicate
            sync: If True, wait for all replicas (strong consistency)
                  If False, async replication (eventual consistency)
        """
        replication_record = {
            "data": data,
            "timestamp": time.time(),
            "replicated_to": [],
            "sync": sync
        }
        
        with self.lock:
            self.replication_log.append(replication_record)
        
        if sync:
            # Synchronous replication - wait for all
            for replica_id in self.replica_nodes:
                # Simulate replication
                replication_record["replicated_to"].append(replica_id)
        else:
            # Asynchronous replication - fire and forget
            for replica_id in self.replica_nodes:
                # Simulate async replication
                threading.Thread(
                    target=self._async_replicate,
                    args=(replica_id, data, replication_record)
                ).start()
        
        return replication_record
    
    def _async_replicate(self, replica_id: int, data: Dict, record: Dict):
        """Async replication worker"""
        time.sleep(0.01)  # Simulate network delay
        record["replicated_to"].append(replica_id)
    
    def get_replication_status(self) -> Dict:
        """Get replication status"""
        return {
            "primary": self.primary_node_id,
            "replicas": self.replica_nodes,
            "total_replications": len(self.replication_log)
        }
