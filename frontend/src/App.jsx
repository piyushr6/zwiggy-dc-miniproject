// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './index.css';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import DistributedDashboard from './pages/DistributedDashboard';

// Redux Actions
import { loadCartFromStorage } from './store/cartSlice';

// Utils
import { loadFromLocalStorage, saveToLocalStorage } from './utils/helpers';
import { STORAGE_KEYS } from './utils/constants';

function App() {
  const dispatch = useDispatch();

  // Load cart from localStorage on app mount
  useEffect(() => {
    const savedCart = loadFromLocalStorage(STORAGE_KEYS.CART);
    if (savedCart) {
      dispatch(loadCartFromStorage(savedCart));
    }
  }, [dispatch]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      const cart = document.querySelector('[data-cart]');
      if (cart) {
        saveToLocalStorage(STORAGE_KEYS.CART, cart);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header Navigation */}
        <Header />

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Home - Browse Restaurants */}
            <Route path="/" element={<HomePage />} />

            {/* Restaurant Details & Menu */}
            <Route path="/restaurant/:id" element={<RestaurantPage />} />

            {/* Shopping Cart */}
            <Route path="/cart" element={<CartPage />} />

            {/* Orders & Tracking */}
            <Route path="/orders" element={<OrdersPage />} />

            {/* Distributed System Dashboard */}
            <Route path="/distributed" element={<DistributedDashboard />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;