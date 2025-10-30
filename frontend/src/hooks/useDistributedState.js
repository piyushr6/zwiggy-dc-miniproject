// frontend/src/hooks/useDistributedState.js
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNodes, fetchLeader, fetchEventLogs } from '../store/distributedSlice';

const useDistributedState = () => {
   const dispatch = useDispatch();

   const {
      nodes,
      leader,
      eventLogs,
      nodesLoading,
      leaderLoading,
      eventsLoading
   } = useSelector(state => state.distributed);

   const connected = true; // WebSocket connection status

   useEffect(() => {
      // Fetch initial data
      dispatch(fetchNodes());
      dispatch(fetchLeader());
      dispatch(fetchEventLogs());

      // Poll for updates every 5 seconds
      const interval = setInterval(() => {
         dispatch(fetchNodes());
         dispatch(fetchLeader());
         dispatch(fetchEventLogs({ limit: 50 }));
      }, 5000);

      return () => clearInterval(interval);
   }, [dispatch]);

   return {
      nodes: Array.isArray(nodes) ? nodes : [],
      leader,
      eventLogs: Array.isArray(eventLogs) ? eventLogs : [],
      connected,
      loading: nodesLoading || leaderLoading || eventsLoading
   };
};

export default useDistributedState;