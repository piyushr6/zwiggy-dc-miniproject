// frontend/src/components/common/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
   const location = useLocation();
   const cartItems = useSelector(state => state.cart.items);
   const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

   const isActive = (path) => location.pathname === path;

   return (
      <header className="bg-white shadow-md">
         <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
               <Link to="/" className="text-2xl font-bold text-blue-600">
                  FoodDistro
               </Link>

               <div className="flex items-center space-x-6">
                  <Link
                     to="/"
                     className={`hover:text-blue-600 ${isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                  >
                     Home
                  </Link>

                  <Link
                     to="/orders"
                     className={`hover:text-blue-600 ${isActive('/orders') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                  >
                     Orders
                  </Link>

                  <Link
                     to="/distributed"
                     className={`hover:text-blue-600 ${isActive('/distributed') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                  >
                     Distributed System
                  </Link>

                  <Link
                     to="/cart"
                     className={`relative hover:text-blue-600 ${isActive('/cart') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                  >
                     Cart
                     {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                           {cartCount}
                        </span>
                     )}
                  </Link>
               </div>
            </div>
         </nav>
      </header>
   );
};

export default Header;