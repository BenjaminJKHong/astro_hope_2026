import { useState, useEffect } from 'react';

export function useTelemetry() {
    const [telemetry, setTelemetry] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let ws: WebSocket;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            // Changed from localhost to 127.0.0.1 to fix Windows IPv6 resolution blocking
            ws = new WebSocket('ws://127.0.0.1:8000/ws/telemetry');

            ws.onopen = () => {
                setIsConnected(true);
                console.log('Connected to AstroPulse Engine');
            };
            
            ws.onclose = () => {
                setIsConnected(false);
                // Auto-reconnect every 3 seconds if the backend drops
                reconnectTimer = setTimeout(connect, 3000);
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket Error. Is Uvicorn running on port 8000?', error);
                ws.close(); // Force close to trigger the auto-reconnect
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setTelemetry(data);
                
                setHistory(prev => {
                    const newHistory = [...prev, data];
                    if (newHistory.length > 30) newHistory.shift();
                    return newHistory;
                });
            };
        };

        connect();

        return () => {
            clearTimeout(reconnectTimer);
            if (ws) ws.close();
        };
    }, []);

    return { telemetry, history, isConnected };
}