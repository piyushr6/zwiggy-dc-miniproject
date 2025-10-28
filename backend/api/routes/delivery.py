"""
Delivery Management Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/delivery", tags=["delivery"])

class AssignAgentRequest(BaseModel):
    order_id: str

@router.get("/agents")
async def get_agents():
    """Get all delivery agents"""
    from backend.services import DeliveryService
    from backend.core import DistributedNode
    
    node = DistributedNode(node_id=1, priority=1)
    delivery_service = DeliveryService(node)
    
    return {
        "success": True,
        "data": [
            {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "phone": agent.phone,
                "is_available": agent.is_available,
                "current_location": agent.current_location,
                "assigned_order_id": agent.assigned_order_id
            }
            for agent in delivery_service.agents
        ]
    }

@router.post("/assign")
async def assign_agent(request: AssignAgentRequest):
    """Assign delivery agent to order"""
    from backend.services import DeliveryService
    from backend.core import DistributedNode
    
    node = DistributedNode(node_id=1, priority=1)
    delivery_service = DeliveryService(node)
    
    agent = delivery_service.assign_agent(request.order_id)
    
    if not agent:
        raise HTTPException(status_code=404, detail="No available agents")
    
    return {
        "success": True,
        "data": {
            "agent_id": agent.agent_id,
            "name": agent.name,
            "order_id": request.order_id
        }
    }
