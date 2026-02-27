"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Clock, History, AlertCircle } from "lucide-react";

interface AwaySession {
    id: string;
    startTime: number;
    endTime: number;
    duration: number; // in seconds
    timestamp: number;
}

export default function TabActivityTracker() {
    const [awaySessions, setAwaySessions] = useState<AwaySession[]>([]);
    const [isAway, setIsAway] = useState(false);
    const [awayStartTime, setAwayStartTime] = useState<number | null>(null);
    const [lastAwayDuration, setLastAwayDuration] = useState<number | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    // Live Tab Details States
    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
    const [liveDuration, setLiveDuration] = useState(0);
    const [tabTitle, setTabTitle] = useState("");

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("meow-away-sessions");
        if (saved) {
            try {
                setAwaySessions(JSON.parse(saved).slice(0, 5)); // Keep last 5
            } catch (e) {
                console.error("Failed to load away sessions", e);
            }
        }
    }, []);

    useEffect(() => {
        setTabTitle(document.title || "Meow Focus");
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                setLiveDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionStartTime]);

    // Save history to localStorage
    const saveSession = useCallback((session: AwaySession) => {
        setAwaySessions(prev => {
            const updated = [session, ...prev].slice(0, 5);
            localStorage.setItem("meow-away-sessions", JSON.stringify(updated));
            return updated;
        });
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                setAwayStartTime(Date.now());
                setIsAway(true);
            } else {
                setSessionStartTime(Date.now());
                if (awayStartTime) {
                    const endTime = Date.now();
                    const durationInSeconds = Math.floor((endTime - awayStartTime) / 1000);

                    if (durationInSeconds >= 5) { // Only track if away for more than 5 seconds
                        const newSession: AwaySession = {
                            id: Math.random().toString(36).substr(2, 9),
                            startTime: awayStartTime,
                            endTime: endTime,
                            duration: durationInSeconds,
                            timestamp: endTime
                        };
                        saveSession(newSession);
                        setLastAwayDuration(durationInSeconds);
                        setShowPopup(true);

                        // Auto hide popup after 5 seconds
                        setTimeout(() => setShowPopup(false), 5000);
                    }
                }
                setIsAway(false);
                setAwayStartTime(null);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [awayStartTime, saveSession]);

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Away Popup Alert */}
            <AnimatePresence>
                {showPopup && lastAwayDuration && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 right-8 z-[60] bg-foreground text-background px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl"
                    >
                        <div className="p-2 bg-background/20 rounded-full">
                            <ExternalLink size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Tab Switch Detected</span>
                            <span className="text-sm font-bold">You were away for {formatDuration(lastAwayDuration)}</span>
                        </div>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="ml-2 opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <AlertCircle size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live & History Widget */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed bottom-24 right-8 w-64 bg-foreground/[0.04] border border-foreground/[0.15] backdrop-blur-xl rounded-[2rem] p-6 flex flex-col gap-6 z-50 group transition-all shadow-2xl shadow-black/10 hover:border-foreground/30"
            >
                {/* Live Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-foreground/10 animate-pulse">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-1.5 h-1.5 rounded-full bg-green-500"
                            />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Live Status</h2>
                    </div>

                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-foreground/5 border border-foreground/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-30">Current Tab</span>
                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Active</span>
                        </div>
                        <span className="text-xs font-bold truncate opacity-80 mb-2">
                            {tabTitle}
                        </span>
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="opacity-30" />
                            <span className="text-xl font-black tabular-nums tracking-tight">
                                {formatDuration(liveDuration)}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-20">Started at</span>
                            <span className="text-[9px] font-black opacity-40">{formatTimestamp(sessionStartTime)}</span>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-foreground/5" />

                {/* History Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-foreground/5">
                                <History size={14} className="opacity-50" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Away History</h2>
                        </div>
                        {awaySessions.length > 0 && (
                            <button
                                onClick={() => {
                                    setAwaySessions([]);
                                    localStorage.removeItem("meow-away-sessions");
                                }}
                                className="text-[8px] font-bold uppercase tracking-widest opacity-20 hover:opacity-60 transition-opacity"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {awaySessions.length === 0 ? (
                            <div className="py-4 flex flex-col items-center gap-2 opacity-20">
                                <Clock size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">No away time yet</span>
                            </div>
                        ) : (
                            awaySessions.map((session) => (
                                <div key={session.id} className="flex flex-col gap-1 p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/[0.08] transition-colors group/item">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black opacity-30 group-hover/item:opacity-50 transition-opacity">
                                            {formatTimestamp(session.timestamp)}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-40">
                                            <ExternalLink size={8} />
                                            <span className="text-[8px] font-bold uppercase">Away</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold">{formatDuration(session.duration)} spent in other tabs</span>
                                </div>
                            ))
                        )}
                    </div>

                    <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 2px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(var(--foreground-rgb), 0.1);
                        border-radius: 10px;
                    }
                `}</style>

                    {awaySessions.length > 0 && (
                        <div className="pt-2 border-t border-foreground/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-30">Total Away Today</span>
                                <span className="text-[10px] font-black opacity-60">
                                    {formatDuration(awaySessions.reduce((acc, s) => acc + s.duration, 0))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
