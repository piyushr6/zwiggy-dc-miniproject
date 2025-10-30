// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '../utils/constants';

export const useWebSocket = (onMessage) => {
   const ws = useRef(null);
   const [connected, setConnected] = useState(false);
   const [error, setError] = useState(null);

   const connect = useCallback(() => {
      try {
         ws.current = new WebSocket(WS_URL);

         ws.current.onopen = () => {
            console.log("✅ WebSocket connected");
            setConnected(true);
            setError(null);
         };

         ws.current.onmessage = (event) => {
            try {
               const data = JSON.parse(event.data);
               onMessage(data);
            } catch (err) {
               console.error("❌ Failed to parse WebSocket message:", err);
            }
         };

         ws.current.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
            setError("WebSocket connection error");
         };

         ws.current.onclose = () => {
            console.log("⚠️ WebSocket disconnected, retrying in 3s...");
            setConnected(false);

            setTimeout(() => {
               connect();
            }, 3000);
         };
      } catch (err) {
         console.error("❌ Failed to create WebSocket:", err);
         setError("Failed to create WebSocket");
      }
   }, [onMessage]);

   useEffect(() => {
      connect();

      return () => {
         if (ws.current) {
            console.log("🔌 Cleaning up WebSocket");
            ws.current.onclose = null; // avoid triggering reconnection on cleanup
            ws.current.close();
         }
      };
   }, []); // ✅ EMPTY dependency → runs only once

   const sendMessage = (message) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
         ws.current.send(JSON.stringify(message));
      } else {
         console.error("❌ WebSocket is not connected");
      }
   };

   return { connected, error, sendMessage };
};

export default useWebSocket;
