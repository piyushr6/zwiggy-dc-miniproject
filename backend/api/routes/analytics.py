from fastapi import APIRouter

from zwiggy.backend.services.analytics_service import AnalyticsService
from zwiggy.backend.services.order_service import OrderService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/top-items")
async def get_top_items():
    """Get top selling items using MapReduce"""
    # Collect all orders from all nodes
    all_orders = []
    for node in all_nodes:
        if node.is_active:
            order_service = OrderService(node)
            all_orders.extend(order_service.get_orders())
    
    if not all_orders:
        return {"success": True, "data": {}}
    
    analytics = AnalyticsService(all_nodes)
    results = analytics.get_top_selling_items(all_orders)
    
    # Sort by quantity
    sorted_results = sorted(results.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "success": True,
        "data": dict(sorted_results)
    }

@router.get("/revenue")
async def get_revenue():
    """Get revenue by restaurant using MapReduce"""
    all_orders = []
    for node in all_nodes:
        if node.is_active:
            order_service = OrderService(node)
            all_orders.extend(order_service.get_orders())
    
    if not all_orders:
        return {"success": True, "data": {}}
    
    analytics = AnalyticsService(all_nodes)
    results = analytics.get_revenue_by_restaurant(all_orders)
    
    return {
        "success": True,
        "data": results
    }

