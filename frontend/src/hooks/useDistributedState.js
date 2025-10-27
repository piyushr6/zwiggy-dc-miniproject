// frontend/src/hooks/useDistributedState.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
   fetchNodes,
   fetchLeader,
   fetchEventLogs,
   addEventLog,
   updateNodeStatus
} from '../store/distributedSlice';
import useWebSocket from './useWebSocket';

export const useDistributedState = () => {
   const dispatch = useDispatch();
   const distributed = useSelector(state => state.distributed);

   const handleWebSocketMessage = (data) => {
      switch (data.type) {
         case 'node_status_update':
            dispatch(updateNodeStatus(data.payload));
            break;
         case 'leader_elected':
            dispatch(fetchLeader());
            dispatch(addEventLog({
               type: 'leader_elected',
               timestamp: Date.now(),
               data: data.payload
            }));
            break;
         case 'event_log':
            dispatch(addEventLog(data.payload));
            break;
         default:
            console.log('Unknown message type:', data.type);
      }
   };

   const { connected, sendMessage } = useWebSocket(handleWebSocketMessage);

   useEffect(() => {
      dispatch(fetchNodes());
      dispatch(fetchLeader());
      dispatch(fetchEventLogs());

      const interval = setInterval(() => {
         dispatch(fetchNodes());
      }, 5000);

      return () => clearInterval(interval);
   }, [dispatch]);

   return {
      ...distributed,
      connected,
      sendMessage
   };
};

export default useDistributedState;