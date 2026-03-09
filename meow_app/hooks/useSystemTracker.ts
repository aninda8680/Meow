"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActivityData {
    app?: string;
    domain?: string;
    title: string;
    timestamp: string;
    duration: number;
    type: 'app' | 'tab';
}

export interface ActivityStats {
    sessions: ActivityData[];
    totals: Record<string, { totalDuration: number; visits: number }>;
}

export function useSystemTracker() {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [currentApp, setCurrentApp] = useState<{ app: string; title: string } | null>(null);
    const [stats, setStats] = useState<ActivityStats>({ sessions: [], totals: {} });
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        let socket: WebSocket;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            console.log("🔄 Attempting to connect to Meow Tracker...");
            socket = new WebSocket('ws://127.0.0.1:5263');

            socket.onopen = () => {
                setStatus('connected');
                console.log("✅ Connected to Meow System Tracker");
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'init' || data.type === 'stats') {
                        setStats(data.data);
                    } else if (data.type === 'update') {
                        setCurrentApp({ app: data.app, title: data.title });
                    }
                } catch (e) {
                    console.error("Parse error", e);
                }
            };

            socket.onerror = () => {
                setStatus('error');
            };

            socket.onclose = () => {
                setStatus('connecting');
                reconnectTimeout = setTimeout(connect, 5000);
            };

            setWs(socket);
        };

        connect();

        return () => {
            if (socket) socket.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, []);

    const logTabActivity = useCallback((domain: string, title: string, duration: number) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'TAB_LOG',
                domain,
                title,
                duration
            }));
        }
    }, [ws]);

    return { status, currentApp, stats, logTabActivity };
}
