// frontend/src/components/order/OrderTimeline.jsx
import React from 'react';
import { ORDER_STATUS } from '../../utils/constants';
import { formatTimestamp } from '../../utils/helpers';

const OrderTimeline = ({ order }) => {
   const statuses = [
      { key: ORDER_STATUS.PENDING, label: 'Order Placed', icon: '📝' },
      { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed', icon: '✅' },
      { key: ORDER_STATUS.PREPARING, label: 'Preparing', icon: '👨‍🍳' },
      { key: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: '🚗' },
      { key: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: '🎉' }
   ];

   const currentStatusIndex = statuses.findIndex(s => s.key === order.status);
   const isCancelled = order.status === ORDER_STATUS.CANCELLED;

   if (isCancelled) {
      return (
         <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center">
               <span className="text-4xl mr-3">❌</span>
               <div>
                  <p className="font-bold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600">
                     {order.cancelledAt && `Cancelled at ${formatTimestamp(order.cancelledAt)}`}
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-white rounded-lg p-6">
         <h3 className="font-semibold mb-6">Order Progress</h3>

         <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200"></div>

            {/* Progress Line */}
            <div
               className="absolute left-6 top-0 w-1 bg-blue-600 transition-all duration-500"
               style={{ height: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
            ></div>

            {/* Timeline Items */}
            <div className="space-y-6">
               {statuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                     <div key={status.key} className="relative flex items-start">
                        {/* Circle */}
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-colors ${isCompleted
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-300'
                           }`}>
                           <span className={`text-xl ${isCompleted ? '' : 'grayscale opacity-50'}`}>
                              {status.icon}
                           </span>
                        </div>

                        {/* Content */}
                        <div className="ml-6 flex-1">
                           <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                              {status.label}
                           </p>

                           {isCurrent && (
                              <p className="text-sm text-blue-600 font-medium mt-1">
                                 Current Status
                              </p>
                           )}

                           {isCompleted && order.timestamps && order.timestamps[status.key] && (
                              <p className="text-xs text-gray-500 mt-1">
                                 {formatTimestamp(order.timestamps[status.key])}
                              </p>
                           )}
                        </div>

                        {/* Animation for current status */}
                        {isCurrent && (
                           <div className="absolute left-6 top-6 w-12 h-12">
                              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Estimated Time */}
         {order.estimatedDelivery && order.status !== ORDER_STATUS.DELIVERED && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
               <p className="text-sm text-gray-600">Estimated Delivery</p>
               <p className="font-semibold text-blue-700">
                  {new Date(order.estimatedDelivery).toLocaleTimeString()}
               </p>
            </div>
         )}
      </div>
   );
};

export default OrderTimeline;