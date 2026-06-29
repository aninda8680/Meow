"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export default function LandingHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax effects
    const bgScale = useTransform(scrollY, [0, 800], [1.0, 1.02]);
    const textY = useTransform(scrollY, [0, 800], [0, -100]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <section
            id="home"
            ref={containerRef}
            className="relative w-full min-h-[100svh] overflow-hidden flex items-center"
        >
            <motion.div
                style={{ scale: bgScale }}
                className="absolute inset-0"
            >
                <img
                    src="/image/hero.png"
                    alt="Meow hero"
                    className="w-full h-full object-cover object-center"
                />
            </motion.div>

            {/* ── Premium Gradient Overlays ── */}
            {/* 1. Base darkening for text legibility (very subtle) */}
            <div className="absolute inset-0 bg-black/15 z-[1]" />

            {/* 2. Soft radial gradient from the left to highlight the text area */}
            <div
                className="absolute inset-0 z-[2]"
                style={{
                    background: "radial-gradient(circle at 20% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%)"
                }}
            />

            {/* ── Text content — sophisticated, airy typography ── */}
            <motion.div
                style={{ y: textY, opacity }}
                className="relative z-10 w-[95%] max-w-7xl mx-auto px-8 md:px-14 pt-24 pb-24"
            >
                <div className="max-w-4xl flex flex-col items-start">
                    {/* Minimalist Live Badge */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-6"
                    >
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[13px] font-medium tracking-widest uppercase text-white/90" style={{ letterSpacing: "0.15em", fontFamily: "var(--font-pixel)" }}>
                                Version 1.0 Live
                            </span>
                        </div>
                    </motion.div>

                    {/* Bold, Elegant Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-6xl lg:text-[100px] font-normal leading-none tracking-tighter mb-6"
                        style={{ color: "#ffffff", textShadow: "0 10px 40px rgba(0,0,0,0.3)", fontFamily: "var(--font-malinton)" }}
                    >
                        <span className="block mb-[0.1em]">Focus.</span>
                        <span
                            className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 py-[0.1em] -my-[0.1em] px-[0.05em] -mx-[0.05em]"
                        >
                            Redefined.
                        </span>
                    </motion.h1>

                    {/* Refined Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="text-base md:text-lg leading-relaxed mb-8 text-white/80 max-w-lg font-light"
                    >
                        The ultimate companion for deep work. <br className="hidden md:block" />
                        Track your habits, monitor your tabs, and <br className="hidden md:block" />
                        build unbreakable discipline seamlessly.
                    </motion.p>

                    {/* Premium CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col sm:flex-row items-center gap-5"
                    >
                        <Link href="/login" className="w-full sm:w-auto">
                            <button
                                className="group relative w-full sm:w-auto px-6 py-3 bg-white text-black rounded-2xl text-base tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                style={{ fontFamily: "var(--font-malinton)" }}
                            >
                                {/* Subtle hover glow inside the button */}
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Start Exploring
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </button>
                        </Link>

                        <Link href="#features" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-6 py-3 rounded-2xl text-white/80 text-base tracking-wide transition-all duration-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm" style={{ fontFamily: "var(--font-malinton)" }}>
                                View Features
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Elegant Scroll Indicator ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
            >
                <span className="text-[12px] uppercase tracking-[0.2em] text-white/40 font-medium" style={{ fontFamily: "var(--font-pixel)" }}>Scroll</span>
                <div className="w-[1px] h-12 bg-white/10 overflow-hidden">
                    <motion.div
                        className="w-full h-1/2 bg-white/60"
                        animate={{ y: [-24, 48] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </motion.div>
            {/* ── Scroll-linked fade to background ── */}
            <div
                className="absolute bottom-0 left-0 right-0 h-64 z-[3] pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent 0%, #000 100%)" }}
            />
        </section>
    );
}
