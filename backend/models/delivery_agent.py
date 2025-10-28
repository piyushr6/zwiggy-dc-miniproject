# FILE: backend/models/delivery_agent.py
# ============================================================================

from dataclasses import dataclass

@dataclass
class DeliveryAgent:
    agent_id: int
    name: str
    phone: str
    is_available: bool
    current_location: str
    assigned_order_id: str = None