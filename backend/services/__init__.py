"""
Business Logic Services

Application services implementing core business operations:

1. RestaurantService: Restaurant management
   - Get all restaurants
   - Get restaurant by ID
   - Update menu inventory
   - Search restaurants by cuisine
   - Manage restaurant availability

2. OrderService: Order processing
   - Create new orders
   - Update order status
   - Get order history
   - Cancel orders
   - Track order lifecycle
   - Handle concurrent order creation with locks

3. DeliveryService: Delivery management
   - Assign delivery agents
   - Track delivery status
   - Update delivery location
   - Manage agent availability

4. AnalyticsService: Data analytics using MapReduce
   - Top selling items
   - Revenue by restaurant
   - Peak order hours
   - Customer ordering patterns
   - Restaurant performance metrics

Each service operates in the context of a distributed node
and logs events for distributed system monitoring.
"""

from .restaurant_service import RestaurantService
from .order_service import OrderService
from .delivery_service import DeliveryService
from .analytics_service import AnalyticsService

__all__ = [
    'RestaurantService',
    'OrderService',
    'DeliveryService',
    'AnalyticsService'
]