// frontend/src/hooks/useOrders.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../store/orderSlice';
import useWebSocket from './useWebSocket';

export const useOrders = (userId) => {
   const dispatch = useDispatch();
   const orders = useSelector(state => state.orders);

   const handleWebSocketMessage = (data) => {
      if (data.type === 'order_status_update') {
         dispatch(updateOrderStatus(data.payload));
      }
   };

   useWebSocket(handleWebSocketMessage);

   useEffect(() => {
      if (userId) {
         dispatch(fetchOrders(userId));
      }
   }, [userId, dispatch]);

   return orders;
};

export default useOrders;