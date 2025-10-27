// frontend/src/components/distributed/ConcurrencyDemo.jsx
import React, { useState } from 'react';

const ConcurrencyDemo = ({ onRunSimulation }) => {
   const [simulationRunning, setSimulationRunning] = useState(false);
   const [scenario, setScenario] = useState('race_condition');
   const [results, setResults] = useState(null);
   const [transactions, setTransactions] = useState([]);

   const scenarios = {
      race_condition: {
         name: 'Race Condition',
         icon: '🏁',
         color: 'red',
         description: 'Two transactions try to update the same resource simultaneously without proper locking',
         example: 'User A and User B both order the last pizza at the same time'
      },
      deadlock: {
         name: 'Deadlock',
         icon: '🔒',
         color: 'orange',
         description: 'Two transactions wait for each other to release locks, creating a circular dependency',
         example: 'Transaction 1 locks Order A, Transaction 2 locks Order B, then they need each other\'s locks'
      },
      lost_update: {
         name: 'Lost Update',
         icon: '📝',
         color: 'yellow',
         description: 'One transaction overwrites another\'s changes without seeing them',
         example: 'Two restaurant updates happen, second one overwrites first without merging'
      },
      dirty_read: {
         name: 'Dirty Read',
         icon: '👓',
         color: 'purple',
         description: 'A transaction reads uncommitted data from another transaction',
         example: 'Order status updated but not committed, another process reads incorrect status'
      }
   };

   const handleRunSimulation = async () => {
      setSimulationRunning(true);
      setTransactions([]);
      setResults(null);

      // Simulate transactions
      const mockTransactions = [
         { id: 1, status: 'started', action: 'Read resource', timestamp: Date.now() },
         { id: 2, status: 'started', action: 'Read resource', timestamp: Date.now() + 100 },
         { id: 1, status: 'processing', action: 'Attempt write', timestamp: Date.now() + 200 },
         { id: 2, status: 'processing', action: 'Attempt write', timestamp: Date.now() + 250 },
         { id: 1, status: 'conflict', action: 'Lock conflict detected', timestamp: Date.now() + 300 },
         { id: 2, status: 'waiting', action: 'Waiting for lock', timestamp: Date.now() + 350 },
      ];

      for (const tx of mockTransactions) {
         await new Promise(resolve => setTimeout(resolve, 200));
         setTransactions(prev => [...prev, tx]);
      }

      // Resolve based on scenario
      await new Promise(resolve => setTimeout(resolve, 500));

      if (scenario === 'race_condition') {
         setResults({
            outcome: 'Conflict Detected',
            resolution: 'Transaction 2 rolled back, Transaction 1 completed',
            finalState: 'Resource updated by Transaction 1 only',
            impact: 'Data consistency maintained with proper locking'
         });
      } else if (scenario === 'deadlock') {
         setResults({
            outcome: 'Deadlock Detected',
            resolution: 'Transaction 2 aborted to break cycle',
            finalState: 'Transaction 1 completed, Transaction 2 needs retry',
            impact: 'System prevented infinite wait'
         });
      } else if (scenario === 'lost_update') {
         setResults({
            outcome: 'Lost Update Prevented',
            resolution: 'Optimistic locking detected version mismatch',
            finalState: 'Transaction 2 rejected, needs refresh',
            impact: 'No data loss occurred'
         });
      } else {
         setResults({
            outcome: 'Dirty Read Prevented',
            resolution: 'Read isolation level enforced',
            finalState: 'Only committed data visible',
            impact: 'Data integrity maintained'
         });
      }

      setSimulationRunning(false);

      if (onRunSimulation) {
         onRunSimulation(scenario);
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'started': return 'blue';
         case 'processing': return 'yellow';
         case 'waiting': return 'orange';
         case 'conflict': return 'red';
         case 'completed': return 'green';
         default: return 'gray';
      }
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-xl font-bold mb-4">Concurrency Control Demo</h3>

         {/* Scenario Selector */}
         <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
               Select Scenario
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {Object.entries(scenarios).map(([key, info]) => (
                  <button
                     key={key}
                     onClick={() => setScenario(key)}
                     disabled={simulationRunning}
                     className={`p-3 rounded-lg border-2 transition-all ${scenario === key
                        ? `border-${info.color}-500 bg-${info.color}-50`
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        } ${simulationRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     <div className="text-2xl mb-1">{info.icon}</div>
                     <div className="text-sm font-semibold">{info.name}</div>
                  </button>
               ))}
            </div>
         </div>

         {/* Scenario Description */}
         <div className={`p-4 rounded-lg border-2 border-${scenarios[scenario].color}-300 bg-${scenarios[scenario].color}-50 mb-6`}>
            <div className="flex items-start gap-3">
               <div className="text-3xl">{scenarios[scenario].icon}</div>
               <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{scenarios[scenario].name}</h4>
                  <p className="text-sm text-gray-700 mb-2">{scenarios[scenario].description}</p>
                  <div className="text-sm">
                     <strong>Example:</strong> {scenarios[scenario].example}
                  </div>
               </div>
            </div>
         </div>

         {/* Run Simulation Button */}
         <div className="mb-6 text-center">
            <button
               onClick={handleRunSimulation}
               disabled={simulationRunning}
               className={`px-6 py-3 rounded-lg font-semibold text-white ${simulationRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
            >
               {simulationRunning ? (
                  <span className="flex items-center gap-2">
                     <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                     Running Simulation...
                  </span>
               ) : (
                  'Run Simulation'
               )}
            </button>
         </div>

         {/* Transaction Timeline */}
         {transactions.length > 0 && (
            <div className="mb-6">
               <h4 className="font-semibold mb-3 text-gray-700">Transaction Timeline</h4>
               <div className="max-h-80 overflow-y-auto space-y-2">
                  {transactions.map((tx, index) => {
                     const color = getStatusColor(tx.status);
                     return (
                        <div
                           key={index}
                           className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200"
                        >
                           <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                              <span className={`font-bold text-${color}-700`}>{tx.id}</span>
                           </div>
                           <div className="flex-1">
                              <div className="text-sm font-semibold">{tx.action}</div>
                              <div className="text-xs text-gray-500">Transaction {tx.id}</div>
                           </div>
                           <div className={`px-3 py-1 rounded text-xs font-semibold bg-${color}-100 text-${color}-700`}>
                              {tx.status.toUpperCase()}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}

         {/* Results */}
         {results && (
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
               <h4 className="font-bold text-lg text-green-900 mb-3">✅ Simulation Complete</h4>
               <div className="space-y-2 text-sm">
                  <div>
                     <strong className="text-gray-700">Outcome:</strong>
                     <span className="ml-2 text-gray-800">{results.outcome}</span>
                  </div>
                  <div>
                     <strong className="text-gray-700">Resolution:</strong>
                     <span className="ml-2 text-gray-800">{results.resolution}</span>
                  </div>
                  <div>
                     <strong className="text-gray-700">Final State:</strong>
                     <span className="ml-2 text-gray-800">{results.finalState}</span>
                  </div>
                  <div>
                     <strong className="text-gray-700">Impact:</strong>
                     <span className="ml-2 text-gray-800">{results.impact}</span>
                  </div>
               </div>
            </div>
         )}

         {/* Information Box */}
         <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Concurrency Control Mechanisms</h4>
            <ul className="text-sm text-blue-800 space-y-1">
               <li>• <strong>Locks:</strong> Prevent simultaneous access to resources</li>
               <li>• <strong>Timestamps:</strong> Order transactions chronologically</li>
               <li>• <strong>Optimistic Control:</strong> Detect conflicts at commit time</li>
               <li>• <strong>MVCC:</strong> Multi-Version Concurrency Control for reads</li>
            </ul>
         </div>
      </div>
   );
};

export default ConcurrencyDemo;