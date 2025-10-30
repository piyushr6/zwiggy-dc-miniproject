# FILE: backend/core/node.py
# ============================================================================

import time
import threading
from datetime import datetime
from typing import Dict, Any

class LamportClock:
    """Lamport logical clock implementation"""
    
    def __init__(self):
        self.time = 0
        self.lock = threading.Lock()
    
    def tick(self) -> int:
        """Increment clock on local event"""
        with self.lock:
            self.time += 1
            return self.time
    
    def update(self, received_time: int) -> int:
        """Update clock on message receive"""
        with self.lock:
            self.time = max(self.time, received_time) + 1
            return self.time
    
    def get_time(self) -> int:
        """Get current logical time"""
        with self.lock:
            return self.time


class DistributedNode:
    """Represents a node in the distributed system"""
    
    def __init__(self, node_id: int, priority: int = None):
        self.node_id = node_id
        self.priority = priority if priority is not None else node_id
        self.is_active = True
        self.is_leader = False
        self.current_leader_id = None
        self.clock = LamportClock()
        self.event_log = []
        self.health_status = "healthy"
        self.request_count = 0
        self.lock = threading.Lock()
        self.last_heartbeat = time.time()
    
    def log_event(self, event_type: str, description: str, data: Dict[str, Any] = None):
        """Log an event with Lamport timestamp"""
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
            # Keep only last 1000 events to prevent memory issues
            if len(self.event_log) > 1000:
                self.event_log = self.event_log[-1000:]
        
        return event
    
    def get_status(self) -> Dict[str, Any]:
        """Return node status as dictionary"""
        return {
            "node_id": self.node_id,
            "priority": self.priority,
            "is_active": self.is_active,
            "is_leader": self.is_leader,
            "current_leader": self.current_leader_id,
            "health": self.health_status,
            "request_count": self.request_count,
            "logical_clock": self.clock.get_time(),
            "last_heartbeat": self.last_heartbeat
        }
    
    def set_leader(self, is_leader: bool = True):
        """Set this node as leader or follower"""
        with self.lock:
            self.is_leader = is_leader
            if is_leader:
                self.current_leader_id = self.node_id
                self.log_event("LEADER_ELECTED", f"Node {self.node_id} became leader")
            else:
                self.log_event("LEADER_STEP_DOWN", f"Node {self.node_id} stepped down as leader")
    
    def increment_requests(self):
        """Increment request counter"""
        with self.lock:
            self.request_count += 1
    
    def update_heartbeat(self):
        """Update last heartbeat timestamp"""
        with self.lock:
            self.last_heartbeat = time.time()
    
    def fail(self):
        """Simulate node failure"""
        with self.lock:
            self.is_active = False
            self.health_status = "failed"
            self.log_event("NODE_FAILURE", f"Node {self.node_id} failed")
    
    def recover(self):
        """Recover from failure"""
        with self.lock:
            self.is_active = True
            self.health_status = "healthy"
            self.log_event("NODE_RECOVERY", f"Node {self.node_id} recovered")