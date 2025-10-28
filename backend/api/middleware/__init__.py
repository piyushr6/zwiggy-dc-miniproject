"""
API Middleware

Custom middleware for request processing:

1. NodeSelector: Routes requests to appropriate nodes
   - Load balancing integration
   - Node health checking
   - Request routing based on strategy

2. LoggingMiddleware: Request/response logging
   - Distributed event logging
   - Performance metrics
   - Error tracking

3. AuthMiddleware: Authentication (placeholder)
   - Token validation
   - User identification
   - Permission checking
"""

from .node_selector import NodeSelectorMiddleware

__all__ = ['NodeSelectorMiddleware']
