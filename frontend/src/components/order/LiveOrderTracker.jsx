// frontend/src/components/order/LiveOrderTracker.jsx
import React, { useEffect, useState } from 'react';
import OrderTimeline from './OrderTimeline';
import { formatCurrency, formatTimestamp } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';

const LiveOrderTracker = ({ order }) => {
   const [pulseAnimation, setPulseAnimation] = useState(false);

   useEffect(() => {
      // Trigger pulse animation when order status changes
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 1000);
      return () => clearTimeout(timer);
   }, [order.status]);

   const getStatusMessage = (status) => {
      const messages = {
         [ORDER_STATUS.PENDING]: 'Waiting for restaurant confirmation',
         [ORDER_STATUS.CONFIRMED]: 'Restaurant is preparing your order',
         [ORDER_STATUS.PREPARING]: 'Your food is being prepared',
         [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Delivery agent is on the way',
         [ORDER_STATUS.DELIVERED]: 'Order delivered successfully!'
      };
      return messages[status] || 'Processing...';
   };

   return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${pulseAnimation ? 'ring-4 ring-blue-400 transition-all' : ''
         }`}>
         {/* Order Header */}
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-xl font-bold">Order #{order.id}</h3>
               <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  Live Tracking
               </span>
            </div>
            <p className="text-blue-100">{order.restaurantName}</p>
            <p className="text-sm text-blue-200 mt-1">
               Placed at {formatTimestamp(order.timestamp)}
            </p>
         </div>

         {/* Status Message */}
         <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-center">
               <div className="w-3 h-3 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
               <p className="font-semibold text-blue-900">
                  {getStatusMessage(order.status)}
               </p>
            </div>
         </div>

         {/* Timeline */}
         <div className="p-6">
            <OrderTimeline order={order} />
         </div>

         {/* Order Items */}
         <div className="p-6 bg-gray-50 border-t">
            <h4 className="font-semibold mb-3">Order Items</h4>
            <div className="space-y-2">
               {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                     <span className="text-gray-700">
                        {item.name} x {item.quantity}
                     </span>
                     <span className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                     </span>
                  </div>
               ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
               <span>Total</span>
               <span className="text-blue-600">{formatCurrency(order.total)}</span>
            </div>
         </div>

         {/* Distributed System Info */}
         {order.nodeId && (
            <div className="p-4 bg-purple-50 border-t">
               <p className="text-xs text-gray-600 mb-1">📊 Distributed System Info</p>
               <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                     <span className="text-gray-600">Processing Node:</span>
                     <span className="ml-2 font-semibold text-purple-700">
                        Node {order.nodeId}
                     </span>
                  </div>
                  {order.lamportClock && (
                     <div>
                        <span className="text-gray-600">Lamport Clock:</span>
                        <span className="ml-2 font-mono font-semibold text-purple-700">
                           {order.lamportClock}
                        </span>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Delivery Agent Info (if out for delivery) */}
         {order.status === ORDER_STATUS.OUT_FOR_DELIVERY && order.deliveryAgent && (
            <div className="p-4 bg-orange-50 border-t">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm font-semibold text-orange-900">
                        {order.deliveryAgent.name}
                     </p>
                     <p className="text-xs text-orange-700">
                        📞 {order.deliveryAgent.phone}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-orange-700">Vehicle</p>
                     <p className="text-sm font-semibold text-orange-900">
                        🛵 {order.deliveryAgent.vehicle}
                     </p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default LiveOrderTracker;