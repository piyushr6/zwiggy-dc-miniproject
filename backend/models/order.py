# FILE: backend/models/order.py
# ============================================================================

from dataclasses import dataclass
from typing import List
from datetime import datetime

@dataclass
class OrderItem:
    item_id: int
    item_name: str
    quantity: int
    price: float

@dataclass
class Order:
    order_id: str
    user_id: int
    restaurant_id: int
    items: List[OrderItem]
    total_amount: float
    status: str  # pending, confirmed, preparing, out_for_delivery, delivered
    created_at: datetime
    logical_timestamp: int
    processed_by_node: int