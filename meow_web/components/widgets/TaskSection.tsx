"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Target } from "lucide-react";

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    focusTime: number; // in seconds
}

interface TaskSectionProps {
    activeTaskId: string | null;
    onSetActiveTask: (id: string | null) => void;
}

export default function TaskSection({ activeTaskId, onSetActiveTask }: TaskSectionProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Load tasks from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("meow-tasks");
        if (saved) {
            try {
                setTasks(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse tasks", e);
            }
        }
    }, []);

    // Save tasks to localStorage
    useEffect(() => {
        localStorage.setItem("meow-tasks", JSON.stringify(tasks));
        // Dispatch custom event so other components can know if needed
        window.dispatchEvent(new CustomEvent("meow-tasks-updated", { detail: tasks }));
    }, [tasks]);

    // Listen for focus time updates from the timer logic (global event for simplicity)
    useEffect(() => {
        const handleFocusUpdate = (e: any) => {
            const { taskId, duration } = e.detail;
            if (!taskId) return;

            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, focusTime: t.focusTime + duration } : t
            ));
        };

        window.addEventListener("meow-focus-update", handleFocusUpdate);
        return () => window.removeEventListener("meow-focus-update", handleFocusUpdate);
    }, []);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            title: newTaskTitle.trim(),
            completed: false,
            focusTime: 0,
        };

        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
        if (activeTaskId === id) onSetActiveTask(null);
    };

    const toggleComplete = (id: string) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const formatFocusTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;
        const hrs = (mins / 60).toFixed(1);
        return `${hrs}h`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-24 right-8 w-72 h-fit max-h-[60vh] bg-foreground/[0.04] border border-foreground/[0.15] backdrop-blur-xl rounded-[2rem] p-6 flex flex-col gap-6 z-50 group/box hover:border-foreground/30 transition-all shadow-2xl shadow-black/10"
        >
            <div className="flex flex-col gap-0.5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Objective</h2>
            </div>

            <form onSubmit={addTask} className="relative">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Focus on..."
                    className="w-full bg-transparent border-b border-foreground/[0.1] py-2 px-0 text-xs focus:outline-none focus:border-foreground/40 transition-all placeholder:opacity-30 placeholder:italic"
                />
                <button
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-100 opacity-40 transition-opacity"
                >
                    <Plus size={14} />
                </button>
            </form>

            <div className="flex flex-col gap-1 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {tasks.length === 0 ? (
                        <div className="py-4 flex flex-col items-center justify-center gap-2 opacity-10">
                            <Target size={20} strokeWidth={1.5} />
                            <span className="text-[8px] uppercase tracking-widest font-black">Mindful Focus</span>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-all ${activeTaskId === task.id
                                    ? "bg-foreground/[0.08] shadow-sm"
                                    : "hover:bg-foreground/[0.04]"
                                    }`}
                            >
                                <button
                                    onClick={() => toggleComplete(task.id)}
                                    className="flex-shrink-0 transition-all"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 size={14} className="opacity-50" />
                                    ) : (
                                        <Circle size={14} className="opacity-20 group-hover:opacity-50" />
                                    )}
                                </button>

                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => onSetActiveTask(task.id === activeTaskId ? null : task.id)}
                                >
                                    <p className={`text-[11px] truncate font-semibold transition-all ${task.completed ? "line-through opacity-20" : "opacity-80 group-hover:opacity-100"}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[7px] uppercase tracking-wider opacity-40 font-bold">
                                            {formatFocusTime(task.focusTime)}
                                        </span>
                                        {activeTaskId === task.id && !task.completed && (
                                            <span className="flex items-center gap-0.5 text-[7px] uppercase font-black text-foreground/60 animate-pulse">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-20 hover:!opacity-60 transition-opacity p-1"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </motion.div>
                        )
                        ))}
                </AnimatePresence>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--foreground-rgb), 0.05);
          border-radius: 10px;
        }
      `}</style>
        </motion.div>
    );
}
