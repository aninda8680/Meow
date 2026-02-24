"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, History } from "lucide-react";

export default function ActivityTracker() {
    const [totalFocusToday, setTotalFocusToday] = useState(0);

    useEffect(() => {
        const loadStats = () => {
            const tasksString = localStorage.getItem("meow-tasks");
            if (tasksString) {
                try {
                    const tasks = JSON.parse(tasksString);
                    // This is a simplification; a real app might track by date
                    const total = tasks.reduce((acc: number, task: any) => acc + (task.focusTime || 0), 0);
                    setTotalFocusToday(total);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        loadStats();
        window.addEventListener("meow-tasks-updated", loadStats);
        window.addEventListener("meow-focus-update", loadStats);
        return () => {
            window.removeEventListener("meow-tasks-updated", loadStats);
            window.removeEventListener("meow-focus-update", loadStats);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-24 left-8 w-64 bg-foreground/[0.04] border border-foreground/[0.15] backdrop-blur-xl rounded-[2rem] p-6 flex flex-col gap-4 z-50 group transition-all shadow-2xl shadow-black/10 hover:border-foreground/30"
        >
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-foreground/5">
                    <Activity size={14} className="opacity-50" />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Activity</h2>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-30">Today's Focus</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black tabular-nums">{formatTime(totalFocusToday)}</span>
                </div>
            </div>

            <div className="h-[1px] w-full bg-foreground/5" />

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-30">Intensity</span>
                    <span className="text-[10px] font-black text-foreground/60">High</span>
                </div>
                <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        className="h-full bg-foreground/40 rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
}
