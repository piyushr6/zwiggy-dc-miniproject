// frontend/src/services/orderService.js
import api from './api';

export const orderService = {
   // Create a new order
   createOrder: async (orderData) => {
      try {
         const response = await api.post('/orders', orderData);
         return response;
      } catch (error) {
         console.error('Error creating order:', error);
         throw error;
      }
   },

   // Get all orders for a user
   getOrders: async (userId) => {
      try {
         const response = await api.get(`/orders?user_id=${userId}`);
         return response;
      } catch (error) {
         console.error('Error fetching orders:', error);
         throw error;
      }
   },

   // Get a specific order by ID
   getOrderById: async (orderId) => {
      try {
         const response = await api.get(`/orders/${orderId}`);
         return response;
      } catch (error) {
         console.error('Error fetching order:', error);
         throw error;
      }
   },

   // Update order status
   updateOrderStatus: async (orderId, status) => {
      try {
         const response = await api.patch(`/orders/${orderId}`, { status });
         return response;
      } catch (error) {
         console.error('Error updating order status:', error);
         throw error;
      }
   },

   // Cancel an order
   cancelOrder: async (orderId) => {
      try {
         const response = await api.delete(`/orders/${orderId}`);
         return response;
      } catch (error) {
         console.error('Error cancelling order:', error);
         throw error;
      }
   },

   // Track order in real-time
   trackOrder: async (orderId) => {
      try {
         const response = await api.get(`/orders/${orderId}/track`);
         return response;
      } catch (error) {
         console.error('Error tracking order:', error);
         throw error;
      }
   },

   // Get order history with pagination
   getOrderHistory: async (userId, page = 1, limit = 10) => {
      try {
         const response = await api.get(`/orders/history?user_id=${userId}&page=${page}&limit=${limit}`);
         return response;
      } catch (error) {
         console.error('Error fetching order history:', error);
         throw error;
      }
   },

   // Rate an order
   rateOrder: async (orderId, rating, review) => {
      try {
         const response = await api.post(`/orders/${orderId}/rate`, { rating, review });
         return response;
      } catch (error) {
         console.error('Error rating order:', error);
         throw error;
      }
   }
};

export default orderService;