import json
from datetime import datetime
from typing import List

from zwiggy.backend.core.node import DistributedNode

def serialize_datetime(obj):
    """JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def print_divider(title: str = ""):
    """Print formatted divider"""
    if title:
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}\n")
    else:
        print(f"{'='*60}\n")

def print_node_status(nodes: List[DistributedNode]):
    """Print status of all nodes"""
    print("\n" + "="*60)
    print("NODE STATUS")
    print("="*60)
    
    for node in nodes:
        status = "🟢" if node.is_active else "🔴"
        leader = "👑" if node.is_leader else "  "
        print(f"{status} {leader} Node {node.node_id} | "
              f"Priority: {node.priority} | "
              f"Requests: {node.request_count} | "
              f"Clock: {node.clock.get_time()}")
    
    print("="*60 + "\n")


