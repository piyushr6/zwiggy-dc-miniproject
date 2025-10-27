// frontend/src/components/distributed/ReplicationStatus.jsx
import React, { useState } from 'react';

const ReplicationStatus = ({ primary, replicas, syncStatus, replicationLag }) => {
   const [selectedReplica, setSelectedReplica] = useState(null);

   const getSyncStatusColor = (status) => {
      switch (status?.toLowerCase()) {
         case 'synced':
         case 'synchronized':
            return 'green';
         case 'syncing':
         case 'replicating':
            return 'yellow';
         case 'lagging':
         case 'behind':
            return 'orange';
         case 'disconnected':
         case 'failed':
            return 'red';
         default:
            return 'gray';
      }
   };

   const getSyncIcon = (status) => {
      switch (status?.toLowerCase()) {
         case 'synced':
         case 'synchronized':
            return '✓';
         case 'syncing':
         case 'replicating':
            return '↻';
         case 'lagging':
         case 'behind':
            return '⚠';
         case 'disconnected':
         case 'failed':
            return '✗';
         default:
            return '○';
      }
   };

   const formatBytes = (bytes) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h3 className="text-xl font-bold mb-4">Database Replication Status</h3>

         {/* Primary Database */}
         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                     P
                  </div>
                  <div>
                     <h4 className="font-bold text-lg">Primary Database</h4>
                     <p className="text-sm text-gray-600">{primary?.host || 'localhost:5432'}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded font-semibold text-sm">
                     MASTER
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
               <div>
                  <div className="text-gray-600">Write Ops/sec</div>
                  <div className="text-xl font-bold text-blue-700">{primary?.writeOps || 0}</div>
               </div>
               <div>
                  <div className="text-gray-600">Data Size</div>
                  <div className="text-xl font-bold text-blue-700">
                     {formatBytes(primary?.dataSize || 0)}
                  </div>
               </div>
               <div>
                  <div className="text-gray-600">Connections</div>
                  <div className="text-xl font-bold text-blue-700">{primary?.connections || 0}</div>
               </div>
            </div>
         </div>

         {/* Replication Flow Indicator */}
         <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
               <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                     <div
                        key={i}
                        className="w-2 h-0.5 bg-blue-400"
                        style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }}
                     ></div>
                  ))}
               </div>
               <div className="text-sm font-semibold text-gray-600">Replicating</div>
               <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                     <div
                        key={i}
                        className="w-2 h-0.5 bg-blue-400"
                        style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }}
                     ></div>
                  ))}
               </div>
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
         </div>

         {/* Replica Databases */}
         <div className="mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Replica Databases</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {replicas && replicas.length > 0 ? (
                  replicas.map((replica, index) => {
                     const status = replica.status || 'synced';
                     const color = getSyncStatusColor(status);
                     const lag = replica.replicationLag || 0;

                     return (
                        <div
                           key={replica.id || index}
                           className={`p-4 rounded-lg border-2 border-${color}-300 bg-${color}-50 cursor-pointer hover:shadow-lg transition-all ${selectedReplica === replica.id ? 'ring-2 ring-blue-500' : ''
                              }`}
                           onClick={() => setSelectedReplica(replica.id)}
                        >
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                 <div className={`w-10 h-10 bg-${color}-500 rounded-lg flex items-center justify-center text-white font-bold`}>
                                    R{index + 1}
                                 </div>
                                 <div>
                                    <h5 className="font-semibold">Replica {index + 1}</h5>
                                    <p className="text-xs text-gray-600">{replica.host}</p>
                                 </div>
                              </div>
                              <span className={`text-2xl text-${color}-600`}>
                                 {getSyncIcon(status)}
                              </span>
                           </div>
                           <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                 <span className="text-gray-600">Status:</span>
                                 <span className={`font-semibold text-${color}-700`}>
                                    {status.toUpperCase()}
                                 </span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-gray-600">Lag:</span>
                                 <span className={`font-semibold ${lag > 1000 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {lag}ms
                                 </span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-gray-600">Read Ops:</span>
                                 <span className="font-semibold">{replica.readOps || 0}/s</span>
                              </div>
                           </div>
                           {lag > 0 && (
                              <div className="mt-3">
                                 <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                       className={`h-2 rounded-full transition-all ${lag > 1000 ? 'bg-red-500' : lag > 500 ? 'bg-yellow-500' : 'bg-green-500'
                                          }`}
                                       style={{ width: `${Math.min((lag / 2000) * 100, 100)}%` }}
                                    ></div>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })
               ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                     No replica databases configured
                  </div>
               )}
            </div>
         </div>

         {/* Replication Statistics */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
               <div className="text-sm text-gray-600 mb-1">Total Replicas</div>
               <div className="text-2xl font-bold text-blue-600">
                  {replicas?.length || 0}
               </div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
               <div className="text-sm text-gray-600 mb-1">Synced</div>
               <div className="text-2xl font-bold text-green-600">
                  {replicas?.filter(r => r.status?.toLowerCase() === 'synced').length || 0}
               </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
               <div className="text-sm text-gray-600 mb-1">Avg Lag</div>
               <div className="text-2xl font-bold text-yellow-600">
                  {replicas && replicas.length > 0
                     ? Math.round(replicas.reduce((sum, r) => sum + (r.replicationLag || 0), 0) / replicas.length)
                     : 0}ms
               </div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
               <div className="text-sm text-gray-600 mb-1">Data Transfer</div>
               <div className="text-xl font-bold text-purple-600">
                  {formatBytes(syncStatus?.bytesTransferred || 0)}/s
               </div>
            </div>
         </div>

         {/* Replication Strategy Info */}
         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">📋 Replication Strategy</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
               <div>
                  <strong className="text-gray-700">Method:</strong>
                  <span className="ml-2 text-gray-600">
                     {syncStatus?.method || 'Asynchronous Replication'}
                  </span>
               </div>
               <div>
                  <strong className="text-gray-700">Consistency:</strong>
                  <span className="ml-2 text-gray-600">
                     {syncStatus?.consistency || 'Eventual Consistency'}
                  </span>
               </div>
               <div>
                  <strong className="text-gray-700">Conflict Resolution:</strong>
                  <span className="ml-2 text-gray-600">
                     {syncStatus?.conflictResolution || 'Last Write Wins'}
                  </span>
               </div>
               <div>
                  <strong className="text-gray-700">Failover:</strong>
                  <span className="ml-2 text-gray-600">
                     {syncStatus?.failover || 'Automatic'}
                  </span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ReplicationStatus;