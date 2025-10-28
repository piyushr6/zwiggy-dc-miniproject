# FILE: backend/concurrency/transaction_manager.py
# ============================================================================

import threading
from typing import Dict, List, Callable
import time

class Transaction:
    """Transaction context"""
    
    def __init__(self, tx_id: str):
        self.tx_id = tx_id
        self.operations = []
        self.locks = []
        self.status = "active"  # active, committed, aborted
    
    def add_operation(self, operation: Dict):
        """Add operation to transaction"""
        self.operations.append(operation)
    
    def commit(self):
        """Commit transaction"""
        self.status = "committed"
    
    def abort(self):
        """Abort transaction"""
        self.status = "aborted"


class TransactionManager:
    """Manages distributed transactions"""
    
    def __init__(self):
        self.transactions: Dict[str, Transaction] = {}
        self.lock = threading.Lock()
    
    def begin_transaction(self, tx_id: str) -> Transaction:
        """Begin new transaction"""
        with self.lock:
            tx = Transaction(tx_id)
            self.transactions[tx_id] = tx
            return tx
    
    def commit_transaction(self, tx_id: str) -> bool:
        """Commit transaction"""
        with self.lock:
            if tx_id in self.transactions:
                tx = self.transactions[tx_id]
                tx.commit()
                
                # Release all locks
                for resource_id in tx.locks:
                    lock_manager.release(resource_id, int(tx_id.split("_")[1]))
                
                return True
        return False
    
    def abort_transaction(self, tx_id: str):
        """Abort transaction"""
        with self.lock:
            if tx_id in self.transactions:
                tx = self.transactions[tx_id]
                tx.abort()
                
                # Release locks and rollback
                for resource_id in tx.locks:
                    lock_manager.release(resource_id, int(tx_id.split("_")[1]))


# Global transaction manager
transaction_manager = TransactionManager()