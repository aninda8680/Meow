"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, BarChart3, Search, Activity, Box, ExternalLink } from "lucide-react";
import { useSystemTracker } from "@/hooks/useSystemTracker";

interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AppModal({ isOpen, onClose }: AppModalProps) {
    const { stats } = useSystemTracker();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    const appTotals = Object.entries(stats?.totals || {})
        .filter(([key]) => {
            // Filter for apps (heuristic: doesn't look like domain and not a website session)
            const isDomain = key.includes('.') && key.split('.').pop()!.length >= 2;
            return !isDomain;
        })
        .filter(([app]) => app.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => b[1].totalDuration - a[1].totalDuration);

    const recentApps = stats.sessions
        .filter(s => s.type === 'app')
        .filter(s => s.app?.toLowerCase().includes(searchQuery.toLowerCase()) || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .reverse();

    const aggregateStats = {
        totalApps: appTotals.length,
        totalTime: appTotals.reduce((acc, curr) => acc + curr[1].totalDuration, 0),
        mostUsed: appTotals[0]?.[0] || "None"
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 w-screen h-screen bg-background z-1000 flex flex-col overflow-hidden"
                    style={{ fontFamily: 'var(--font-malinton)' }}
                >
                    {/* Header Overlay */}
                    <div className="flex justify-between items-center px-10 py-8 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-foreground/5 rounded-2xl">
                                <Box className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter uppercase">Application Engine</h2>
                                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.4em] mt-1">System Resource Audit</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-4 hover:bg-foreground/5 rounded-full transition-all hover:rotate-90 duration-300"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-10 pb-10 gap-10 overflow-hidden mt-6">
                        {/* Top Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                            {[
                                { label: "Logged Applications", value: aggregateStats.totalApps, icon: Box, color: "text-purple-500" },
                                { label: "Workstation Time", value: formatDuration(aggregateStats.totalTime), icon: Clock, color: "text-blue-500" },
                                { label: "Primary Workflow", value: aggregateStats.mostUsed, icon: BarChart3, color: "text-amber-500" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1 }}
                                    className="p-8 rounded-[40px] bg-foreground/3 border border-foreground/5 flex flex-col gap-4 relative overflow-hidden group hover:bg-foreground/5 transition-all"
                                >
                                    <stat.icon className={`w-12 h-12 opacity-5 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-125 transition-transform`} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</span>
                                    <p className="text-3xl font-black tracking-tighter truncate">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Interaction Area */}
                        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-10">
                            {/* App List */}
                            <div className="flex-1 flex flex-col gap-6 min-h-0">
                                <div className="flex items-center justify-between px-2 shrink-0">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">App Metrics</h3>
                                    <div className="relative w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                                        <input
                                            type="text"
                                            placeholder="Audit application..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-foreground/3 border border-transparent focus:border-foreground/10 py-3 pl-12 pr-4 rounded-2xl text-xs outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar" data-lenis-prevent>
                                    {appTotals.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                                            <Box size={80} strokeWidth={1} />
                                            <p className="text-sm font-black uppercase tracking-[0.5em]">No Applications</p>
                                        </div>
                                    ) : (
                                        appTotals.map(([app, data], idx) => (
                                            <motion.div
                                                key={app}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="group flex items-center justify-between p-6 rounded-4xl bg-foreground/3 border border-transparent hover:border-foreground/10 hover:bg-foreground/5 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-xl font-bold opacity-40">
                                                        {app[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold opacity-80">{app}</h4>
                                                        <p className="text-[10px] uppercase font-black opacity-20 tracking-widest">{data.visits} recorded focus sessions</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black tracking-tight">{formatDuration(data.totalDuration)}</p>
                                                    <div className="w-32 h-1 bg-foreground/5 rounded-full mt-2 overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: "100%" }}
                                                            className="h-full bg-purple-500 opacity-40"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Recent Timeline */}
                            <div className="w-full md:w-96 flex flex-col gap-6 min-h-0">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 px-2 shrink-0">Workflow History</h3>
                                <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar" data-lenis-prevent>
                                    {recentApps.slice(0, 20).map((session, idx) => (
                                        <div key={idx} className="relative pl-6 pb-6 border-l border-foreground/10 last:pb-0">
                                            <div className="absolute -left-1.25 top-0 w-2.5 h-2.5 rounded-full bg-foreground/20" />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-purple-500/60 uppercase tracking-widest">{session.app}</span>
                                                    <span className="text-[9px] opacity-30 font-mono">{formatDuration(session.duration)}</span>
                                                </div>
                                                <h5 className="text-xs font-bold leading-relaxed line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {session.title}
                                                </h5>
                                                <p className="text-[8px] opacity-20 font-medium">
                                                    {new Date(session.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Subtle Elements */}
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
                    </div>

                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 4px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(var(--foreground-rgb), 0.1);
                            border-radius: 10px;
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
