# FILE: backend/models/restaurant.py
# ============================================================================

from dataclasses import dataclass
from typing import List

@dataclass
class MenuItem:
    item_id: int
    name: str
    price: float
    quantity_available: int

@dataclass
class Restaurant:
    restaurant_id: int
    name: str
    cuisine: str
    menu: List[MenuItem]
    rating: float
    is_active: bool = True