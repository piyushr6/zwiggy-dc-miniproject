// frontend/src/pages/DistributedDashboard.jsx
import React, { useState, useEffect } from 'react';
import useDistributedState from '../hooks/useDistributedState';
import NodeVisualization from '../components/distributed/NodeVisualization';
import ClockSyncTimeline from '../components/distributed/ClockSyncTimeline';
import LeaderElectionPanel from '../components/distributed/LeaderElectionPanel';
import ConsistencyToggle from '../components/distributed/ConsistencyToggle';
import LoadBalancerView from '../components/distributed/LoadBalancerView';
import ReplicationStatus from '../components/distributed/ReplicationStatus';
import EventLogViewer from '../components/distributed/EventLogViewer';
import ConcurrencyDemo from '../components/distributed/ConcurrencyDemo';

const DistributedDashboard = () => {
   const [activeTab, setActiveTab] = useState('nodes');
   const { nodes, leader, eventLogs, connected } = useDistributedState();

   const tabs = [
      { id: 'nodes', label: 'Nodes & Leader', icon: '🖥️' },
      { id: 'clock', label: 'Clock Sync', icon: '🕐' },
      { id: 'consistency', label: 'Consistency', icon: '🔄' },
      { id: 'loadbalancer', label: 'Load Balancer', icon: '⚖️' },
      { id: 'replication', label: 'Replication', icon: '📑' },
      { id: 'concurrency', label: 'Concurrency', icon: '🔒' },
      { id: 'events', label: 'Event Logs', icon: '📋' }
   ];

   // Safe access to nodes array
   const safeNodes = Array.isArray(nodes) ? nodes : [];
   const safeEventLogs = Array.isArray(eventLogs) ? eventLogs : [];

   return (
      <div className="p-6">
         {/* Header */}
         <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h1 className="text-3xl font-bold text-gray-800">Distributed System Dashboard</h1>
                  <p className="text-gray-600 mt-2">
                     Monitor and interact with distributed system components
                  </p>
               </div>
               <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                     {connected ? 'Connected' : 'Disconnected'}
                  </span>
               </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Active Nodes</p>
                  <p className="text-3xl font-bold text-blue-600">{safeNodes.length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Current Leader</p>
                  <p className="text-3xl font-bold text-purple-600">
                     {leader ? `Node ${leader.node_id || leader.id}` : 'None'}
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Event Logs</p>
                  <p className="text-3xl font-bold text-green-600">{safeEventLogs.length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">System Status</p>
                  <p className="text-xl font-bold text-green-600">✓ Healthy</p>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex overflow-x-auto">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex-shrink-0 px-6 py-4 font-semibold transition ${activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                  >
                     <span className="mr-2">{tab.icon}</span>
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Tab Content */}
         <div className="space-y-6">
            {activeTab === 'nodes' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NodeVisualization nodes={safeNodes} leader={leader} />
                  <LeaderElectionPanel leader={leader} nodes={safeNodes} />
               </div>
            )}

            {activeTab === 'clock' && (
               <ClockSyncTimeline events={safeEventLogs} />
            )}

            {activeTab === 'consistency' && (
               <ConsistencyToggle />
            )}

            {activeTab === 'loadbalancer' && (
               <LoadBalancerView nodes={safeNodes} />
            )}

            {activeTab === 'replication' && (
               <ReplicationStatus nodes={safeNodes} />
            )}

            {activeTab === 'concurrency' && (
               <ConcurrencyDemo />
            )}

            {activeTab === 'events' && (
               <EventLogViewer events={safeEventLogs} />
            )}
         </div>

         {/* Information Panel */}
         <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">🎓 Distributed Systems Concepts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
               <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold mb-2 text-gray-800">Leader Election</p>
                  <p className="text-gray-600">
                     Bully algorithm ensures a leader is always elected to coordinate operations.
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold mb-2 text-gray-800">Lamport Clocks</p>
                  <p className="text-gray-600">
                     Logical timestamps maintain causal ordering of events across nodes.
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold mb-2 text-gray-800">Consistency Models</p>
                  <p className="text-gray-600">
                     Choose between strong, eventual, or quorum-based consistency.
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold mb-2 text-gray-800">Load Balancing</p>
                  <p className="text-gray-600">
                     Distribute requests across nodes using various algorithms.
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold mb-2 text-gray-800">Data Replication</p>
                  <p className="text-gray-600">
                     Maintain multiple copies of data for fault tolerance.
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold mb-2 text-gray-800">Concurrency Control</p>
                  <p className="text-gray-600">
                     Use distributed locks to prevent race conditions.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DistributedDashboard;