// frontend/src/components/restaurant/RestaurantCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
   return (
      <Link to={`/restaurant/${restaurant.id}`}>
         <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
            <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
               <span className="text-4xl">{restaurant.emoji || '🍽️'}</span>
            </div>

            <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>

            <div className="flex items-center text-sm text-gray-600 mb-2">
               <span className="mr-3">⭐ {restaurant.rating}</span>
               <span className="mr-3">• {restaurant.cuisine}</span>
               <span>• {restaurant.deliveryTime} min</span>
            </div>

            <div className="flex items-center justify-between text-sm">
               <span className="text-gray-600">Min: ₹{restaurant.minOrder}</span>
               <span className="text-green-600 font-semibold">
                  {restaurant.isOpen ? 'Open' : 'Closed'}
               </span>
            </div>
         </div>
      </Link>
   );
};

export default RestaurantCard;