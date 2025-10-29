// frontend/src/store/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../services/orderService';

// Async thunks
export const fetchOrders = createAsyncThunk(
   'orders/fetchOrders',
   async (userId, { rejectWithValue }) => {
      try {
         return await orderService.getOrders(userId);
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const createOrder = createAsyncThunk(
   'orders/createOrder',
   async (orderData, { rejectWithValue }) => {
      try {
         return await orderService.createOrder(orderData);
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchOrderById = createAsyncThunk(
   'orders/fetchOrderById',
   async (orderId, { rejectWithValue }) => {
      try {
         return await orderService.getOrderById(orderId);
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const cancelOrder = createAsyncThunk(
   'orders/cancelOrder',
   async (orderId, { rejectWithValue }) => {
      try {
         return await orderService.cancelOrder(orderId);
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

const initialState = {
   orders: [],
   currentOrder: null,
   loading: false,
   error: null,
   createOrderLoading: false,
   createOrderError: null,
   successMessage: null
};

const orderSlice = createSlice({
   name: 'orders',
   initialState,
   reducers: {
      setCurrentOrder: (state, action) => {
         state.currentOrder = action.payload;
      },

      updateOrderStatus: (state, action) => {
         const { orderId, status } = action.payload;
         const order = state.orders.find(o => o.id === orderId);
         if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
         }
         if (state.currentOrder && state.currentOrder.id === orderId) {
            state.currentOrder.status = status;
            state.currentOrder.updatedAt = new Date().toISOString();
         }
      },

      addOrder: (state, action) => {
         state.orders.unshift(action.payload);
      },

      clearOrders: (state) => {
         state.orders = [];
         state.currentOrder = null;
      },

      clearError: (state) => {
         state.error = null;
         state.createOrderError = null;
      },

      clearSuccessMessage: (state) => {
         state.successMessage = null;
      },

      updateOrderTracking: (state, action) => {
         const { orderId, trackingData } = action.payload;
         const order = state.orders.find(o => o.id === orderId);
         if (order) {
            order.tracking = trackingData;
         }
         if (state.currentOrder && state.currentOrder.id === orderId) {
            state.currentOrder.tracking = trackingData;
         }
      }
   },

   extraReducers: (builder) => {
      builder
         // Fetch Orders
         .addCase(fetchOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
         })
         .addCase(fetchOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to fetch orders';
         })

         // Create Order
         .addCase(createOrder.pending, (state) => {
            state.createOrderLoading = true;
            state.createOrderError = null;
            state.successMessage = null;
         })
         .addCase(createOrder.fulfilled, (state, action) => {
            state.createOrderLoading = false;
            state.orders.unshift(action.payload);
            state.currentOrder = action.payload;
            state.successMessage = 'Order created successfully!';
         })
         .addCase(createOrder.rejected, (state, action) => {
            state.createOrderLoading = false;
            state.createOrderError = action.payload || 'Failed to create order';
         })

         // Fetch Order By ID
         .addCase(fetchOrderById.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchOrderById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentOrder = action.payload;
         })
         .addCase(fetchOrderById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to fetch order';
         })

         // Cancel Order
         .addCase(cancelOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(cancelOrder.fulfilled, (state, action) => {
            state.loading = false;
            const order = state.orders.find(o => o.id === action.payload.id);
            if (order) {
               order.status = 'cancelled';
            }
            if (state.currentOrder && state.currentOrder.id === action.payload.id) {
               state.currentOrder.status = 'cancelled';
            }
            state.successMessage = 'Order cancelled successfully!';
         })
         .addCase(cancelOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to cancel order';
         });
   }
});

export const {
   setCurrentOrder,
   updateOrderStatus,
   addOrder,
   clearOrders,
   clearError,
   clearSuccessMessage,
   updateOrderTracking
} = orderSlice.actions;

export default orderSlice.reducer;