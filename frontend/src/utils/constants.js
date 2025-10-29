// frontend/src/utils/constants.js

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
export const NODE_COUNT = parseInt(import.meta.env.VITE_NODE_COUNT) || 3;

// Node Status
export const NODE_STATUS = {
   ACTIVE: 'active',
   INACTIVE: 'inactive',
   LEADER: 'leader',
   FAILED: 'failed',
   RECOVERING: 'recovering'
};

// Consistency Modes
export const CONSISTENCY_MODES = {
   STRONG: 'strong',
   EVENTUAL: 'eventual',
   QUORUM: 'quorum'
};

// Order Status
export const ORDER_STATUS = {
   PENDING: 'pending',
   CONFIRMED: 'confirmed',
   PREPARING: 'preparing',
   OUT_FOR_DELIVERY: 'out_for_delivery',
   DELIVERED: 'delivered',
   CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
   [ORDER_STATUS.PENDING]: 'Pending',
   [ORDER_STATUS.CONFIRMED]: 'Confirmed',
   [ORDER_STATUS.PREPARING]: 'Preparing',
   [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
   [ORDER_STATUS.DELIVERED]: 'Delivered',
   [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

// Load Balancing Algorithms
export const LOAD_BALANCING_ALGORITHMS = {
   ROUND_ROBIN: 'round_robin',
   LEAST_CONNECTIONS: 'least_connections',
   RANDOM: 'random',
   WEIGHTED: 'weighted'
};

// Event Types
export const EVENT_TYPES = {
   ORDER_CREATED: 'order_created',
   ORDER_UPDATED: 'order_updated',
   ORDER_CANCELLED: 'order_cancelled',
   NODE_JOINED: 'node_joined',
   NODE_FAILED: 'node_failed',
   NODE_RECOVERED: 'node_recovered',
   LEADER_ELECTED: 'leader_elected',
   ELECTION_STARTED: 'election_started',
   LOCK_ACQUIRED: 'lock_acquired',
   LOCK_RELEASED: 'lock_released',
   REPLICATION_SYNC: 'replication_sync',
   REPLICATION_LAG: 'replication_lag',
   CLOCK_SYNC: 'clock_sync',
   PARTITION_DETECTED: 'partition_detected',
   PARTITION_HEALED: 'partition_healed'
};

// Cuisine Types
export const CUISINE_TYPES = [
   'Indian',
   'Chinese',
   'Italian',
   'Mexican',
   'Japanese',
   'Thai',
   'American',
   'Mediterranean',
   'Korean',
   'Vietnamese'
];

// Time Ranges for Analytics
export const TIME_RANGES = {
   LAST_HOUR: '1h',
   LAST_24_HOURS: '24h',
   LAST_7_DAYS: '7d',
   LAST_30_DAYS: '30d',
   LAST_90_DAYS: '90d'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Timeouts
export const REQUEST_TIMEOUT = 10000; // 10 seconds
export const WEBSOCKET_RECONNECT_DELAY = 3000; // 3 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
   AUTH_TOKEN: 'authToken',
   USER_ID: 'userId',
   CART: 'cart',
   THEME: 'theme'
};

// Error Messages
export const ERROR_MESSAGES = {
   NETWORK_ERROR: 'Network error. Please check your connection.',
   SERVER_ERROR: 'Server error. Please try again later.',
   UNAUTHORIZED: 'You are not authorized. Please login.',
   NOT_FOUND: 'Resource not found.',
   VALIDATION_ERROR: 'Please check your input.',
   UNKNOWN_ERROR: 'An unknown error occurred.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
   ORDER_CREATED: 'Order placed successfully!',
   ORDER_CANCELLED: 'Order cancelled successfully!',
   CART_UPDATED: 'Cart updated!',
   SETTINGS_SAVED: 'Settings saved successfully!'
};

// Distributed System Defaults
export const DISTRIBUTED_DEFAULTS = {
   REPLICATION_FACTOR: 2,
   QUORUM_SIZE: 2,
   HEARTBEAT_INTERVAL: 5000, // 5 seconds
   ELECTION_TIMEOUT: 10000, // 10 seconds
   MAX_CLOCK_DRIFT: 1000 // 1 second
};

// MapReduce Job Types
export const MAPREDUCE_JOBS = {
   POPULAR_ITEMS: 'popular_items',
   REVENUE_ANALYSIS: 'revenue_analysis',
   CUSTOMER_ANALYSIS: 'customer_analysis',
   DELIVERY_TIME_ANALYSIS: 'delivery_time_analysis'
};

// WebSocket Events
export const WS_EVENTS = {
   CONNECT: 'connect',
   DISCONNECT: 'disconnect',
   ERROR: 'error',
   NODE_UPDATE: 'node_update',
   ORDER_UPDATE: 'order_update',
   LEADER_UPDATE: 'leader_update',
   EVENT_LOG: 'event_log',
   CLOCK_UPDATE: 'clock_update'
};

// Restaurant Filters
export const SORT_OPTIONS = {
   RATING: 'rating',
   DELIVERY_TIME: 'deliveryTime',
   MIN_ORDER: 'minOrder',
   POPULARITY: 'popularity'
};

// Color Schemes
export const COLORS = {
   PRIMARY: '#3b82f6',
   SUCCESS: '#10b981',
   WARNING: '#f59e0b',
   DANGER: '#ef4444',
   INFO: '#0ea5e9',
   PURPLE: '#8b5cf6'
};

// Export all constants as default
export default {
   API_BASE_URL,
   WS_URL,
   NODE_COUNT,
   NODE_STATUS,
   CONSISTENCY_MODES,
   ORDER_STATUS,
   ORDER_STATUS_LABELS,
   LOAD_BALANCING_ALGORITHMS,
   EVENT_TYPES,
   CUISINE_TYPES,
   TIME_RANGES,
   DEFAULT_PAGE_SIZE,
   MAX_PAGE_SIZE,
   REQUEST_TIMEOUT,
   WEBSOCKET_RECONNECT_DELAY,
   STORAGE_KEYS,
   ERROR_MESSAGES,
   SUCCESS_MESSAGES,
   DISTRIBUTED_DEFAULTS,
   MAPREDUCE_JOBS,
   WS_EVENTS,
   SORT_OPTIONS,
   COLORS
};