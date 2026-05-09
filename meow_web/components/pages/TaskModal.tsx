"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, CheckCircle2, Circle, Clock, Target, Search, BarChart3, ListTodo } from "lucide-react";
import { Task } from "../widgets/TaskSection";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    onUpdateTasks: (tasks: Task[]) => void;
}

export function TaskModal({ isOpen, onClose, tasks, onUpdateTasks }: TaskModalProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleComplete = (id: string) => {
        onUpdateTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const deleteTask = (id: string) => {
        onUpdateTasks(tasks.filter(t => t.id !== id));
    };

    const formatFocusTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;

        if (hrs > 0) {
            return `${hrs}h ${remainingMins}m`;
        }
        return `${mins}m`;
    };

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        totalTime: tasks.reduce((acc, t) => acc + t.focusTime, 0)
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
                                <Target className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-damaris)' }}>Focus Center</h2>
                                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.4em] mt-1">Deep Work Dashboard</p>
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
                                { label: "Total Objectives", value: stats.total, icon: ListTodo, color: "text-blue-500" },
                                { label: "Tasks Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500" },
                                { label: "Cumulative Focus", value: formatFocusTime(stats.totalTime), icon: BarChart3, color: "text-amber-500" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1 }}
                                    className="p-8 rounded-[40px] bg-foreground/3 border border-foreground/5 flex flex-col gap-4 relative overflow-hidden group hover:bg-foreground/5 transition-all"
                                >
                                    <stat.icon className={`w-12 h-12 opacity-10 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-125 transition-transform`} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</span>
                                    <p className="text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-damaris)' }}>{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Interaction Area */}
                        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-10">
                            {/* Search & List */}
                            <div className="flex-1 flex flex-col gap-6 min-h-0">
                                <div className="flex items-center justify-between px-2 shrink-0">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Active Objectives</h3>
                                    <div className="relative w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                                        <input
                                            type="text"
                                            placeholder="Find mission..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-foreground/3 border border-transparent focus:border-foreground/10 py-3 pl-12 pr-4 rounded-2xl text-xs outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar" data-lenis-prevent>
                                    <AnimatePresence mode="popLayout">
                                        {filteredTasks.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="h-full flex flex-col items-center justify-center opacity-10 gap-4"
                                            >
                                                <Target size={80} strokeWidth={1} />
                                                <p className="text-sm font-black uppercase tracking-[0.5em]">Clear Mind</p>
                                            </motion.div>
                                        ) : (
                                            filteredTasks.map((task, idx) => (
                                                <motion.div
                                                    key={task.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group relative flex items-center gap-6 p-6 rounded-4xl bg-foreground/3 border border-transparent hover:border-foreground/10 hover:bg-foreground/5 transition-all"
                                                >
                                                    <button
                                                        onClick={() => toggleComplete(task.id)}
                                                        className="shrink-0 transition-transform active:scale-90"
                                                    >
                                                        {task.completed ? (
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full border-2 border-foreground/10 flex items-center justify-center group-hover:border-foreground/30 transition-colors">
                                                                <Circle className="w-6 h-6 opacity-0 group-hover:opacity-40 transition-opacity" />
                                                            </div>
                                                        )}
                                                    </button>

                                                    <div className="flex-1 min-w-0 pr-10">
                                                        <h4 className={`text-xl font-bold truncate transition-all ${task.completed ? "opacity-20 line-through" : "opacity-80"}`}>
                                                            {task.title}
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-2 opacity-30">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{formatFocusTime(task.focusTime)}</span>
                                                            </div>
                                                            {task.completed && (
                                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">Successful</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        className="absolute top-4 right-4 p-3 opacity-0 group-hover:opacity-20 hover:opacity-100! hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Subtle Elements */}
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
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
