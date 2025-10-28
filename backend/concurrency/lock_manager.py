# FILE: backend/concurrency/lock_manager.py
# ============================================================================

import threading
import time
from typing import Dict, Optional

class DistributedLockManager:
    """Manages distributed locks for concurrency control"""
    
    def __init__(self):
        self.locks: Dict[str, threading.Lock] = {}
        self.lock_holders: Dict[str, int] = {}
        self.master_lock = threading.Lock()
    
    def acquire(self, resource_id: str, node_id: int, timeout: float = 5.0) -> bool:
        """Acquire lock on resource"""
        with self.master_lock:
            if resource_id not in self.locks:
                self.locks[resource_id] = threading.Lock()
        
        lock = self.locks[resource_id]
        acquired = lock.acquire(timeout=timeout)
        
        if acquired:
            with self.master_lock:
                self.lock_holders[resource_id] = node_id
        
        return acquired
    
    def release(self, resource_id: str, node_id: int):
        """Release lock on resource"""
        if resource_id in self.locks:
            with self.master_lock:
                if self.lock_holders.get(resource_id) == node_id:
                    self.locks[resource_id].release()
                    del self.lock_holders[resource_id]
    
    def is_locked(self, resource_id: str) -> bool:
        """Check if resource is locked"""
        return resource_id in self.lock_holders
    
    def get_lock_holder(self, resource_id: str) -> Optional[int]:
        """Get current lock holder"""
        return self.lock_holders.get(resource_id)


# Global lock manager
lock_manager = DistributedLockManager()