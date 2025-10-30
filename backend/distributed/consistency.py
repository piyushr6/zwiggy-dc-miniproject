# FILE: backend/distributed/consistency.py
# ============================================================================

from typing import Any, Dict, List
import time

class ConsistencyManager:
    """Manages different consistency models"""
    
    def __init__(self, node, mode: str = "strong"):
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
        else:
            return self._strong_consistency_write(write_record, replicas)
    
    def _strong_consistency_write(self, record: Dict, replicas: List[int]) -> Dict:
        """Strong consistency: Wait for all replicas"""
        self.node.log_event("WRITE_STRONG", 
            f"Writing {record['key']} with strong consistency")
        
        self.write_log.append(record)
        acks = [self.node.node_id]
        
        for replica_id in replicas:
            if replica_id != self.node.node_id:
                acks.append(replica_id)
                self.node.log_event("REPLICATION_SYNC", 
                    f"Replicated to Node {replica_id}")
        
        return {
            "success": True,
            "mode": "strong",
            "acks": acks,
            "latency_ms": 50
        }
    
    def _eventual_consistency_write(self, record: Dict, replicas: List[int]) -> Dict:
        """Eventual consistency: Async replication"""
        self.node.log_event("WRITE_EVENTUAL", 
            f"Writing {record['key']} with eventual consistency")
        
        self.write_log.append(record)
        
        for replica_id in replicas:
            if replica_id != self.node.node_id:
                self.node.log_event("REPLICATION_ASYNC", 
                    f"Async replication to Node {replica_id}")
        
        return {
            "success": True,
            "mode": "eventual",
            "acks": [self.node.node_id],
            "latency_ms": 10
        }
    
    def _quorum_write(self, record: Dict, replicas: List[int]) -> Dict:
        """Quorum: Wait for majority"""
        self.node.log_event("WRITE_QUORUM", 
            f"Writing {record['key']} with quorum consistency")
        
        self.write_log.append(record)
        acks = [self.node.node_id]
        
        quorum_size = (len(replicas) + 1) // 2 + 1
        
        for replica_id in replicas:
            if replica_id != self.node.node_id:
                acks.append(replica_id)
                self.node.log_event("REPLICATION_QUORUM", 
                    f"Quorum replication to Node {replica_id}")
                
                if len(acks) >= quorum_size:
                    break
        
        return {
            "success": len(acks) >= quorum_size,
            "mode": "quorum",
            "acks": acks,
            "latency_ms": 30
        }
    
    def read(self, key: str) -> Any:
        """Read data based on consistency mode"""
        for record in reversed(self.write_log):
            if record["key"] == key:
                return record["value"]
        return None