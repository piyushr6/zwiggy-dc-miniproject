// frontend/src/components/distributed/LeaderElectionPanel.jsx
import React, { useState } from 'react';
import { NODE_STATUS } from '../../utils/constants';

const LeaderElectionPanel = ({ nodes, leader, electionInProgress, electionHistory, onTriggerElection }) => {
   const [selectedNode, setSelectedNode] = useState(null);

   const getNodePriority = (nodeId) => {
      return parseInt(nodeId?.toString().replace(/\D/g, '')) || 0;
   };

   const sortedNodes = nodes ? [...nodes].sort((a, b) => getNodePriority(b.id) - getNodePriority(a.id)) : [];

   const handleTriggerElection = () => {
      if (onTriggerElection) {
         onTriggerElection();
      }
   };

   const handleSimulateFailure = (nodeId) => {
      setSelectedNode(nodeId);
      // Call API to simulate node failure
      console.log('Simulating failure for node:', nodeId);
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Leader Election (Bully Algorithm)</h3>
            {electionInProgress && (
               <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full animate-pulse">
                  Election in Progress...
               </span>
            )}
         </div>

         {/* Current Leader Section */}
         <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="text-4xl">👑</div>
                  <div>
                     <h4 className="text-sm text-gray-600 font-semibold">Current Leader</h4>
                     {leader ? (
                        <div className="text-2xl font-bold text-purple-700">
                           Node {leader.id}
                        </div>
                     ) : (
                        <div className="text-lg text-gray-500 italic">No leader elected</div>
                     )}
                  </div>
               </div>
               <button
                  onClick={handleTriggerElection}
                  disabled={electionInProgress}
                  className={`px-4 py-2 rounded font-semibold ${electionInProgress
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     : 'bg-purple-600 text-white hover:bg-purple-700'
                     }`}
               >
                  Trigger Election
               </button>
            </div>
         </div>

         {/* Node Priority List */}
         <div className="mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Node Priority (Bully Algorithm)</h4>
            <div className="space-y-2">
               {sortedNodes.map((node, index) => {
                  const isLeader = leader?.id === node.id;
                  const priority = getNodePriority(node.id);
                  const isFailed = node.status === NODE_STATUS.FAILED;

                  return (
                     <div
                        key={node.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${isLeader
                           ? 'border-purple-400 bg-purple-50'
                           : isFailed
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 bg-gray-50'
                           }`}
                     >
                        <div className="flex items-center gap-3 flex-1">
                           <div className={`text-xl font-bold ${isFailed ? 'text-gray-400' : 'text-gray-700'
                              }`}>
                              #{index + 1}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-2">
                                 <span className="font-semibold">Node {node.id}</span>
                                 {isLeader && (
                                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">
                                       LEADER
                                    </span>
                                 )}
                                 {isFailed && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded">
                                       FAILED
                                    </span>
                                 )}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Priority: {priority}
                              </div>
                           </div>
                        </div>
                        <button
                           onClick={() => handleSimulateFailure(node.id)}
                           disabled={isFailed || electionInProgress}
                           className={`px-3 py-1 text-sm rounded ${isFailed || electionInProgress
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                        >
                           Simulate Failure
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Election History */}
         {electionHistory && electionHistory.length > 0 && (
            <div>
               <h4 className="font-semibold mb-3 text-gray-700">Recent Elections</h4>
               <div className="max-h-48 overflow-y-auto space-y-2">
                  {electionHistory.slice(-5).reverse().map((election, index) => (
                     <div
                        key={index}
                        className="p-3 bg-gray-50 rounded border border-gray-200"
                     >
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-semibold text-sm">
                              Election #{election.id}
                           </span>
                           <span className="text-xs text-gray-500">
                              {new Date(election.timestamp).toLocaleString()}
                           </span>
                        </div>
                        <div className="text-sm text-gray-700">
                           <span className="font-semibold text-purple-600">
                              Node {election.winner}
                           </span>{' '}
                           elected as leader
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                           Participants: {election.participants?.join(', ') || 'N/A'}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Algorithm Info */}
         <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Bully Algorithm</h4>
            <ul className="text-sm text-blue-800 space-y-1">
               <li>• Node with highest ID becomes leader</li>
               <li>• When leader fails, remaining nodes elect new leader</li>
               <li>• Higher priority nodes "bully" lower ones</li>
               <li>• Failed nodes are excluded from elections</li>
            </ul>
         </div>
      </div>
   );
};

export default LeaderElectionPanel;