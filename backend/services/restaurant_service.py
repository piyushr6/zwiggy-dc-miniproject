# FILE: zwiggy/backend/services/restaurant_service.py
from typing import List
from zwiggy.backend.models.restaurant import MenuItem, Restaurant

class RestaurantService:
    """Handles restaurant operations"""
    
    def __init__(self):
        self.restaurants = self._initialize_restaurants()
    
    def _initialize_restaurants(self) -> List[Restaurant]:
        return [
            Restaurant(
                restaurant_id=1,
                name="Pizza Palace",
                cuisine="Italian",
                rating=4.5,
                menu=[
                    MenuItem(1, "Margherita Pizza", 12.99, 50),
                    MenuItem(2, "Pepperoni Pizza", 14.99, 30),
                    MenuItem(3, "Pasta Alfredo", 11.99, 40)
                ]
            ),
            Restaurant(
                restaurant_id=2,
                name="Burger Haven",
                cuisine="American",
                rating=4.3,
                menu=[
                    MenuItem(4, "Classic Burger", 9.99, 60),
                    MenuItem(5, "Cheese Burger", 10.99, 45),
                    MenuItem(6, "Fries", 3.99, 100)
                ]
            ),
            Restaurant(
                restaurant_id=3,
                name="Sushi World",
                cuisine="Japanese",
                rating=4.7,
                menu=[
                    MenuItem(7, "California Roll", 8.99, 35),
                    MenuItem(8, "Salmon Sashimi", 15.99, 20),
                    MenuItem(9, "Miso Soup", 4.99, 50)
                ]
            )
        ]
    
    def get_restaurants(self) -> List[Restaurant]:
        return self.restaurants
    
    def get_restaurant(self, restaurant_id: int) -> Restaurant:
        return next((r for r in self.restaurants if r.restaurant_id == restaurant_id), None)
    
    def update_inventory(self, restaurant_id: int, item_id: int, quantity_change: int):
        restaurant = self.get_restaurant(restaurant_id)
        if restaurant:
            for item in restaurant.menu:
                if item.item_id == item_id:
                    item.quantity_available += quantity_change
                    break

# ✅ Shared instance
restaurant_service = RestaurantService()
