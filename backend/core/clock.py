# FILE: backend/core/clock.py
# ============================================================================

import time
import threading

class LamportClock:
    """Lamport Logical Clock for distributed event ordering"""
    
    def __init__(self):
        self.counter = 0
        self.lock = threading.Lock()
    
    def tick(self) -> int:
        """Increment clock on local event"""
        with self.lock:
            self.counter += 1
            return self.counter
    
    def update(self, received_time: int) -> int:
        """Update clock on receiving message"""
        with self.lock:
            self.counter = max(self.counter, received_time) + 1
            return self.counter
    
    def get_time(self) -> int:
        """Get current logical time"""
        with self.lock:
            return self.counter