"""
Standalone demo script to showcase all distributed features
Run this to see the system in action without starting the web server
"""

import time
import random
from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend.core.message_queue import message_queue
from zwiggy.backend.distributed.leader_election import BullyLeaderElection
from zwiggy.backend.distributed.consistency import ConsistencyManager
from zwiggy.backend.distributed.load_balancer import LoadBalancer
from zwiggy.backend.services.order_service import OrderService
from zwiggy.backend.services.restaurant_service import RestaurantService
from zwiggy.backend.services.analytics_service import AnalyticsService
from zwiggy.backend.simulation.traffic_generator import TrafficGenerator
from zwiggy.backend.simulation.failure_injector import FailureInjector
from zwiggy.backend.simulation.clock_drift import ClockDriftSimulator
from zwiggy.backend.config import Config
from zwiggy.backend.utils.helpers import print_divider, print_node_status

class NodeRegistry:
    """Global registry for node status"""
    nodes = {}
    
    @classmethod
    def register(cls, node):
        cls.nodes[node.node_id] = node
    
    @classmethod
    def is_node_active(cls, node_id):
        return cls.nodes.get(node_id, None) and cls.nodes[node_id].is_active
    
    @classmethod
    def set_leader(cls, leader_id):
        for node in cls.nodes.values():
            node.is_leader = (node.node_id == leader_id)
            node.current_leader_id = leader_id


def demo_1_basic_workflow():
    """Demo 1: Basic food delivery workflow"""
    print_divider("DEMO 1: BASIC FOOD DELIVERY WORKFLOW")
    
    # Initialize node
    node = DistributedNode(node_id=1, priority=1)
    NodeRegistry.register(node)
    
    # Initialize services
    restaurant_service = RestaurantService()
    order_service = OrderService(node)
    
    # Show restaurants
    print("Available Restaurants:")
    for restaurant in restaurant_service.get_restaurants():
        print(f"  - {restaurant.name} ({restaurant.cuisine}) ⭐{restaurant.rating}")
    
    print("\n")
    
    # Create order
    print("Creating order...")
    order = order_service.create_order(
        user_id=101,
        restaurant_id=1,
        items=[
            {"item_id": 1, "item_name": "Margherita Pizza", "quantity": 2, "price": 12.99},
            {"item_id": 3, "item_name": "Pasta Alfredo", "quantity": 1, "price": 11.99}
        ]
    )
    
    print(f"✓ Order {order.order_id} created")
    print(f"  Total: ${order.total_amount:.2f}")
    print(f"  Status: {order.status}")
    print(f"  Logical Timestamp: {order.logical_timestamp}")


def demo_2_concurrency():
    """Demo 2: Concurrency & Race Conditions"""
    print_divider("DEMO 2: CONCURRENCY & RACE CONDITIONS")
    
    node = DistributedNode(node_id=1, priority=1)
    NodeRegistry.register(node)
    order_service = OrderService(node)
    traffic_gen = TrafficGenerator(order_service)
    
    # Test WITHOUT locks
    print("TEST 1: WITHOUT LOCKS (Race Conditions)")
    print("-" * 60)
    traffic_gen.results = []
    traffic_gen.generate_concurrent_orders(5, restaurant_id=1, use_locks=False)
    
    time.sleep(1)
    
    # Test WITH locks
    print("\nTEST 2: WITH LOCKS (Thread Safe)")
    print("-" * 60)
    traffic_gen.results = []
    traffic_gen.generate_concurrent_orders(5, restaurant_id=1, use_locks=True)


def demo_3_clock_sync():
    """Demo 3: Clock Synchronization"""
    print_divider("DEMO 3: CLOCK SYNCHRONIZATION (Lamport Clocks)")
    
    # Create multiple nodes
    nodes = []
    for i in range(1, 4):
        node = DistributedNode(node_id=i, priority=i)
        NodeRegistry.register(node)
        nodes.append(node)
    
    clock_drift = ClockDriftSimulator(nodes)
    clock_drift.apply_random_drift()
    
    print("Simulating distributed events...\n")
    
    # Node 1 creates order
    nodes[0].log_event("ORDER_CREATE", "User 101 placed order")
    time.sleep(0.1)
    
    # Node 2 processes payment
    nodes[1].clock.update(nodes[0].clock.get_time())
    nodes[1].log_event("PAYMENT_PROCESS", "Payment processed")
    time.sleep(0.1)
    
    # Node 3 assigns delivery
    nodes[2].clock.update(nodes[1].clock.get_time())
    nodes[2].log_event("DELIVERY_ASSIGN", "Delivery agent assigned")
    
    # Show events
    print("Event Timeline (by Logical Clock):")
    print("-" * 80)
    
    all_events = []
    for node in nodes:
        all_events.extend(node.event_log)
    
    all_events.sort(key=lambda e: e["logical_time"])
    
    for event in all_events:
        print(f"[Clock: {event['logical_time']:3d}] Node {event['node_id']}: {event['description']}")


