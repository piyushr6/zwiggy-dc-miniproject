# FILE: zwiggy/backend/api/routes/orders.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from zwiggy.backend.config import Config
from zwiggy.backend.distributed import load_balancer
from zwiggy.backend.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])

class CreateOrderRequest(BaseModel):
    user_id: int
    restaurant_id: int
    items: List[dict]


@router.post("/")
async def create_order(request: CreateOrderRequest):
    """Create new order"""

    # ✅ Select node using load balancer
    node = load_balancer.select_node(Config.REGISTERED_NODES)

    if not node:
        raise HTTPException(status_code=503, detail="No nodes available")

    node.increment_requests()

    order_service = OrderService(node)
    order = order_service.create_order(
        user_id=request.user_id,
        restaurant_id=request.restaurant_id,
        items=request.items,
        use_lock=True
    )

    if not order:
        raise HTTPException(status_code=500, detail="Order creation failed")

    return {
        "success": True,
        "data": {
            "order_id": order.order_id,
            "total_amount": order.total_amount,
            "status": order.status,
            "processed_by_node": node.node_id,
            "logical_timestamp": order.logical_timestamp
        }
    }


@router.get("/")
async def get_orders():
    """Get all orders from all active nodes"""
    all_orders = []

    # ✅ Loop through registered nodes only
    for node in Config.REGISTERED_NODES:
        if node.is_active:
            order_service = OrderService(node)
            orders = order_service.get_orders()
            all_orders.extend(orders)

    return {
        "success": True,
        "count": len(all_orders),
        "data": [
            {
                "order_id": o.order_id,
                "user_id": o.user_id,
                "restaurant_id": o.restaurant_id,
                "total_amount": o.total_amount,
                "status": o.status,
                "processed_by_node": o.processed_by_node,
                "logical_timestamp": o.logical_timestamp,
                "created_at": o.created_at.isoformat()
            }
            for o in all_orders
        ]
    }
