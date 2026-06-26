"use client";

import { motion } from "framer-motion";
import { Terminal, Github, Linkedin, ArrowUpRight } from "lucide-react";

const XIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

export default function LandingFooter() {
    return (
        <footer className="py-20 px-6 bg-background relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            {/* Decorative Cat Mascot */}
            <div className="absolute bottom-0 left-[50%] md:left-[45%] -translate-x-1/2 pointer-events-none z-0 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <img 
                    src="/image/cat.png" 
                    alt="Meow Mascot" 
                    className="w-[280px] md:w-[420px] lg:w-[450px] object-contain transition-transform duration-700 hover:scale-[1.02]" 
                />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="md:col-span-2 flex flex-col gap-8">
                        <div className="flex items-center gap-4">
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

                    <div className="flex flex-col gap-6 w-full md:ml-32">
                        <span className="text-lg md:text-xl font-bold tracking-wide opacity-70" style={{ fontFamily: "var(--font-malinton)" }}>Core Team</span>
                        <div className="flex flex-col gap-5 ml-4">
                            
                            {/* Member 1: Aninda Debta */}
                            <div className="group flex flex-col gap-2.5">
                                <a href="https://aninda.tech" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 w-fit group/name">
                                    <span className="text-sm font-bold relative">
                                        Aninda Debta
                                        <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-foreground origin-left scale-x-0 group-hover/name:scale-x-100 transition-transform duration-300 ease-out" />
                                    </span>
                                    <ArrowUpRight size={14} className="opacity-40 group-hover/name:opacity-100 group-hover/name:-translate-y-[2px] group-hover/name:translate-x-[2px] transition-all duration-300 ease-out" />
                                </a>
                                
                                <div className="flex gap-2">
                                    <a href="https://github.com/aninda8680" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background hover:-translate-y-1 transition-all shadow-sm">
                                        <Github size={14} />
                                    </a>
                                    <a href="https://x.com/hii_aninda" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background hover:-translate-y-1 transition-all shadow-sm">
                                        <XIcon size={12} />
                                    </a>
                                    <a href="https://www.linkedin.com/in/aninda01" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background hover:-translate-y-1 transition-all shadow-sm">
                                        <Linkedin size={14} />
                                    </a>
                                </div>
                            </div>

                            {/* Member 2: Atanu Saha */}
                            <div className="group flex flex-col gap-2.5">
                                <a href="https://atanusaha.tech" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 w-fit group/name">
                                    <span className="text-sm font-bold relative">
                                        Atanu Saha
                                        <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-foreground origin-left scale-x-0 group-hover/name:scale-x-100 transition-transform duration-300 ease-out" />
                                    </span>
                                    <ArrowUpRight size={14} className="opacity-40 group-hover/name:opacity-100 group-hover/name:-translate-y-[2px] group-hover/name:translate-x-[2px] transition-all duration-300 ease-out" />
                                </a>
                                
                                <div className="flex gap-2">
                                    <a href="https://github.com/Atanu2k4" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background hover:-translate-y-1 transition-all shadow-sm">
                                        <Github size={14} />
                                    </a>
                                    <a href="https://x.com/atanu__07" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background hover:-translate-y-1 transition-all shadow-sm">
                                        <XIcon size={12} />
                                    </a>
                                    <a href="https://www.linkedin.com/in/atanusaha07/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center hover:bg-foreground hover:text-background hover:-translate-y-1 transition-all shadow-sm">
                                        <Linkedin size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 md:ml-20">
                        <span className="text-lg md:text-xl font-bold tracking-wide opacity-70" style={{ fontFamily: "var(--font-malinton)" }}>Subsystems</span>
                        <div className="flex flex-col gap-3 text-sm font-bold opacity-60 ml-4">
                            <a href="#" className="hover:opacity-100 transition-opacity">Extension UI</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Analysis Engine</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Workflows</a>
                            <a href="#" className="hover:opacity-100 transition-opacity">Desktop (WIP)</a>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-foreground/[0.05] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-8 text-[11px] font-medium uppercase tracking-widest opacity-30" style={{ fontFamily: "var(--font-pixel)" }}>
                        <a href="#" className="hover:opacity-100 transition-opacity">Privacy_Policy</a>
                        <a href="#" className="hover:opacity-100 transition-opacity">Terms_of_Service</a>
                        {/* <a href="#" className="hover:opacity-100 transition-opacity">Open_Source</a> */}
                    </div>

                    <div className="text-[11px] opacity-40 text-center md:text-right font-medium" style={{ fontFamily: "var(--font-pixel)" }}>
                        © {new Date().getFullYear()} MEOW. ALL RIGHTS RESERVED. <br />
                    </div>
                </div>
            </div>
        </footer>
    );
}
