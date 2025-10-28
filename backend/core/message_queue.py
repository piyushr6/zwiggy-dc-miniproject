# FILE: backend/core/message_queue.py
# ============================================================================

import threading
from queue import Queue
from typing import Dict, List, Callable
import time

class InMemoryMessageQueue:
    """Simple in-memory message queue for inter-node communication"""
    
    def __init__(self):
        self.queues: Dict[int, Queue] = {}
        self.subscribers: Dict[str, List[Callable]] = {}
        self.lock = threading.Lock()
    
    def create_queue(self, node_id: int):
        """Create message queue for a node"""
        with self.lock:
            if node_id not in self.queues:
                self.queues[node_id] = Queue()
    
    def send_message(self, to_node_id: int, message: Dict):
        """Send message to specific node"""
        with self.lock:
            if to_node_id in self.queues:
                self.queues[to_node_id].put(message)
    
    def broadcast_message(self, message: Dict, exclude_node: int = None):
        """Broadcast message to all nodes"""
        with self.lock:
            for node_id in self.queues.keys():
                if node_id != exclude_node:
                    self.queues[node_id].put(message)
    
    def receive_message(self, node_id: int, timeout: float = 0.1) -> Dict:
        """Receive message from queue (non-blocking)"""
        try:
            if node_id in self.queues:
                return self.queues[node_id].get(timeout=timeout)
        except:
            return None
    
    def publish(self, topic: str, message: Dict):
        """Publish message to topic"""
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                callback(message)
    
    def subscribe(self, topic: str, callback: Callable):
        """Subscribe to topic"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)


# Global message queue instance
message_queue = InMemoryMessageQueue()