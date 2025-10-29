import { COLORS, EVENT_TYPES, ORDER_STATUS } from './constants';

// ===== DATE & TIME UTILITIES =====

export const formatTimestamp = (timestamp) => {
   if (!timestamp) return 'N/A';
   const date = new Date(timestamp);
   return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
   });
};

export const formatDate = (timestamp) => {
   if (!timestamp) return 'N/A';
   const date = new Date(timestamp);
   return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
   });
};

export const formatDateTime = (timestamp) => {
   if (!timestamp) return 'N/A';
   const date = new Date(timestamp);
   return `${formatDate(timestamp)} ${formatTimestamp(timestamp)}`;
};

export const getRelativeTime = (timestamp) => {
   if (!timestamp) return 'N/A';
   const now = Date.now();
   const diff = now - new Date(timestamp).getTime();

   const seconds = Math.floor(diff / 1000);
   const minutes = Math.floor(seconds / 60);
   const hours = Math.floor(minutes / 60);
   const days = Math.floor(hours / 24);

   if (seconds < 60) return `${seconds}s ago`;
   if (minutes < 60) return `${minutes}m ago`;
   if (hours < 24) return `${hours}h ago`;
   return `${days}d ago`;
};

export const formatDuration = (milliseconds) => {
   const seconds = Math.floor(milliseconds / 1000);
   const minutes = Math.floor(seconds / 60);
   const hours = Math.floor(minutes / 60);

   if (hours > 0) return `${hours}h ${minutes % 60}m`;
   if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
   return `${seconds}s`;
};

// ===== CLOCK UTILITIES =====

export const formatLamportClock = (clock) => {
   return `LC:${clock || 0}`;
};

export const formatVectorClock = (vectorClock) => {
   if (!vectorClock || typeof vectorClock !== 'object') return 'VC:[]';
   const entries = Object.entries(vectorClock)
      .map(([node, clock]) => `${node}:${clock}`)
      .join(',');
   return `VC:[${entries}]`;
};

// ===== CURRENCY UTILITIES =====

export const formatCurrency = (amount) => {
   if (typeof amount !== 'number') return '₹0.00';
   return `₹${amount.toFixed(2)}`;
};

export const parseCurrency = (str) => {
   if (typeof str === 'number') return str;
   const cleaned = str.replace(/[₹,]/g, '');
   return parseFloat(cleaned) || 0;
};

// ===== NODE & DISTRIBUTED SYSTEM UTILITIES =====

export const getNodeColor = (nodeId) => {
   const colors = [
      COLORS.PRIMARY,    // blue
      COLORS.SUCCESS,    // green
      COLORS.WARNING,    // yellow
      COLORS.DANGER,     // red
      COLORS.PURPLE      // purple
   ];
   return colors[nodeId % colors.length];
};

export const calculateQuorum = (totalNodes) => {
   return Math.floor(totalNodes / 2) + 1;
};

export const getNodeStatusColor = (status) => {
   const colorMap = {
      active: 'bg-green-100 text-green-800 border-green-300',
      leader: 'bg-purple-100 text-purple-800 border-purple-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      recovering: 'bg-yellow-100 text-yellow-800 border-yellow-300'
   };
   return colorMap[status] || colorMap.inactive;
};

export const getNodeIcon = (status) => {
   const iconMap = {
      active: '✓',
      leader: '👑',
      inactive: '○',
      failed: '✗',
      recovering: '↻'
   };
   return iconMap[status] || '○';
};

// ===== EVENT & LOG UTILITIES =====

export const getEventColor = (eventType) => {
   const colorMap = {
      [EVENT_TYPES.ORDER_CREATED]: 'bg-green-100 text-green-800',
      [EVENT_TYPES.ORDER_UPDATED]: 'bg-blue-100 text-blue-800',
      [EVENT_TYPES.ORDER_CANCELLED]: 'bg-red-100 text-red-800',
      [EVENT_TYPES.NODE_JOINED]: 'bg-purple-100 text-purple-800',
      [EVENT_TYPES.NODE_FAILED]: 'bg-red-100 text-red-800',
      [EVENT_TYPES.NODE_RECOVERED]: 'bg-green-100 text-green-800',
      [EVENT_TYPES.LEADER_ELECTED]: 'bg-yellow-100 text-yellow-800',
      [EVENT_TYPES.ELECTION_STARTED]: 'bg-orange-100 text-orange-800',
      [EVENT_TYPES.LOCK_ACQUIRED]: 'bg-indigo-100 text-indigo-800',
      [EVENT_TYPES.LOCK_RELEASED]: 'bg-gray-100 text-gray-800',
      [EVENT_TYPES.REPLICATION_SYNC]: 'bg-pink-100 text-pink-800',
      [EVENT_TYPES.CLOCK_SYNC]: 'bg-cyan-100 text-cyan-800'
   };
   return colorMap[eventType] || 'bg-gray-100 text-gray-800';
};

