from typing import List, Dict
import time
import uuid
from datetime import datetime

from zwiggy.backend.concurrency import lock_manager
from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend.models.order import Order, OrderItem

class OrderService:
    """Handles order operations"""
    
    def __init__(self, node: DistributedNode):
        self.node = node
        self.orders = []
    
    def create_order(self, user_id: int, restaurant_id: int, 
                    items: List[Dict], use_lock: bool = False) -> Order:
        """Create new order"""
        order_id = f"ORD_{uuid.uuid4().hex[:8]}"
        
        if use_lock:
            # Demonstrate concurrency control
            resource_id = f"restaurant_{restaurant_id}"
            lock_acquired = lock_manager.acquire(resource_id, self.node.node_id)
            
            if not lock_acquired:
                self.node.log_event("ORDER_LOCK_FAILED", 
                    f"Failed to acquire lock for restaurant {restaurant_id}")
                return None
        
        try:
            # Process order
            logical_time = self.node.clock.tick()
            
            order = Order(
                order_id=order_id,
                user_id=user_id,
                restaurant_id=restaurant_id,
                items=[OrderItem(**item) for item in items],
                total_amount=sum(item["price"] * item["quantity"] for item in items),
                status="pending",
                created_at=datetime.now(),
                logical_timestamp=logical_time,
                processed_by_node=self.node.node_id
            )
            
            self.orders.append(order)
            
            self.node.log_event("ORDER_CREATED", 
                f"Order {order_id} created",
                {"order_id": order_id, "total": order.total_amount})
            
            return order
        
        finally:
            if use_lock:
                lock_manager.release(resource_id, self.node.node_id)
    
    def update_order_status(self, order_id: str, new_status: str):
        """Update order status"""
        for order in self.orders:
            if order.order_id == order_id:
                order.status = new_status
                self.node.log_event("ORDER_STATUS_UPDATE", 
                    f"Order {order_id} status: {new_status}")
                break
    
    def get_orders(self) -> List[Order]:
        """Get all orders"""
        return self.orders
