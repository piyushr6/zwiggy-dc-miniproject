// frontend/src/pages/OrdersPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../store/orderSlice';
import OrderCard from '../components/order/OrderCard';
import LiveOrderTracker from '../components/order/LiveOrderTracker';
import Loader from '../components/common/Loader';

const OrdersPage = () => {
   const dispatch = useDispatch();
   const { orders, loading, error } = useSelector(state => state.orders);
   const userId = 'user-123'; // In real app, get from auth

   useEffect(() => {
      dispatch(fetchOrders(userId));
   }, [dispatch, userId]);

   const activeOrders = orders.filter(order =>
      ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
   );

   const completedOrders = orders.filter(order =>
      ['delivered', 'cancelled'].includes(order.status)
   );

   if (loading) return <Loader text="Loading orders..." />;

   if (error) {
      return (
         <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
            <button
               onClick={() => dispatch(fetchOrders(userId))}
               className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
               Retry
            </button>
         </div>
      );
   }

   if (orders.length === 0) {
      return (
         <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-12">
               <div className="text-6xl mb-4">📦</div>
               <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
               <p className="text-gray-600 mb-6">Start ordering to see your orders here</p>
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-6xl mx-auto">
         <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

         {/* Active Orders with Live Tracking */}
         {activeOrders.length > 0 && (
            <div className="mb-8">
               <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeOrders.map(order => (
                     <div key={order.id}>
                        <LiveOrderTracker order={order} />
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Order History */}
         <div>
            <h2 className="text-2xl font-semibold mb-4">
               {activeOrders.length > 0 ? 'Order History' : 'All Orders'}
            </h2>
            <div className="space-y-4">
               {(activeOrders.length > 0 ? completedOrders : orders).map(order => (
                  <OrderCard key={order.id} order={order} />
               ))}
            </div>
         </div>

         {/* Distributed System Info */}
         <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">📊 Distributed System Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
               <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Orders Processed</p>
                  <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Active Orders</p>
                  <p className="text-2xl font-bold text-green-600">{activeOrders.length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-purple-600">{completedOrders.length}</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OrdersPage;