"use client";

import { motion } from "framer-motion";

const features = [
    {
        chapter: "01",
        title: "Smart Timer",
        subtitle: "Optimized Focus Cycles",
        description: "Adaptive Pomodoro cycles that dynamically adjust to your brain's peak focus windows, ensuring you remain in a state of flow without experiencing burnout.",
        bgColor: "#f8fafc", // Very soft blue-gray
        accentColor: "#3b82f6",
        illustration: (
            <svg viewBox="0 0 280 160" className="w-full h-full transition-transform duration-700 group-hover:scale-105" style={{ imageRendering: "pixelated" }}>
                <rect width="280" height="160" fill="#e0f2fe" />
                <rect x="0" y="0" width="280" height="80" fill="#bae6fd" />
                {/* Minimal Clouds */}
                <rect x="20" y="20" width="40" height="8" fill="#fff" opacity="0.7" />
                <rect x="28" y="12" width="24" height="8" fill="#fff" opacity="0.7" />
                <rect x="180" y="30" width="32" height="6" fill="#fff" opacity="0.5" />
                {/* Ground */}
                <rect x="0" y="100" width="280" height="60" fill="#bbf7d0" />
                <rect x="0" y="100" width="280" height="4" fill="#86efac" />
                {/* Clock structure */}
                <rect x="100" y="35" width="80" height="80" rx="40" fill="#0284c7" />
                <rect x="108" y="43" width="64" height="64" rx="32" fill="#f0f9ff" />
                {/* Clock hands */}
                <rect x="138" y="56" width="4" height="20" fill="#0369a1" />
                <rect x="138" y="72" width="16" height="4" fill="#0369a1" />
                <rect x="139" y="73" width="2" height="2" fill="#fff" />
                {/* Tick marks */}
                <rect x="139" y="48" width="2" height="4" fill="#0284c7" />
                <rect x="139" y="98" width="2" height="4" fill="#0284c7" />
                <rect x="114" y="73" width="4" height="2" fill="#0284c7" />
                <rect x="162" y="73" width="4" height="2" fill="#0284c7" />
            </svg>
        ),
    },
    {
        chapter: "02",
        title: "Focus Buddy",
        subtitle: "Real-Time Activity Monitor",
        description: "A minimalist digital companion that observes your activity in real-time, delivering subtle nudges to guide you back to concentration when you drift.",
        bgColor: "#faf5ff", // Soft purple
        accentColor: "#8b5cf6",
        illustration: (
            <svg viewBox="0 0 280 160" className="w-full h-full transition-transform duration-700 group-hover:scale-105" style={{ imageRendering: "pixelated" }}>
                <rect width="280" height="160" fill="#e9d5ff" />
                <rect x="0" y="0" width="280" height="90" fill="#8b5cf6" />
                {/* Stars */}
                {[30, 80, 140, 200, 250].map((x, i) => (
                    <rect key={i} x={x} y={i % 2 === 0 ? 15 : 30} width="2" height="2" fill="#fff" opacity="0.6" />
                ))}
                {/* Moon */}
                <rect x="220" y="15" width="20" height="20" rx="10" fill="#fef08a" />
                {/* Monitor */}
                <rect x="70" y="45" width="140" height="85" rx="6" fill="#1e1b4b" />
                <rect x="76" y="51" width="128" height="70" fill="#2e1065" rx="2" />
                {/* Eye graphic */}
                <rect x="104" y="65" width="72" height="36" rx="18" fill="#c4b5fd" />
                <rect x="116" y="71" width="48" height="24" rx="12" fill="#fff" />
                <rect x="128" y="75" width="24" height="16" rx="8" fill="#5b21b6" />
                <rect x="134" y="79" width="8" height="8" rx="4" fill="#fff" />
                {/* Stand */}
                <rect x="128" y="130" width="24" height="8" fill="#3f3f46" />
                <rect x="110" y="138" width="60" height="4" fill="#3f3f46" rx="2" />
                {/* Ground */}
                <rect x="0" y="142" width="280" height="18" fill="#a78bfa" />
            </svg>
        ),
    },
    {
        chapter: "03",
        title: "Deep Analytics",
        subtitle: "Actionable Intelligence",
        description: "Gain profound insights into your digital habits. Visualize exactly where your time is spent and identify hidden patterns to unlock peak productivity.",
        bgColor: "#f0fdfa", // Soft teal
        accentColor: "#0d9488",
        illustration: (
            <svg viewBox="0 0 280 160" className="w-full h-full transition-transform duration-700 group-hover:scale-105" style={{ imageRendering: "pixelated" }}>
                <rect width="280" height="160" fill="#ccfbf1" />
                <rect x="0" y="0" width="280" height="75" fill="#0f766e" />
                {/* Subtle sky detail */}
                <rect x="40" y="20" width="30" height="4" fill="#fff" opacity="0.2" />
                <rect x="180" y="30" width="40" height="4" fill="#fff" opacity="0.2" />
                {/* Dashboard Frame */}
                <rect x="35" y="40" width="210" height="100" rx="8" fill="#134e4a" />
                <rect x="41" y="46" width="198" height="88" fill="#042f2e" rx="4" />
                {/* Bars */}
                <rect x="55" y="94" width="16" height="30" fill="#14b8a6" rx="2" />
                <rect x="80" y="74" width="16" height="50" fill="#2dd4bf" rx="2" />
                <rect x="105" y="60" width="16" height="64" fill="#5eead4" rx="2" />
                <rect x="130" y="84" width="16" height="40" fill="#14b8a6" rx="2" />
                <rect x="155" y="54" width="16" height="70" fill="#2dd4bf" rx="2" />
                <rect x="180" y="68" width="16" height="56" fill="#5eead4" rx="2" />
                <rect x="205" y="88" width="16" height="36" fill="#14b8a6" rx="2" />
                {/* Axis */}
                <rect x="48" y="128" width="184" height="1" fill="#115e59" />
                <rect x="48" y="52" width="1" height="76" fill="#115e59" />
            </svg>
        ),
    },
    {
        chapter: "04",
        title: "Privacy First",
        subtitle: "Local-First Architecture",
        description: "Your browsing data and activity logs never touch the cloud. Enjoy total sovereignty over your digital life with a system built entirely for you.",
        bgColor: "#f0fdf4", // Soft green
        accentColor: "#16a34a",
        illustration: (
            <svg viewBox="0 0 280 160" className="w-full h-full transition-transform duration-700 group-hover:scale-105" style={{ imageRendering: "pixelated" }}>
                <rect width="280" height="160" fill="#dcfce7" />
                <rect x="0" y="0" width="280" height="90" fill="#166534" />
                {/* Distant trees/hills */}
                <rect x="0" y="80" width="80" height="10" fill="#14532d" />
                <rect x="200" y="75" width="80" height="15" fill="#14532d" />
                {/* Lock body */}
                <rect x="105" y="70" width="70" height="60" rx="8" fill="#15803d" />
                <rect x="111" y="76" width="58" height="48" fill="#16a34a" rx="4" />
                {/* Lock shackle */}
                <rect x="119" y="42" width="42" height="34" rx="21" fill="none" stroke="#4ade80" strokeWidth="8" />
                <rect x="119" y="70" width="8" height="6" fill="#4ade80" />
                <rect x="153" y="70" width="8" height="6" fill="#4ade80" />
                {/* Keyhole */}
                <rect x="134" y="90" width="12" height="12" rx="6" fill="#14532d" />
                <rect x="137" y="98" width="6" height="12" fill="#14532d" rx="2" />
                {/* Ground details */}
                <rect x="0" y="130" width="280" height="30" fill="#22c55e" />
                <rect x="0" y="130" width="280" height="4" fill="#4ade80" opacity="0.5" />
            </svg>
        ),
    },
];

