# FILE: backend/core/node.py
# ============================================================================

import time
import threading
import json
from typing import Dict, Optional, List
from datetime import datetime

from zwiggy.backend.core.clock import LamportClock

class DistributedNode:
    """Base class for distributed node instances"""
    
    def __init__(self, node_id: int, priority: int):
        self.node_id = node_id
        self.priority = priority
        self.is_active = True
        self.is_leader = False
        self.current_leader_id = None
        self.clock = LamportClock()
        self.event_log = []
        self.health_status = "healthy"
        self.request_count = 0
        self.lock = threading.Lock()
    
    def log_event(self, event_type: str, description: str, data: dict = None):
        """Log distributed events with timestamps"""
        logical_time = self.clock.tick()
        physical_time = time.time()
        
        event = {
            "node_id": self.node_id,
            "event_type": event_type,
            "description": description,
            "logical_time": logical_time,
            "physical_time": physical_time,
            "timestamp": datetime.now().isoformat(),
            "data": data or {}
        }
        
        with self.lock:
            self.event_log.append(event)
        
        return event
    
    def get_status(self) -> Dict:
        """Get node status"""
        return {
            "node_id": self.node_id,
            "priority": self.priority,
            "is_active": self.is_active,
            "is_leader": self.is_leader,
            "current_leader": self.current_leader_id,
            "health": self.health_status,
            "request_count": self.request_count,
            "logical_clock": self.clock.get_time()
        }
    
    def increment_requests(self):
        """Track request count for load balancing"""
        with self.lock:
            self.request_count += 1