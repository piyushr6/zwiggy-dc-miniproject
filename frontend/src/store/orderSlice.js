// frontend/src/store/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../services/orderService";

export const fetchOrders = createAsyncThunk(
   "orders/fetchOrders",
   async (userId, { rejectWithValue }) => {
      try {
         return await orderService.getOrders(userId);
      } catch (err) {
         return rejectWithValue(err.response?.data || "Failed to fetch orders");
      }
   }
);

export const createOrder = createAsyncThunk(
   "orders/createOrder",
   async (orderData, { rejectWithValue }) => {
      try {
         return await orderService.createOrder(orderData);
      } catch (err) {
         return rejectWithValue(err.response?.data || "Failed to create order");
      }
   }
);

export const fetchOrderById = createAsyncThunk(
   "orders/fetchOrderById",
   async (orderId, { rejectWithValue }) => {
      try {
         return await orderService.getOrderById(orderId);
      } catch (err) {
         return rejectWithValue(err.response?.data || "Failed to fetch order");
      }
   }
);

export const cancelOrder = createAsyncThunk(
   "orders/cancelOrder",
   async (orderId, { rejectWithValue }) => {
      try {
         return await orderService.cancelOrder(orderId);
      } catch (err) {
         return rejectWithValue(err.response?.data || "Failed to cancel order");
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
   successMessage: null,
};

const orderSlice = createSlice({
   name: "orders",
   initialState,
   reducers: {
      setCurrentOrder: (state, action) => {
         state.currentOrder = action.payload;
      },
   },

   extraReducers: (builder) => {
      builder
         .addCase(fetchOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = Array.isArray(action.payload) ? action.payload : [];
         })
         .addCase(fetchOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         .addCase(createOrder.pending, (state) => {
            state.createOrderLoading = true;
            state.createOrderError = null;
         })
         .addCase(createOrder.fulfilled, (state, action) => {
            state.createOrderLoading = false;
            state.orders.unshift(action.payload);
            state.currentOrder = action.payload;
            state.successMessage = "Order created successfully!";
         })
         .addCase(createOrder.rejected, (state, action) => {
            state.createOrderLoading = false;
            state.createOrderError = action.payload;
         })

         .addCase(fetchOrderById.pending, (state) => {
            state.loading = true;
         })
         .addCase(fetchOrderById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentOrder = action.payload;
         })
         .addCase(fetchOrderById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         .addCase(cancelOrder.fulfilled, (state, action) => {
            const cancelled = action.payload;
            const order = state.orders.find((o) => o.id === cancelled.id);
            if (order) order.status = "cancelled";
            if (state.currentOrder && state.currentOrder.id === cancelled.id) {
               state.currentOrder.status = "cancelled";
            }
            state.successMessage = "Order cancelled!";
         });
   },
});

export const { setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
