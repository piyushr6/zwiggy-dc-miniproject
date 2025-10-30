// frontend/src/services/orderService.js
import api from "./api";

const orderService = {
   createOrder: async (orderData) => {
      const res = await api.post("/orders", orderData);
      return res.data;
   },

   getOrders: async (userId) => {
      const res = await api.get(`/orders?user_id=${userId}`);
      return res.data;
   },

   getOrderById: async (orderId) => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
   },

   updateOrderStatus: async (orderId, status) => {
      const res = await api.patch(`/orders/${orderId}`, { status });
      return res.data;
   },

   cancelOrder: async (orderId) => {
      const res = await api.delete(`/orders/${orderId}`);
      return res.data;
   },

   trackOrder: async (orderId) => {
      const res = await api.get(`/orders/${orderId}/track`);
      return res.data;
   },

   getOrderHistory: async (userId, page = 1, limit = 10) => {
      const res = await api.get(
         `/orders/history?user_id=${userId}&page=${page}&limit=${limit}`
      );
      return res.data;
   },

   rateOrder: async (orderId, rating, review) => {
      const res = await api.post(`/orders/${orderId}/rate`, { rating, review });
      return res.data;
   },
};

export default orderService;