export const getEventIcon = (eventType) => {
   const iconMap = {
      [EVENT_TYPES.ORDER_CREATED]: '🛒',
      [EVENT_TYPES.ORDER_UPDATED]: '📝',
      [EVENT_TYPES.ORDER_CANCELLED]: '❌',
      [EVENT_TYPES.NODE_JOINED]: '➕',
      [EVENT_TYPES.NODE_FAILED]: '⚠️',
      [EVENT_TYPES.NODE_RECOVERED]: '✅',
      [EVENT_TYPES.LEADER_ELECTED]: '👑',
      [EVENT_TYPES.ELECTION_STARTED]: '🗳️',
      [EVENT_TYPES.LOCK_ACQUIRED]: '🔒',
      [EVENT_TYPES.LOCK_RELEASED]: '🔓',
      [EVENT_TYPES.REPLICATION_SYNC]: '🔄',
      [EVENT_TYPES.CLOCK_SYNC]: '🕐'
   };
   return iconMap[eventType] || '📋';
};

// ===== ORDER UTILITIES =====

export const getOrderStatusColor = (status) => {
   const colorMap = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [ORDER_STATUS.PREPARING]: 'bg-purple-100 text-purple-800',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-800',
      [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
   };
   return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getOrderStatusIcon = (status) => {
   const iconMap = {
      [ORDER_STATUS.PENDING]: '⏳',
      [ORDER_STATUS.CONFIRMED]: '✓',
      [ORDER_STATUS.PREPARING]: '👨‍🍳',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: '🚗',
      [ORDER_STATUS.DELIVERED]: '✅',
      [ORDER_STATUS.CANCELLED]: '❌'
   };
   return iconMap[status] || '📦';
};

export const generateOrderId = () => {
   const timestamp = Date.now();
   const random = Math.random().toString(36).substr(2, 9).toUpperCase();
   return `ORD-${timestamp}-${random}`;
};

export const calculateOrderTotal = (items) => {
   if (!Array.isArray(items)) return 0;
   return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// ===== STRING UTILITIES =====

export const truncateText = (text, maxLength = 50) => {
   if (!text) return '';
   if (text.length <= maxLength) return text;
   return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (str) => {
   if (!str) return '';
   return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toTitleCase = (str) => {
   if (!str) return '';
   return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
   });
};

export const slugify = (text) => {
   return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
};

// ===== ARRAY UTILITIES =====

export const groupBy = (array, key) => {
   return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
         result[group] = [];
      }
      result[group].push(item);
      return result;
   }, {});
};

export const sortBy = (array, key, order = 'asc') => {
   return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (order === 'asc') {
         return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
         return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
   });
};

export const unique = (array) => {
   return [...new Set(array)];
};

export const chunk = (array, size) => {
   const chunks = [];
   for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
   }
   return chunks;
};

// ===== VALIDATION UTILITIES =====

export const isValidEmail = (email) => {
   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return regex.test(email);
};

export const isValidPhone = (phone) => {
   const regex = /^[\d\s\-\+\(\)]{10,}$/;
   return regex.test(phone);
};

export const isValidUrl = (url) => {
   try {
      new URL(url);
      return true;
   } catch {
      return false;
   }
};

// ===== ASYNC UTILITIES =====

export const delay = (ms) => {
   return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = (func, wait) => {
   let timeout;
   return function executedFunction(...args) {
      const later = () => {
         clearTimeout(timeout);
         func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
   };
};

export const throttle = (func, limit) => {
   let inThrottle;
   return function (...args) {
      if (!inThrottle) {
         func.apply(this, args);
         inThrottle = true;
         setTimeout(() => inThrottle = false, limit);
      }
   };
};

// ===== STORAGE UTILITIES =====

export const saveToLocalStorage = (key, value) => {
   try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
   } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
   }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
   try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized);
   } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
   }
};

export const removeFromLocalStorage = (key) => {
   try {
      localStorage.removeItem(key);
      return true;
   } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
   }
};

export const clearLocalStorage = () => {
   try {
      localStorage.clear();
      return true;
   } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
   }
};

// ===== DISTRIBUTED SYSTEM SPECIFIC =====

export const calculateReplicationLag = (primaryTimestamp, replicaTimestamp) => {
   if (!primaryTimestamp || !replicaTimestamp) return 0;
   return Math.abs(new Date(primaryTimestamp) - new Date(replicaTimestamp));
};

export const isQuorumReached = (responses, totalNodes) => {
   const quorum = calculateQuorum(totalNodes);
   return responses >= quorum;
};

export const generateNodeId = () => {
   return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateLoadPercentage = (currentLoad, maxLoad = 100) => {
   return Math.min((currentLoad / maxLoad) * 100, 100);
};

// ===== EXPORT ALL =====

export default {
   formatTimestamp,
   formatDate,
   formatDateTime,
   getRelativeTime,
   formatDuration,
   formatLamportClock,
   formatVectorClock,
   formatCurrency,
   parseCurrency,
   getNodeColor,
   calculateQuorum,
   getNodeStatusColor,
   getNodeIcon,
   getEventColor,
   getEventIcon,
   getOrderStatusColor,
   getOrderStatusIcon,
   generateOrderId,
   calculateOrderTotal,
   truncateText,
   capitalizeFirst,
   toTitleCase,
   slugify,
   groupBy,
   sortBy,
   unique,
   chunk,
   isValidEmail,
   isValidPhone,
   isValidUrl,
   delay,
   debounce,
   throttle,
   saveToLocalStorage,
   loadFromLocalStorage,
   removeFromLocalStorage,
   clearLocalStorage,
   calculateReplicationLag,
   isQuorumReached,
   generateNodeId,
   calculateLoadPercentage
};