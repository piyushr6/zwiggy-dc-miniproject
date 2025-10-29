// frontend/src/services/distributedService.js
import api from './api';

export const distributedService = {
   // ===== NODE MANAGEMENT =====

   // Get all nodes in the distributed system
   getNodes: async () => {
      try {
         const response = await api.get('/distributed/nodes');
         return response;
      } catch (error) {
         console.error('Error fetching nodes:', error);
         throw error;
      }
   },

   // Get status of a specific node
   getNodeStatus: async (nodeId) => {
      try {
         const response = await api.get(`/distributed/nodes/${nodeId}`);
         return response;
      } catch (error) {
         console.error('Error fetching node status:', error);
         throw error;
      }
   },

   // Add a new node to the cluster
   addNode: async (nodeConfig) => {
      try {
         const response = await api.post('/distributed/nodes', nodeConfig);
         return response;
      } catch (error) {
         console.error('Error adding node:', error);
         throw error;
      }
   },

   // Remove a node from the cluster
   removeNode: async (nodeId) => {
      try {
         const response = await api.delete(`/distributed/nodes/${nodeId}`);
         return response;
      } catch (error) {
         console.error('Error removing node:', error);
         throw error;
      }
   },

   // ===== LEADER ELECTION =====

   // Trigger leader election using Bully algorithm
   triggerElection: async () => {
      try {
         const response = await api.post('/distributed/election/trigger');
         return response;
      } catch (error) {
         console.error('Error triggering election:', error);
         throw error;
      }
   },

   // Get current leader information
   getLeader: async () => {
      try {
         const response = await api.get('/distributed/leader');
         return response;
      } catch (error) {
         console.error('Error fetching leader:', error);
         throw error;
      }
   },

   // Get election history
   getElectionHistory: async () => {
      try {
         const response = await api.get('/distributed/election/history');
         return response;
      } catch (error) {
         console.error('Error fetching election history:', error);
         throw error;
      }
   },

   // ===== CLOCK SYNCHRONIZATION =====

   // Get current clock state of all nodes
   getClockState: async () => {
      try {
         const response = await api.get('/distributed/clock');
         return response;
      } catch (error) {
         console.error('Error fetching clock state:', error);
         throw error;
      }
   },

   // Synchronize clocks across nodes
   syncClocks: async () => {
      try {
         const response = await api.post('/distributed/clock/sync');
         return response;
      } catch (error) {
         console.error('Error syncing clocks:', error);
         throw error;
      }
   },

   // Get Lamport clock history
   getClockHistory: async (limit = 50) => {
      try {
         const response = await api.get(`/distributed/clock/history?limit=${limit}`);
         return response;
      } catch (error) {
         console.error('Error fetching clock history:', error);
         throw error;
      }
   },

   // ===== CONSISTENCY MODELS =====

   // Set consistency mode (strong/eventual/quorum)
   setConsistencyMode: async (mode) => {
      try {
         const response = await api.post('/distributed/consistency', { mode });
         return response;
      } catch (error) {
         console.error('Error setting consistency mode:', error);
         throw error;
      }
   },

   // Get current consistency mode
   getConsistencyMode: async () => {
      try {
         const response = await api.get('/distributed/consistency');
         return response;
      } catch (error) {
         console.error('Error fetching consistency mode:', error);
         throw error;
      }
   },

   // Test consistency with concurrent writes
   testConsistency: async (testData) => {
      try {
         const response = await api.post('/distributed/consistency/test', testData);
         return response;
      } catch (error) {
         console.error('Error testing consistency:', error);
         throw error;
      }
   },

   // ===== LOAD BALANCING =====

   // Get load balancer statistics
   getLoadBalancerStats: async () => {
      try {
         const response = await api.get('/distributed/load-balancer');
         return response;
      } catch (error) {
         console.error('Error fetching load balancer stats:', error);
         throw error;
      }
   },

   // Set load balancing algorithm (round_robin/least_connections/random)
   setLoadBalancingAlgorithm: async (algorithm) => {
      try {
         const response = await api.post('/distributed/load-balancer', { algorithm });
         return response;
      } catch (error) {
         console.error('Error setting load balancing algorithm:', error);
         throw error;
      }
   },

   // Get request distribution across nodes
   getRequestDistribution: async () => {
      try {
         const response = await api.get('/distributed/load-balancer/distribution');
         return response;
      } catch (error) {
         console.error('Error fetching request distribution:', error);
         throw error;
      }
   },

   // ===== DATA REPLICATION =====

   // Get replication status
   getReplicationStatus: async () => {
      try {
         const response = await api.get('/distributed/replication');
         return response;
      } catch (error) {
         console.error('Error fetching replication status:', error);
         throw error;
      }
   },

   // Trigger manual replication
   triggerReplication: async () => {
      try {
         const response = await api.post('/distributed/replication/trigger');
         return response;
      } catch (error) {
         console.error('Error triggering replication:', error);
         throw error;
      }
   },

   // Get replication lag
   getReplicationLag: async () => {
      try {
         const response = await api.get('/distributed/replication/lag');
         return response;
      } catch (error) {
         console.error('Error fetching replication lag:', error);
         throw error;
      }
   },

   // ===== MAPREDUCE ANALYTICS =====

   // Run MapReduce job
   runMapReduce: async (query) => {
      try {
         const response = await api.post('/distributed/mapreduce', query);
         return response;
      } catch (error) {
         console.error('Error running MapReduce:', error);
         throw error;
      }
   },

   // Get analytics for a specific metric
   getAnalytics: async (metric) => {
      try {
         const response = await api.get(`/distributed/analytics/${metric}`);
         return response;
      } catch (error) {
         console.error('Error fetching analytics:', error);
         throw error;
      }
   },

   // Get popular items using MapReduce
   getPopularItems: async (timeRange = '24h') => {
      try {
         const response = await api.get(`/distributed/analytics/popular-items?range=${timeRange}`);
         return response;
      } catch (error) {
         console.error('Error fetching popular items:', error);
         throw error;
      }
   },

   // Get revenue analytics
   getRevenueAnalytics: async (timeRange = '7d') => {
      try {
         const response = await api.get(`/distributed/analytics/revenue?range=${timeRange}`);
         return response;
      } catch (error) {
         console.error('Error fetching revenue analytics:', error);
         throw error;
      }
   },

   // ===== EVENT LOGS =====

   // Get distributed event logs
   getEventLogs: async (filters = {}) => {
      try {
         const params = new URLSearchParams();

         if (filters.nodeId) params.append('node_id', filters.nodeId);
         if (filters.eventType) params.append('event_type', filters.eventType);
         if (filters.startTime) params.append('start_time', filters.startTime);
         if (filters.endTime) params.append('end_time', filters.endTime);
         if (filters.limit) params.append('limit', filters.limit);

         const response = await api.get(`/distributed/events?${params.toString()}`);
         return response;
      } catch (error) {
         console.error('Error fetching event logs:', error);
         throw error;
      }
   },

   // Clear event logs
   clearEventLogs: async () => {
      try {
         const response = await api.delete('/distributed/events');
         return response;
      } catch (error) {
         console.error('Error clearing event logs:', error);
         throw error;
      }
   },

   // ===== CONCURRENCY & LOCKING =====

   // Simulate concurrency scenario
   simulateConcurrency: async (scenario) => {
      try {
         const response = await api.post('/distributed/concurrency/simulate', scenario);
         return response;
      } catch (error) {
         console.error('Error simulating concurrency:', error);
         throw error;
      }
   },

   // Get lock status
   getLockStatus: async () => {
      try {
         const response = await api.get('/distributed/locks');
         return response;
      } catch (error) {
         console.error('Error fetching lock status:', error);
         throw error;
      }
   },

   // ===== FAILURE SIMULATION =====

   // Simulate node failure
   simulateNodeFailure: async (nodeId) => {
      try {
         const response = await api.post(`/distributed/nodes/${nodeId}/fail`);
         return response;
      } catch (error) {
         console.error('Error simulating node failure:', error);
         throw error;
      }
   },

   // Recover failed node
   recoverNode: async (nodeId) => {
      try {
         const response = await api.post(`/distributed/nodes/${nodeId}/recover`);
         return response;
      } catch (error) {
         console.error('Error recovering node:', error);
         throw error;
      }
   },

   // Simulate network partition
   simulatePartition: async (nodeIds) => {
      try {
         const response = await api.post('/distributed/partition', { nodeIds });
         return response;
      } catch (error) {
         console.error('Error simulating partition:', error);
         throw error;
      }
   },

   // Heal network partition
   healPartition: async () => {
      try {
         const response = await api.post('/distributed/partition/heal');
         return response;
      } catch (error) {
         console.error('Error healing partition:', error);
         throw error;
      }
   },

   // ===== SYSTEM METRICS =====

   // Get overall system health
   getSystemHealth: async () => {
      try {
         const response = await api.get('/distributed/health');
         return response;
      } catch (error) {
         console.error('Error fetching system health:', error);
         throw error;
      }
   },

   // Get performance metrics
   getPerformanceMetrics: async () => {
      try {
         const response = await api.get('/distributed/metrics/performance');
         return response;
      } catch (error) {
         console.error('Error fetching performance metrics:', error);
         throw error;
      }
   }
};

export default distributedService;