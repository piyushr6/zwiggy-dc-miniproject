// frontend/src/pages/CartPage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { incrementQuantity, decrementQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import { createOrder } from '../store/orderSlice';
import { formatCurrency } from '../utils/helpers';

const CartPage = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const { items, restaurantName, total, tax, deliveryFee, grandTotal } = useSelector(state => state.cart);
   const { createOrderLoading } = useSelector(state => state.orders);
   const [orderPlaced, setOrderPlaced] = useState(false);

   const handleIncrement = (itemId) => {
      dispatch(incrementQuantity(itemId));
   };

   const handleDecrement = (itemId) => {
      dispatch(decrementQuantity(itemId));
   };

   const handleRemove = (itemId) => {
      dispatch(removeFromCart(itemId));
   };

   const handleCheckout = async () => {
      const orderData = {
         restaurantName,
         items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
         })),
         total: grandTotal,
         timestamp: new Date().toISOString()
      };

      try {
         await dispatch(createOrder(orderData)).unwrap();
         setOrderPlaced(true);
         dispatch(clearCart());

         setTimeout(() => {
            navigate('/orders');
         }, 2000);
      } catch (error) {
         console.error('Failed to create order:', error);
      }
   };

   if (orderPlaced) {
      return (
         <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-12">
               <div className="text-6xl mb-4">✅</div>
               <h2 className="text-3xl font-bold text-green-600 mb-2">Order Placed!</h2>
               <p className="text-gray-600 mb-6">Your order has been successfully placed</p>
               <p className="text-sm text-gray-500">Redirecting to orders page...</p>
            </div>
         </div>
      );
   }

   if (items.length === 0) {
      return (
         <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-12">
               <div className="text-6xl mb-4">🛒</div>
               <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
               <p className="text-gray-600 mb-6">Add items from restaurants to get started</p>
               <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
               >
                  Browse Restaurants
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-4xl mx-auto">
         <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
               <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-semibold">
                        Items from {restaurantName}
                     </h2>
                     <button
                        onClick={() => dispatch(clearCart())}
                        className="text-red-600 text-sm hover:text-red-800"
                     >
                        Clear Cart
                     </button>
                  </div>

                  <div className="space-y-4">
                     {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                           <div className="flex-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                           </div>

                           <div className="flex items-center space-x-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded">
                                 <button
                                    onClick={() => handleDecrement(item.id)}
                                    className="px-3 py-1 hover:bg-gray-100"
                                 >
                                    -
                                 </button>
                                 <span className="px-4 py-1 border-x">{item.quantity}</span>
                                 <button
                                    onClick={() => handleIncrement(item.id)}
                                    className="px-3 py-1 hover:bg-gray-100"
                                 >
                                    +
                                 </button>
                              </div>

                              {/* Item Total */}
                              <div className="w-20 text-right font-semibold">
                                 {formatCurrency(item.price * item.quantity)}
                              </div>

                              {/* Remove Button */}
                              <button
                                 onClick={() => handleRemove(item.id)}
                                 className="text-red-600 hover:text-red-800"
                              >
                                 ✕
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h3 className="text-xl font-bold mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-4">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span>{formatCurrency(tax)}</span>
                     </div>
                     <div className="border-t pt-3">
                        <div className="flex justify-between font-bold text-lg">
                           <span>Total</span>
                           <span>{formatCurrency(grandTotal)}</span>
                        </div>
                     </div>
                  </div>

                  <button
                     onClick={handleCheckout}
                     disabled={createOrderLoading}
                     className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                  >
                     {createOrderLoading ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                     <p className="text-xs text-gray-600 mb-2">
                        <strong>Distributed Processing:</strong>
                     </p>
                     <p className="text-xs text-gray-600">
                        Your order will be processed by one of our distributed nodes using load balancing algorithms.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CartPage;