// frontend/src/components/distributed/ClockSyncTimeline.jsx
import React, { useState, useEffect } from 'react';

const ClockSyncTimeline = ({ events, nodes }) => {
   const [selectedNode, setSelectedNode] = useState(null);
   const [sortedEvents, setSortedEvents] = useState([]);

   useEffect(() => {
      if (events && events.length > 0) {
         const sorted = [...events].sort((a, b) => a.lamportTimestamp - b.lamportTimestamp);
         setSortedEvents(sorted);
      }
   }, [events]);

   const getNodeColor = (nodeId) => {
      const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
      const index = parseInt(nodeId?.toString().replace(/\D/g, '')) || 0;
      return colors[index % colors.length];
   };

   const filteredEvents = selectedNode
      ? sortedEvents.filter(e => e.nodeId === selectedNode)
      : sortedEvents;

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Lamport Clock Timeline</h3>
            <div className="flex items-center gap-2">
               <label className="text-sm text-gray-600">Filter:</label>
               <select
                  value={selectedNode || ''}
                  onChange={(e) => setSelectedNode(e.target.value || null)}
                  className="border rounded px-3 py-1 text-sm"
               >
                  <option value="">All Nodes</option>
                  {nodes?.map(node => (
                     <option key={node.id} value={node.id}>
                        Node {node.id}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Legend */}
         <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded">
            {nodes?.map(node => (
               <div key={node.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${getNodeColor(node.id)}-500`}></div>
                  <span className="text-sm">Node {node.id}</span>
               </div>
            ))}
         </div>

         {/* Timeline */}
         <div className="relative max-h-96 overflow-y-auto">
            {filteredEvents.length > 0 ? (
               <div className="space-y-3">
                  {filteredEvents.map((event, index) => {
                     const color = getNodeColor(event.nodeId);
                     return (
                        <div key={index} className="flex items-start gap-3">
                           {/* Timestamp Badge */}
                           <div className="flex-shrink-0 w-16 text-center">
                              <div className={`inline-block bg-${color}-100 text-${color}-700 px-2 py-1 rounded text-xs font-mono font-bold`}>
                                 {event.lamportTimestamp}
                              </div>
                           </div>

                           {/* Timeline Line */}
                           <div className="flex flex-col items-center">
                              <div className={`w-4 h-4 rounded-full bg-${color}-500 border-2 border-white shadow`}></div>
                              {index < filteredEvents.length - 1 && (
                                 <div className={`w-0.5 h-8 bg-${color}-200`}></div>
                              )}
                           </div>

                           {/* Event Card */}
                           <div className="flex-1 pb-4">
                              <div className={`p-3 rounded-lg border border-${color}-200 bg-${color}-50`}>
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm">
                                       Node {event.nodeId}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                       {new Date(event.timestamp).toLocaleTimeString()}
                                    </span>
                                 </div>
                                 <div className="text-sm text-gray-700">
                                    <strong>{event.eventType}:</strong> {event.description}
                                 </div>
                                 {event.metadata && (
                                    <div className="mt-2 text-xs text-gray-600">
                                       {Object.entries(event.metadata).map(([key, value]) => (
                                          <div key={key}>
                                             <span className="font-semibold">{key}:</span> {JSON.stringify(value)}
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               <div className="text-center py-8 text-gray-500">
                  <p>No events to display</p>
                  <p className="text-sm mt-2">Lamport clock events will appear here in real-time</p>
               </div>
            )}
         </div>

         {/* Stats */}
         {sortedEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
               <div>
                  <div className="text-2xl font-bold text-blue-600">{sortedEvents.length}</div>
                  <div className="text-xs text-gray-600">Total Events</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-green-600">
                     {Math.max(...sortedEvents.map(e => e.lamportTimestamp))}
                  </div>
                  <div className="text-xs text-gray-600">Max Clock Value</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-purple-600">{nodes?.length || 0}</div>
                  <div className="text-xs text-gray-600">Active Nodes</div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ClockSyncTimeline;