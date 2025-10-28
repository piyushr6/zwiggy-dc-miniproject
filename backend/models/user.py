# FILE: backend/models/user.py
# ============================================================================

from dataclasses import dataclass

@dataclass
class User:
    user_id: int
    name: str
    email: str
    phone: str
    address: str