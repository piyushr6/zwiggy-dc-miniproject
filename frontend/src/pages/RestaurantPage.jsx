// frontend/src/pages/RestaurantPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuItemCard from '../components/restaurant/MenuItemCard';
import Loader from '../components/common/Loader';
import restaurantService from '../services/restaurantService';
import { useSelector } from 'react-redux';

const RestaurantPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [restaurant, setRestaurant] = useState(null);
   const [menu, setMenu] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedCategory, setSelectedCategory] = useState('All');

   const cartItems = useSelector(state => state.cart.items);
   const cartTotal = useSelector(state => state.cart.total);

   useEffect(() => {
      fetchRestaurantData();
   }, [id]);

   const fetchRestaurantData = async () => {
      try {
         setLoading(true);
         const [restaurantData, menuData] = await Promise.all([
            restaurantService.getRestaurantById(id),
            restaurantService.getMenu(id)
         ]);
         setRestaurant(restaurantData);
         setMenu(menuData);
      } catch (err) {
         setError('Failed to load restaurant details');
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   if (loading) return <Loader text="Loading restaurant..." />;

   if (error || !restaurant) {
      return (
         <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error || 'Restaurant not found'}</p>
            <button
               onClick={() => navigate('/')}
               className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
               Back to Home
            </button>
         </div>
      );
   }

   const categories = ['All', ...new Set(menu.map(item => item.category))];
   const filteredMenu = selectedCategory === 'All'
      ? menu
      : menu.filter(item => item.category === selectedCategory);

   return (
      <div>
         {/* Restaurant Header */}
         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
               <div className="flex-1">
                  <div className="flex items-center mb-2">
                     <span className="text-5xl mr-4">{restaurant.emoji || '🍽️'}</span>
                     <div>
                        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                        <p className="text-gray-600">{restaurant.cuisine}</p>
                     </div>
                  </div>

                  <div className="flex items-center space-x-6 mt-4 text-sm">
                     <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span className="font-semibold">{restaurant.rating}</span>
                     </div>
                     <div className="text-gray-600">
                        🕐 {restaurant.deliveryTime} min
                     </div>
                     <div className="text-gray-600">
                        💰 Min order: ₹{restaurant.minOrder}
                     </div>
                     <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${restaurant.isOpen
                           ? 'bg-green-100 text-green-800'
                           : 'bg-red-100 text-red-800'
                           }`}>
                           {restaurant.isOpen ? 'Open' : 'Closed'}
                        </span>
                     </div>
                  </div>

                  {restaurant.address && (
                     <p className="mt-4 text-gray-600">📍 {restaurant.address}</p>
                  )}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-2">
               {/* Category Filter */}
               <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                     {categories.map(category => (
                        <button
                           key={category}
                           onClick={() => setSelectedCategory(category)}
                           className={`px-4 py-2 rounded-lg transition ${selectedCategory === category
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                        >
                           {category}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Menu Items */}
               <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">
                     {selectedCategory === 'All' ? 'All Items' : selectedCategory}
                  </h2>
                  {filteredMenu.map(item => (
                     <MenuItemCard
                        key={item.id}
                        item={item}
                        restaurantId={restaurant.id}
                     />
                  ))}

                  {filteredMenu.length === 0 && (
                     <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">No items in this category</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h3 className="text-xl font-bold mb-4">Your Cart</h3>

                  {cartItems.length === 0 ? (
                     <div className="text-center py-8 text-gray-500">
                        <p className="text-4xl mb-2">🛒</p>
                        <p>Cart is empty</p>
                     </div>
                  ) : (
                     <>
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                           {cartItems.map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                 <span>{item.name} x {item.quantity}</span>
                                 <span className="font-semibold">₹{item.price * item.quantity}</span>
                              </div>
                           ))}
                        </div>

                        <div className="border-t pt-4">
                           <div className="flex justify-between font-bold text-lg mb-4">
                              <span>Total</span>
                              <span>₹{cartTotal.toFixed(2)}</span>
                           </div>

                           <button
                              onClick={() => navigate('/cart')}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                           >
                              View Cart & Checkout
                           </button>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default RestaurantPage;