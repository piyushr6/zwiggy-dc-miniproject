# FILE: backend/distributed/consistency.py
# ============================================================================

from typing import Any, Dict, List
import time
import copy

class ConsistencyManager:
    """Manages different consistency models"""
    
    def __init__(self, node: DistributedNode, mode: str = "strong"):
        self.node = node
        self.mode = mode  # strong, eventual, quorum
        self.write_log = []
        self.version_vector = {}
    
    def write(self, key: str, value: Any, replicas: List[int]) -> Dict:
        """Write data with consistency guarantees"""
        logical_time = self.node.clock.tick()
        
        write_record = {
            "key": key,
            "value": value,
            "timestamp": time.time(),
            "logical_time": logical_time,
            "node_id": self.node.node_id
        }
        
        if self.mode == "strong":
            return self._strong_consistency_write(write_record, replicas)
        elif self.mode == "eventual":
            return self._eventual_consistency_write(write_record, replicas)
        elif self.mode == "quorum":
            return self._quorum_write(write_record, replicas)
    
    def _strong_consistency_write(self, record: Dict, replicas: List[int]) -> Dict:
        """Strong consistency: Wait for all replicas"""
        self.node.log_event("WRITE_STRONG", 
            f"Writing {record['key']} with strong consistency")
        
        # Write to primary (self)
        self.write_log.append(record)
        
        # Replicate to all replicas synchronously
        acks = [self.node.node_id]
        for replica_id in replicas:
            if replica_id != self.node.node_id:
                message = {
                    "type": "REPLICATE",
                    "data": record,
                    "mode": "strong"
                }
                message_queue.send_message(replica_id, message)
                acks.append(replica_id)
                
                self.node.log_event("REPLICATION_SYNC", 
                    f"Replicated to Node {replica_id}")
        
        return {
            "success": True,
            "mode": "strong",
            "acks": acks,
            "latency_ms": 50  # Simulated
        }
    
    def _eventual_consistency_write(self, record: Dict, replicas: List[int]) -> Dict:
        """Eventual consistency: Async replication"""
        self.node.log_event("WRITE_EVENTUAL", 
            f"Writing {record['key']} with eventual consistency")
        
        # Write to primary immediately
        self.write_log.append(record)
        
        # Replicate asynchronously (fire and forget)
        for replica_id in replicas:
            if replica_id != self.node.node_id:
                message = {
                    "type": "REPLICATE",
                    "data": record,
                    "mode": "eventual"
                }
                message_queue.send_message(replica_id, message)
        
        return {
            "success": True,
            "mode": "eventual",
            "acks": [self.node.node_id],
            "latency_ms": 10  # Much faster
        }
    
    def _quorum_write(self, record: Dict, replicas: List[int]) -> Dict:
        """Quorum: Wait for majority"""
        self.node.log_event("WRITE_QUORUM", 
            f"Writing {record['key']} with quorum consistency")
        
        from backend.config import Config
        
        self.write_log.append(record)
        acks = [self.node.node_id]
        
        # Replicate and wait for quorum
        for replica_id in replicas:
            if replica_id != self.node.node_id:
                message = {
                    "type": "REPLICATE",
                    "data": record,
                    "mode": "quorum"
                }
                message_queue.send_message(replica_id, message)
                acks.append(replica_id)
                
                if len(acks) >= Config.QUORUM_SIZE:
                    break
        
        return {
            "success": len(acks) >= Config.QUORUM_SIZE,
            "mode": "quorum",
            "acks": acks,
            "latency_ms": 30
        }
    
    def read(self, key: str) -> Any:
        """Read data based on consistency mode"""
        # Find latest write for key
        for record in reversed(self.write_log):
            if record["key"] == key:
                return record["value"]
        return None