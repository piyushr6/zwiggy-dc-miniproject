"""
API Routes

FastAPI router modules for different endpoints:

1. restaurants.py - Restaurant endpoints
   - GET /restaurants - List all restaurants
   - GET /restaurants/{id} - Get restaurant details

2. orders.py - Order endpoints
   - POST /orders - Create new order
   - GET /orders - List all orders
   - GET /orders/{id} - Get order details
   - PUT /orders/{id}/status - Update order status

3. delivery.py - Delivery endpoints
   - GET /delivery/agents - List delivery agents
   - POST /delivery/assign - Assign agent to order
   - PUT /delivery/{agent_id}/complete - Complete delivery

4. distributed.py - Distributed system monitoring
   - GET /distributed/nodes - Node status
   - GET /distributed/leader - Current leader
   - POST /distributed/election - Trigger election
   - GET /distributed/events - Event log
   - GET /distributed/load-balance-stats - Load stats
   - POST /distributed/simulate/failure/{node_id} - Simulate failure
   - POST /distributed/simulate/recovery/{node_id} - Simulate recovery

5. analytics.py - Analytics endpoints
   - GET /analytics/top-items - Top selling items
   - GET /analytics/revenue - Revenue by restaurant
   - GET /analytics/peak-hours - Peak order hours

6. users.py - User endpoints
   - GET /users - List users
   - GET /users/{id} - Get user details
   - POST /users - Create user
"""

from . import restaurants
from . import orders
from . import delivery
from . import distributed
from . import analytics
from . import users

__all__ = [
    'restaurants',
    'orders',
    'delivery',
    'distributed',
    'analytics',
    'users'
]