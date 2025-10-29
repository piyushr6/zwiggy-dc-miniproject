// frontend/src/store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   items: [],
   restaurantId: null,
   restaurantName: null,
   total: 0,
   itemCount: 0,
   deliveryFee: 0,
   tax: 0,
   grandTotal: 0
};

const calculateTotals = (items, deliveryFee = 0) => {
   const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
   const tax = total * 0.05; // 5% tax
   const grandTotal = total + deliveryFee + tax;
   const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

   return { total, tax, grandTotal, itemCount };
};

const cartSlice = createSlice({
   name: 'cart',
   initialState,
   reducers: {
      addToCart: (state, action) => {
         const { restaurantId, restaurantName, item } = action.payload;

         // Clear cart if from different restaurant
         if (state.restaurantId && state.restaurantId !== restaurantId) {
            state.items = [];
            state.total = 0;
         }

         state.restaurantId = restaurantId;
         state.restaurantName = restaurantName;

         const existingItem = state.items.find(i => i.id === item.id);
         if (existingItem) {
            existingItem.quantity += 1;
         } else {
            state.items.push({ ...item, quantity: 1 });
         }

         const totals = calculateTotals(state.items, state.deliveryFee);
         Object.assign(state, totals);
      },

      removeFromCart: (state, action) => {
         const itemId = action.payload;
         state.items = state.items.filter(i => i.id !== itemId);

         if (state.items.length === 0) {
            state.restaurantId = null;
            state.restaurantName = null;
            state.deliveryFee = 0;
         }

         const totals = calculateTotals(state.items, state.deliveryFee);
         Object.assign(state, totals);
      },

      updateQuantity: (state, action) => {
         const { itemId, quantity } = action.payload;
         const item = state.items.find(i => i.id === itemId);

         if (item) {
            if (quantity === 0) {
               state.items = state.items.filter(i => i.id !== itemId);
            } else {
               item.quantity = quantity;
            }
         }

         if (state.items.length === 0) {
            state.restaurantId = null;
            state.restaurantName = null;
            state.deliveryFee = 0;
         }

         const totals = calculateTotals(state.items, state.deliveryFee);
         Object.assign(state, totals);
      },

      incrementQuantity: (state, action) => {
         const itemId = action.payload;
         const item = state.items.find(i => i.id === itemId);
         if (item) {
            item.quantity += 1;
         }

         const totals = calculateTotals(state.items, state.deliveryFee);
         Object.assign(state, totals);
      },

      decrementQuantity: (state, action) => {
         const itemId = action.payload;
         const item = state.items.find(i => i.id === itemId);

         if (item) {
            if (item.quantity > 1) {
               item.quantity -= 1;
            } else {
               state.items = state.items.filter(i => i.id !== itemId);
            }
         }

         if (state.items.length === 0) {
            state.restaurantId = null;
            state.restaurantName = null;
            state.deliveryFee = 0;
         }

         const totals = calculateTotals(state.items, state.deliveryFee);
         Object.assign(state, totals);
      },

      setDeliveryFee: (state, action) => {
         state.deliveryFee = action.payload;
         const totals = calculateTotals(state.items, state.deliveryFee);
         Object.assign(state, totals);
      },

      clearCart: (state) => {
         state.items = [];
         state.restaurantId = null;
         state.restaurantName = null;
         state.total = 0;
         state.itemCount = 0;
         state.deliveryFee = 0;
         state.tax = 0;
         state.grandTotal = 0;
      },

      loadCartFromStorage: (state, action) => {
         const savedCart = action.payload;
         if (savedCart) {
            Object.assign(state, savedCart);
         }
      }
   }
});

export const {
   addToCart,
   removeFromCart,
   updateQuantity,
   incrementQuantity,
   decrementQuantity,
   setDeliveryFee,
   clearCart,
   loadCartFromStorage
} = cartSlice.actions;

export default cartSlice.reducer;