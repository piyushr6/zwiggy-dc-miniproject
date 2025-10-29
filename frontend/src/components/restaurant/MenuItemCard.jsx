// frontend/src/components/restaurant/MenuItemCard.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';

const MenuItemCard = ({ item, restaurantId }) => {
   const dispatch = useDispatch();

   const handleAddToCart = () => {
      dispatch(addToCart({ restaurantId, item }));
   };

   return (
      <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-start">
         <div className="flex-1">
            <h4 className="text-lg font-semibold mb-1">{item.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            <p className="text-lg font-bold text-blue-600">₹{item.price}</p>
            {item.isVeg !== undefined && (
               <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
               </span>
            )}
         </div>

         <div className="ml-4">
            <button
               onClick={handleAddToCart}
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
               Add
            </button>
         </div>
      </div>
   );
};

export default MenuItemCard;