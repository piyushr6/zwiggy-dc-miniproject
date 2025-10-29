// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../utils/constants';

export const useWebSocket = (onMessage) => {
   const ws = useRef(null);
   const [connected, setConnected] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
      const connect = () => {
         try {
            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
               console.log('WebSocket connected');
               setConnected(true);
               setError(null);
            };

            ws.current.onmessage = (event) => {
               try {
                  const data = JSON.parse(event.data);
                  onMessage(data);
               } catch (err) {
                  console.error('Failed to parse WebSocket message:', err);
               }
            };

            ws.current.onerror = (err) => {
               console.error('WebSocket error:', err);
               setError('WebSocket connection error');
            };

            ws.current.onclose = () => {
               console.log('WebSocket disconnected');
               setConnected(false);

               // Attempt reconnection after 3 seconds
               setTimeout(() => {
                  connect();
               }, 3000);
            };
         } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setError('Failed to create WebSocket connection');
         }
      };

      connect();

      return () => {
         if (ws.current) {
            ws.current.close();
         }
      };
   }, [onMessage]);

   const sendMessage = (message) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
         ws.current.send(JSON.stringify(message));
      } else {
         console.error('WebSocket is not connected');
      }
   };

   return { connected, error, sendMessage };
};

export default useWebSocket;