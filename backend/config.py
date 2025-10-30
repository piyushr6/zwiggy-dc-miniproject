# FILE: backend/config.py
# ============================================================================

import os

class Config:
    # Node Configuration
    NODE_ID = int(os.getenv("NODE_ID", "1"))          # this node
    NODE_PORT = int(os.getenv("NODE_PORT", "8000"))   # FastAPI server port
    NODE_PRIORITY = NODE_ID                           # priority = ID

    # List of node IDs in cluster (not host/port)
    ALL_NODE_IDS = [1, 2, 3]

    # Runtime node objects stored here
    REGISTERED_NODES = []

    # Database
    DATABASE_URL = f"sqlite:///./node_{NODE_ID}_food_delivery.db"
    PRIMARY_NODE_ID = 1

    # Consistency
    CONSISTENCY_MODE = "strong"
    QUORUM_SIZE = 2