def demo_4_leader_election():
    """Demo 4: Leader Election (Bully Algorithm)"""
    print_divider("DEMO 4: LEADER ELECTION (BULLY ALGORITHM)")
    
    # Create nodes
    nodes = []
    for i in range(1, 4):
        node = DistributedNode(node_id=i, priority=i)
        NodeRegistry.register(node)
        message_queue.create_queue(i)
        nodes.append(node)
    
    print("Initial Setup: 3 nodes active\n")
    print_node_status(nodes)
    
    # Initial election
    print("Starting initial election from Node 1...")
    election = BullyLeaderElection(nodes[0], Config.ALL_NODES)
    election.start_election()
    time.sleep(0.5)
    
    print_node_status(nodes)
    
    # Simulate leader failure
    print("Simulating leader failure...")
    failure_injector = FailureInjector(nodes)
    leader_node = next((n for n in nodes if n.is_leader), None)
    if leader_node:
        failure_injector.simulate_node_failure(leader_node.node_id)
    
    print_node_status(nodes)
    
    # New election
    print("Starting new election...")
    active_node = next((n for n in nodes if n.is_active and not n.is_leader), None)
    if active_node:
        election = BullyLeaderElection(active_node, Config.ALL_NODES)
        election.start_election()
        time.sleep(0.5)
    
    print_node_status(nodes)


def demo_5_consistency():
    """Demo 5: Data Consistency Models"""
    print_divider("DEMO 5: DATA CONSISTENCY MODELS")
    
    node = DistributedNode(node_id=1, priority=1)
    NodeRegistry.register(node)
    
    replicas = [2, 3]
    
    # Test different consistency modes
    modes = ["strong", "eventual", "quorum"]
    
    for mode in modes:
        print(f"\nTesting {mode.upper()} Consistency:")
        print("-" * 60)
        
        consistency_mgr = ConsistencyManager(node, mode=mode)
        
        result = consistency_mgr.write(
            key="order_123_status",
            value="delivered",
            replicas=replicas
        )
        
        print(f"Mode: {result['mode']}")
        print(f"Acknowledged by nodes: {result['acks']}")
        print(f"Latency: {result['latency_ms']}ms")
        print(f"Success: {result['success']}")


def demo_6_load_balancing():
    """Demo 6: Load Balancing"""
    print_divider("DEMO 6: LOAD BALANCING")
    
    # Create nodes
    nodes = []
    for i in range(1, 4):
        node = DistributedNode(node_id=i, priority=i)
        NodeRegistry.register(node)
        nodes.append(node)
    
    # Test Round Robin
    print("Testing ROUND ROBIN Strategy:")
    print("-" * 60)
    
    lb = LoadBalancer(strategy="round_robin")
    
    for i in range(9):
        selected = lb.select_node(nodes)
        selected.increment_requests()
        print(f"Request {i+1} → Node {selected.node_id}")
    
    print("\nLoad Distribution:")
    stats = lb.get_distribution_stats(nodes)
    for node_id, stat in stats.items():
        print(f"  Node {node_id}: {stat['request_count']} requests ({stat['percentage']:.1f}%)")
    
    # Reset counts
    for node in nodes:
        node.request_count = 0
    
    print("\n\nTesting LEAST CONNECTIONS Strategy:")
    print("-" * 60)
    
    lb = LoadBalancer(strategy="least_connections")
    
    for i in range(9):
        selected = lb.select_node(nodes)
        selected.increment_requests()
        print(f"Request {i+1} → Node {selected.node_id} (current load: {selected.request_count})")
    
    print("\nLoad Distribution:")
    stats = lb.get_distribution_stats(nodes)
    for node_id, stat in stats.items():
        print(f"  Node {node_id}: {stat['request_count']} requests ({stat['percentage']:.1f}%)")


def demo_7_mapreduce():
    """Demo 7: MapReduce Analytics"""
    print_divider("DEMO 7: MAPREDUCE ANALYTICS")
    
    # Create nodes and orders
    nodes = []
    all_orders = []
    
    for i in range(1, 4):
        node = DistributedNode(node_id=i, priority=i)
        NodeRegistry.register(node)
        nodes.append(node)
        
        order_service = OrderService(node)
        
        # Create some orders
        for j in range(3):
            order = order_service.create_order(
                user_id=random.randint(100, 200),
                restaurant_id=random.randint(1, 3),
                items=[
                    {
                        "item_id": random.randint(1, 9),
                        "item_name": random.choice(["Pizza", "Burger", "Sushi", "Pasta", "Fries"]),
                        "quantity": random.randint(1, 3),
                        "price": random.uniform(5.0, 20.0)
                    }
                ]
            )
            all_orders.append(order)
    
    print(f"Created {len(all_orders)} orders across {len(nodes)} nodes\n")
    
    # Run MapReduce analytics
    analytics = AnalyticsService(nodes)
    
    print("Running MapReduce: Top Selling Items")
    print("-" * 60)
    results = analytics.get_top_selling_items(all_orders)
    
    print("\nResults:")
    for item, count in sorted(results.items(), key=lambda x: x[1], reverse=True):
        print(f"  {item}: {count} units sold")
    
    print("\n\nRunning MapReduce: Revenue by Restaurant")
    print("-" * 60)
    revenue_results = analytics.get_revenue_by_restaurant(all_orders)
    
    print("\nResults:")
    for restaurant_id, revenue in revenue_results.items():
        print(f"  Restaurant {restaurant_id}: ${revenue:.2f}")


