# ============================================================================
# FILE: backend/utils/__init__.py
# LOCATION: distributed-food-delivery/backend/utils/__init__.py
# PURPOSE: Utility functions and helpers
# ============================================================================

"""
Utility Functions and Helpers

Common utilities used throughout the application:

1. Logger: Logging configuration
   - Per-node logging
   - Structured log format
   - Log levels and handlers

2. Helpers: Common helper functions
   - print_divider: Formatted output dividers
   - print_node_status: Node status display
   - serialize_datetime: JSON serialization
   - format_currency: Money formatting

3. Constants: Application constants
   - Status codes
   - Event types
   - Configuration defaults

4. Validators: Input validation
   - Order validation
   - Restaurant data validation
   - Node configuration validation
"""

from .logger import setup_logger
from .helpers import (
    print_divider, 
    print_node_status, 
    serialize_datetime
)

__all__ = [
    'setup_logger',
    'print_divider',
    'print_node_status',
    'serialize_datetime'
]