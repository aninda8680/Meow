"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActivityData {
    app?: string;
    domain?: string;
    title: string;
    timestamp: string;
    duration: number;
    id?: number;
    type: 'app' | 'tab';
}

// FIX #3: appTotals and tabTotals are now separate — no more mixed namespace
export interface ActivityStats {
    sessions: ActivityData[];
    appTotals: Record<string, { totalDuration: number; visits: number }>;
    tabTotals: Record<string, { totalDuration: number; visits: number }>;
}

// ── Module-level shared state (singleton across all hook instances) ────────────

let globalSocket: WebSocket | null = null;
let globalStatus: 'connecting' | 'connected' | 'error' = 'connecting';
let globalCurrentApp: { app: string; title: string; startTime: number } | null = null;
let globalStats: ActivityStats = { sessions: [], appTotals: {}, tabTotals: {} };

// FIX #2: Module-level persistent set — survives component unmount/remount/page navigation
// This is the single source of truth for "already synced to backend" tab session IDs
export const globalSyncedTabIds = new Set<number>();

const listeners = new Set<() => void>();
let reconnectTimeout: NodeJS.Timeout | null = null;
let isConnecting = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function notifyListeners() {
    listeners.forEach(listener => listener());
}

// ── WebSocket singleton ───────────────────────────────────────────────────────

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
                // FIX #3: Backend now sends appTotals / tabTotals separately
                globalStats = {
                    sessions: data.data?.sessions || [],
                    appTotals: data.data?.appTotals || {},
                    tabTotals: data.data?.tabTotals || {},
                };
            } else if (data.type === 'update') {
                // FIX #8: Track the session start time for live current-app duration
                const isSameApp = globalCurrentApp?.app === data.app;
                globalCurrentApp = {
                    app: data.app,
                    title: data.title,
                    startTime: isSameApp ? (globalCurrentApp?.startTime ?? Date.now()) : Date.now(),
                };
            }

            notifyListeners();
        } catch (e) {
            console.error("❌ Failed to parse tracker message:", e);
        }
    };

    globalSocket.onerror = () => {
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

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSystemTracker() {
    const [, forceRender] = useState({});

    // FIX #8: Live timer for current app's in-progress session duration
    const [liveCurrentDuration, setLiveCurrentDuration] = useState(0);
    const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // FIX #8: Tick a live counter for the current app's unfinished session
    useEffect(() => {
        if (liveTimerRef.current) clearInterval(liveTimerRef.current);

        if (globalCurrentApp) {
            liveTimerRef.current = setInterval(() => {
                setLiveCurrentDuration(
                    Math.floor((Date.now() - globalCurrentApp!.startTime) / 1000)
                );
            }, 1000);
        } else {
            setLiveCurrentDuration(0);
        }

        return () => {
            if (liveTimerRef.current) clearInterval(liveTimerRef.current);
        };
    }, [globalCurrentApp?.app]); // restart timer when app changes

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
            // Also clear the synced IDs set so sessions can be re-synced after a clear
            globalSyncedTabIds.clear();
        }
    }, []);

    return {
        status: globalStatus,
        currentApp: globalCurrentApp,
        liveCurrentDuration, // FIX #8: seconds spent in current app since last focus change
        stats: globalStats,
        logTabActivity,
        clearData,
    };
}
