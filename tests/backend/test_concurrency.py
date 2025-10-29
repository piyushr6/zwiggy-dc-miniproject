"""
tests/backend/test_concurrency.py
Unit tests for concurrency control and distributed locks
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '../../backend')

from concurrency.lock_manager import DistributedLockManager, LockType, DeadlockDetector
from concurrency.transaction_manager import TransactionManager, IsolationLevel


class TestDistributedLockManager:
    """Test cases for distributed lock management"""
    
    @pytest.fixture
    def lock_manager(self):
        """Create distributed lock manager"""
        return DistributedLockManager(node_id=1)
    
    @pytest.mark.asyncio
    async def test_acquire_lock_success(self, lock_manager):
        """Test successfully acquiring a lock"""
        resource_id = 'order:123'
        
        lock = await lock_manager.acquire_lock(resource_id, lock_type=LockType.EXCLUSIVE)
        
        assert lock is not None
        assert lock.resource_id == resource_id
        assert lock.holder == 1  # node_id
        assert lock.lock_type == LockType.EXCLUSIVE
    
    @pytest.mark.asyncio
    async def test_acquire_lock_blocks_on_conflict(self, lock_manager):
        """Test that acquiring a locked resource blocks"""
        resource_id = 'order:123'
        
        # First lock acquired
        lock1 = await lock_manager.acquire_lock(resource_id)
        assert lock1 is not None
        
        # Second attempt should block
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(
                lock_manager.acquire_lock(resource_id),
                timeout=0.5
            )
    
    @pytest.mark.asyncio
    async def test_release_lock(self, lock_manager):
        """Test releasing a lock"""
        resource_id = 'order:123'
        
        lock = await lock_manager.acquire_lock(resource_id)
        released = await lock_manager.release_lock(resource_id)
        
        assert released == True
        
        # Should be able to acquire again
        lock2 = await lock_manager.acquire_lock(resource_id)
        assert lock2 is not None
    
    @pytest.mark.asyncio
    async def test_lock_timeout(self, lock_manager):
        """Test lock timeout and automatic release"""
        resource_id = 'order:123'
        
        # Acquire lock with short timeout
        lock = await lock_manager.acquire_lock(resource_id, timeout=1)
        
        # Wait for timeout
        await asyncio.sleep(1.5)
        
        # Lock should be automatically released
        lock2 = await lock_manager.acquire_lock(resource_id)
        assert lock2 is not None
    
    @pytest.mark.asyncio
    async def test_shared_locks_compatible(self, lock_manager):
        """Test that multiple shared locks can coexist"""
        resource_id = 'order:123'
        
        # Acquire multiple shared locks
        lock1 = await lock_manager.acquire_lock(resource_id, lock_type=LockType.SHARED)
        lock2 = await lock_manager.acquire_lock(resource_id, lock_type=LockType.SHARED)
        
        assert lock1 is not None
        assert lock2 is not None
    
    @pytest.mark.asyncio
    async def test_shared_and_exclusive_incompatible(self, lock_manager):
        """Test that shared and exclusive locks conflict"""
        resource_id = 'order:123'
        
        # Acquire shared lock
        lock1 = await lock_manager.acquire_lock(resource_id, lock_type=LockType.SHARED)
        
        # Exclusive lock should block
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(
                lock_manager.acquire_lock(resource_id, lock_type=LockType.EXCLUSIVE),
                timeout=0.5
            )
    
    @pytest.mark.asyncio
    async def test_lock_upgrade(self, lock_manager):
        """Test upgrading shared lock to exclusive"""
        resource_id = 'order:123'
        
        # Acquire shared lock
        shared_lock = await lock_manager.acquire_lock(resource_id, lock_type=LockType.SHARED)
        
        # Upgrade to exclusive
        exclusive_lock = await lock_manager.upgrade_lock(resource_id)
        
        assert exclusive_lock is not None
        assert exclusive_lock.lock_type == LockType.EXCLUSIVE
    
    @pytest.mark.asyncio
    async def test_deadlock_detection(self, lock_manager):
        """Test deadlock detection mechanism"""
        detector = DeadlockDetector(lock_manager)
        
        # Create circular wait: T1 -> R1, T2 -> R2, T1 waits for R2, T2 waits for R1
        await lock_manager.acquire_lock('resource1', transaction_id='T1')
        await lock_manager.acquire_lock('resource2', transaction_id='T2')
        
        # Record wait-for relationships
        lock_manager.add_wait_for('T1', 'resource2', 'T2')
        lock_manager.add_wait_for('T2', 'resource1', 'T1')
        
        # Detect deadlock
        has_deadlock = detector.detect_cycle()
        
        assert has_deadlock == True
    
    @pytest.mark.asyncio
    async def test_deadlock_resolution(self, lock_manager):
        """Test automatic deadlock resolution"""
        detector = DeadlockDetector(lock_manager)
        
        # Create deadlock scenario
        await lock_manager.acquire_lock('resource1', transaction_id='T1')
        await lock_manager.acquire_lock('resource2', transaction_id='T2')
        
        lock_manager.add_wait_for('T1', 'resource2', 'T2')
        lock_manager.add_wait_for('T2', 'resource1', 'T1')
        
        # Resolve deadlock (abort one transaction)
        aborted_tx = detector.resolve_deadlock()
        
        assert aborted_tx in ['T1', 'T2']


class TestTransactionManager:
    """Test cases for transaction management"""
    
    @pytest.fixture
    def tx_manager(self):
        """Create transaction manager"""
        return TransactionManager(node_id=1)
    
    @pytest.mark.asyncio
    async def test_begin_transaction(self, tx_manager):
        """Test starting a new transaction"""
        tx = await tx_manager.begin_transaction()
        
        assert tx is not None
        assert tx.status == 'active'
        assert tx.isolation_level == IsolationLevel.READ_COMMITTED
    
    @pytest.mark.asyncio
    async def test_commit_transaction(self, tx_manager):
        """Test committing a transaction"""
        tx = await tx_manager.begin_transaction()
        
        # Perform some operations
        await tx_manager.execute(tx.id, "UPDATE orders SET status='confirmed' WHERE id=1")
        
        # Commit
        result = await tx_manager.commit(tx.id)
        
        assert result == True
        assert tx.status == 'committed'
    
    @pytest.mark.asyncio
    async def test_rollback_transaction(self, tx_manager):
        """Test rolling back a transaction"""
        tx = await tx_manager.begin_transaction()
        
        # Perform operations
        await tx_manager.execute(tx.id, "UPDATE orders SET status='confirmed' WHERE id=1")
        
        # Rollback
        result = await tx_manager.rollback(tx.id)
        
        assert result == True
        assert tx.status == 'aborted'
    
    @pytest.mark.asyncio
    async def test_dirty_read_prevention(self, tx_manager):
        """Test that dirty reads are prevented"""
        # Transaction 1 writes but doesn't commit
        tx1 = await tx_manager.begin_transaction(isolation_level=IsolationLevel.READ_COMMITTED)
        await tx_manager.execute(tx1.id, "UPDATE orders SET status='confirmed' WHERE id=1")
        
        # Transaction 2 tries to read
        tx2 = await tx_manager.begin_transaction(isolation_level=IsolationLevel.READ_COMMITTED)
        result = await tx_manager.execute(tx2.id, "SELECT status FROM orders WHERE id=1")
        
        # Should not see uncommitted changes
        assert result['status'] != 'confirmed'
    
    @pytest.mark.asyncio
    async def test_lost_update_prevention(self, tx_manager):
        """Test prevention of lost updates"""
        # Two transactions try to update same record
        tx1 = await tx_manager.begin_transaction()
        tx2 = await tx_manager.begin_transaction()
        
        # Both read initial value
        val1 = await tx_manager.execute(tx1.id, "SELECT quantity FROM inventory WHERE id=1")
        val2 = await tx_manager.execute(tx2.id, "SELECT quantity FROM inventory WHERE id=1")
        
        # Both try to update
        await tx_manager.execute(tx1.id, "UPDATE inventory SET quantity=quantity-1 WHERE id=1")
        
        # Second update should detect conflict
        with pytest.raises(Exception, match="Conflict"):
            await tx_manager.execute(tx2.id, "UPDATE inventory SET quantity=quantity-1 WHERE id=1")
    
    @pytest.mark.asyncio
    async def test_optimistic_locking(self, tx_manager):
        """Test optimistic concurrency control"""
        tx = await tx_manager.begin_transaction()
        
        # Read with version
        data = await tx_manager.read(tx.id, 'order:123')
        version = data['version']
        
        # Update with version check
        result = await tx_manager.update(
            tx.id,
            'order:123',
            {'status': 'confirmed'},
            expected_version=version
        )
        
        assert result == True
    
    @pytest.mark.asyncio
    async def test_optimistic_locking_conflict(self, tx_manager):
        """Test optimistic locking detects conflicts"""
        tx1 = await tx_manager.begin_transaction()
        tx2 = await tx_manager.begin_transaction()
        
        # Both read same version
        data1 = await tx_manager.read(tx1.id, 'order:123')
        data2 = await tx_manager.read(tx2.id, 'order:123')
        
        # First commits successfully
        await tx_manager.update(tx1.id, 'order:123', {'status': 'confirmed'}, data1['version'])
        await tx_manager.commit(tx1.id)
        
        # Second should fail due to version mismatch
        with pytest.raises(Exception, match="Version"):
            await tx_manager.update(tx2.id, 'order:123', {'status': 'cancelled'}, data2['version'])
    
    @pytest.mark.asyncio
    async def test_two_phase_commit(self, tx_manager):
        """Test two-phase commit protocol"""
        tx = await tx_manager.begin_transaction()
        
        # Phase 1: Prepare
        prepare_results = await tx_manager.prepare(tx.id)
        
        assert all(prepare_results.values())  # All nodes vote yes
        
        # Phase 2: Commit
        commit_result = await tx_manager.commit_2pc(tx.id)
        
        assert commit_result == True
    
    @pytest.mark.asyncio
    async def test_two_phase_commit_abort(self, tx_manager):
        """Test 2PC aborts if any node votes no"""
        tx = await tx_manager.begin_transaction()
        
        # Simulate one node voting no
        with patch.object(tx_manager, 'prepare_on_node', side_effect=[True, False, True]):
            prepare_results = await tx_manager.prepare(tx.id)
            
            assert not all(prepare_results.values())
            
            # Should abort
            result = await tx_manager.abort_2pc(tx.id)
            assert result == True


class TestRaceConditionScenarios:
    """Test specific race condition scenarios"""
    
    @pytest.fixture
    def system(self):
        """Create system with lock and transaction managers"""
        return {
            'lock_manager': DistributedLockManager(node_id=1),
            'tx_manager': TransactionManager(node_id=1)
        }
    
    @pytest.mark.asyncio
    async def test_concurrent_order_updates(self, system):
        """Test concurrent updates to same order"""
        tx_manager = system['tx_manager']
        
        async def update_order_status(status):
            tx = await tx_manager.begin_transaction()
            await tx_manager.execute(tx.id, f"UPDATE orders SET status='{status}' WHERE id=1")
            await tx_manager.commit(tx.id)
        
        # Two concurrent updates
        results = await asyncio.gather(
            update_order_status('confirmed'),
            update_order_status('cancelled'),
            return_exceptions=True
        )
        
        # One should succeed, one should fail
        assert any(isinstance(r, Exception) for r in results)
    
    @pytest.mark.asyncio
    async def test_double_booking_prevention(self, system):
        """Test prevention of double booking delivery agents"""
        lock_manager = system['lock_manager']
        
        async def assign_agent(order_id, agent_id):
            # Try to lock agent
            lock = await lock_manager.acquire_lock(f'agent:{agent_id}', timeout=1)
            if lock:
                # Assign order
                await asyncio.sleep(0.1)  # Simulate assignment
                await lock_manager.release_lock(f'agent:{agent_id}')
                return True
            return False
        
        # Two orders try to book same agent
        results = await asyncio.gather(
            assign_agent(1, 'agent_1'),
            assign_agent(2, 'agent_1')
        )
        
        # Only one should succeed
        assert sum(results) == 1
    
    @pytest.mark.asyncio
    async def test_inventory_deduction_race(self, system):
        """Test race condition in inventory deduction"""
        tx_manager = system['tx_manager']
        
        async def place_order(item_id):
            tx = await tx_manager.begin_transaction()
            
            # Check inventory
            inventory = await tx_manager.execute(
                tx.id,
                f"SELECT quantity FROM inventory WHERE item_id={item_id} FOR UPDATE"
            )
            
            if inventory['quantity'] > 0:
                # Deduct
                await tx_manager.execute(
                    tx.id,
                    f"UPDATE inventory SET quantity=quantity-1 WHERE item_id={item_id}"
                )
                await tx_manager.commit(tx.id)
                return True
            else:
                await tx_manager.rollback(tx.id)
                return False
        
        # Multiple concurrent orders for last item
        results = await asyncio.gather(
            *[place_order(1) for _ in range(5)]
        )
        
        # Only one should succeed (if only 1 item in stock)
        assert sum(results) == 1


if __name__ == '__main__':
    pytest.main([__file__, '-v'])