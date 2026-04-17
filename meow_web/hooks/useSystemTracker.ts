"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActivityData {
    app?: string;
    domain?: string;
    title: string;
    timestamp: string;
    duration: number;
    id?: number;
    type: 'app' | 'tab';
}

export interface ActivityStats {
    sessions: ActivityData[];
    totals: Record<string, { totalDuration: number; visits: number }>;
}

let globalSocket: WebSocket | null = null;
let globalStatus: 'connecting' | 'connected' | 'error' = 'connecting';
let globalCurrentApp: { app: string; title: string } | null = null;
let globalStats: ActivityStats = { sessions: [], totals: {} };
const listeners = new Set<() => void>();

let reconnectTimeout: NodeJS.Timeout | null = null;
let isConnecting = false;

function notifyListeners() {
    listeners.forEach(listener => listener());
}

function initGlobalSocket() {
    if (globalSocket || isConnecting) return;
    isConnecting = true;

    console.log("🔄 Attempting to connect to Meow Tracker...");
    globalSocket = new WebSocket('ws://localhost:5263');

    globalSocket.onopen = () => {
        isConnecting = false;
        globalStatus = 'connected';
        console.log("✅ Connected to Meow System Tracker");
        notifyListeners();
    };

    globalSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'init' || data.type === 'stats') {
                globalStats = {
                    sessions: data.data?.sessions || [],
                    totals: data.data?.totals || {}
                };
            } else if (data.type === 'update') {
                globalCurrentApp = { app: data.app, title: data.title };
            }
            notifyListeners();
        } catch (e) {
            console.error("❌ Failed to parse tracker message:", e);
        }
    };

    globalSocket.onerror = (error) => {
        console.warn("⚠️ Tracker connection error. Is the backend running?");
        globalStatus = 'error';
        notifyListeners();
    };

    globalSocket.onclose = () => {
        isConnecting = false;
        globalStatus = 'connecting';
        globalSocket = null;
        console.log("🔌 Tracker disconnected. Retrying in 5s...");
        notifyListeners();
        
        if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
                reconnectTimeout = null;
                initGlobalSocket();
            }, 5000);
        }
    };
}

export function useSystemTracker() {
    const [, forceRender] = useState({});

    useEffect(() => {
        const listener = () => forceRender({});
        listeners.add(listener);
        
        if (!globalSocket && !isConnecting) {
            initGlobalSocket();
        }

        return () => {
            listeners.delete(listener);
        };
    }, []);

    const logTabActivity = useCallback((domain: string, title: string, duration: number, id?: number) => {
        if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
            globalSocket.send(JSON.stringify({
                type: 'TAB_LOG',
                domain,
                title,
                duration,
                id
            }));
        }
    }, []);

    const clearData = useCallback(() => {
        if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
            globalSocket.send(JSON.stringify({ type: 'CLEAR_DATA' }));
        }
    }, []);

    return { 
        status: globalStatus, 
        currentApp: globalCurrentApp, 
        stats: globalStats, 
        logTabActivity, 
        clearData 
    };
}
