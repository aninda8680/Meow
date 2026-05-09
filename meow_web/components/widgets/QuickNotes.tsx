"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, StickyNote, Send, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Note {
    _id: string;
    content: string;
    createdAt: string;
}

export default function QuickNotes({ className }: { className?: string }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Load notes from API
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const res = await fetch("/api/notes");
                if (res.ok) {
                    const data = await res.json();
                    setNotes(data);
                }
            } catch (e) {
                console.error("Failed to fetch notes", e);
            }
        };
        loadNotes();
    }, []);

    const addNote = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newNote.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                body: JSON.stringify({
                    content: newNote.trim(),
                }),
            });

            if (res.ok) {
                const note = await res.json();
                setNotes([note, ...notes]);
                setNewNote("");
            }
        } catch (e) {
            console.error("Failed to add note", e);
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (id: string) => {
        try {
            const res = await fetch("/api/notes", {
                method: "DELETE",
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                setNotes(notes.filter(n => n._id !== id));
            }
        } catch (e) {
            console.error("Failed to delete note", e);
        }
    };

    return (
        <div
            className={`w-full max-h-[60vh] bg-foreground/4 border border-foreground/15 backdrop-blur-xl rounded-4xl p-6 flex flex-col gap-4 group/box hover:border-foreground/30 transition-all shadow-2xl shadow-black/10 ${className}`}
            style={{ fontFamily: 'var(--font-malinton)' }}
        >
            <div className="flex justify-between items-center pr-2 shrink-0">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.4em] opacity-40">Quick Notes</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/dashboard/notes")}
                        className="p-1.5 hover:bg-foreground/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
                    >
                        <Maximize2 size={12} />
                    </button>
                    <StickyNote size={12} className="opacity-40" />
                </div>
            </div>

            <form onSubmit={addNote} className="relative shrink-0">
                <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Jot something down..."
                    className="w-full bg-transparent border-b border-foreground/10 py-2 px-0 text-xs focus:outline-none focus:border-foreground/40 transition-all placeholder:opacity-30 placeholder:italic pr-8"
                />
                <button
                    type="submit"
                    disabled={!newNote.trim() || loading}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-100 opacity-40 transition-opacity disabled:opacity-10"
                >
                    <Send size={14} />
                </button>
            </form>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0" data-lenis-prevent>
                <AnimatePresence initial={false}>
                    {notes.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-10">
                            <Plus size={20} strokeWidth={1.5} />
                            <span className="text-[8px] uppercase tracking-widest font-black">No Notes Yet</span>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <motion.div
                                key={note._id}
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-foreground/5 rounded-2xl p-3 transition-all"
                            >
                                <p className="text-[11px] font-medium opacity-80 leading-relaxed whitespace-pre-wrap break-words pr-6">
                                    {note.content}
                                </p>
                                
                                <button
                                    onClick={() => deleteNote(note._id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 hover:opacity-100! transition-opacity p-1 text-red-500/80"
                                >
                                    <Trash2 size={10} />
                                </button>
                                
                                <div className="mt-2 text-[8px] opacity-20 font-bold uppercase tracking-tighter">
                                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </motion.div>
                        ))
                    )}
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
        </div>
    );
}
