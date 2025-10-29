from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List

# ✅ FIXED IMPORTS — include `zwiggy.` prefix
from zwiggy.backend.config import Config
from zwiggy.backend.core.node import DistributedNode
from zwiggy.backend.core.clock import LamportClock
from zwiggy.backend.core.message_queue import message_queue
from zwiggy.backend.distributed.leader_election import BullyLeaderElection
from zwiggy.backend.distributed.consistency import ConsistencyManager
from zwiggy.backend.distributed.load_balancer import LoadBalancer
from zwiggy.backend.distributed.mapreduce import MapReduceEngine
from zwiggy.backend.concurrency.lock_manager import lock_manager
from zwiggy.backend.models.restaurant import Restaurant, MenuItem
from zwiggy.backend.models.order import Order, OrderItem
from zwiggy.backend.services.restaurant_service import RestaurantService
from zwiggy.backend.services.order_service import OrderService
from zwiggy.backend.services.analytics_service import AnalyticsService
from zwiggy.backend.simulation.traffic_generator import TrafficGenerator
from zwiggy.backend.simulation.failure_injector import FailureInjector
from zwiggy.backend.utils.helpers import print_divider, print_node_status

# ✅ API Routers
from zwiggy.backend.api.routes import restaurants, orders, distributed, analytics

# Initialize FastAPI app
app = FastAPI(title="Distributed Food Delivery System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
all_nodes: List[DistributedNode] = []
restaurant_service = None
load_balancer = None
failure_injector = None

# Include routers
app.include_router(restaurants.router)
app.include_router(orders.router)
app.include_router(distributed.router)
app.include_router(analytics.router)

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup"""
    global all_nodes, restaurant_service, load_balancer, failure_injector
    
    print_divider("INITIALIZING DISTRIBUTED FOOD DELIVERY SYSTEM")
    
    # Create nodes
    for node_config in Config.ALL_NODES:
        node = DistributedNode(
            node_id=node_config["id"],
            priority=node_config["id"]
        )
        all_nodes.append(node)
        message_queue.create_queue(node.node_id)
        print(f"✓ Node {node.node_id} initialized")
    
    # Initialize services
    restaurant_service = RestaurantService()
    load_balancer = LoadBalancer(Config.LOAD_BALANCE_STRATEGY)
    failure_injector = FailureInjector(all_nodes)
    
    print(f"✓ Restaurant Service initialized with {len(restaurant_service.get_restaurants())} restaurants")
    print(f"✓ Load Balancer initialized (strategy: {Config.LOAD_BALANCE_STRATEGY})")
    
    # Perform initial leader election
    print("\n" + "="*60)
    print("PERFORMING INITIAL LEADER ELECTION")
    print("="*60 + "\n")
    
    election = BullyLeaderElection(all_nodes[0], Config.ALL_NODES)
    election.start_election()
    
    print_node_status(all_nodes)
    
    print("✓ System ready!")
    print_divider()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Distributed Food Delivery System API",
        "version": "1.0",
        "nodes": len(all_nodes),
        "active_nodes": len([n for n in all_nodes if n.is_active])
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "nodes": [n.get_status() for n in all_nodes]
    }