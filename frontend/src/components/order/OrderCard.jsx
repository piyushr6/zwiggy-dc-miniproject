// frontend/src/components/order/OrderCard.jsx
import React from 'react';
import { formatTimestamp, formatCurrency } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';

const OrderCard = ({ order }) => {
   const getStatusColor = (status) => {
      const colors = {
         [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
         [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
         [ORDER_STATUS.PREPARING]: 'bg-purple-100 text-purple-800',
         [ORDER_STATUS.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-800',
         [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
         [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
   };

   return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
         <div className="flex justify-between items-start mb-4">
            <div>
               <h3 className="text-lg font-semibold">Order #{order.id}</h3>
               <p className="text-sm text-gray-600">{order.restaurantName}</p>
               <p className="text-xs text-gray-500">{formatTimestamp(order.timestamp)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
               {order.status.replace('_', ' ').toUpperCase()}
            </span>
         </div>

         <div className="border-t pt-4">
            <div className="space-y-2">
               {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                     <span>{item.name} x {item.quantity}</span>
                     <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
               ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
               <span>Total</span>
               <span>{formatCurrency(order.total)}</span>
            </div>
         </div>

         {order.nodeId && (
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
               <span>Processed by Node: {order.nodeId}</span>
               {order.lamportClock && <span className="ml-3">Clock: {order.lamportClock}</span>}
            </div>
         )}
      </div>
   );
};

export default OrderCard;