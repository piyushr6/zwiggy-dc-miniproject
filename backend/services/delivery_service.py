"""
Delivery Service

Manages delivery agent assignment and tracking.
"""

from typing import List, Optional
from zwiggy.backend.models import DeliveryAgent, Order

class DeliveryService:
    """Handles delivery operations"""
    
    def __init__(self, node):
        self.node = node
        self.agents = self._initialize_agents()
    
    def _initialize_agents(self) -> List[DeliveryAgent]:
        """Initialize sample delivery agents"""
        return [
            DeliveryAgent(
                agent_id=1,
                name="John Doe",
                phone="555-0101",
                is_available=True,
                current_location="Zone A"
            ),
            DeliveryAgent(
                agent_id=2,
                name="Jane Smith",
                phone="555-0102",
                is_available=True,
                current_location="Zone B"
            ),
            DeliveryAgent(
                agent_id=3,
                name="Mike Johnson",
                phone="555-0103",
                is_available=True,
                current_location="Zone C"
            )
        ]
    
    def assign_agent(self, order_id: str) -> Optional[DeliveryAgent]:
        """Assign available agent to order"""
        for agent in self.agents:
            if agent.is_available:
                agent.is_available = False
                agent.assigned_order_id = order_id
                
                self.node.log_event(
                    "AGENT_ASSIGNED",
                    f"Agent {agent.name} assigned to order {order_id}",
                    {"agent_id": agent.agent_id, "order_id": order_id}
                )
                
                return agent
        
        return None
    
    def complete_delivery(self, agent_id: int):
        """Mark delivery as complete and free agent"""
        for agent in self.agents:
            if agent.agent_id == agent_id:
                order_id = agent.assigned_order_id
                agent.is_available = True
                agent.assigned_order_id = None
                
                self.node.log_event(
                    "DELIVERY_COMPLETE",
                    f"Agent {agent.name} completed delivery",
                    {"agent_id": agent_id, "order_id": order_id}
                )
                break
    
    def get_available_agents(self) -> List[DeliveryAgent]:
        """Get list of available agents"""
        return [agent for agent in self.agents if agent.is_available]
