# FILE: backend/utils/logger.py
# ============================================================================

import logging
from datetime import datetime

def setup_logger(node_id: int):
    """Setup logger for node"""
    logger = logging.getLogger(f"Node{node_id}")
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        f'%(asctime)s - Node{node_id} - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger