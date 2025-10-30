// frontend/src/store/distributedSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import distributedService from '../services/distributedService';

// Async thunks
export const fetchNodes = createAsyncThunk(
   'distributed/fetchNodes',
   async (_, { rejectWithValue }) => {
      try {
         const response = await distributedService.getNodes();
         // Handle both direct data and nested response
         return response?.data?.nodes || response?.nodes || response || [];
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchLeader = createAsyncThunk(
   'distributed/fetchLeader',
   async (_, { rejectWithValue }) => {
      try {
         const response = await distributedService.getLeader();
         // Handle both direct data and nested response
         return response?.data?.leader || response?.leader || response || null;
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchEventLogs = createAsyncThunk(
   'distributed/fetchEventLogs',
   async (filters, { rejectWithValue }) => {
      try {
         const response = await distributedService.getEventLogs(filters);
         // Handle both direct data and nested response
         return response?.data?.events || response?.events || response || [];
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchClockState = createAsyncThunk(
   'distributed/fetchClockState',
   async (_, { rejectWithValue }) => {
      try {
         const response = await distributedService.getClockState();
         return response?.data?.clocks || response?.clocks || response || {};
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchReplicationStatus = createAsyncThunk(
   'distributed/fetchReplicationStatus',
   async (_, { rejectWithValue }) => {
      try {
         const response = await distributedService.getReplicationStatus();
         return response?.data || response || {};
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchLoadBalancerStats = createAsyncThunk(
   'distributed/fetchLoadBalancerStats',
   async (_, { rejectWithValue }) => {
      try {
         const response = await distributedService.getLoadBalancerStats();
         return response?.data?.stats || response?.stats || response || {};
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const triggerElection = createAsyncThunk(
   'distributed/triggerElection',
   async (_, { rejectWithValue }) => {
      try {
         const response = await distributedService.triggerElection();
         return response?.data?.leader || response?.leader || response || null;
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const setConsistencyModeAsync = createAsyncThunk(
   'distributed/setConsistencyModeAsync',
   async (mode, { rejectWithValue }) => {
      try {
         const response = await distributedService.setConsistencyMode(mode);
         return response?.data?.mode || response?.mode || mode;
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

const initialState = {
   // Node management
   nodes: [],
   leader: null,

   // Consistency
   consistencyMode: 'strong',

   // Load balancing
   loadBalancingAlgorithm: 'round_robin',
   loadBalancerStats: {},

   // Event logs
   eventLogs: [],
   eventLogsFilter: {},

   // Clock synchronization
   clockState: {},

   // Replication
   replicationStatus: {},

   // Analytics
   analyticsData: null,

   // Loading states
   loading: false,
   nodesLoading: false,
   leaderLoading: false,
   eventsLoading: false,

   // Errors
   error: null,
   nodesError: null,
   leaderError: null,
   eventsError: null
};

const distributedSlice = createSlice({
   name: 'distributed',
   initialState,
   reducers: {
      // Consistency
      setConsistencyMode: (state, action) => {
         state.consistencyMode = action.payload;
      },

      // Load balancing
      setLoadBalancingAlgorithm: (state, action) => {
         state.loadBalancingAlgorithm = action.payload;
      },

      // Event logs
      addEventLog: (state, action) => {
         state.eventLogs.unshift(action.payload);
         // Keep only last 100 events
         if (state.eventLogs.length > 100) {
            state.eventLogs = state.eventLogs.slice(0, 100);
         }
      },

      clearEventLogs: (state) => {
         state.eventLogs = [];
      },

      setEventLogsFilter: (state, action) => {
         state.eventLogsFilter = action.payload;
      },

      // Node management
      updateNodeStatus: (state, action) => {
         const { nodeId, status } = action.payload;
         const node = state.nodes.find(n => n.node_id === nodeId || n.id === nodeId);
         if (node) {
            node.status = status;
            node.lastUpdated = new Date().toISOString();
         }
      },

      updateNodeLoad: (state, action) => {
         const { nodeId, load } = action.payload;
         const node = state.nodes.find(n => n.node_id === nodeId || n.id === nodeId);
         if (node) {
            node.currentLoad = load;
         }
      },

      addNode: (state, action) => {
         state.nodes.push(action.payload);
      },

      removeNode: (state, action) => {
         const nodeId = action.payload;
         state.nodes = state.nodes.filter(n => n.node_id !== nodeId && n.id !== nodeId);
      },

      // Leader
      setLeader: (state, action) => {
         state.leader = action.payload;
      },

      // Replication
      setReplicationStatus: (state, action) => {
         state.replicationStatus = action.payload;
      },

      updateReplicationLag: (state, action) => {
         const { nodeId, lag } = action.payload;
         if (state.replicationStatus.replicas) {
            const replica = state.replicationStatus.replicas.find(r => r.nodeId === nodeId);
            if (replica) {
               replica.lag = lag;
            }
         }
      },

      // Clock
      updateClockState: (state, action) => {
         state.clockState = action.payload;
      },

      // Analytics
      setAnalyticsData: (state, action) => {
         state.analyticsData = action.payload;
      },

      // Load balancer stats
      updateLoadBalancerStats: (state, action) => {
         state.loadBalancerStats = action.payload;
      },

      // Clear errors
      clearError: (state) => {
         state.error = null;
         state.nodesError = null;
         state.leaderError = null;
         state.eventsError = null;
      }
   },

   extraReducers: (builder) => {
      builder
         // Fetch Nodes
         .addCase(fetchNodes.pending, (state) => {
            state.nodesLoading = true;
            state.nodesError = null;
         })
         .addCase(fetchNodes.fulfilled, (state, action) => {
            state.nodesLoading = false;
            state.nodes = Array.isArray(action.payload) ? action.payload : [];
         })
         .addCase(fetchNodes.rejected, (state, action) => {
            state.nodesLoading = false;
            state.nodesError = action.payload || 'Failed to fetch nodes';
            state.nodes = [];
         })

         // Fetch Leader
         .addCase(fetchLeader.pending, (state) => {
            state.leaderLoading = true;
            state.leaderError = null;
         })
         .addCase(fetchLeader.fulfilled, (state, action) => {
            state.leaderLoading = false;
            state.leader = action.payload;
         })
         .addCase(fetchLeader.rejected, (state, action) => {
            state.leaderLoading = false;
            state.leaderError = action.payload || 'Failed to fetch leader';
            state.leader = null;
         })

         // Fetch Event Logs
         .addCase(fetchEventLogs.pending, (state) => {
            state.eventsLoading = true;
            state.eventsError = null;
         })
         .addCase(fetchEventLogs.fulfilled, (state, action) => {
            state.eventsLoading = false;
            state.eventLogs = Array.isArray(action.payload) ? action.payload : [];
         })
         .addCase(fetchEventLogs.rejected, (state, action) => {
            state.eventsLoading = false;
            state.eventsError = action.payload || 'Failed to fetch event logs';
            state.eventLogs = [];
         })

         // Fetch Clock State
         .addCase(fetchClockState.fulfilled, (state, action) => {
            state.clockState = action.payload || {};
         })

         // Fetch Replication Status
         .addCase(fetchReplicationStatus.fulfilled, (state, action) => {
            state.replicationStatus = action.payload || {};
         })

         // Fetch Load Balancer Stats
         .addCase(fetchLoadBalancerStats.fulfilled, (state, action) => {
            state.loadBalancerStats = action.payload || {};
         })

         // Trigger Election
         .addCase(triggerElection.fulfilled, (state, action) => {
            state.leader = action.payload;
         })

         // Set Consistency Mode
         .addCase(setConsistencyModeAsync.fulfilled, (state, action) => {
            state.consistencyMode = action.payload;
         });
   }
});

export const {
   setConsistencyMode,
   setLoadBalancingAlgorithm,
   addEventLog,
   clearEventLogs,
   setEventLogsFilter,
   updateNodeStatus,
   updateNodeLoad,
   addNode,
   removeNode,
   setLeader,
   setReplicationStatus,
   updateReplicationLag,
   updateClockState,
   setAnalyticsData,
   updateLoadBalancerStats,
   clearError
} = distributedSlice.actions;

export default distributedSlice.reducer;