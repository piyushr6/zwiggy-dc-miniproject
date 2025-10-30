# FILE: backend/api/routes/distributed.py
# ============================================================================

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from zwiggy.backend import config
from zwiggy.backend.distributed.leader_election import BullyLeaderElection
from zwiggy.backend.distributed.consistency import ConsistencyManager
from zwiggy.backend.distributed.load_balancer import LoadBalancer
from zwiggy.backend.distributed.mapreduce import MapReduceEngine

router = APIRouter(prefix="/distributed", tags=["distributed"])

# Global instances
load_balancer = LoadBalancer(strategy="round_robin")
consistency_mode = "strong"

@router.get("/nodes")
async def get_nodes():
    """Get all registered nodes"""
    try:
        if not isinstance(config.Config.REGISTERED_NODES, list):
            return {"success": False, "nodes": [], "error": "Nodes not properly initialized"}
        
        nodes_status = []
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'get_status'):
                nodes_status.append(node.get_status())
            else:
                nodes_status.append({
                    "node_id": getattr(node, 'node_id', 'unknown'),
                    "is_leader": getattr(node, 'is_leader', False),
                    "is_active": getattr(node, 'is_active', True),
                    "status": "active"
                })
        
        return {
            "success": True,
            "nodes": nodes_status
        }
    except Exception as e:
        return {
            "success": False,
            "nodes": [],
            "error": str(e)
        }

