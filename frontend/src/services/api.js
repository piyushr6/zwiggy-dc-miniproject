// frontend/src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
   baseURL: API_BASE_URL,
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json'
   }
});

// Request interceptor - add auth tokens, logging, etc.
api.interceptors.request.use(
   (config) => {
      // Add timestamp to all requests
      config.metadata = { startTime: new Date() };

      // Add any auth tokens here if needed
      const token = localStorage.getItem('authToken');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
      return config;
   },
   (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
   }
);

// Response interceptor - handle errors, logging, etc.
api.interceptors.response.use(
   (response) => {
      // Calculate request duration
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`[API Response] ${response.config.url} - ${duration}ms`);

      return response.data;
   },
   (error) => {
      if (error.response) {
         // Server responded with error status
         console.error('[API Error Response]', {
            status: error.response.status,
            data: error.response.data,
            url: error.config.url
         });

         // Handle specific error codes
         switch (error.response.status) {
            case 401:
               // Unauthorized - redirect to login or refresh token
               console.log('Unauthorized access');
               break;
            case 403:
               console.log('Forbidden access');
               break;
            case 404:
               console.log('Resource not found');
               break;
            case 500:
               console.log('Server error');
               break;
            default:
               console.log('API error:', error.response.status);
         }
      } else if (error.request) {
         // Request was made but no response received
         console.error('[API No Response]', error.request);
      } else {
         // Error in request configuration
         console.error('[API Config Error]', error.message);
      }

      return Promise.reject(error);
   }
);

export default api;