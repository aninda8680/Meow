"use client";

import { motion } from "framer-motion";
import { Terminal, Github, Twitter, Mail } from "lucide-react";

export default function LandingFooter() {
    return (
        <footer className="py-20 px-6 bg-background relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="md:col-span-2 flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-foreground flex items-center justify-center rounded-xl">
                                <Terminal className="text-background" size={24} />
                            </div>
                            <div>
                                <span
                                    className="text-4xl font-bold tracking-tighter block"
                                    style={{ fontFamily: "var(--font-malinton)" }}
                                >
                                    MEOW
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30" style={{ fontFamily: "var(--font-pixel)" }}>Focus_Assistant</span>
                            </div>
                        </div>
                        <p className="text-sm opacity-50 max-w-sm leading-relaxed">
                            The next generation of browse-centric productivity.
                            Designed for developers, researchers, and digital nomads who demand deep concentration.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "var(--font-pixel)" }}>Subsystems</span>
                        <div className="flex flex-col gap-3 text-sm font-bold opacity-60">
                            <a href="#" className="hover:opacity-100 transition-opacity">Extension UI</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Analysis Engine</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Workflows</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Desktop (WIP)</a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "var(--font-pixel)" }}>Network</span>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                                    <Github size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                                    <Twitter size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                                    <Mail size={18} />
                                </a>
                            </div>
                            <div className="text-[11px] font-medium opacity-30" style={{ fontFamily: "var(--font-pixel)" }}>
                                HOST: MEOW_WEB_SERVER <br />
                                LOC: EN/INTL
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-foreground/[0.05] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-8 text-[11px] font-medium uppercase tracking-widest opacity-30" style={{ fontFamily: "var(--font-pixel)" }}>
                        <a href="#" className="hover:opacity-100 transition-opacity">Privacy_Policy</a>
                        <a href="#" className="hover:opacity-100 transition-opacity">Terms_of_Service</a>
                        <a href="#" className="hover:opacity-100 transition-opacity">Open_Source</a>
                    </div>

                    <div className="text-[11px] opacity-40 text-center md:text-right font-medium" style={{ fontFamily: "var(--font-pixel)" }}>
                        © {new Date().getFullYear()} MEOW_OPERATIONS. ALL RIGHTS RESERVED. <br />
                        BUILD SHA: FW_8829_0X
                    </div>
                </div>
            </div>
        </footer>
    );
}
