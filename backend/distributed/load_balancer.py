# FILE: backend/distributed/load_balancer.py
# ============================================================================

from typing import List, Dict
import threading

class LoadBalancer:
    """Load balancing algorithms for request distribution"""
    
    def __init__(self, strategy: str = "round_robin"):
        self.strategy = strategy
        self.current_index = 0
        self.lock = threading.Lock()
    
    def select_node(self, nodes: List) -> any:
        """Select node based on strategy"""
        active_nodes = [n for n in nodes if getattr(n, 'is_active', True)]
        
        if not active_nodes:
            return None
        
        if self.strategy == "round_robin":
            return self._round_robin(active_nodes)
        elif self.strategy == "least_connections":
            return self._least_connections(active_nodes)
        elif self.strategy == "random":
            import random
            return random.choice(active_nodes)
        
        return active_nodes[0]
    
    def _round_robin(self, nodes: List) -> any:
        """Round-robin selection"""
        with self.lock:
            node = nodes[self.current_index % len(nodes)]
            self.current_index += 1
            return node
    
    def _least_connections(self, nodes: List) -> any:
        """Select node with least connections"""
        return min(nodes, key=lambda n: getattr(n, 'request_count', 0))
    
    def get_distribution_stats(self, nodes: List) -> Dict:
        """Get request distribution statistics"""
        total_requests = sum(getattr(n, 'request_count', 0) for n in nodes)
        
        stats = {}
        for node in nodes:
            node_id = getattr(node, 'node_id', 'unknown')
            request_count = getattr(node, 'request_count', 0)
            
            stats[f"node_{node_id}"] = {
                "node_id": node_id,
                "request_count": request_count,
                "percentage": (request_count / total_requests * 100) if total_requests > 0 else 0
            }
        
        return stats