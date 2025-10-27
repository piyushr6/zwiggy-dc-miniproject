// frontend/src/components/distributed/ConsistencyToggle.jsx
import React, { useState } from 'react';

const CONSISTENCY_MODES = {
   STRONG: 'strong',
   EVENTUAL: 'eventual',
   QUORUM: 'quorum'
};

const ConsistencyToggle = ({ currentMode, onModeChange, stats }) => {
   const [selectedMode, setSelectedMode] = useState(currentMode || CONSISTENCY_MODES.STRONG);

   const consistencyInfo = {
      [CONSISTENCY_MODES.STRONG]: {
         title: 'Strong Consistency',
         icon: '🔒',
         color: 'blue',
         description: 'All reads return the most recent write. Highest consistency, lower availability.',
         pros: ['Data is always up-to-date', 'No conflicts', 'Predictable behavior'],
         cons: ['Higher latency', 'Lower availability', 'Single point of failure'],
         latency: 'High',
         availability: 'Low'
      },
      [CONSISTENCY_MODES.EVENTUAL]: {
         title: 'Eventual Consistency',
         icon: '⏱️',
         color: 'green',
         description: 'Data will become consistent eventually. High availability, lower consistency.',
         pros: ['Low latency', 'High availability', 'Better performance'],
         cons: ['Stale reads possible', 'Conflict resolution needed', 'Complex debugging'],
         latency: 'Low',
         availability: 'High'
      },
      [CONSISTENCY_MODES.QUORUM]: {
         title: 'Quorum Consistency',
         icon: '⚖️',
         color: 'purple',
         description: 'Read/write from majority of nodes. Balanced trade-off between consistency and availability.',
         pros: ['Balanced approach', 'Fault tolerant', 'Configurable'],
         cons: ['Moderate latency', 'Network overhead', 'Complex implementation'],
         latency: 'Medium',
         availability: 'Medium'
      }
   };

   const handleModeSelect = (mode) => {
      setSelectedMode(mode);
      if (onModeChange) {
         onModeChange(mode);
      }
   };

   const info = consistencyInfo[selectedMode];

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-xl font-bold mb-4">Consistency Model</h3>

         {/* Mode Selector */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(consistencyInfo).map(([mode, data]) => (
               <button
                  key={mode}
                  onClick={() => handleModeSelect(mode)}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedMode === mode
                     ? `border-${data.color}-500 bg-${data.color}-50`
                     : 'border-gray-300 bg-white hover:border-gray-400'
                     }`}
               >
                  <div className="text-3xl mb-2">{data.icon}</div>
                  <div className={`font-semibold ${selectedMode === mode ? `text-${data.color}-700` : 'text-gray-700'
                     }`}>
                     {data.title}
                  </div>
                  {selectedMode === mode && (
                     <div className={`mt-2 px-2 py-1 bg-${data.color}-600 text-white text-xs rounded`}>
                        ACTIVE
                     </div>
                  )}
               </button>
            ))}
         </div>

         {/* Detailed Information */}
         <div className={`p-4 rounded-lg border-2 border-${info.color}-300 bg-${info.color}-50 mb-6`}>
            <div className="flex items-start gap-3 mb-3">
               <div className="text-4xl">{info.icon}</div>
               <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{info.title}</h4>
                  <p className="text-sm text-gray-700">{info.description}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Pros */}
               <div>
                  <h5 className="font-semibold text-green-700 mb-2">✅ Advantages</h5>
                  <ul className="text-sm space-y-1">
                     {info.pros.map((pro, idx) => (
                        <li key={idx} className="text-gray-700">• {pro}</li>
                     ))}
                  </ul>
               </div>

               {/* Cons */}
               <div>
                  <h5 className="font-semibold text-red-700 mb-2">⚠️ Trade-offs</h5>
                  <ul className="text-sm space-y-1">
                     {info.cons.map((con, idx) => (
                        <li key={idx} className="text-gray-700">• {con}</li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>

         {/* Performance Metrics */}
         <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
               <div className="text-sm text-gray-600 mb-1">Expected Latency</div>
               <div className={`text-2xl font-bold ${info.latency === 'Low' ? 'text-green-600' :
                  info.latency === 'Medium' ? 'text-yellow-600' :
                     'text-red-600'
                  }`}>
                  {info.latency}
               </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
               <div className="text-sm text-gray-600 mb-1">Availability</div>
               <div className={`text-2xl font-bold ${info.availability === 'High' ? 'text-green-600' :
                  info.availability === 'Medium' ? 'text-yellow-600' :
                     'text-red-600'
                  }`}>
                  {info.availability}
               </div>
            </div>
         </div>

         {/* Current Stats */}
         {stats && (
            <div className="pt-4 border-t">
               <h4 className="font-semibold mb-3 text-gray-700">Current Performance</h4>
               <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                     <div className="text-2xl font-bold text-blue-600">
                        {stats.avgLatency || 0}ms
                     </div>
                     <div className="text-xs text-gray-600">Avg Latency</div>
                  </div>
                  <div className="text-center">
                     <div className="text-2xl font-bold text-green-600">
                        {stats.successRate || 0}%
                     </div>
                     <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                     <div className="text-2xl font-bold text-purple-600">
                        {stats.conflictsResolved || 0}
                     </div>
                     <div className="text-xs text-gray-600">Conflicts</div>
                  </div>
               </div>
            </div>
         )}

         {/* CAP Theorem Notice */}
         <div className="mt-6 p-3 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-start gap-2">
               <span className="text-lg">💡</span>
               <div className="text-sm">
                  <strong className="text-yellow-900">CAP Theorem:</strong>
                  <span className="text-yellow-800"> In a distributed system, you can only guarantee 2 out of 3: Consistency, Availability, and Partition Tolerance.</span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ConsistencyToggle;