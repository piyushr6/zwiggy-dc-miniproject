"""
tests/backend/test_consistency.py
Unit tests for consistency models (Strong, Eventual, Quorum)
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime
import sys
sys.path.insert(0, '../../backend')

from distributed.consistency import (
    ConsistencyManager,
    ConsistencyLevel,
    ReadResult,
    WriteResult
)


class TestStrongConsistency:
    """Test cases for strong consistency model"""
    
    @pytest.fixture
    def consistency_manager(self):
        """Create consistency manager with strong consistency"""
        return ConsistencyManager(
            level=ConsistencyLevel.STRONG,
            num_replicas=3
        )
    
    @pytest.mark.asyncio
    async def test_write_blocks_until_all_replicas_sync(self, consistency_manager):
        """Test that writes block until all replicas are synchronized"""
        data = {'order_id': 1, 'status': 'confirmed'}
        
        result = await consistency_manager.write(data)
        
        assert result.success == True
        assert result.replicas_synced == 3
        assert result.consistency_level == ConsistencyLevel.STRONG
    
    @pytest.mark.asyncio
    async def test_read_returns_latest_write(self, consistency_manager):
        """Test that reads always return the most recent write"""
        # Write data
        await consistency_manager.write({'order_id': 1, 'status': 'pending'})
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed'})
        
        # Read data
        result = await consistency_manager.read(key='order_id:1')
        
        assert result.data['status'] == 'confirmed'
        assert result.is_stale == False
    
    @pytest.mark.asyncio
    async def test_write_fails_if_replica_unavailable(self, consistency_manager):
        """Test that write fails if any replica is unavailable"""
        with patch.object(consistency_manager, 'sync_to_replica', side_effect=Exception("Replica down")):
            data = {'order_id': 1, 'status': 'confirmed'}
            
            with pytest.raises(Exception):
                await consistency_manager.write(data)
    
    @pytest.mark.asyncio
    async def test_linearizability(self, consistency_manager):
        """Test linearizability - operations appear atomic"""
        # Concurrent reads and writes
        async def write_task():
            for i in range(5):
                await consistency_manager.write({'counter': i})
        
        async def read_task():
            values = []
            for _ in range(5):
                result = await consistency_manager.read(key='counter')
                values.append(result.data['counter'])
            return values
        
        write_future = asyncio.create_task(write_task())
        read_future = asyncio.create_task(read_task())
        
        await write_future
        values = await read_future
        
        # Values should be monotonically increasing (linearizable)
        assert values == sorted(values)


class TestEventualConsistency:
    """Test cases for eventual consistency model"""
    
    @pytest.fixture
    def consistency_manager(self):
        """Create consistency manager with eventual consistency"""
        return ConsistencyManager(
            level=ConsistencyLevel.EVENTUAL,
            num_replicas=3
        )
    
    @pytest.mark.asyncio
    async def test_write_returns_immediately(self, consistency_manager):
        """Test that writes return immediately without waiting for replication"""
        data = {'order_id': 1, 'status': 'confirmed'}
        
        start_time = asyncio.get_event_loop().time()
        result = await consistency_manager.write(data)
        duration = asyncio.get_event_loop().time() - start_time
        
        assert result.success == True
        assert duration < 0.1  # Should be very fast
        assert result.replicas_synced >= 1  # At least primary
    
    @pytest.mark.asyncio
    async def test_read_may_return_stale_data(self, consistency_manager):
        """Test that reads may return stale data before replication completes"""
        # Write to primary
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed'})
        
        # Immediate read from replica may be stale
        with patch.object(consistency_manager, 'get_replica_data', return_value={'order_id': 1, 'status': 'pending'}):
            result = await consistency_manager.read(key='order_id:1', prefer_replica=True)
            
            assert result.data['status'] == 'pending'
            assert result.is_stale == True
    
    @pytest.mark.asyncio
    async def test_eventual_convergence(self, consistency_manager):
        """Test that all replicas eventually converge to same state"""
        data = {'order_id': 1, 'status': 'confirmed'}
        
        await consistency_manager.write(data)
        
        # Wait for replication
        await asyncio.sleep(1)
        
        # Check all replicas
        for replica_id in range(consistency_manager.num_replicas):
            replica_data = await consistency_manager.read_from_replica(replica_id, key='order_id:1')
            assert replica_data['status'] == 'confirmed'
    
    @pytest.mark.asyncio
    async def test_write_continues_on_replica_failure(self, consistency_manager):
        """Test that writes succeed even if some replicas fail"""
        with patch.object(consistency_manager, 'sync_to_replica', side_effect=[None, Exception("Replica down"), None]):
            data = {'order_id': 1, 'status': 'confirmed'}
            
            result = await consistency_manager.write(data)
            
            # Should succeed despite one replica failure
            assert result.success == True
            assert result.replicas_synced >= 1
    
    @pytest.mark.asyncio
    async def test_conflict_resolution_last_write_wins(self, consistency_manager):
        """Test conflict resolution using last-write-wins strategy"""
        # Simulate concurrent writes to different replicas
        await consistency_manager.write({'order_id': 1, 'status': 'pending'}, timestamp=100)
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed'}, timestamp=200)
        
        # Wait for convergence
        await asyncio.sleep(1)
        
        result = await consistency_manager.read(key='order_id:1')
        
        # Later write should win
        assert result.data['status'] == 'confirmed'


class TestQuorumConsistency:
    """Test cases for quorum-based consistency"""
    
    @pytest.fixture
    def consistency_manager(self):
        """Create consistency manager with quorum consistency"""
        return ConsistencyManager(
            level=ConsistencyLevel.QUORUM,
            num_replicas=5,
            read_quorum=3,
            write_quorum=3
        )
    
    @pytest.mark.asyncio
    async def test_write_requires_quorum(self, consistency_manager):
        """Test that writes require majority quorum"""
        data = {'order_id': 1, 'status': 'confirmed'}
        
        result = await consistency_manager.write(data)
        
        assert result.success == True
        assert result.replicas_synced >= 3  # Write quorum
    
    @pytest.mark.asyncio
    async def test_read_requires_quorum(self, consistency_manager):
        """Test that reads require majority quorum"""
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed'})
        
        result = await consistency_manager.read(key='order_id:1')
        
        assert result.success == True
        assert result.replicas_read >= 3  # Read quorum
    
    @pytest.mark.asyncio
    async def test_write_fails_without_quorum(self, consistency_manager):
        """Test that writes fail if quorum cannot be achieved"""
        # Simulate only 2 replicas available (need 3)
        with patch.object(consistency_manager, 'get_available_replicas', return_value=2):
            data = {'order_id': 1, 'status': 'confirmed'}
            
            result = await consistency_manager.write(data)
            
            assert result.success == False
    
    @pytest.mark.asyncio
    async def test_read_plus_write_quorum_guarantees_consistency(self, consistency_manager):
        """Test that R + W > N guarantees strong consistency"""
        # With 5 replicas, R=3, W=3, we have R+W=6 > N=5
        # This guarantees any read will see the latest write
        
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed'})
        result = await consistency_manager.read(key='order_id:1')
        
        assert result.data['status'] == 'confirmed'
        assert result.is_stale == False
    
    @pytest.mark.asyncio
    async def test_versioning_with_quorum(self, consistency_manager):
        """Test version vectors in quorum reads"""
        # Write with version
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed', 'version': 1})
        await consistency_manager.write({'order_id': 1, 'status': 'ready', 'version': 2})
        
        result = await consistency_manager.read(key='order_id:1')
        
        # Should return latest version
        assert result.data['version'] == 2
        assert result.data['status'] == 'ready'
    
    @pytest.mark.asyncio
    async def test_sloppy_quorum_with_hinted_handoff(self, consistency_manager):
        """Test sloppy quorum with hinted handoff"""
        # Simulate one replica down
        with patch.object(consistency_manager, 'is_replica_available', side_effect=[True, True, False, True, True]):
            data = {'order_id': 1, 'status': 'confirmed'}
            
            result = await consistency_manager.write_with_hinted_handoff(data)
            
            # Should use hinted handoff to maintain quorum
            assert result.success == True
            assert result.hinted_handoff_used == True


class TestConsistencyLevelSwitching:
    """Test dynamic switching between consistency levels"""
    
    @pytest.fixture
    def consistency_manager(self):
        """Create consistency manager"""
        return ConsistencyManager(
            level=ConsistencyLevel.EVENTUAL,
            num_replicas=3
        )
    
    @pytest.mark.asyncio
    async def test_switch_to_strong_consistency(self, consistency_manager):
        """Test switching from eventual to strong consistency"""
        # Initial state: eventual
        assert consistency_manager.level == ConsistencyLevel.EVENTUAL
        
        # Switch to strong
        consistency_manager.set_consistency_level(ConsistencyLevel.STRONG)
        
        # Verify behavior changed
        result = await consistency_manager.write({'order_id': 1, 'status': 'confirmed'})
        assert result.replicas_synced == 3  # All replicas
    
    @pytest.mark.asyncio
    async def test_consistency_level_per_operation(self, consistency_manager):
        """Test specifying consistency level per operation"""
        # Write with strong consistency
        result1 = await consistency_manager.write(
            {'order_id': 1, 'status': 'confirmed'},
            consistency_override=ConsistencyLevel.STRONG
        )
        assert result1.replicas_synced == 3
        
        # Write with eventual consistency
        result2 = await consistency_manager.write(
            {'order_id': 2, 'status': 'pending'},
            consistency_override=ConsistencyLevel.EVENTUAL
        )
        assert result2.replicas_synced >= 1


class TestConsistencyMetrics:
    """Test consistency monitoring and metrics"""
    
    @pytest.fixture
    def consistency_manager(self):
        return ConsistencyManager(
            level=ConsistencyLevel.QUORUM,
            num_replicas=3
        )
    
    @pytest.mark.asyncio
    async def test_track_replication_lag(self, consistency_manager):
        """Test tracking replication lag across replicas"""
        await consistency_manager.write({'order_id': 1, 'status': 'confirmed'})
        
        metrics = consistency_manager.get_replication_metrics()
        
        assert 'avg_lag' in metrics
        assert 'max_lag' in metrics
        assert 'replicas_behind' in metrics
    
    @pytest.mark.asyncio
    async def test_track_consistency_violations(self, consistency_manager):
        """Test tracking consistency violations"""
        # Simulate stale read
        with patch.object(consistency_manager, 'detect_stale_read', return_value=True):
            await consistency_manager.read(key='order_id:1')
        
        violations = consistency_manager.get_consistency_violations()
        
        assert violations['stale_reads'] > 0
    
    @pytest.mark.asyncio
    async def test_success_rate_tracking(self, consistency_manager):
        """Test tracking read/write success rates"""
        # Perform operations
        for i in range(10):
            await consistency_manager.write({'order_id': i, 'status': 'confirmed'})
        
        for i in range(10):
            await consistency_manager.read(key=f'order_id:{i}')
        
        stats = consistency_manager.get_stats()
        
        assert stats['write_success_rate'] >= 0.9
        assert stats['read_success_rate'] >= 0.9
        assert stats['total_operations'] == 20


@pytest.mark.integration
class TestConsistencyIntegration:
    """Integration tests for consistency across distributed nodes"""
    
    @pytest.mark.asyncio
    async def test_multi_datacenter_consistency(self):
        """Test consistency across multiple datacenters"""
        dc1_manager = ConsistencyManager(level=ConsistencyLevel.QUORUM, num_replicas=3)
        dc2_manager = ConsistencyManager(level=ConsistencyLevel.QUORUM, num_replicas=3)
        
        # Write in DC1
        await dc1_manager.write({'order_id': 1, 'status': 'confirmed'})
        
        # Wait for cross-DC replication
        await asyncio.sleep(0.5)
        
        # Read from DC2
        result = await dc2_manager.read(key='order_id:1')
        
        assert result.data['status'] == 'confirmed'
    
    @pytest.mark.asyncio
    async def test_partition_tolerance(self):
        """Test behavior during network partition"""
        manager = ConsistencyManager(
            level=ConsistencyLevel.QUORUM,
            num_replicas=5,
            read_quorum=3,
            write_quorum=3
        )
        
        # Simulate network partition (2 replicas isolated)
        with patch.object(manager, 'get_available_replicas', return_value=3):
            # Should still achieve quorum
            result = await manager.write({'order_id': 1, 'status': 'confirmed'})
            assert result.success == True
    
    @pytest.mark.asyncio
    async def test_cap_theorem_tradeoffs(self):
        """Test CAP theorem tradeoffs in different scenarios"""
        # Partition scenario - choose between consistency and availability
        manager = ConsistencyManager(level=ConsistencyLevel.STRONG, num_replicas=3)
        
        with patch.object(manager, 'can_reach_all_replicas', return_value=False):
            # Strong consistency sacrifices availability
            with pytest.raises(Exception):
                await manager.write({'order_id': 1, 'status': 'confirmed'})
        
        # Switch to eventual consistency
        manager.set_consistency_level(ConsistencyLevel.EVENTUAL)
        
        with patch.object(manager, 'can_reach_all_replicas', return_value=False):
            # Eventual consistency maintains availability
            result = await manager.write({'order_id': 1, 'status': 'confirmed'})
            assert result.success == True


if __name__ == '__main__':
    pytest.main([__file__, '-v'])