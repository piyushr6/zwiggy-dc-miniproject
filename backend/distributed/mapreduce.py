# FILE: backend/distributed/mapreduce.py
# ============================================================================

from typing import List, Dict, Callable, Any
from collections import defaultdict
import threading

class MapReduceEngine:
    """MapReduce for distributed analytics"""
    
    def __init__(self, nodes: List):
        self.nodes = nodes
        self.map_results = defaultdict(list)
        self.lock = threading.Lock()
    
    def run(self, data: List[Any], map_func: Callable, reduce_func: Callable) -> Dict:
        """Execute MapReduce job"""
        partitions = self._partition_data(data)
        
        map_results = []
        threads = []
        
        for node, partition in zip(self.nodes, partitions):
            if hasattr(node, 'log_event'):
                node.log_event("MAPREDUCE_MAP", 
                    f"Map phase on Node {node.node_id} with {len(partition)} items")
            
            thread = threading.Thread(
                target=self._map_worker,
                args=(node, partition, map_func, map_results)
            )
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        shuffled = self._shuffle(map_results)
        
        final_results = {}
        for key, values in shuffled.items():
            final_results[key] = reduce_func(key, values)
        
        for node in self.nodes:
            if hasattr(node, 'log_event'):
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
    
    def _map_worker(self, node, data: List[Any], 
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