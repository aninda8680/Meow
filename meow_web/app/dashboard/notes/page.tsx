"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, StickyNote, Send, ChevronLeft, Search, Grid, List as ListIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Note {
    _id: string;
    content: string;
    createdAt: string;
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

    const filteredNotes = notes.filter(note => 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-20 px-6 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all active:scale-90"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Quick Notes</h1>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.4em] mt-1">Capture Thoughts</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="bg-foreground/5 border border-foreground/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-foreground/30 transition-all w-64"
                        />
                    </div>
                    <div className="bg-foreground/5 p-1 rounded-xl flex gap-1 border border-foreground/10">
                        <button 
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-foreground text-background" : "opacity-40 hover:opacity-100"}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-foreground text-background" : "opacity-40 hover:opacity-100"}`}
                        >
                            <ListIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left side: Note Creator */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 px-1">New Entry</h3>
                    <div className="bg-foreground/[0.02] border border-foreground/[0.05] p-8 rounded-[40px] flex flex-col gap-4 focus-within:border-foreground/20 transition-all">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-transparent resize-none h-48 outline-none text-lg font-medium placeholder:opacity-20 leading-relaxed"
                        />
                        <div className="flex justify-end pt-4 border-t border-foreground/5">
                            <button
                                onClick={() => addNote()}
                                disabled={!newNote.trim() || loading}
                                className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <Send size={14} />
                                {loading ? "Saving..." : "Save Note"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side: Notes List/Grid */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 px-1">Archive</h3>
                    
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
                        <AnimatePresence mode="popLayout">
                            {filteredNotes.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-10"
                                >
                                    <StickyNote size={48} strokeWidth={1} />
                                    <span className="text-xs uppercase tracking-[0.4em] font-black">No entries found</span>
                                </motion.div>
                            ) : (
                                filteredNotes.map((note) => (
                                    <motion.div
                                        key={note._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`group relative bg-foreground/[0.02] border border-foreground/[0.05] hover:bg-foreground/[0.04] hover:border-foreground/10 p-6 rounded-[32px] transition-all flex flex-col justify-between gap-4 ${viewMode === "list" ? "flex-row items-center" : ""}`}
                                    >
                                        <div className="flex flex-col gap-2 flex-1 pr-8">
                                            <p className="text-sm font-medium opacity-80 leading-relaxed whitespace-pre-wrap">
                                                {note.content}
                                            </p>
                                            <div className="text-[8px] opacity-20 font-bold uppercase tracking-widest">
                                                {new Date(note.createdAt).toLocaleDateString(undefined, { 
                                                    weekday: 'long',
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteNote(note._id)}
                                            className="absolute top-6 right-6 p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <section className="mt-20 pt-10 border-t border-foreground/5 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Meow Archive v1.0</span>
                <span className="text-[8px] font-bold opacity-10 uppercase tracking-[0.2em]">Synchronized with Cloud Core</span>
            </section>
        </div>
    );
}
