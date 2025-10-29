// frontend/src/services/restaurantService.js
import api from './api';

export const restaurantService = {
   // Get all restaurants with optional filters
   getRestaurants: async (filters = {}) => {
      try {
         const params = new URLSearchParams();

         if (filters.cuisine) params.append('cuisine', filters.cuisine);
         if (filters.rating) params.append('rating', filters.rating);
         if (filters.sortBy) params.append('sort', filters.sortBy);
         if (filters.isOpen !== undefined) params.append('is_open', filters.isOpen);

         const response = await api.get(`/restaurants?${params.toString()}`);
         return response;
      } catch (error) {
         console.error('Error fetching restaurants:', error);
         throw error;
      }
   },

   // Get a specific restaurant by ID
   getRestaurantById: async (restaurantId) => {
      try {
         const response = await api.get(`/restaurants/${restaurantId}`);
         return response;
      } catch (error) {
         console.error('Error fetching restaurant:', error);
         throw error;
      }
   },

   // Get menu for a restaurant
   getMenu: async (restaurantId) => {
      try {
         const response = await api.get(`/restaurants/${restaurantId}/menu`);
         return response;
      } catch (error) {
         console.error('Error fetching menu:', error);
         throw error;
      }
   },

   // Search restaurants by name or cuisine
   searchRestaurants: async (query) => {
      try {
         const response = await api.get(`/restaurants/search?q=${encodeURIComponent(query)}`);
         return response;
      } catch (error) {
         console.error('Error searching restaurants:', error);
         throw error;
      }
   },

   // Get restaurants by location
   getRestaurantsByLocation: async (latitude, longitude, radius = 5) => {
      try {
         const response = await api.get(
            `/restaurants/nearby?lat=${latitude}&lon=${longitude}&radius=${radius}`
         );
         return response;
      } catch (error) {
         console.error('Error fetching nearby restaurants:', error);
         throw error;
      }
   },

   // Get restaurant reviews
   getRestaurantReviews: async (restaurantId, page = 1, limit = 10) => {
      try {
         const response = await api.get(
            `/restaurants/${restaurantId}/reviews?page=${page}&limit=${limit}`
         );
         return response;
      } catch (error) {
         console.error('Error fetching reviews:', error);
         throw error;
      }
   },

   // Get popular restaurants
   getPopularRestaurants: async (limit = 10) => {
      try {
         const response = await api.get(`/restaurants/popular?limit=${limit}`);
         return response;
      } catch (error) {
         console.error('Error fetching popular restaurants:', error);
         throw error;
      }
   }
};

export default restaurantService;