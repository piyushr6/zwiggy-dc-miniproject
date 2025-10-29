# FILE: backend/distributed/load_balancer.py
# ============================================================================

from typing import List, Dict
import threading

from zwiggy.backend.core.node import DistributedNode

class LoadBalancer:
    """Load balancing algorithms for request distribution"""
    
    def __init__(self, strategy: str = "round_robin"):
        self.strategy = strategy
        self.current_index = 0
        self.lock = threading.Lock()
    
    def select_node(self, nodes: List[DistributedNode]) -> DistributedNode:
        """Select node based on strategy"""
        active_nodes = [n for n in nodes if n.is_active]
        
        if not active_nodes:
            return None
        
        if self.strategy == "round_robin":
            return self._round_robin(active_nodes)
        elif self.strategy == "least_connections":
            return self._least_connections(active_nodes)
        
        return active_nodes[0]
    
    def _round_robin(self, nodes: List[DistributedNode]) -> DistributedNode:
        """Round-robin selection"""
        with self.lock:
            node = nodes[self.current_index % len(nodes)]
            self.current_index += 1
            return node
    
    def _least_connections(self, nodes: List[DistributedNode]) -> DistributedNode:
        """Select node with least connections"""
        return min(nodes, key=lambda n: n.request_count)
    
    def get_distribution_stats(self, nodes: List[DistributedNode]) -> Dict:
        """Get request distribution statistics"""
        return {
            node.node_id: {
                "request_count": node.request_count,
                "percentage": (node.request_count / sum(n.request_count for n in nodes) * 100) 
                             if sum(n.request_count for n in nodes) > 0 else 0
            }
            for node in nodes
        }


# ============================================================================
# FILE: backend/distributed/mapreduce.py
# ============================================================================

from typing import List, Dict, Callable, Any
from collections import defaultdict
import threading

class MapReduceEngine:
    """MapReduce for distributed analytics"""
    
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        self.map_results = defaultdict(list)
        self.lock = threading.Lock()
    
    def run(self, data: List[Any], map_func: Callable, reduce_func: Callable) -> Dict:
        """Execute MapReduce job"""
        # Partition data across nodes
        partitions = self._partition_data(data)
        
        # MAP PHASE
        map_results = []
        threads = []
        
        for node, partition in zip(self.nodes, partitions):
            node.log_event("MAPREDUCE_MAP", 
                f"Map phase on Node {node.node_id} with {len(partition)} items")
            
            thread = threading.Thread(
                target=self._map_worker,
                args=(node, partition, map_func, map_results)
            )
            threads.append(thread)
            thread.start()
        
        # Wait for all map tasks
        for thread in threads:
            thread.join()
        
        # SHUFFLE PHASE
        shuffled = self._shuffle(map_results)
        
        # REDUCE PHASE
        final_results = {}
        for key, values in shuffled.items():
            final_results[key] = reduce_func(key, values)
        
        for node in self.nodes:
            node.log_event("MAPREDUCE_COMPLETE", 
                f"MapReduce completed with {len(final_results)} results")
        
        return final_results
    
    def _partition_data(self, data: List[Any]) -> List[List[Any]]:
        """Partition data across nodes"""
        chunk_size = len(data) // len(self.nodes)
        partitions = []
        
        for i in range(len(self.nodes)):
            start = i * chunk_size
            end = start + chunk_size if i < len(self.nodes) - 1 else len(data)
            partitions.append(data[start:end])
        
        return partitions
    
    def _map_worker(self, node: DistributedNode, data: List[Any], 
                   map_func: Callable, results: List):
        """Map worker thread"""
        local_results = []
        for item in data:
            mapped = map_func(item)
            local_results.extend(mapped)
        
        with self.lock:
            results.extend(local_results)
    
    def _shuffle(self, map_results: List[tuple]) -> Dict[Any, List]:
        """Shuffle and group by key"""
        shuffled = defaultdict(list)
        for key, value in map_results:
            shuffled[key].append(value)
        return shuffled