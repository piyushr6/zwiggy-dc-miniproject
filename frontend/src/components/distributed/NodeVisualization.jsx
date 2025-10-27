// frontend/src/components/distributed/NodeVisualization.jsx
import React from 'react';
import { getNodeColor } from '../../utils/helpers';
import { NODE_STATUS } from '../../utils/constants';

const NodeVisualization = ({ nodes, leader }) => {
   const getStatusIcon = (status) => {
      if (status === NODE_STATUS.ACTIVE || status === NODE_STATUS.LEADER) return '✓';
      if (status === NODE_STATUS.FAILED) return '✗';
      return '○';
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-xl font-bold mb-4">Active Nodes</h3>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map(node => (
               <div
                  key={node.id}
                  className={`p-4 rounded-lg border-2 ${node.id === leader?.id
                     ? 'border-purple-500 bg-purple-50 leader-badge'
                     : node.status === NODE_STATUS.FAILED
                        ? 'border-red-300 bg-red-50'
                        : 'border-blue-300 bg-blue-50'
                     }`}
               >
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold">Node {node.id}</h4>
                     <span
                        className={`text-2xl ${node.status === NODE_STATUS.ACTIVE || node.id === leader?.id
                           ? 'text-green-500'
                           : 'text-red-500'
                           }`}
                     >
                        {getStatusIcon(node.status)}
                     </span>
                  </div>

                  {node.id === leader?.id && (
                     <div className="mb-2">
                        <span className="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded">
                           👑 LEADER
                        </span>
                     </div>
                  )}

                  <div className="text-sm space-y-1">
                     <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold">{node.status}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-600">Load:</span>
                        <span className="font-semibold">{node.currentLoad || 0}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="font-semibold">{node.uptime || '0s'}</span>
                     </div>
                     {node.lamportClock && (
                        <div className="flex justify-between">
                           <span className="text-gray-600">Clock:</span>
                           <span className="font-mono text-xs">{node.lamportClock}</span>
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>

         {nodes.length === 0 && (
            <p className="text-center text-gray-500 py-8">No active nodes</p>
         )}
      </div>
   );
};

export default NodeVisualization;