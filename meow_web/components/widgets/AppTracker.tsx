"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Maximize2 } from "lucide-react";

import { useSystemTracker } from "@/hooks/useSystemTracker";
import { AppModal } from "../pages/AppModal";

interface AppTrackerProps {
    className?: string;
}

export default function AppTracker({ className }: AppTrackerProps) {
    const { currentApp, liveCurrentDuration, stats, clearData, status } = useSystemTracker();
    const [totalFocusToday, setTotalFocusToday] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // FIX #6: Use stats.appTotals only — tab durations no longer counted here
    const totalAppTime = Object.values(stats?.appTotals || {})
        .reduce((acc, curr) => acc + curr.totalDuration, 0);

    // FIX #8: Add the live in-progress session if the current app is being tracked
    const totalWithLive = totalAppTime + liveCurrentDuration;

    const handleClear = () => {
        if (confirm("Are you sure you want to clear all local activity history? This cannot be undone.")) {
            clearData();
        }
    };

    useEffect(() => {
        const loadStats = () => {
            const tasksString = localStorage.getItem("meow-tasks");
            if (tasksString) {
                try {
                    const tasks = JSON.parse(tasksString);
                    const total = tasks.reduce((acc: number, task: any) => acc + (task.focusTime || 0), 0);
                    setTotalFocusToday(total);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        loadStats();
    }, []);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    // FIX #5: getStats() already sorts sessions newest-first — use .slice(0, N) not .slice(-N)
    const recentAppSessions = stats.sessions
        .filter(s => s.type === 'app')
        .slice(0, 1); // most recent 1 session

    return (
        <>
            <div
                className={`w-full bg-foreground/4 border border-foreground/15 backdrop-blur-xl rounded-4xl p-6 flex flex-col gap-4 group transition-all shadow-2xl shadow-black/10 hover:border-foreground/30 ${className}`}
                style={{ fontFamily: 'var(--font-malinton)' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-widest font-semibold opacity-30">App Sync</span>
                        <span className={`text-[8px] uppercase font-bold ${status === 'connected' ? 'text-green-500/60' : 'text-red-500/60'}`}>
                            {status === 'connected' ? '● System Connected' : '○ System Offline'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-1 px-1.5 rounded-lg hover:bg-foreground/5 opacity-0 group-hover:opacity-100 transition-all text-foreground/40 hover:text-foreground"
                            title="Maximize"
                        >
                            <Maximize2 size={12} />
                        </button>
                        <button
                            onClick={handleClear}
                            className="p-1 px-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            title="Clear All History"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>

                {/* FIX #8: Current App — live in-progress session */}
                {currentApp && (
                    <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/10">
                        <div className="text-[9px] uppercase tracking-widest font-bold opacity-30 mb-1">Focusing on</div>
                        <div className="text-xs font-bold truncate">{currentApp.app}</div>
                        <div className="text-[10px] opacity-40 truncate">{currentApp.title}</div>
                        {/* Live timer for current unfinished session */}
                        <div className="text-[9px] font-bold text-green-500/50 mt-1.5 tabular-nums">
                            ● {formatTime(liveCurrentDuration)} live
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-30">Total Screen Time</span>
                    <div className="flex items-baseline gap-1">
                        {/* FIX #8: Shows committed + live in-progress time */}
                        <span className="text-2xl font-black tabular-nums">{formatTime(totalWithLive)}</span>
                    </div>
                </div>

                <div className="h-px w-full bg-foreground/5" />

                {/* Recent Apps */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <History size={14} className="opacity-50" />
                        <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-40">
                            Recent Apps
                        </h2>
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* FIX #5: slice(0, 1) — correct, sessions are already newest-first */}
                        {recentAppSessions.map((session, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-foreground/5"
                            >
                                <div className="flex justify-between text-[10px] opacity-50 mb-1">
                                    <span className="truncate max-w-30">{session.app}</span>
                                    <span>{formatTime(session.duration)}</span>
                                </div>
                                <div className="text-[11px] font-bold truncate">
                                    {session.title}
                                </div>
                            </div>
                        ))}
                        {recentAppSessions.length === 0 && (
                            <div className="text-[10px] opacity-20 text-center py-4">No data tracked yet</div>
                        )}
                    </div>
                </div>
            </div>

            <AppModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
