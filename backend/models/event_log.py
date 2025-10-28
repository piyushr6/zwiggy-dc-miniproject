"""
Event Log Model

Tracks distributed events for debugging and visualization.
"""

from dataclasses import dataclass
from datetime import datetime

@dataclass
class EventLog:
    event_id: str
    node_id: int
    event_type: str
    description: str
    logical_time: int
    physical_time: float
    timestamp: datetime
    data: dict = None

