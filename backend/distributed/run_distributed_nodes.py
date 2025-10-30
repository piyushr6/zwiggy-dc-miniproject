import threading
import time

from ..core.node import DistributedNode
from ..core.message_queue import message_queue
from .leader_election import BullyLeaderElection
from .consistency import ConsistencyManager


# Number of nodes to simulate
NODE_COUNT = 3

def start_node(node_id):
    """
    Start a distributed node with leader election + heartbeats.
    """
    node = DistributedNode(
        node_id=node_id,
        message_queue=message_queue,
        consistency_manager=ConsistencyManager()
    )
    node.start()
    return node

def start_election(nodes):
    """
    Trigger bully leader election when system starts.
    """
    election = BullyLeaderElection(nodes)
    leader = election.run_election()
    print(f"[SYSTEM] Leader elected: Node {leader.node_id}")

def main():
    print("[SYSTEM] Starting distributed nodes...")
    nodes = []

    # ✅ Start all nodes
    for i in range(1, NODE_COUNT + 1):
        thread = threading.Thread(target=start_node, args=(i,), daemon=True)
        thread.start()
        nodes.append(i)
        time.sleep(0.3)

    print(f"[SYSTEM] {NODE_COUNT} nodes started.")

    # ✅ Run leader election
    time.sleep(1)
    start_election(nodes)

    print("[SYSTEM] Nodes are running. Press CTRL+C to stop.")

    # ✅ Keep process alive
    while True:
        time.sleep(2)

if __name__ == "__main__":
    main()
