"""
Core Distributed System Components

This module provides the fundamental building blocks for distributed systems:

- DistributedNode: Base class for distributed node instances
- LamportClock: Logical clock implementation for event ordering
- message_queue: Inter-node communication mechanism

These components form the foundation for all distributed operations.
"""

from .node import DistributedNode
from .clock import LamportClock
from .message_queue import message_queue, InMemoryMessageQueue

__all__ = [
    'DistributedNode',
    'LamportClock', 
    'message_queue',
    'InMemoryMessageQueue'
]
