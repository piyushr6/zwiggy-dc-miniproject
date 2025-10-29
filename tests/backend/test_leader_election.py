"""
tests/backend/test_leader_election.py
Unit tests for Bully algorithm leader election
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
import sys
sys.path.insert(0, '../../backend')

from distributed.leader_election import BullyLeaderElection, Node, NodeStatus


class TestBullyLeaderElection:
    """Test cases for Bully algorithm implementation"""
    
    @pytest.fixture
    def nodes(self):
        """Create test nodes"""
        return [
            Node(id=1, priority=1, status=NodeStatus.ACTIVE),
            Node(id=2, priority=2, status=NodeStatus.ACTIVE),
            Node(id=3, priority=3, status=NodeStatus.ACTIVE)
        ]
    
    @pytest.fixture
    def election_manager(self, nodes):
        """Create election manager with test nodes"""
        manager = BullyLeaderElection(node_id=1)
        manager.nodes = {node.id: node for node in nodes}
        return manager
    
    def test_node_initialization(self):
        """Test node object initialization"""
        node = Node(id=1, priority=5, status=NodeStatus.ACTIVE)
        
        assert node.id == 1
        assert node.priority == 5
        assert node.status == NodeStatus.ACTIVE
        assert node.is_leader == False
    
    def test_highest_priority_becomes_leader(self, election_manager, nodes):
        """Test that node with highest priority becomes leader"""
        leader = election_manager.elect_leader()
        
        assert leader is not None
        assert leader.id == 3  # Node 3 has highest priority
        assert leader.is_leader == True
    
    def test_election_with_failed_nodes(self, election_manager, nodes):
        """Test election when some nodes have failed"""
        # Node 3 (highest priority) fails
        election_manager.nodes[3].status = NodeStatus.FAILED
        
        leader = election_manager.elect_leader()
        
        assert leader is not None
        assert leader.id == 2  # Node 2 should become leader
        assert leader.is_leader == True
    
    def test_election_with_all_but_one_failed(self, election_manager):
        """Test election when only one node remains active"""
        # All nodes except node 1 fail
        election_manager.nodes[2].status = NodeStatus.FAILED
        election_manager.nodes[3].status = NodeStatus.FAILED
        
        leader = election_manager.elect_leader()
        
        assert leader is not None
        assert leader.id == 1
        assert leader.is_leader == True
    
    def test_no_leader_when_all_failed(self, election_manager):
        """Test that no leader is elected when all nodes fail"""
        # All nodes fail
        for node in election_manager.nodes.values():
            node.status = NodeStatus.FAILED
        
        leader = election_manager.elect_leader()
        
        assert leader is None
    
    def test_higher_priority_node_bullies_lower(self, election_manager):
        """Test that higher priority node can bully lower priority leader"""
        # Node 1 is current leader
        election_manager.nodes[1].is_leader = True
        election_manager.current_leader_id = 1
        
        # Node 3 comes online and triggers election
        result = election_manager.start_election(initiator_id=3)
        
        assert result == 3
        assert election_manager.nodes[3].is_leader == True
        assert election_manager.nodes[1].is_leader == False
    
    def test_election_message_to_higher_priority_nodes(self, election_manager):
        """Test that election messages are sent to higher priority nodes only"""
        higher_nodes = election_manager.get_higher_priority_nodes(node_id=1)
        
        assert len(higher_nodes) == 2
        assert all(node.priority > 1 for node in higher_nodes)
    
    def test_coordinator_message_broadcast(self, election_manager):
        """Test coordinator message is broadcast to all nodes"""
        election_manager.nodes[3].is_leader = True
        election_manager.current_leader_id = 3
        
        recipients = election_manager.get_broadcast_targets()
        
        assert len(recipients) == 2  # All nodes except leader
        assert 3 not in [node.id for node in recipients]
    
    @pytest.mark.asyncio
    async def test_heartbeat_detection(self, election_manager):
        """Test leader failure detection via heartbeat"""
        election_manager.nodes[3].is_leader = True
        election_manager.current_leader_id = 3
        election_manager.last_heartbeat = asyncio.get_event_loop().time() - 10
        
        is_alive = await election_manager.check_leader_heartbeat(timeout=5)
        
        assert is_alive == False
    
    @pytest.mark.asyncio
    async def test_election_triggered_on_leader_failure(self, election_manager):
        """Test that election is automatically triggered when leader fails"""
        election_manager.nodes[3].is_leader = True
        election_manager.current_leader_id = 3
        
        # Simulate leader failure
        election_manager.nodes[3].status = NodeStatus.FAILED
        
        new_leader_id = await election_manager.handle_leader_failure()
        
        assert new_leader_id == 2  # Next highest priority
        assert election_manager.nodes[2].is_leader == True
    
    def test_election_history_recorded(self, election_manager):
        """Test that election events are recorded in history"""
        leader = election_manager.elect_leader()
        
        assert len(election_manager.election_history) > 0
        last_election = election_manager.election_history[-1]
        assert last_election['winner'] == leader.id
        assert 'timestamp' in last_election
        assert 'participants' in last_election
    
    def test_multiple_simultaneous_elections(self, election_manager):
        """Test handling of multiple simultaneous election requests"""
        # Multiple nodes start elections simultaneously
        results = []
        for node_id in [1, 2]:
            result = election_manager.start_election(initiator_id=node_id)
            results.append(result)
        
        # All should converge to the same leader
        assert len(set(results)) == 1
        assert results[0] == 3  # Highest priority node
    
    def test_node_recovery_triggers_election(self, election_manager):
        """Test that recovered node with higher priority triggers election"""
        # Node 2 is leader, Node 3 is failed
        election_manager.nodes[2].is_leader = True
        election_manager.nodes[3].status = NodeStatus.FAILED
        election_manager.current_leader_id = 2
        
        # Node 3 recovers
        election_manager.nodes[3].status = NodeStatus.ACTIVE
        new_leader = election_manager.handle_node_recovery(node_id=3)
        
        assert new_leader.id == 3
        assert election_manager.nodes[3].is_leader == True
        assert election_manager.nodes[2].is_leader == False
    
    def test_election_timeout_handling(self, election_manager):
        """Test handling of election timeout"""
        with patch.object(election_manager, 'wait_for_response', return_value=None):
            # Simulate timeout - no response from higher priority nodes
            leader = election_manager.elect_leader_with_timeout(timeout=2)
            
            # Should elect itself after timeout
            assert leader is not None
    
    def test_priority_uniqueness(self, election_manager):
        """Test handling when multiple nodes have same priority"""
        # Set same priority for two nodes
        election_manager.nodes[1].priority = 3
        election_manager.nodes[3].priority = 3
        
        leader = election_manager.elect_leader()
        
        # Should use node ID as tiebreaker (higher ID wins)
        assert leader.id == 3


@pytest.mark.integration
class TestLeaderElectionIntegration:
    """Integration tests for leader election across multiple nodes"""
    
    @pytest.mark.asyncio
    async def test_full_election_cycle(self):
        """Test complete election cycle with message passing"""
        # Create multiple election managers
        nodes_config = [
            {'id': 1, 'priority': 1},
            {'id': 2, 'priority': 2},
            {'id': 3, 'priority': 3}
        ]
        
        managers = []
        for config in nodes_config:
            manager = BullyLeaderElection(node_id=config['id'])
            for c in nodes_config:
                manager.add_node(Node(id=c['id'], priority=c['priority'], status=NodeStatus.ACTIVE))
            managers.append(manager)
        
        # Start election from lowest priority node
        leader_id = await managers[0].start_election_async()
        
        # Verify all managers agree on leader
        for manager in managers:
            assert manager.current_leader_id == 3
    
    @pytest.mark.asyncio
    async def test_cascading_failures(self):
        """Test election through cascading node failures"""
        manager = BullyLeaderElection(node_id=1)
        for i in range(1, 6):
            manager.add_node(Node(id=i, priority=i, status=NodeStatus.ACTIVE))
        
        # Initial election
        leader = manager.elect_leader()
        assert leader.id == 5
        
        # Nodes fail one by one from highest to lowest
        for node_id in [5, 4, 3]:
            manager.nodes[node_id].status = NodeStatus.FAILED
            leader = manager.elect_leader()
            assert leader.id == node_id - 1


if __name__ == '__main__':
    pytest.main([__file__, '-v'])