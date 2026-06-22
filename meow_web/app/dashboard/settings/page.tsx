"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Moon, Monitor, Pencil, ChevronLeft, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { useSystemTracker } from "@/hooks/useSystemTracker";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { clearData } = useSystemTracker();
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [selectedAvatar, setSelectedAvatar] = React.useState("users-1.svg");
    const [widgets, setWidgets] = React.useState({
        tasks: true,
        appTracker: true,
        tabHistory: true,
        quickNotes: true,
        focusReport: true,
    });

    // Load from API
    React.useEffect(() => {
        setMounted(true);
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.name) setUsername(data.name);
                    if (data.avatar) setSelectedAvatar(data.avatar);
                    if (data.widgets) {
                        const w = { ...data.widgets };
                        if ('activity' in w && !('appTracker' in w)) {
                            w.appTracker = w.activity;
                            w.focusReport = w.activity;
                            delete w.activity;
                        }
                        setWidgets(prev => ({ ...prev, ...w }));
                    }
                }
            } catch (e) {
                console.error("Failed to load settings from API", e);
            }
        };
        loadSettings();
    }, []);

    // Save to API
    const saveToApi = async (updates: any) => {
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            window.dispatchEvent(new Event('user-settings-changed'));
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    };

    const handleUsernameBlur = () => {
        saveToApi({ name: username });
    };

    const handleAvatarSelect = (avatar: string) => {
        setSelectedAvatar(avatar);
        saveToApi({ avatar });
    };

    const toggleWidget = (key: keyof typeof widgets) => {
        const newWidgets = { ...widgets, [key]: !widgets[key] };
        setWidgets(newWidgets);
        saveToApi({ widgets: newWidgets });
    };

    if (!mounted) return null;

    const avatars = Array.from({ length: 16 }, (_, i) => `users-${i + 1}.svg`);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-20 px-6 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all active:scale-90"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Settings</h1>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.4em] mt-1">Control Center</p>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                {/* Profile Section */}
                <section>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-8 px-1">Profile Configuration</h3>
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-8 bg-foreground/[0.02] border border-foreground/[0.05] p-8 rounded-[40px]">
                            <div className="relative group shrink-0 self-center">
                                <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-foreground/10 shadow-lg bg-foreground/5 group-hover:border-foreground/30 transition-all ring-0 group-hover:ring-4 ring-foreground/5">
                                    <img
                                        src={`/Avatars Icons/users-insights-svg-icons/${selectedAvatar}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover p-1"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                                    className="absolute -bottom-2 -right-2 p-3 bg-foreground text-background rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-10"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 flex-1">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Identity Tag</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={handleUsernameBlur}
                                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                    placeholder="Enter pilot name..."
                                    className="w-full bg-transparent border-b-2 border-foreground/10 focus:border-foreground py-4 outline-none transition-all placeholder:opacity-20 text-3xl font-black tracking-tight"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {isEditingAvatar && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col gap-6"
                                >
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">Selection Matrix</h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 p-8 bg-foreground/5 rounded-[40px] border border-foreground/10 shadow-inner">
                                        {avatars.map((avatar) => (
                                            <button
                                                key={avatar}
                                                onClick={() => {
                                                    handleAvatarSelect(avatar);
                                                    setIsEditingAvatar(false);
                                                }}
                                                className={`relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-110 active:scale-95 ${selectedAvatar === avatar
                                                    ? 'ring-4 ring-foreground shadow-2xl scale-110 z-10 bg-background/80'
                                                    : 'opacity-40 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={`/Avatars Icons/users-insights-svg-icons/${avatar}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover p-1"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Theme Setting */}
                <section>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-8 px-1">Aesthetic Protocol</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: 'light', icon: Sun, label: 'Standard' },
                            { id: 'dark', icon: Moon, label: 'Dark Matter' },
                            { id: 'system', icon: Monitor, label: 'Automated' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setTheme(item.id)}
                                className={`flex items-center justify-between gap-4 p-8 rounded-[32px] border-2 transition-all group ${theme === item.id
                                    ? 'bg-foreground text-background border-foreground shadow-2xl scale-[1.02]'
                                    : 'bg-foreground/[0.02] border-foreground/[0.05] hover:bg-foreground/[0.05] hover:border-foreground/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-6 h-6 ${theme === item.id ? '' : 'opacity-40 group-hover:opacity-100'}`} />
                                    <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                {theme === item.id && <div className="w-2 h-2 rounded-full bg-background animate-pulse" />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Widgets Toggle */}
                <section>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-8 px-1">Subsystem Matrix</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { id: 'appTracker', label: 'App Intelligence', desc: 'Monitor active system applications' },
                            { id: 'tasks', label: 'Mission Log', desc: 'Enable focus task management' },
                            { id: 'tabHistory', label: 'Domain Tracking', desc: 'Sync browser activity in real-time' },
                            { id: 'quickNotes', label: 'Quick Notes', desc: 'Minimal jot-it-down scratchpad' },
                            { id: 'focusReport', label: 'Focus Report', desc: 'Productivity score & breakdown strip' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => toggleWidget(item.id as keyof typeof widgets)}
                                className="w-full flex justify-between items-center p-8 rounded-[32px] bg-foreground/[0.02] border border-foreground/[0.05] hover:bg-foreground/[0.05] hover:border-foreground/10 transition-all group group"
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-sm font-black uppercase tracking-wider opacity-60 group-hover:opacity-100">{item.label}</span>
                                    <span className="text-[10px] font-bold opacity-20 uppercase tracking-widest">{item.desc}</span>
                                </div>
                                <div className={`w-14 h-7 rounded-full relative transition-all duration-500 border ${widgets[item.id as keyof typeof widgets] ? 'bg-foreground border-foreground' : 'bg-transparent border-foreground/20'}`}>
                                    <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all duration-500 ${widgets[item.id as keyof typeof widgets] ? 'left-8 bg-background shadow-lg' : 'left-1 bg-foreground/20'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Data Management */}
                <section>
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-8 px-1 text-red-500/80">Security & Erasure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[40px] bg-red-500/[0.02] border border-red-500/10 flex flex-col justify-between space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-lg font-black tracking-tight text-red-500/80">Purge Activity History</h4>
                                <p className="text-[11px] opacity-40 leading-relaxed font-bold uppercase tracking-tighter">Permanently wipe all recorded application and domain telemetry from the local system.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm("Delete all activity history? This cannot be undone.")) {
                                        clearData();
                                    }
                                }}
                                className="w-full py-5 rounded-3xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm hover:shadow-red-500/20"
                            >
                                Execute Purge
                            </button>
                        </div>

                        <div className="p-8 rounded-[40px] bg-foreground/[0.02] border border-foreground/5 flex flex-col justify-between space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-lg font-black tracking-tight opacity-70">Hard Reset Preferences</h4>
                                <p className="text-[11px] opacity-40 leading-relaxed font-bold uppercase tracking-tighter">Revert username, avatar selections, and subsystem configurations to factory defaults.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm("Reset all app preferences? Your activity history will be kept.")) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="w-full py-5 rounded-3xl bg-foreground/5 hover:bg-foreground text-foreground hover:text-background text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                            >
                                System Reset
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer Info */}
                <section className="pt-20 border-t border-foreground/5 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Meow Focus Engine v1.1.0</span>
                    <span className="text-[8px] font-bold opacity-10 uppercase tracking-[0.2em]">Developed by Advanced Agentic Systems</span>
                </section>
            </div>
        </div>
    );
}