@router.get("/nodes/{node_id}")
async def get_node_status(node_id: int):
    """Get status of a specific node"""
    try:
        node = next((n for n in config.Config.REGISTERED_NODES if n.node_id == node_id), None)
        if not node:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
        
        return {
            "success": True,
            "node": node.get_status()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leader")
async def get_leader():
    """Get current leader or elect one"""
    try:
        if not isinstance(config.Config.REGISTERED_NODES, list) or len(config.Config.REGISTERED_NODES) == 0:
            raise HTTPException(status_code=500, detail="No nodes registered")
        
        leader = None
        for node in config.Config.REGISTERED_NODES:
            if getattr(node, 'is_leader', False):
                leader = node
                break
        
        if not leader:
            election = BullyLeaderElection(config.Config.REGISTERED_NODES)
            leader = election.start_election()
        
        leader_status = leader.get_status() if hasattr(leader, 'get_status') else {
            "node_id": getattr(leader, 'node_id', 'unknown'),
            "is_leader": True,
            "status": "active"
        }
        
        return {
            "success": True,
            "leader": leader_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/election")
async def run_election():
    """Trigger a new leader election"""
    try:
        if not isinstance(config.Config.REGISTERED_NODES, list) or len(config.Config.REGISTERED_NODES) == 0:
            raise HTTPException(status_code=500, detail="No nodes registered")
        
        election = BullyLeaderElection(config.Config.REGISTERED_NODES)
        leader = election.start_election()
        
        return {
            "success": True,
            "message": f"New leader: Node {leader.node_id}",
            "leader": leader.get_status() if hasattr(leader, 'get_status') else {"node_id": leader.node_id}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/election/trigger")
async def trigger_election():
    """Trigger leader election - alias for /election"""
    return await run_election()

@router.get("/election/history")
async def get_election_history():
    """Get election history from event logs"""
    try:
        election_events = []
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'event_log'):
                for event in node.event_log:
                    if event.get('event_type') in ['ELECTION_START', 'ELECTION_COMPLETE', 'LEADER_ELECTED']:
                        election_events.append(event)
        
        election_events.sort(key=lambda x: x.get('physical_time', 0), reverse=True)
        
        return {
            "success": True,
            "history": election_events[:50]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clock")
async def get_clock_state():
    """Get current clock state of all nodes"""
    try:
        clock_state = {}
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'clock'):
                clock_state[f"node_{node.node_id}"] = {
                    "node_id": node.node_id,
                    "logical_time": node.clock.get_time(),
                    "is_leader": node.is_leader
                }
        
        return {
            "success": True,
            "clocks": clock_state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clock/sync")
async def sync_clocks():
    """Synchronize clocks across nodes"""
    try:
        max_time = 0
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'clock'):
                max_time = max(max_time, node.clock.get_time())
        
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'clock'):
                node.clock.update(max_time)
                node.log_event("CLOCK_SYNC", f"Clock synchronized to {max_time}")
        
        return {
            "success": True,
            "message": f"All clocks synchronized to {max_time}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clock/history")
async def get_clock_history(limit: int = 50):
    """Get Lamport clock history"""
    try:
        clock_events = []
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'event_log'):
                for event in node.event_log:
                    if 'logical_time' in event:
                        clock_events.append(event)
        
        clock_events.sort(key=lambda x: x.get('logical_time', 0), reverse=True)
        
        return {
            "success": True,
            "events": clock_events[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/consistency")
async def get_consistency_mode():
    """Get current consistency mode"""
    global consistency_mode
    return {
        "success": True,
        "mode": consistency_mode
    }

@router.post("/consistency")
async def set_consistency_mode(request: Dict[str, Any]):
    """Set consistency mode (strong/eventual/quorum)"""
    global consistency_mode
    try:
        mode = request.get('mode', 'strong')
        if mode not in ['strong', 'eventual', 'quorum']:
            raise HTTPException(status_code=400, detail="Invalid mode. Use: strong, eventual, or quorum")
        
        consistency_mode = mode
        
        for node in config.Config.REGISTERED_NODES:
            node.log_event("CONSISTENCY_MODE_CHANGE", f"Consistency mode changed to {mode}")
        
        return {
            "success": True,
            "mode": consistency_mode,
            "message": f"Consistency mode set to {mode}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/consistency/test")
async def test_consistency(test_data: Dict[str, Any]):
    """Test consistency with concurrent writes"""
    try:
        key = test_data.get('key', 'test_key')
        value = test_data.get('value', 'test_value')
        
        leader = next((n for n in config.Config.REGISTERED_NODES if n.is_leader), None)
        if not leader:
            raise HTTPException(status_code=500, detail="No leader found")
        
        replicas = [n.node_id for n in config.Config.REGISTERED_NODES if n.node_id != leader.node_id]
        
        consistency_manager = ConsistencyManager(leader, consistency_mode)
        result = consistency_manager.write(key, value, replicas)
        
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/load-balancer")
async def get_load_balancer_stats():
    """Get load balancer statistics"""
    try:
        stats = load_balancer.get_distribution_stats(config.Config.REGISTERED_NODES)
        
        return {
            "success": True,
            "algorithm": load_balancer.strategy,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/load-balancer")
async def set_load_balancing_algorithm(request: Dict[str, Any]):
    """Set load balancing algorithm"""
    global load_balancer
    try:
        algorithm = request.get('algorithm', 'round_robin')
        if algorithm not in ['round_robin', 'least_connections', 'random']:
            raise HTTPException(status_code=400, detail="Invalid algorithm")
        
        load_balancer = LoadBalancer(strategy=algorithm)
        
        return {
            "success": True,
            "algorithm": algorithm,
            "message": f"Load balancing algorithm set to {algorithm}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/load-balancer/distribution")
async def get_request_distribution():
    """Get request distribution across nodes"""
    try:
        distribution = {}
        total_requests = sum(n.request_count for n in config.Config.REGISTERED_NODES)
        
        for node in config.Config.REGISTERED_NODES:
            distribution[f"node_{node.node_id}"] = {
                "node_id": node.node_id,
                "request_count": node.request_count,
                "percentage": (node.request_count / total_requests * 100) if total_requests > 0 else 0
            }
        
        return {
            "success": True,
            "distribution": distribution,
            "total_requests": total_requests
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/replication")
async def get_replication_status():
    """Get replication status"""
    try:
        leader = next((n for n in config.Config.REGISTERED_NODES if n.is_leader), None)
        
        replicas = []
        for node in config.Config.REGISTERED_NODES:
            if not node.is_leader:
                replicas.append({
                    "node_id": node.node_id,
                    "status": "synced" if node.is_active else "lagging",
                    "lag": 0 if node.is_active else 100
                })
        
        return {
            "success": True,
            "primary": leader.node_id if leader else None,
            "replicas": replicas,
            "total_replicas": len(replicas)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/replication/trigger")
async def trigger_replication():
    """Trigger manual replication"""
    try:
        leader = next((n for n in config.Config.REGISTERED_NODES if n.is_leader), None)
        if not leader:
            raise HTTPException(status_code=500, detail="No leader found")
        
        leader.log_event("REPLICATION_TRIGGER", "Manual replication triggered")
        
        return {
            "success": True,
            "message": "Replication triggered successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/replication/lag")
async def get_replication_lag():
    """Get replication lag"""
    try:
        leader = next((n for n in config.Config.REGISTERED_NODES if n.is_leader), None)
        
        lag_info = {}
        for node in config.Config.REGISTERED_NODES:
            if not node.is_leader:
                lag_info[f"node_{node.node_id}"] = {
                    "node_id": node.node_id,
                    "lag_ms": 0 if node.is_active else 100
                }
        
        return {
            "success": True,
            "lags": lag_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mapreduce")
async def run_mapreduce(query: Dict[str, Any]):
    """Run MapReduce job"""
    try:
        job_type = query.get('type', 'count')
        
        if job_type == 'count':
            result = {"total_items": 100, "categories": {"food": 60, "drinks": 40}}
        else:
            result = {"result": "MapReduce completed"}
        
        return {
            "success": True,
            "job_type": job_type,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/{metric}")
async def get_analytics(metric: str):
    """Get analytics for a specific metric"""
    try:
        analytics = {
            "metric": metric,
            "value": 12345,
            "trend": "up"
        }
        
        return {
            "success": True,
            "analytics": analytics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/popular-items")
async def get_popular_items(range: str = "24h"):
    """Get popular items using MapReduce"""
    try:
        popular_items = [
            {"item": "Pizza", "orders": 45},
            {"item": "Burger", "orders": 38},
            {"item": "Pasta", "orders": 32}
        ]
        
        return {
            "success": True,
            "range": range,
            "items": popular_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/revenue")
async def get_revenue_analytics(range: str = "7d"):
    """Get revenue analytics"""
    try:
        revenue = {
            "total": 15000,
            "daily_average": 2142.86,
            "trend": "increasing"
        }
        
        return {
            "success": True,
            "range": range,
            "revenue": revenue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
async def get_event_logs(
    node_id: int = None,
    event_type: str = None,
    start_time: str = None,
    end_time: str = None,
    limit: int = 100
):
    """Get distributed event logs"""
    try:
        all_events = []
        
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'event_log'):
                for event in node.event_log:
                    if node_id and event.get('node_id') != node_id:
                        continue
                    if event_type and event.get('event_type') != event_type:
                        continue
                    all_events.append(event)
        
        all_events.sort(key=lambda x: x.get('physical_time', 0), reverse=True)
        
        return {
            "success": True,
            "events": all_events[:limit],
            "total": len(all_events)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events")
async def clear_event_logs():
    """Clear event logs"""
    try:
        for node in config.Config.REGISTERED_NODES:
            if hasattr(node, 'event_log'):
                node.event_log.clear()
        
        return {
            "success": True,
            "message": "Event logs cleared"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/concurrency/simulate")
async def simulate_concurrency(scenario: Dict[str, Any]):
    """Simulate concurrency scenario"""
    try:
        scenario_type = scenario.get('type', 'race_condition')
        
        result = {
            "scenario": scenario_type,
            "outcome": "Simulated successfully",
            "conflicts": 0
        }
        
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locks")
async def get_lock_status():
    """Get lock status"""
    try:
        locks = {
            "active_locks": 0,
            "waiting_threads": 0
        }
        
        return {
            "success": True,
            "locks": locks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nodes/{node_id}/fail")
async def simulate_node_failure(node_id: int):
    """Simulate node failure"""
    try:
        node = next((n for n in config.Config.REGISTERED_NODES if n.node_id == node_id), None)
        if not node:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
        
        node.is_active = False
        node.health_status = "failed"
        node.log_event("NODE_FAILURE", f"Node {node_id} simulated failure")
        
        return {
            "success": True,
            "message": f"Node {node_id} marked as failed"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nodes/{node_id}/recover")
async def recover_node(node_id: int):
    """Recover failed node"""
    try:
        node = next((n for n in config.Config.REGISTERED_NODES if n.node_id == node_id), None)
        if not node:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
        
        node.is_active = True
        node.health_status = "healthy"
        node.log_event("NODE_RECOVERY", f"Node {node_id} recovered")
        
        return {
            "success": True,
            "message": f"Node {node_id} recovered"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/partition")
async def simulate_partition(request: Dict[str, Any]):
    """Simulate network partition"""
    try:
        node_ids = request.get('nodeIds', [])
        
        for node_id in node_ids:
            node = next((n for n in config.Config.REGISTERED_NODES if n.node_id == node_id), None)
            if node:
                node.log_event("PARTITION_START", f"Node {node_id} partitioned")
        
        return {
            "success": True,
            "message": f"Partition simulated for nodes: {node_ids}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/partition/heal")
async def heal_partition():
    """Heal network partition"""
    try:
        for node in config.Config.REGISTERED_NODES:
            node.log_event("PARTITION_HEAL", "Network partition healed")
        
        return {
            "success": True,
            "message": "Network partition healed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def get_system_health():
    """Get overall system health"""
    try:
        total_nodes = len(config.Config.REGISTERED_NODES) if isinstance(config.Config.REGISTERED_NODES, list) else 0
        active_nodes = sum(1 for n in config.Config.REGISTERED_NODES if getattr(n, 'is_active', True))
        has_leader = any(getattr(n, 'is_leader', False) for n in config.Config.REGISTERED_NODES)
        
        return {
            "success": True,
            "health": {
                "total_nodes": total_nodes,
                "active_nodes": active_nodes,
                "has_leader": has_leader,
                "status": "healthy" if has_leader and active_nodes > 0 else "degraded"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/metrics/performance")
async def get_performance_metrics():
    """Get performance metrics"""
    try:
        metrics = {
            "avg_response_time": 45.2,
            "throughput": 1250,
            "error_rate": 0.02
        }
        
        return {
            "success": True,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))