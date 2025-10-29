# FILE: backend/distributed/leader_election.py
# ============================================================================

import threading
import time
from typing import Dict, List, Optional

from zwiggy.backend.core import message_queue
from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend.demo import NodeRegistry

class BullyLeaderElection:
    """Bully Algorithm for Leader Election"""
    
    def __init__(self, node: DistributedNode, all_nodes: List[Dict]):
        self.node = node
        self.all_nodes = all_nodes
        self.election_in_progress = False
        self.election_lock = threading.Lock()
    
    def start_election(self) -> bool:
        """Initiate leader election"""
        with self.election_lock:
            if self.election_in_progress:
                return False
            
            self.election_in_progress = True
            self.node.log_event("ELECTION_START", 
                f"Node {self.node.node_id} starting election")
        
        # Find nodes with higher priority
        higher_nodes = [n for n in self.all_nodes 
                       if n["id"] > self.node.node_id]
        
        if not higher_nodes:
            # I'm the highest, become leader
            self._become_leader()
            return True
        
        # Send ELECTION message to higher priority nodes
        responses = []
        for node in higher_nodes:
            message = {
                "type": "ELECTION",
                "from_node": self.node.node_id,
                "to_node": node["id"],
                "timestamp": time.time()
            }
            
            self.node.log_event("ELECTION_MESSAGE", 
                f"Sending ELECTION to Node {node['id']}")
            
            message_queue.send_message(node["id"], message)
            
            # Simulate response (in real system, wait for actual response)
            # Check if higher node is active
            response = self._check_node_response(node["id"])
            responses.append(response)
        
        # If no higher node responds, become leader
        if not any(responses):
            self._become_leader()
        else:
            self.node.log_event("ELECTION_DEFER", 
                "Higher priority node responded, deferring")
        
        with self.election_lock:
            self.election_in_progress = False
        
        return True
    
    def _check_node_response(self, node_id: int) -> bool:
        """Check if node is active (simulated)"""
        # In real system, wait for OK response
        # For simulation, check node status from registry
        return NodeRegistry.is_node_active(node_id)
    
    def _become_leader(self):
        """Declare self as leader"""
        self.node.is_leader = True
        self.node.current_leader_id = self.node.node_id
        
        self.node.log_event("LEADER_ELECTED", 
            f"Node {self.node.node_id} elected as LEADER")
        
        # Broadcast COORDINATOR message
        message = {
            "type": "COORDINATOR",
            "leader_id": self.node.node_id,
            "timestamp": time.time()
        }
        
        message_queue.broadcast_message(message, exclude_node=self.node.node_id)
        
        # Update all nodes
        NodeRegistry.set_leader(self.node.node_id)
    
    def handle_election_message(self, message: Dict):
        """Handle incoming ELECTION message"""
        from_node = message["from_node"]
        
        if self.node.node_id > from_node:
            # I have higher priority, respond OK and start my own election
            self.node.log_event("ELECTION_RESPOND", 
                f"Responding OK to Node {from_node}")
            
            ok_message = {
                "type": "OK",
                "from_node": self.node.node_id,
                "to_node": from_node
            }
            message_queue.send_message(from_node, ok_message)
            
            # Start my own election
            self.start_election()
    
    def handle_coordinator_message(self, message: Dict):
        """Handle COORDINATOR message"""
        leader_id = message["leader_id"]
        self.node.is_leader = False
        self.node.current_leader_id = leader_id
        
        self.node.log_event("LEADER_ACKNOWLEDGED", 
            f"Acknowledged Node {leader_id} as leader")
