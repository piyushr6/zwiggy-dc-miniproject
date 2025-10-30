# FILE: zwiggy/backend/services/order_service.py
from typing import List, Dict
import uuid
from datetime import datetime

from zwiggy.backend.concurrency import lock_manager
from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend.models.order import Order, OrderItem

class OrderService:
    """Handles order operations"""

    def __init__(self, node: DistributedNode):
        self.node = node
        # ✅ Persist orders inside the node object so they survive across calls
        if not hasattr(self.node, "orders"):
            self.node.orders = []

    def create_order(self, user_id: int, restaurant_id: int,
                     items: List[Dict], use_lock: bool = False) -> Order:

        order_id = f"ORD_{uuid.uuid4().hex[:8]}"
        resource_id = f"restaurant_{restaurant_id}"

        if use_lock:
            if not lock_manager.acquire(resource_id, self.node.node_id):
                self.node.log_event("ORDER_LOCK_FAILED",
                                    f"Failed lock for restaurant {restaurant_id}")
                return None

        try:
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

            self.node.orders.append(order)

            self.node.log_event("ORDER_CREATED",
                                f"Order {order_id} created",
                                {"order_id": order_id, "total": order.total_amount})

            return order

        finally:
            if use_lock:
                lock_manager.release(resource_id, self.node.node_id)

    def get_orders(self) -> List[Order]:
        return self.node.orders
