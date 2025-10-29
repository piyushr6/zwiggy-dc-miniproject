// frontend/src/store/distributedSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import distributedService from '../services/distributedService';

// Async thunks
export const fetchNodes = createAsyncThunk(
   'distributed/fetchNodes',
   async (_, { rejectWithValue }) => {
      try {
         return await distributedService.getNodes();
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchLeader = createAsyncThunk(
   'distributed/fetchLeader',
   async (_, { rejectWithValue }) => {
      try {
         return await distributedService.getLeader();
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchEventLogs = createAsyncThunk(
   'distributed/fetchEventLogs',
   async (filters, { rejectWithValue }) => {
      try {
         return await distributedService.getEventLogs(filters);
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchClockState = createAsyncThunk(
   'distributed/fetchClockState',
   async (_, { rejectWithValue }) => {
      try {
         return await distributedService.getClockState();
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchReplicationStatus = createAsyncThunk(
   'distributed/fetchReplicationStatus',
   async (_, { rejectWithValue }) => {
      try {
         return await distributedService.getReplicationStatus();
      } catch (error) {
         return rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchLoadBalancerStats = createAsyncThunk(
   'distributed/fetchLoadBalancerStats',
   async (_, { rejectWithValue }) => {
      try {
         return await distributedService.getLoadBalancerStats();
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
   loadBalancerStats: null,

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
         const node = state.nodes.find(n => n.id === nodeId);
         if (node) {
            node.status = status;
            node.lastUpdated = new Date().toISOString();
         }
      },

      updateNodeLoad: (state, action) => {
         const { nodeId, load } = action.payload;
         const node = state.nodes.find(n => n.id === nodeId);
         if (node) {
            node.currentLoad = load;
         }
      },

      addNode: (state, action) => {
         state.nodes.push(action.payload);
      },

      removeNode: (state, action) => {
         const nodeId = action.payload;
         state.nodes = state.nodes.filter(n => n.id !== nodeId);
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
            state.nodes = action.payload;
         })
         .addCase(fetchNodes.rejected, (state, action) => {
            state.nodesLoading = false;
            state.nodesError = action.payload || 'Failed to fetch nodes';
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
         })

         // Fetch Event Logs
         .addCase(fetchEventLogs.pending, (state) => {
            state.eventsLoading = true;
            state.eventsError = null;
         })
         .addCase(fetchEventLogs.fulfilled, (state, action) => {
            state.eventsLoading = false;
            state.eventLogs = action.payload;
         })
         .addCase(fetchEventLogs.rejected, (state, action) => {
            state.eventsLoading = false;
            state.eventsError = action.payload || 'Failed to fetch event logs';
         })

         // Fetch Clock State
         .addCase(fetchClockState.fulfilled, (state, action) => {
            state.clockState = action.payload;
         })

         // Fetch Replication Status
         .addCase(fetchReplicationStatus.fulfilled, (state, action) => {
            state.replicationStatus = action.payload;
         })

         // Fetch Load Balancer Stats
         .addCase(fetchLoadBalancerStats.fulfilled, (state, action) => {
            state.loadBalancerStats = action.payload;
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