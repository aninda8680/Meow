"use client";

import { motion } from "framer-motion";
import { Download, Globe, Monitor, HelpCircle, Code2, Terminal, AlertCircle } from "lucide-react";

const steps = [
    {
        id: "01",
        icon: <Download className="w-6 h-6" />,
        title: "TAB TELEMETRY",
        subtitle: "BROWSER EXTENSION",
        description: "Install the core bypass extension. This enables real-time browser telemetry and event hooks required for active tab mapping.",
        link: "Download Extension",
        href: "/downloads/meow-extension.zip",
        download: "meow-extension.zip",
        tag: ""
    },
    {
        id: "02",
        icon: <Terminal className="w-6 h-6" />,
        title: "APP TRACKER (CLI)",
        subtitle: "COMMAND LINE INTERFACE",
        description: "Run the zero-clone app tracker via Node.js. No installation required—just execute the mission-critical command.",
        link: "npx meow-tracker",
        href: "#",
        tag: ""
    },
    {
        id: "03",
        icon: <Monitor className="w-6 h-6" />,
        title: "SYSTEM TRAP APP",
        subtitle: "NATIVE DESKTOP SHELL",
        description: "A dedicated Electron-powered binary for system-wide focus containment and native OS hooks with system tray integration.",
        link: "Download App",
        href: "/downloads/Meow 1.0.0.exe",
        download: "Meow 1.0.0.exe",
        tag: ""
    },
    {
        id: "04",
        icon: <Globe className="w-6 h-6" />,
        title: "MISSION CONTROL",
        subtitle: "WEB CONSOLE",
        description: "Initialize the web-based dashboard. This is your primary interface for focus visualization and deep session management.",
        link: "Open Dashboard",
        href: "/main",
        tag: ""
    }
];

export default function LandingHowTo() {
    return (
        <section className="py-32 px-6 bg-foreground/[0.01] border-y border-foreground/[0.03] relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Massive Centered Heading */}
                <div className="flex flex-col items-center mb-40 select-none">
                    <h2 className="opacity-[0.15] text-[16vw] font-black pointer-events-none uppercase leading-none tracking-tighter whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/20" style={{ fontFamily: "var(--font-malinton)" }}>
                        Deploy
                    </h2>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="mt-8 flex items-center gap-3 px-4 py-2 bg-foreground/[0.03] border border-foreground/[0.05] rounded-full"
                    >
                        <Code2 size={14} className="text-foreground/40" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">
                            Prerequisite: <a href="https://nodejs.org" target="_blank" rel="noopener" className="underline hover:opacity-100 transition-opacity">Node.js Engine</a> (v18+)
                        </span>
                    </motion.div>
                </div>

                <div className="max-w-4xl mx-auto flex flex-col gap-12 mb-32">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative flex flex-col md:flex-row gap-8 p-10 bg-background border border-foreground/[0.05] rounded-[32px] hover:border-foreground/20 transition-all shadow-sm"
                        >
                            <div className="flex-shrink-0 flex items-center md:flex-col gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-foreground/[0.03] flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
                                    {step.icon}
                                </div>
                                <span className="text-xl font-bold opacity-10">{step.id}</span>
                            </div>

                            <div className="flex-grow text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-malinton)" }}>{step.title}</h3>
                                    {step.tag && (
                                        <span className="px-2 py-0.5 bg-foreground/5 text-[9px] font-bold rounded-md opacity-50 uppercase tracking-widest">{step.tag}</span>
                                    )}
                                </div>
                                <div className="text-[10px] font-bold tracking-widest opacity-30 mb-4">{step.subtitle}</div>
                                <p className="opacity-50 leading-relaxed mb-6 group-hover:opacity-70 transition-opacity max-w-2xl mx-auto md:mx-0">
                                    {step.description}
                                </p>
                                {step.link && (
                                    <a
                                        href={step.href || "#"}
                                        download={step.download}
                                        className="text-xs font-bold underline underline-offset-8 decoration-foreground/20 hover:decoration-foreground transition-all cursor-pointer"
                                    >
                                        {step.link}
                                    </a>
                                )}
                            </div>

                            {/* Coming Soon Overlay for Staging */}
                            {step.tag === "STAGING" && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px] z-20 pointer-events-none">
                                    <span className="text-2xl font-bold tracking-tighter uppercase text-black" style={{ fontFamily: 'var(--font-pixel)' }}>
                                        Soon !
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Support Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[48px] bg-foreground p-12 md:p-20 overflow-hidden"
                >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(var(--background) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-background">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-background/10 rounded-full mb-8">
                                <AlertCircle size={14} className="text-blue-400" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Idea Incubator</span>
                            </div>
                            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-none" style={{ fontFamily: "var(--font-malinton)" }}>
                                HAVE A <br /> <span className="opacity-40">VISION?</span>
                            </h3>
                            <p className="text-lg opacity-70">
                                Meow is built by the obsessed, for the obsessed. If you have a feature suggestion, a unique workflow, or just an idea to make focus even sharper—we're all ears.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button className="px-10 py-5 bg-background text-foreground rounded-2xl font-bold text-lg hover:scale-[1.05] transition-transform" style={{ fontFamily: "var(--font-malinton)" }}>
                                Suggest Feature
                            </button>
                            <button className="px-10 py-5 bg-background/10 border border-background/20 rounded-2xl font-bold text-lg hover:bg-background/20 transition-all" style={{ fontFamily: "var(--font-malinton)" }}>
                                Join the Lab
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
