from fastapi import APIRouter

from zwiggy.backend.distributed import load_balancer
from zwiggy.backend.distributed.leader_election import BullyLeaderElection
from zwiggy.backend.simulation import failure_injector

router = APIRouter(prefix="/distributed", tags=["distributed"])

@router.get("/nodes")
async def get_nodes_status():
    """Get status of all nodes"""
    return {
        "success": True,
        "nodes": [node.get_status() for node in all_nodes]
    }

@router.get("/leader")
async def get_leader():
    """Get current leader"""
    leader = None
    for node in all_nodes:
        if node.is_leader:
            leader = node
            break
    
    return {
        "success": True,
        "leader": leader.get_status() if leader else None
    }

@router.post("/election")
async def trigger_election():
    """Trigger leader election"""
    # Start election from random node
    import random
    active_nodes = [n for n in all_nodes if n.is_active]
    
    if active_nodes:
        node = random.choice(active_nodes)
        election = BullyLeaderElection(node, Config.ALL_NODES)
        election.start_election()
        
        return {
            "success": True,
            "message": f"Election triggered by Node {node.node_id}"
        }
    
    return {"success": False, "message": "No active nodes"}

@router.get("/events")
async def get_events():
    """Get all distributed events"""
    all_events = []
    
    for node in all_nodes:
        all_events.extend(node.event_log)
    
    # Sort by logical time
    all_events.sort(key=lambda e: e["logical_time"])
    
    return {
        "success": True,
        "count": len(all_events),
        "events": all_events
    }

@router.get("/load-balance-stats")
async def get_load_balance_stats():
    """Get load balancing statistics"""
    stats = load_balancer.get_distribution_stats(all_nodes)
    
    return {
        "success": True,
        "strategy": load_balancer.strategy,
        "stats": stats
    }

@router.post("/simulate/failure/{node_id}")
async def simulate_failure(node_id: int):
    """Simulate node failure"""
    failure_injector.simulate_node_failure(node_id)
    
    return {
        "success": True,
        "message": f"Node {node_id} failed"
    }

@router.post("/simulate/recovery/{node_id}")
async def simulate_recovery(node_id: int):
    """Simulate node recovery"""
    failure_injector.simulate_node_recovery(node_id)
    
    return {
        "success": True,
        "message": f"Node {node_id} recovered"
    }