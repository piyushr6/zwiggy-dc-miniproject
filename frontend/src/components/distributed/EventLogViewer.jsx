// frontend/src/components/distributed/EventLogViewer.jsx
import React, { useState, useEffect } from 'react';

const EventLogViewer = ({ events, nodes }) => {
   const [filteredEvents, setFilteredEvents] = useState([]);
   const [filters, setFilters] = useState({
      nodeId: 'all',
      eventType: 'all',
      severity: 'all',
      searchTerm: ''
   });
   const [autoScroll, setAutoScroll] = useState(true);

   useEffect(() => {
      if (events) {
         let filtered = [...events];

         // Filter by node
         if (filters.nodeId !== 'all') {
            filtered = filtered.filter(e => e.nodeId === filters.nodeId);
         }

         // Filter by event type
         if (filters.eventType !== 'all') {
            filtered = filtered.filter(e => e.eventType === filters.eventType);
         }

         // Filter by severity
         if (filters.severity !== 'all') {
            filtered = filtered.filter(e => e.severity === filters.severity);
         }

         // Filter by search term
         if (filters.searchTerm) {
            filtered = filtered.filter(e =>
               e.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
               e.eventType?.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
         }

         setFilteredEvents(filtered);
      }
   }, [events, filters]);

   const eventTypes = [
      'all',
      'node_started',
      'node_failed',
      'leader_elected',
      'replication',
      'transaction',
      'consistency',
      'load_balance',
      'lock_acquired',
      'lock_released'
   ];

   const severityLevels = ['all', 'info', 'warning', 'error', 'critical'];

   const getSeverityColor = (severity) => {
      switch (severity?.toLowerCase()) {
         case 'critical':
            return 'red';
         case 'error':
            return 'orange';
         case 'warning':
            return 'yellow';
         case 'info':
         default:
            return 'blue';
      }
   };

   const getSeverityIcon = (severity) => {
      switch (severity?.toLowerCase()) {
         case 'critical':
            return '🔴';
         case 'error':
            return '⚠️';
         case 'warning':
            return '⚡';
         case 'info':
         default:
            return 'ℹ️';
      }
   };

   const getEventTypeIcon = (eventType) => {
      const icons = {
         node_started: '🟢',
         node_failed: '🔴',
         leader_elected: '👑',
         replication: '🔄',
         transaction: '💳',
         consistency: '🔒',
         load_balance: '⚖️',
         lock_acquired: '🔐',
         lock_released: '🔓'
      };
      return icons[eventType] || '📌';
   };

   const handleFilterChange = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
   };

   const handleClearFilters = () => {
      setFilters({
         nodeId: 'all',
         eventType: 'all',
         severity: 'all',
         searchTerm: ''
      });
   };

   const exportLogs = () => {
      const dataStr = JSON.stringify(filteredEvents, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-logs-${Date.now()}.json`;
      link.click();
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Distributed Event Log</h3>
            <div className="flex items-center gap-2">
               <label className="flex items-center gap-2 text-sm">
                  <input
                     type="checkbox"
                     checked={autoScroll}
                     onChange={(e) => setAutoScroll(e.target.checked)}
                     className="rounded"
                  />
                  Auto-scroll
               </label>
               <button
                  onClick={exportLogs}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
               >
                  Export
               </button>
            </div>
         </div>

         {/* Filters */}
         <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
               {/* Node Filter */}
               <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Node</label>
                  <select
                     value={filters.nodeId}
                     onChange={(e) => handleFilterChange('nodeId', e.target.value)}
                     className="w-full border rounded px-2 py-1 text-sm"
                  >
                     <option value="all">All Nodes</option>
                     {nodes?.map(node => (
                        <option key={node.id} value={node.id}>Node {node.id}</option>
                     ))}
                  </select>
               </div>

               {/* Event Type Filter */}
               <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Event Type</label>
                  <select
                     value={filters.eventType}
                     onChange={(e) => handleFilterChange('eventType', e.target.value)}
                     className="w-full border rounded px-2 py-1 text-sm"
                  >
                     {eventTypes.map(type => (
                        <option key={type} value={type}>
                           {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').toUpperCase()}
                        </option>
                     ))}
                  </select>
               </div>

               {/* Severity Filter */}
               <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Severity</label>
                  <select
                     value={filters.severity}
                     onChange={(e) => handleFilterChange('severity', e.target.value)}
                     className="w-full border rounded px-2 py-1 text-sm"
                  >
                     {severityLevels.map(level => (
                        <option key={level} value={level}>
                           {level === 'all' ? 'All Levels' : level.toUpperCase()}
                        </option>
                     ))}
                  </select>
               </div>

               {/* Search */}
               <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
                  <input
                     type="text"
                     value={filters.searchTerm}
                     onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                     placeholder="Search events..."
                     className="w-full border rounded px-2 py-1 text-sm"
                  />
               </div>
            </div>
            <button
               onClick={handleClearFilters}
               className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
               Clear All Filters
            </button>
         </div>

         {/* Statistics Bar */}
         <div className="mb-4 grid grid-cols-4 gap-3">
            <div className="p-2 bg-blue-50 rounded text-center">
               <div className="text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
               <div className="text-xs text-gray-600">Total Events</div>
            </div>
            <div className="p-2 bg-green-50 rounded text-center">
               <div className="text-2xl font-bold text-green-600">
                  {filteredEvents.filter(e => e.severity === 'info').length}
               </div>
               <div className="text-xs text-gray-600">Info</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded text-center">
               <div className="text-2xl font-bold text-yellow-600">
                  {filteredEvents.filter(e => e.severity === 'warning').length}
               </div>
               <div className="text-xs text-gray-600">Warnings</div>
            </div>
            <div className="p-2 bg-red-50 rounded text-center">
               <div className="text-2xl font-bold text-red-600">
                  {filteredEvents.filter(e => ['error', 'critical'].includes(e.severity)).length}
               </div>
               <div className="text-xs text-gray-600">Errors</div>
            </div>
         </div>

         {/* Event Log Table */}
         <div className="max-h-96 overflow-y-auto border rounded-lg">
            {filteredEvents.length > 0 ? (
               <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                     <tr>
                        <th className="p-2 text-left font-semibold">Time</th>
                        <th className="p-2 text-left font-semibold">Node</th>
                        <th className="p-2 text-left font-semibold">Type</th>
                        <th className="p-2 text-left font-semibold">Severity</th>
                        <th className="p-2 text-left font-semibold">Description</th>
                        <th className="p-2 text-left font-semibold">Clock</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredEvents.map((event, index) => {
                        const color = getSeverityColor(event.severity);
                        return (
                           <tr
                              key={index}
                              className={`border-t border-gray-200 hover:bg-gray-50 ${event.severity === 'critical' ? 'bg-red-50' : ''
                                 }`}
                           >
                              <td className="p-2 text-xs text-gray-600 whitespace-nowrap">
                                 {new Date(event.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="p-2">
                                 <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                    Node {event.nodeId}
                                 </span>
                              </td>
                              <td className="p-2">
                                 <div className="flex items-center gap-1">
                                    <span>{getEventTypeIcon(event.eventType)}</span>
                                    <span className="text-xs">{event.eventType?.replace(/_/g, ' ')}</span>
                                 </div>
                              </td>
                              <td className="p-2">
                                 <span className={`flex items-center gap-1 px-2 py-0.5 bg-${color}-100 text-${color}-700 rounded text-xs font-semibold w-fit`}>
                                    {getSeverityIcon(event.severity)}
                                    {event.severity?.toUpperCase()}
                                 </span>
                              </td>
                              <td className="p-2 text-xs">{event.description}</td>
                              <td className="p-2">
                                 <span className="font-mono text-xs text-gray-500">
                                    {event.lamportTimestamp || '-'}
                                 </span>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            ) : (
               <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No events found</p>
                  <p className="text-sm">Try adjusting your filters</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default EventLogViewer;