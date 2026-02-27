"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [selectedAvatar, setSelectedAvatar] = React.useState("users-1.svg");
    const [widgets, setWidgets] = React.useState({
        tasks: true,
        activity: true,
        rain: true,
        tabHistory: true,
    });

    // Load from localStorage
    React.useEffect(() => {
        setMounted(true);
        const storedName = localStorage.getItem("meow-username");
        const storedAvatar = localStorage.getItem("meow-avatar");
        const storedWidgets = localStorage.getItem("meow-widgets");

        if (storedName) setUsername(storedName);
        if (storedAvatar) setSelectedAvatar(storedAvatar);
        if (storedWidgets) {
            try {
                const parsed = JSON.parse(storedWidgets);
                setWidgets(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse widgets", e);
            }
        }
    }, []);

    // Save to localStorage
    const handleUsernameChange = (name: string) => {
        setUsername(name);
        localStorage.setItem("meow-username", name);
        // Dispatch custom event to notify other components (like page.tsx)
        window.dispatchEvent(new Event('user-settings-changed'));
    };

    const handleAvatarSelect = (avatar: string) => {
        setSelectedAvatar(avatar);
        localStorage.setItem("meow-avatar", avatar);
        window.dispatchEvent(new Event('user-settings-changed'));
    };

    const toggleWidget = (key: keyof typeof widgets) => {
        const newWidgets = { ...widgets, [key]: !widgets[key] };
        setWidgets(newWidgets);
        localStorage.setItem("meow-widgets", JSON.stringify(newWidgets));
        window.dispatchEvent(new Event('user-settings-changed'));
    };

    if (!mounted) return null;

    const avatars = Array.from({ length: 16 }, (_, i) => `users-${i + 1}.svg`);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg max-h-[90vh] flex flex-col bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-[32px] shadow-2xl z-[101]"
                    >
                        <div className="flex justify-between items-center p-8 pb-4">
                            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-10 no-scrollbar">
                            {/* Profile Section */}
                            <section>
                                <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-6 px-1">Profile</h3>
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold opacity-60 px-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => handleUsernameChange(e.target.value)}
                                            placeholder="Your name..."
                                            className="w-full bg-transparent border-b border-foreground/10 focus:border-foreground/40 px-1 py-3 outline-none transition-all placeholder:opacity-20 text-lg font-medium"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <label className="text-xs font-bold opacity-60 px-1">Choose Avatar</label>
                                        <div className="grid grid-cols-4 xs:grid-cols-8 gap-3">
                                            {avatars.map((avatar) => (
                                                <button
                                                    key={avatar}
                                                    onClick={() => handleAvatarSelect(avatar)}
                                                    className={`relative aspect-square rounded-xl overflow-hidden transition-all hover:scale-110 active:scale-95 ${selectedAvatar === avatar
                                                        ? 'ring-2 ring-foreground shadow-xl scale-110 z-10'
                                                        : 'opacity-40 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img
                                                        src={`/Avatars Icons/users-insights-svg-icons/${avatar}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Theme Setting */}
                            <section>
                                <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-6 px-1">Appearance</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'light', icon: Sun, label: 'Light' },
                                        { id: 'dark', icon: Moon, label: 'Dark' },
                                        { id: 'system', icon: Monitor, label: 'System' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setTheme(item.id)}
                                            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${theme === item.id
                                                ? 'bg-foreground text-background border-foreground shadow-lg'
                                                : 'bg-foreground/5 border-transparent hover:bg-foreground/10'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Widgets Toggle */}
                            <section>
                                <h3 className="text-[10px] uppercase tracking-[0.25em] font-extrabold opacity-40 mb-6 px-1">Widgets</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'activity', label: 'Activity Tracker' },
                                        { id: 'tasks', label: 'Task List' },
                                        { id: 'tabHistory', label: 'Tab Switch History' },
                                        { id: 'rain', label: 'Rainy Theme' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleWidget(item.id as keyof typeof widgets)}
                                            className="w-full flex justify-between items-center p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/[0.08] transition-all group"
                                        >
                                            <span className="text-sm font-semibold opacity-70 group-hover:opacity-100">{item.label}</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${widgets[item.id as keyof typeof widgets] ? 'bg-foreground' : 'bg-foreground/10'}`}>
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-background transition-all duration-300 ${widgets[item.id as keyof typeof widgets] ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Info Section */}
                            <section className="pt-6 pb-2 border-t border-foreground/5">
                                <div className="flex flex-col gap-2 opacity-30 text-[9px] uppercase font-bold tracking-[0.3em] text-center">
                                    <span>Meow Focus Companion v1.1.0</span>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
