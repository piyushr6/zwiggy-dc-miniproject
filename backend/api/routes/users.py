"""
User Management Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from zwiggy.backend.models import User

router = APIRouter(prefix="/users", tags=["users"])

# Sample users storage
users_db = [
    User(user_id=101, name="Alice Johnson", email="alice@example.com", 
         phone="555-1001", address="123 Main St"),
    User(user_id=102, name="Bob Smith", email="bob@example.com",
         phone="555-1002", address="456 Oak Ave"),
    User(user_id=103, name="Carol White", email="carol@example.com",
         phone="555-1003", address="789 Pine Rd")
]

class CreateUserRequest(BaseModel):
    name: str
    email: str
    phone: str
    address: str

@router.get("/")
async def get_users():
    """Get all users"""
    return {
        "success": True,
        "data": [
            {
                "user_id": u.user_id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "address": u.address
            }
            for u in users_db
        ]
    }

@router.get("/{user_id}")
async def get_user(user_id: int):
    """Get specific user"""
    user = next((u for u in users_db if u.user_id == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "data": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address
        }
    }

@router.post("/")
async def create_user(request: CreateUserRequest):
    """Create new user"""
    new_user_id = max([u.user_id for u in users_db]) + 1 if users_db else 1
    
    user = User(
        user_id=new_user_id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        address=request.address
    )
    
    users_db.append(user)
    
    return {
        "success": True,
        "data": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email
        }
    }
