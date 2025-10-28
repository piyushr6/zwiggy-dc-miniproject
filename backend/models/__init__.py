"""
Data Models

Domain models for the food delivery application:

1. Restaurant: Restaurant entity with menu items
   - restaurant_id: Unique identifier
   - name: Restaurant name
   - cuisine: Cuisine type
   - menu: List of MenuItem objects
   - rating: Customer rating

2. MenuItem: Individual menu item
   - item_id: Unique identifier
   - name: Item name
   - price: Item price
   - quantity_available: Current inventory

3. Order: Customer order
   - order_id: Unique identifier
   - user_id: Customer identifier
   - restaurant_id: Restaurant identifier
   - items: List of OrderItem objects
   - total_amount: Total order value
   - status: Order status (pending/confirmed/preparing/delivered)
   - logical_timestamp: Lamport clock timestamp
   - processed_by_node: Node that processed the order

4. OrderItem: Individual item in an order
   - item_id: Menu item identifier
   - item_name: Item name
   - quantity: Quantity ordered
   - price: Price per unit

5. User: Customer entity
   - user_id: Unique identifier
   - name: Customer name
   - email: Email address
   - phone: Phone number
   - address: Delivery address

6. DeliveryAgent: Delivery personnel
   - agent_id: Unique identifier
   - name: Agent name
   - phone: Phone number
   - is_available: Availability status
   - current_location: Current location
   - assigned_order_id: Currently assigned order

7. EventLog: Distributed event tracking
   - event_id: Unique identifier
   - node_id: Node that generated event
   - event_type: Type of event
   - description: Event description
   - logical_time: Lamport timestamp
   - physical_time: Wall clock time
"""

from .restaurant import Restaurant, MenuItem
from .order import Order, OrderItem
from .user import User
from .delivery_agent import DeliveryAgent
from .event_log import EventLog

__all__ = [
    'Restaurant',
    'MenuItem',
    'Order',
    'OrderItem',
    'User',
    'DeliveryAgent',
    'EventLog'
]