"""
Concurrency Control Mechanisms

This module provides tools for safe concurrent operations in distributed systems:

1. DistributedLockManager: Distributed lock implementation
   - Resource locking across nodes
   - Deadlock prevention
   - Lock timeout handling
   - Lock holder tracking

2. TransactionManager: Distributed transaction handling
   - ACID properties enforcement
   - Two-phase commit protocol
   - Transaction rollback
   - Isolation levels

These components ensure data consistency when multiple nodes
access shared resources concurrently.

Usage Example:
    from backend.concurrency import lock_manager
    
    # Acquire lock
    if lock_manager.acquire("resource_123", node_id=1):
        # Perform critical section operations
        process_order()
        # Release lock
        lock_manager.release("resource_123", node_id=1)
"""

from .lock_manager import lock_manager, DistributedLockManager
from .transaction_manager import transaction_manager, TransactionManager, Transaction

__all__ = [
    'lock_manager',
    'DistributedLockManager',
    'transaction_manager',
    'TransactionManager',
    'Transaction'
]