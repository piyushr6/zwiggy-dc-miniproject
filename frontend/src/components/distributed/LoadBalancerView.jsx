// frontend/src/components/distributed/LoadBalancerView.jsx
import React, { useState, useEffect } from 'react';

const ALGORITHMS = {
   ROUND_ROBIN: 'round_robin',
   LEAST_CONNECTIONS: 'least_connections',
   WEIGHTED: 'weighted',
   RANDOM: 'random'
};

const LoadBalancerView = ({ nodes, algorithm, requests, onAlgorithmChange }) => {
   const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithm || ALGORITHMS.ROUND_ROBIN);
   const [recentRequests, setRecentRequests] = useState([]);

   useEffect(() => {
      if (requests && requests.length > 0) {
         setRecentRequests(requests.slice(-10));
      }
   }, [requests]);

   const handleAlgorithmChange = (algo) => {
      setSelectedAlgorithm(algo);
      if (onAlgorithmChange) {
         onAlgorithmChange(algo);
      }
   };

   const getNodeLoad = (nodeId) => {
      const node = nodes?.find(n => n.id === nodeId);
      return node?.currentLoad || 0;
   };

   const getMaxLoad = () => {
      if (!nodes || nodes.length === 0) return 100;
      return Math.max(...nodes.map(n => n.currentLoad || 0), 100);
   };

   const algorithmInfo = {
      [ALGORITHMS.ROUND_ROBIN]: {
         name: 'Round Robin',
         icon: '🔄',
         color: 'blue',
         description: 'Distributes requests equally across all nodes in circular order'
      },
      [ALGORITHMS.LEAST_CONNECTIONS]: {
         name: 'Least Connections',
         icon: '📊',
         color: 'green',
         description: 'Routes to node with fewest active connections'
      },
      [ALGORITHMS.WEIGHTED]: {
         name: 'Weighted',
         icon: '⚖️',
         color: 'purple',
         description: 'Distributes based on node capacity weights'
      },
      [ALGORITHMS.RANDOM]: {
         name: 'Random',
         icon: '🎲',
         color: 'orange',
         description: 'Randomly selects a node for each request'
      }
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-xl font-bold mb-4">Load Balancer</h3>

         {/* Algorithm Selector */}
         <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
               Balancing Algorithm
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {Object.entries(algorithmInfo).map(([key, info]) => (
                  <button
                     key={key}
                     onClick={() => handleAlgorithmChange(key)}
                     className={`p-3 rounded-lg border-2 transition-all ${selectedAlgorithm === key
                        ? `border-${info.color}-500 bg-${info.color}-50`
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                  >
                     <div className="text-2xl mb-1">{info.icon}</div>
                     <div className={`text-sm font-semibold ${selectedAlgorithm === key ? `text-${info.color}-700` : 'text-gray-700'
                        }`}>
                        {info.name}
                     </div>
                  </button>
               ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
               {algorithmInfo[selectedAlgorithm].description}
            </p>
         </div>

         {/* Node Load Visualization */}
         <div className="mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Node Load Distribution</h4>
            <div className="space-y-3">
               {nodes?.map(node => {
                  const load = node.currentLoad || 0;
                  const maxLoad = getMaxLoad();
                  const percentage = (load / maxLoad) * 100;
                  const isOverloaded = percentage > 80;

                  return (
                     <div key={node.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                           <span className="font-semibold">Node {node.id}</span>
                           <span className={`${isOverloaded ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                              {load} requests
                           </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                           <div
                              className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-500' :
                                 percentage > 60 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                 }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                           ></div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Request Flow Visualization */}
         <div className="mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Recent Request Routing</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
               {recentRequests.length > 0 ? (
                  recentRequests.map((req, index) => (
                     <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200"
                     >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                           <span className="text-xs font-bold text-blue-700">
                              {recentRequests.length - index}
                           </span>
                        </div>
                        <div className="flex-1">
                           <div className="text-sm font-semibold">{req.type || 'Request'}</div>
                           <div className="text-xs text-gray-500">{req.timestamp}</div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="text-2xl">→</div>
                           <div className={`px-3 py-1 rounded font-semibold text-sm ${req.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              Node {req.nodeId}
                           </div>
                        </div>
                        <div className="text-xs text-gray-500">
                           {req.latency}ms
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="text-center py-8 text-gray-500">
                     No recent requests
                  </div>
               )}
            </div>
         </div>

         {/* Statistics */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
               <div className="text-sm text-gray-600 mb-1">Total Requests</div>
               <div className="text-2xl font-bold text-blue-600">
                  {requests?.length || 0}
               </div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
               <div className="text-sm text-gray-600 mb-1">Active Nodes</div>
               <div className="text-2xl font-bold text-green-600">
                  {nodes?.length || 0}
               </div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
               <div className="text-sm text-gray-600 mb-1">Avg Latency</div>
               <div className="text-2xl font-bold text-purple-600">
                  {recentRequests.length > 0
                     ? Math.round(recentRequests.reduce((sum, r) => sum + (r.latency || 0), 0) / recentRequests.length)
                     : 0}ms
               </div>
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200">
               <div className="text-sm text-gray-600 mb-1">Success Rate</div>
               <div className="text-2xl font-bold text-orange-600">
                  {recentRequests.length > 0
                     ? Math.round((recentRequests.filter(r => r.success).length / recentRequests.length) * 100)
                     : 0}%
               </div>
            </div>
         </div>
      </div>
   );
};

export default LoadBalancerView;