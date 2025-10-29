from collections import Counter
from typing import Dict, List

from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend.distributed.mapreduce import MapReduceEngine
from zwiggy.backend.models.order import Order

class AnalyticsService:
    """Analytics using MapReduce"""
    
    def __init__(self, nodes: List[DistributedNode]):
        self.mapreduce = MapReduceEngine(nodes)
    
    def get_top_selling_items(self, orders: List[Order]) -> Dict:
        """Get top selling items using MapReduce"""
        
        def map_func(order):
            # Emit (item_name, quantity) for each item
            results = []
            for item in order.items:
                results.append((item.item_name, item.quantity))
            return results
        
        def reduce_func(item_name, quantities):
            # Sum all quantities for item
            return sum(quantities)
        
        return self.mapreduce.run(orders, map_func, reduce_func)
    
    def get_revenue_by_restaurant(self, orders: List[Order]) -> Dict:
        """Get revenue per restaurant using MapReduce"""
        
        def map_func(order):
            return [(order.restaurant_id, order.total_amount)]
        
        def reduce_func(restaurant_id, amounts):
            return sum(amounts)
        
        return self.mapreduce.run(orders, map_func, reduce_func)
    
    def get_orders_by_hour(self, orders: List[Order]) -> Dict:
        """Get order count by hour using MapReduce"""
        
        def map_func(order):
            hour = order.created_at.hour
            return [(hour, 1)]
        
        def reduce_func(hour, counts):
            return sum(counts)
        
        return self.mapreduce.run(orders, map_func, reduce_func)
