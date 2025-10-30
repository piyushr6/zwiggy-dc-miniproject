# FILE: backend/distributed/leader_election.py
# ============================================================================

import threading
import time
from typing import List
from zwiggy.backend.core import message_queue
from zwiggy.backend.core.node import DistributedNode


class BullyLeaderElection:
    """Bully Algorithm for Leader Election"""

    def __init__(self, node: DistributedNode, all_nodes: List[DistributedNode]):
        self.node = node
        self.all_nodes = all_nodes
        self.election_in_progress = False
        self.election_lock = threading.Lock()

    # -----------------------------------------------------------
    def start_election(self) -> bool:
        """Initiate leader election"""

        with self.election_lock:
            if self.election_in_progress:
                return False

            self.election_in_progress = True
            self.node.log_event("ELECTION_START",
                f"Node {self.node.node_id} starting election")

        # ✅ Higher priority nodes (by node_id)
        higher_nodes = [n for n in self.all_nodes if n.node_id > self.node.node_id]

        if not higher_nodes:
            self._become_leader()
            self._finish()
            return True

        responses = []
        for n in higher_nodes:
            msg = {
                "type": "ELECTION",
                "from_node": self.node.node_id,
                "to_node": n.node_id,
                "timestamp": time.time()
            }

            self.node.log_event("ELECTION_MESSAGE",
                f"Sending ELECTION to Node {n.node_id}")

            message_queue.send_message(n.node_id, msg)
            responses.append(self._check_node_response(n.node_id))

        # ✅ If nobody responds → I am leader
        if not any(responses):
            self._become_leader()
        else:
            self.node.log_event("ELECTION_DEFER",
                "Higher priority node responded, deferring")

        self._finish()
        return True

    # -----------------------------------------------------------
    def _check_node_response(self, node_id: int) -> bool:
        """Check if node is alive"""
        from zwiggy.backend.demo import NodeRegistry
        return NodeRegistry.is_node_active(node_id)

    # -----------------------------------------------------------
    def _become_leader(self):
        """Declare this node as leader"""
        from zwiggy.backend.demo import NodeRegistry

        self.node.is_leader = True
        self.node.current_leader_id = self.node.node_id

        self.node.log_event("LEADER_ELECTED",
            f"Node {self.node.node_id} became leader")

        # ✅ Notify everybody else
        for n in self.all_nodes:
            if n.node_id == self.node.node_id:
                continue

            msg = {
                "type": "COORDINATOR",
                "leader_id": self.node.node_id,
                "to_node": n.node_id,
                "timestamp": time.time()
            }

            self.node.log_event("COORDINATOR_BROADCAST",
                f"Broadcasting COORDINATOR to Node {n.node_id}")

            message_queue.send_message(n.node_id, msg)

        NodeRegistry.set_leader(self.node.node_id)

    # -----------------------------------------------------------
    def _finish(self):
        with self.election_lock:
            self.election_in_progress = False
