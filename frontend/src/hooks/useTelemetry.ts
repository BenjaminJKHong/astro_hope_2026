import { useState, useEffect } from 'react';
import type { TelemetryMessage } from '@/types/telemetry';
import ENV from '@/data/env';

export function useTelemetry() {
    const [telemetry, setTelemetry] = useState<TelemetryMessage | null>(null);
    const [history, setHistory] = useState<TelemetryMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let ws: WebSocket;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            ws = new WebSocket(ENV.wsURL + '/telemetry');

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
                console.warn('WebSocket reconnecting... (Awaiting Uvicorn on port 8000)');
                ws.close(); // Force close to trigger the auto-reconnect
            };
            
            ws.onmessage = (event) => {
                let data: TelemetryMessage;
                try {
                    const parsed: unknown = JSON.parse(event.data);
                    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
                    data = parsed as TelemetryMessage;
                } catch {
                    // Ignore malformed frames and keep the last valid telemetry visible.
                    return;
                }
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
