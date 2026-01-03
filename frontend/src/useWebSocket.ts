import { useState, useEffect, useRef } from "react";

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);

  useEffect(() => {
    const connect = () => {
      const newWs = new WebSocket(url);
      setWs(newWs);

      newWs.addEventListener("open", () => {
        reconnectAttemptRef.current = 0;
        console.log("WebSocket connected");
      });

      newWs.addEventListener("close", () => {
        console.log("WebSocket closed, reconnecting...");

        if (reconnectTimeoutRef.current) {
          return;
        }

        const maxReconnectDelay = 30000;
        const baseDelay = 1000;
        const delay = Math.min(
          baseDelay * Math.pow(2, reconnectAttemptRef.current),
          maxReconnectDelay,
        );

        reconnectAttemptRef.current++;
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, delay);
      });
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws?.close();
    };
  }, [url]);

  return ws;
}