export default function LandingFeatures() {
    return (
        <section
            id="features"
            className="py-32 px-6 relative overflow-hidden"
            style={{ backgroundColor: "#FAFAF8" }}
        >
            {/* Very subtle background noise/texture for premium feel */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "repeat",
                }}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* ── Premium Header ── */}
                <div className="flex flex-col items-center text-center mb-24 overflow-hidden">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="px-4 py-1.5 rounded-full text-[12px] font-medium tracking-widest mb-6 inline-block"
                        style={{ backgroundColor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.06)", fontFamily: "var(--font-pixel)" }}
                    >
                        Features
                    </motion.span>
                    <div className="overflow-hidden">
                        <motion.h2
                            initial={{ y: "100%", opacity: 0 }}
                            whileInView={{ y: "0%", opacity: 1 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                            className="text-4xl md:text-6xl font-normal tracking-tight mb-4 leading-tight max-w-3xl"
                            style={{ color: "#111111", fontFamily: "var(--font-malinton)" }}
                        >
                            Tools designed to elevate your <span className="italic text-black/40">focus</span>.
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light"
                        style={{ color: "rgba(0,0,0,0.5)" }}
                    >
                        Discover the underlying mechanics of Meow. Minimalist design paired with powerful tracking to keep you in the zone.
                    </motion.p>
                </div>

                {/* ── 2×2 Aesthetic Grid with staggered fan-out ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    {features.map((feat, i) => {
                        // Each card gets a unique entry direction for a fanning effect
                        const offsets = [
                            { y: 80, x: -20, rotate: -2 },  // top-left: from bottom-left
                            { y: 80, x: 20, rotate: 2 },    // top-right: from bottom-right
                            { y: 60, x: -15, rotate: -1 },  // bottom-left
                            { y: 60, x: 15, rotate: 1 },    // bottom-right
                        ];
                        const off = offsets[i] ?? offsets[0];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: off.y, x: off.x, rotate: off.rotate, scale: 0.94 }}
                                whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{
                                    duration: 0.9,
                                    delay: i * 0.12,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className="group flex flex-col h-full"
                            >
                                {/* Card Container */}
                                <div
                                    className="flex flex-col h-full rounded-[24px] overflow-hidden relative bg-white transition-all duration-500"
                                    style={{
                                        border: "1px solid rgba(0,0,0,0.04)",
                                        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.02), 0 0 2px rgba(0,0,0,0.02)",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.08), 0 0 3px rgba(0,0,0,0.04)";
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.08)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px -4px rgba(0,0,0,0.02), 0 0 2px rgba(0,0,0,0.02)";
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.04)";
                                    }}
                                >
                                    {/* Top Illustration Section */}
                                    <div 
                                        className="w-full relative overflow-hidden"
                                        style={{ 
                                            aspectRatio: "16/10",
                                            backgroundColor: feat.bgColor 
                                        }}
                                    >
                                        {/* Subtle inner shadow for depth */}
                                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.03)] z-10 pointer-events-none" />
                                        
                                        {feat.illustration}

                                        {/* Minimal Chapter Badge */}
                                        <div className="absolute top-5 left-5 z-20">
                                            <div 
                                                className="px-3 py-1 rounded-full text-[11px] font-medium tracking-widest backdrop-blur-md"
                                                style={{ 
                                                    backgroundColor: "rgba(255,255,255,0.8)", 
                                                    color: feat.accentColor,
                                                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                                    fontFamily: "var(--font-pixel)"
                                                }}
                                            >
                                                CH {feat.chapter}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex flex-col flex-grow p-6 md:p-8">
                                        <div className="flex flex-col gap-1.5 mb-4">
                                            <h3 className="text-3xl md:text-4xl font-normal tracking-tight text-[#111]" style={{ fontFamily: "var(--font-malinton)" }}>
                                                {feat.subtitle}
                                            </h3>
                                            <p className="text-xs font-medium tracking-wide" style={{ color: feat.accentColor }}>
                                                {feat.title}
                                            </p>
                                        </div>

                                        <p className="text-sm text-[#666] leading-relaxed font-light mb-6 flex-grow">
                                            {feat.description}
                                        </p>

                                        {/* Read more link */}
                                        <div className="mt-auto pt-6 border-t border-black/[0.04]">
                                            <div 
                                                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase group-hover:gap-3 transition-all duration-300"
                                                style={{ color: "#111" }}
                                            >
                                                Explore Feature
                                                <svg className="w-3.5 h-3.5 transition-transform duration-300 text-black/40 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
