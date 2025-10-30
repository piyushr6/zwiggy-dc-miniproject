# FILE: zwiggy/backend/api/routes/restaurants.py
from fastapi import APIRouter, HTTPException

from zwiggy.backend.services.restaurant_service import restaurant_service

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

@router.get("/")
async def get_restaurants():
    restaurants = restaurant_service.get_restaurants()
    return {
        "success": True,
        "data": [
            {
                "restaurant_id": r.restaurant_id,
                "name": r.name,
                "cuisine": r.cuisine,
                "rating": r.rating,
                "menu": [
                    {
                        "item_id": item.item_id,
                        "name": item.name,
                        "price": item.price,
                        "available": item.quantity_available
                    }
                    for item in r.menu
                ]
            }
            for r in restaurants
        ]
    }

@router.get("/{restaurant_id}")
async def get_restaurant(restaurant_id: int):
    restaurant = restaurant_service.get_restaurant(restaurant_id)
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return {
        "success": True,
        "data": {
            "restaurant_id": restaurant.restaurant_id,
            "name": restaurant.name,
            "cuisine": restaurant.cuisine,
            "rating": restaurant.rating,
            "menu": [
                {
                    "item_id": item.item_id,
                    "name": item.name,
                    "price": item.price,
                    "available": item.quantity_available
                }
                for item in restaurant.menu
            ]
        }
    }