def demo_8_event_log():
    """Demo 8: Distributed Event Log"""
    print_divider("DEMO 8: DISTRIBUTED EVENT LOG")
    
    # Create nodes
    nodes = []
    for i in range(1, 4):
        node = DistributedNode(node_id=i, priority=i)
        NodeRegistry.register(node)
        nodes.append(node)
    
    # Simulate various events
    print("Simulating distributed events...\n")
    
    nodes[0].log_event("ORDER_RECEIVED", "Order #123 received from user")
    time.sleep(0.05)
    
    nodes[1].clock.update(nodes[0].clock.get_time())
    nodes[1].log_event("INVENTORY_CHECK", "Checking inventory for order #123")
    time.sleep(0.05)
    
    nodes[2].clock.update(nodes[1].clock.get_time())
    nodes[2].log_event("PAYMENT_INIT", "Payment initiated for order #123")
    time.sleep(0.05)
    
    nodes[1].clock.update(nodes[2].clock.get_time())
    nodes[1].log_event("RESTAURANT_NOTIFY", "Restaurant notified of new order")
    time.sleep(0.05)
    
    nodes[0].clock.update(nodes[1].clock.get_time())
    nodes[0].log_event("USER_CONFIRM", "Confirmation sent to user")
    
    # Collect and display events
    all_events = []
    for node in nodes:
        all_events.extend(node.event_log)
    
    # Sort by physical time
    print("Events by Physical Time (Wall Clock):")
    print("-" * 80)
    all_events_physical = sorted(all_events, key=lambda e: e["physical_time"])
    for event in all_events_physical:
        print(f"Node {event['node_id']}: {event['description']}")
    
    print("\n")
    
    # Sort by logical time
    print("Events by Logical Time (Lamport Clock - Correct Ordering):")
    print("-" * 80)
    all_events_logical = sorted(all_events, key=lambda e: e["logical_time"])
    for event in all_events_logical:
        print(f"[Clock: {event['logical_time']:3d}] Node {event['node_id']}: {event['description']}")


def run_all_demos():
    """Run all demonstration scenarios"""
    print("\n")
    print("╔" + "="*78 + "╗")
    print("║" + " "*20 + "DISTRIBUTED FOOD DELIVERY SYSTEM" + " "*26 + "║")
    print("║" + " "*25 + "Demo Suite - All Features" + " "*28 + "║")
    print("╚" + "="*78 + "╝")
    print("\n")
    
    demos = [
        ("Basic Workflow", demo_1_basic_workflow),
        ("Concurrency Control", demo_2_concurrency),
        ("Clock Synchronization", demo_3_clock_sync),
        ("Leader Election", demo_4_leader_election),
        ("Data Consistency", demo_5_consistency),
        ("Load Balancing", demo_6_load_balancing),
        ("MapReduce Analytics", demo_7_mapreduce),
        ("Event Logging", demo_8_event_log)
    ]
    
    for idx, (name, demo_func) in enumerate(demos, 1):
        print(f"\n[{idx}/{len(demos)}] Running: {name}")
        input("Press Enter to continue...")
        demo_func()
        time.sleep(1)
    
    print_divider("ALL DEMOS COMPLETED!")
    print("\n✓ All distributed systems concepts demonstrated successfully!")
    print("\nKey Concepts Covered:")
    print("  1. ✓ Distributed Node Architecture")
    print("  2. ✓ Lamport Logical Clocks")
    print("  3. ✓ Leader Election (Bully Algorithm)")
    print("  4. ✓ Concurrency Control & Locking")
    print("  5. ✓ Consistency Models (Strong/Eventual/Quorum)")
    print("  6. ✓ Load Balancing (Round-Robin/Least-Connections)")
    print("  7. ✓ MapReduce for Distributed Analytics")
    print("  8. ✓ Distributed Event Logging\n")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        demo_num = sys.argv[1]
        
        demos = {
            "1": demo_1_basic_workflow,
            "2": demo_2_concurrency,
            "3": demo_3_clock_sync,
            "4": demo_4_leader_election,
            "5": demo_5_consistency,
            "6": demo_6_load_balancing,
            "7": demo_7_mapreduce,
            "8": demo_8_event_log,
            "all": run_all_demos
        }
        
        if demo_num in demos:
            demos[demo_num]()
        else:
            print("Invalid demo number. Available demos: 1-8, or 'all'")
    else:
        print("\nUsage: python demo.py [demo_number]")
        print("\nAvailable demos:")
        print("  1 - Basic Workflow")
        print("  2 - Concurrency Control")
        print("  3 - Clock Synchronization")
        print("  4 - Leader Election")
        print("  5 - Data Consistency")
        print("  6 - Load Balancing")
        print("  7 - MapReduce Analytics")
        print("  8 - Event Logging")
        print("  all - Run all demos")
        print("\nExample: python demo.py 4")
        print("         python demo.py all\n")
