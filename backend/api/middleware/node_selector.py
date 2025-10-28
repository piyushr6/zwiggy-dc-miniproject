"""
Node Selector Middleware

Routes requests to appropriate backend nodes using load balancing.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class NodeSelectorMiddleware(BaseHTTPMiddleware):
    """Middleware to select appropriate node for request"""
    
    def __init__(self, app, load_balancer, nodes):
        super().__init__(app)
        self.load_balancer = load_balancer
        self.nodes = nodes
    
    async def dispatch(self, request: Request, call_next):
        # Select node using load balancer
        node = self.load_balancer.select_node(self.nodes)
        
        if node:
            # Add selected node to request state
            request.state.selected_node = node
            node.increment_requests()
        
        response = await call_next(request)
        return response