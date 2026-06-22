"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";

import { Zap, Shield, Target, Cpu, MousePointer2 } from "lucide-react";

export default function LandingHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Smooth springs for mouse tracking
    const mouseXSpring = useSpring(0.5, { stiffness: 50, damping: 20 });
    const mouseYSpring = useSpring(0.5, { stiffness: 50, damping: 20 });

    // Derived values for animations (these are MotionValues)
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [0.03, 0]);

    // Perspective & HUD transforms
    const gridRotateX = useTransform(mouseYSpring, [0, 1], [5, -5]);
    const gridRotateY = useTransform(mouseXSpring, [0, 1], [-5, 5]);
    const ghostX = useTransform(mouseXSpring, [0, 1], [100, -100]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            mouseXSpring.set(x);
            mouseYSpring.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseXSpring, mouseYSpring]);

    return (
        <section ref={containerRef} className="relative min-h-[120vh] flex items-center px-6 overflow-hidden bg-background">
            {/* 
                INSPIRED BY VENGENCE: INTERACTIVE PERSPECTIVE GRID
                A deep 3D space that reacts to mouse movement
            */}
            <div className="absolute inset-0 z-0 pointer-events-none perspective-[1000px] overflow-hidden">
                <motion.div
                    style={{
                        rotateX: gridRotateX,
                        rotateY: gridRotateY,
                        scale: 1.2,
                        translateZ: 0
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {/* Main Grid Lines */}
                    <div className="w-[200%] h-[200%] opacity-[0.03] dark:opacity-[0.07] bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:100px_100px]"
                        style={{ maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)' }}
                    />

                    {/* Sub-Grid (Dynamic Grain) */}
                    <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </motion.div>

                {/* 
                    VENGENCE INSPIRED: LIGHT LINES 
                    Flowing "data streams" through the grid
                */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ top: "-20%", left: `${20 * i + 10}%` }}
                            animate={{ top: "120%" }}
                            transition={{
                                duration: 8 + i * 2,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 1.5
                            }}
                            className="absolute w-[1px] h-40 bg-gradient-to-b from-transparent via-foreground/40 to-transparent"
                        />
                    ))}
                </div>

                <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-[1px] bg-foreground/10 z-0"
                />
            </div>

            <div className="max-w-7xl mx-auto z-10 grid lg:grid-cols-2 gap-20 items-center w-full">
                {/* Left Side: Content with Glitch Text */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-10 lg:-translate-y-12"
                >
                    <div className="flex flex-col gap-4">
                        <div className="relative group overflow-hidden">
                            <motion.h1
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85]"
                                style={{ fontFamily: "var(--font-malinton)" }}
                            >
                                <span className="block relative">
                                    STAY
                                    <motion.span
                                        animate={{ opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 5 }}
                                        className="absolute inset-0 text-red-500/30 translate-x-1"
                                    >STAY</motion.span>
                                </span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/20">SHARP</span>
                            </motion.h1>
                            <motion.div
                                style={{ y: y1 }}
                                className="absolute -top-20 -right-10 text-[140px] font-bold opacity-[0.02] select-none pointer-events-none"
                            >
                                001
                            </motion.div>
                        </div>
                    </div>

                    <p className="text-xl md:text-2xl opacity-60 max-w-lg leading-relaxed font-medium">
                        You think you're focused.
                        Meow shows you the truth.

                        Track your apps. Monitor your tabs.
                        Build real discipline.                    </p>

                    <div className="flex flex-wrap gap-6 items-center">
                        <Link href="/dashboard">
                            <button className="group relative px-10 py-5 bg-foreground text-background font-bold text-xl uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.5)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 border border-foreground/10" style={{ fontFamily: "var(--font-malinton)" }}>
                                TRY IT!
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 animate-pulse" />
                            </button>
                        </Link>

                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold tracking-widest opacity-30">ARCHITECT</span>
                            <span className="text-xs font-bold opacity-60 flex items-center gap-2">
                                by <a href="https://aninda-dev.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline decoration-foreground/20 underline-offset-4">Aninda</a>
                            </span>
                        </div>
                    </div>

                </motion.div>

                {/* Right Side: The "Core Unit" with Perspective HUD */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative flex items-center justify-center w-full -translate-y-24"
                >
                    {/* Circular Navigation/HUD elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-full aspect-square border border-dashed border-foreground/[0.08] rounded-full scale-110"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="w-[80%] aspect-square border border-foreground/[0.05] rounded-full scale-105"
                        />
                    </div>

                    {/* 
            THE CORE "MEOW" MODULE 
            A heavy-glass effect enclosure
          */}
                    <motion.div
                        className="relative z-10 w-full max-w-md aspect-square flex flex-col items-center justify-center p-16"
                    >
                        <motion.div
                            style={{ y: y2 }}
                            className="transform scale-[1.4]"
                        >
                        </motion.div>
                    </motion.div>

                </motion.div>
            </div>

            {/* 
        THE "PARALLAX GHOST" 
        Massive text that sits behind everything
      */}
            <motion.div
                style={{ x: ghostX, opacity }}
                className="absolute bottom-10 left-0 text-[25vw] font-black opacity-[0.015] pointer-events-none whitespace-nowrap select-none leading-none tracking-tighter uppercase"
            >
                Meoww
            </motion.div>
        </section>
    );
}
