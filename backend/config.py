# FILE: backend/config.py
# ============================================================================

import os
from typing import List

class Config:
    # Node Configuration
    NODE_ID = int(os.getenv("NODE_ID", "1"))
    NODE_PORT = int(os.getenv("NODE_PORT", "8000"))
    NODE_PRIORITY = NODE_ID  # Higher ID = Higher priority for leader election
    
    # Other Nodes
    ALL_NODES = [
        {"id": 1, "host": "localhost", "port": 8001},
        {"id": 2, "host": "localhost", "port": 8002},
        {"id": 3, "host": "localhost", "port": 8003},
    ]
    
    # Database
    DATABASE_URL = f"sqlite:///./node_{NODE_ID}_food_delivery.db"
    PRIMARY_NODE_ID = 1
    
    # Consistency Mode
    CONSISTENCY_MODE = "strong"  # strong, eventual, quorum
    QUORUM_SIZE = 2
    
    # Load Balancer
    LOAD_BALANCE_STRATEGY = "round_robin"  # round_robin, least_connections
    
    # Simulation
    ENABLE_CLOCK_DRIFT = True
    CLOCK_DRIFT_MS = 50