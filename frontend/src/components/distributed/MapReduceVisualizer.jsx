// frontend/src/components/distributed/MapReduceVisualizer.jsx
import React, { useState, useEffect } from 'react';

const MapReduceVisualizer = ({ job, onRunJob }) => {
   const [activeJob, setActiveJob] = useState(null);
   const [selectedJobType, setSelectedJobType] = useState('order_analytics');
   const [jobProgress, setJobProgress] = useState({ map: 0, shuffle: 0, reduce: 0 });

   const jobTypes = {
      order_analytics: {
         name: 'Order Analytics',
         icon: '📊',
         color: 'blue',
         description: 'Analyze order patterns across restaurants',
         mapTask: 'Extract order data by restaurant',
         reduceTask: 'Aggregate total orders, revenue per restaurant'
      },
      peak_hours: {
         name: 'Peak Hours Analysis',
         icon: '⏰',
         color: 'purple',
         description: 'Identify busiest ordering times',
         mapTask: 'Group orders by hour of day',
         reduceTask: 'Count orders per time slot'
      },
      popular_items: {
         name: 'Popular Menu Items',
         icon: '🍕',
         color: 'orange',
         description: 'Find most ordered items',
         mapTask: 'Extract item data from orders',
         reduceTask: 'Sum quantities per menu item'
      },
      delivery_metrics: {
         name: 'Delivery Performance',
         icon: '🚚',
         color: 'green',
         description: 'Calculate delivery time statistics',
         mapTask: 'Extract delivery times by agent',
         reduceTask: 'Compute avg, min, max delivery times'
      }
   };

   const handleRunJob = () => {
      const newJob = {
         id: Date.now(),
         type: selectedJobType,
         status: 'running',
         startTime: new Date(),
         ...jobTypes[selectedJobType]
      };
      setActiveJob(newJob);
      setJobProgress({ map: 0, shuffle: 0, reduce: 0 });

      // Simulate job progress
      const mapInterval = setInterval(() => {
         setJobProgress(prev => {
            if (prev.map >= 100) {
               clearInterval(mapInterval);
               return prev;
            }
            return { ...prev, map: Math.min(prev.map + 10, 100) };
         });
      }, 300);

      setTimeout(() => {
         const shuffleInterval = setInterval(() => {
            setJobProgress(prev => {
               if (prev.shuffle >= 100) {
                  clearInterval(shuffleInterval);
                  return prev;
               }
               return { ...prev, shuffle: Math.min(prev.shuffle + 15, 100) };
            });
         }, 200);
      }, 3000);

      setTimeout(() => {
         const reduceInterval = setInterval(() => {
            setJobProgress(prev => {
               if (prev.reduce >= 100) {
                  clearInterval(reduceInterval);
                  setActiveJob(current => ({ ...current, status: 'completed' }));
                  return prev;
               }
               return { ...prev, reduce: Math.min(prev.reduce + 12, 100) };
            });
         }, 250);
      }, 6000);

      if (onRunJob) {
         onRunJob(selectedJobType);
      }
   };

   const getPhaseStatus = (phase) => {
      const progress = jobProgress[phase];
      if (progress === 0) return 'pending';
      if (progress === 100) return 'completed';
      return 'running';
   };

   const getPhaseIcon = (status) => {
      if (status === 'completed') return '✓';
      if (status === 'running') return '↻';
      return '○';
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-xl font-bold mb-4">MapReduce Analytics Engine</h3>

         {/* Job Type Selector */}
         <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
               Select Analytics Job
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {Object.entries(jobTypes).map(([key, info]) => (
                  <button
                     key={key}
                     onClick={() => setSelectedJobType(key)}
                     disabled={activeJob?.status === 'running'}
                     className={`p-3 rounded-lg border-2 transition-all ${selectedJobType === key
                           ? `border-${info.color}-500 bg-${info.color}-50`
                           : 'border-gray-300 bg-white hover:border-gray-400'
                        } ${activeJob?.status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     <div className="text-2xl mb-1">{info.icon}</div>
                     <div className="text-sm font-semibold">{info.name}</div>
                  </button>
               ))}
            </div>
         </div>

         {/* Job Description */}
         {selectedJobType && (
            <div className={`p-4 rounded-lg border-2 border-${jobTypes[selectedJobType].color}-300 bg-${jobTypes[selectedJobType].color}-50 mb-6`}>
               <div className="flex items-start gap-3">
                  <div className="text-3xl">{jobTypes[selectedJobType].icon}</div>
                  <div className="flex-1">
                     <h4 className="font-bold text-lg mb-1">{jobTypes[selectedJobType].name}</h4>
                     <p className="text-sm text-gray-700 mb-3">{jobTypes[selectedJobType].description}</p>
                     <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                           <strong className="text-gray-700">Map Phase:</strong>
                           <p className="text-gray-600">{jobTypes[selectedJobType].mapTask}</p>
                        </div>
                        <div>
                           <strong className="text-gray-700">Reduce Phase:</strong>
                           <p className="text-gray-600">{jobTypes[selectedJobType].reduceTask}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Run Job Button */}
         <div className="mb-6 text-center">
            <button
               onClick={handleRunJob}
               disabled={activeJob?.status === 'running'}
               className={`px-6 py-3 rounded-lg font-semibold text-white ${activeJob?.status === 'running'
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-green-600 hover:bg-green-700'
                  }`}
            >
               {activeJob?.status === 'running' ? 'Job Running...' : 'Start MapReduce Job'}
            </button>
         </div>

         {/* MapReduce Pipeline Visualization */}
         {activeJob && (
            <div className="mb-6">
               <h4 className="font-semibold mb-4 text-gray-700">Job Pipeline</h4>

               <div className="space-y-6">
                  {/* Map Phase */}
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getPhaseStatus('map') === 'completed' ? 'bg-green-500 text-white' :
                              getPhaseStatus('map') === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                                 'bg-gray-300 text-gray-600'
                           }`}>
                           {getPhaseIcon(getPhaseStatus('map'))}
                        </div>
                        <div className="flex-1">
                           <h5 className="font-semibold">Map Phase</h5>
                           <p className="text-sm text-gray-600">Distributing data across worker nodes</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{jobProgress.map}%</div>
                     </div>
                     <div className="ml-13 w-full bg-gray-200 rounded-full h-3">
                        <div
                           className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                           style={{ width: `${jobProgress.map}%` }}
                        ></div>
                     </div>
                     {getPhaseStatus('map') === 'running' && (
                        <div className="ml-13 mt-2 grid grid-cols-3 gap-2">
                           {[1, 2, 3].map(node => (
                              <div key={node} className="p-2 bg-blue-50 rounded border border-blue-200">
                                 <div className="text-xs font-semibold">Worker Node {node}</div>
                                 <div className="text-xs text-gray-600">Processing...</div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Shuffle Phase */}
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getPhaseStatus('shuffle') === 'completed' ? 'bg-green-500 text-white' :
                              getPhaseStatus('shuffle') === 'running' ? 'bg-purple-500 text-white animate-pulse' :
                                 'bg-gray-300 text-gray-600'
                           }`}>
                           {getPhaseIcon(getPhaseStatus('shuffle'))}
                        </div>
                        <div className="flex-1">
                           <h5 className="font-semibold">Shuffle Phase</h5>
                           <p className="text-sm text-gray-600">Grouping intermediate results by key</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{jobProgress.shuffle}%</div>
                     </div>
                     <div className="ml-13 w-full bg-gray-200 rounded-full h-3">
                        <div
                           className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                           style={{ width: `${jobProgress.shuffle}%` }}
                        ></div>
                     </div>
                  </div>

                  {/* Reduce Phase */}
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getPhaseStatus('reduce') === 'completed' ? 'bg-green-500 text-white' :
                              getPhaseStatus('reduce') === 'running' ? 'bg-orange-500 text-white animate-pulse' :
                                 'bg-gray-300 text-gray-600'
                           }`}>
                           {getPhaseIcon(getPhaseStatus('reduce'))}
                        </div>
                        <div className="flex-1">
                           <h5 className="font-semibold">Reduce Phase</h5>
                           <p className="text-sm text-gray-600">Aggregating final results</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{jobProgress.reduce}%</div>
                     </div>
                     <div className="ml-13 w-full bg-gray-200 rounded-full h-3">
                        <div
                           className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                           style={{ width: `${jobProgress.reduce}%` }}
                        ></div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Job Results */}
         {activeJob?.status === 'completed' && (
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
               <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✅</span>
                  <h4 className="font-bold text-lg text-green-900">Job Completed Successfully</h4>
               </div>
               <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                     <strong className="text-gray-700">Job ID:</strong>
                     <span className="ml-2 text-gray-600 font-mono">{activeJob.id}</span>
                  </div>
                  <div>
                     <strong className="text-gray-700">Duration:</strong>
                     <span className="ml-2 text-gray-600">~9.5 seconds</span>
                  </div>
                  <div>
                     <strong className="text-gray-700">Records Processed:</strong>
                     <span className="ml-2 text-gray-600">12,847</span>
                  </div>
                  <div>
                     <strong className="text-gray-700">Output Records:</strong>
                     <span className="ml-2 text-gray-600">245</span>
                  </div>
               </div>
               <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <strong className="text-sm text-gray-700">Sample Results:</strong>
                  <pre className="text-xs mt-2 text-gray-600 overflow-x-auto">
                     {`{
  "restaurant_1": { "orders": 450, "revenue": 12500 },
  "restaurant_2": { "orders": 380, "revenue": 9800 },
  "restaurant_3": { "orders": 520, "revenue": 15200 }
}`}
                  </pre>
               </div>
            </div>
         )}

         {/* MapReduce Info */}
         <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ MapReduce Framework</h4>
            <ul className="text-sm text-blue-800 space-y-1">
               <li>• <strong>Map:</strong> Parallel processing of input data across nodes</li>
               <li>• <strong>Shuffle:</strong> Sorting and grouping intermediate key-value pairs</li>
               <li>• <strong>Reduce:</strong> Aggregating values for each unique key</li>
               <li>• <strong>Benefits:</strong> Scalable, fault-tolerant, distributed computing</li>
            </ul>
         </div>
      </div>
   );
};

export default MapReduceVisualizer;