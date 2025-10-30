# FILE: zwiggy/backend/api/routes/__init__.py
# ============================================================================

from . import restaurants
from . import orders
from . import delivery
from . import distributed
from . import analytics
from . import users
from . import websockets

__all__ = [
    'restaurants',
    'orders',
    'delivery',
    'distributed',
    'analytics',
    'users',
    'websockets'
]
