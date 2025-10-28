# ============================================================================
# FILE: backend/distributed/__init__.py
# LOCATION: distributed-food-delivery/backend/distributed/__init__.py
# PURPOSE: Distributed algorithms and protocols
# ============================================================================

"""
Distributed Algorithms and Protocols

This module implements key distributed systems algorithms:

1. BullyLeaderElection: Leader election using the Bully algorithm
   - Automatic leader selection based on priority
   - Failure detection and re-election
   - ELECTION and COORDINATOR message handling

2. ConsistencyManager: Multiple consistency models
   - Strong consistency: Synchronous replication
   - Eventual consistency: Asynchronous replication
   - Quorum: Majority-based consensus

3. LoadBalancer: Request distribution strategies
   - Round-robin: Sequential distribution
   - Least connections: Load-aware routing

4. MapReduceEngine: Distributed analytics
   - Map phase: Parallel data processing
   - Shuffle phase: Data grouping
   - Reduce phase: Result aggregation

5. ReplicationManager: Data replication across nodes
   - Primary-replica architecture
   - Replication lag tracking
   - Consistency enforcement
"""

from .leader_election import BullyLeaderElection
from .consistency import ConsistencyManager
from .load_balancer import LoadBalancer
from .mapreduce import MapReduceEngine
from .replication import ReplicationManager

__all__ = [
    'BullyLeaderElection',
    'ConsistencyManager',
    'LoadBalancer',
    'MapReduceEngine',
    'ReplicationManager'
]