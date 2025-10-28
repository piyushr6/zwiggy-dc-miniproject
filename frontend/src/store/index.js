// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import distributedReducer from './distributedSlice';

const store = configureStore({
   reducer: {
      cart: cartReducer,
      orders: orderReducer,
      distributed: distributedReducer
   },
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false
      })
});

export default store;