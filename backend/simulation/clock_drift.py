import time
import random

class ClockDriftSimulator:
    """Simulates clock drift between nodes"""
    
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        self.drift_offsets = {}
    
    def apply_random_drift(self):
        """Apply random drift to each node's clock"""
        for node in self.nodes:
            # Random drift between -100ms to +100ms
            drift_ms = random.randint(-100, 100)
            self.drift_offsets[node.node_id] = drift_ms
            
            node.log_event("CLOCK_DRIFT", 
                f"Clock drift applied: {drift_ms}ms")
    
    def get_physical_time_with_drift(self, node_id: int) -> float:
        """Get physical time with simulated drift"""
        base_time = time.time()
        drift_ms = self.drift_offsets.get(node_id, 0)
        return base_time + (drift_ms / 1000.0)

