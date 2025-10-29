import time
import random

class FailureInjector:
    """Simulates node failures for testing"""
    
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
    
    def simulate_node_failure(self, node_id: int):
        """Simulate node failure"""
        for node in self.nodes:
            if node.node_id == node_id:
                node.is_active = False
                node.health_status = "failed"
                node.log_event("NODE_FAILURE", f"Node {node_id} failed")
                print(f"\n⚠️  NODE {node_id} FAILED ⚠️\n")
                break
    
    def simulate_node_recovery(self, node_id: int):
        """Simulate node recovery"""
        for node in self.nodes:
            if node.node_id == node_id:
                node.is_active = True
                node.health_status = "healthy"
                node.log_event("NODE_RECOVERY", f"Node {node_id} recovered")
                print(f"\n✅ NODE {node_id} RECOVERED ✅\n")
                break
    
    def random_failure(self, exclude_leader: bool = True):
        """Randomly fail a node"""
        eligible_nodes = [n for n in self.nodes if n.is_active]
        
        if exclude_leader:
            eligible_nodes = [n for n in eligible_nodes if not n.is_leader]
        
        if eligible_nodes:
            failed_node = random.choice(eligible_nodes)
            self.simulate_node_failure(failed_node.node_id)

