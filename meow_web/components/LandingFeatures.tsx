"use client";

import { motion } from "framer-motion";
import { Eye, Timer, History, Zap, Shield, Layout, MousePointer2, Bell } from "lucide-react";

const features = [
    {
        icon: <Timer className="w-6 h-6" />,
        title: "Neuro-Sync Timer",
        description: "Adaptive count-cycles that synchronize with your natural concentration rhythms.",
        tag: "CORE"
    },
    {
        icon: <Eye className="w-6 h-6" />,
        title: "Empathic Eye-Link",
        description: "A digital companion that mirrors your mental state—vigilant when you work, resting when you pause.",
        tag: "LIVE"
    },
    {
        icon: <History className="w-6 h-6" />,
        title: "Trace Memory",
        description: "Deep-layered activity logs that reconstruct your digital movements for better self-optimization.",
        tag: "DATA"
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Ghost Protocol",
        description: "Total architectural privacy. Your focus data never leaves the local perimeter.",
        tag: "SECURE"
    },
    {
        icon: <Layout className="w-6 h-6" />,
        title: "Modular HUD",
        description: "Reconfigurable interface components. Drag, drop, and dock your productivity tools.",
        tag: "UI"
    },
    {
        icon: <Bell className="w-6 h-6" />,
        title: "Silent Pounces",
        description: "Notification dampening that subtly nudges you back to flow without breaking the spell.",
        tag: "FLOW"
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 }
    } as any,
};

export default function LandingFeatures() {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            {/* Decorative Label */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] text-[15vw] font-black pointer-events-none select-none uppercase">
                Modules
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
                    <div className="max-w-xl">
                        <h2
                            className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tighter"
                            style={{ fontFamily: "var(--font-pixel)" }}
                        >
                            INTERNAL <br /> <span className="opacity-40">CAPABILITIES</span>
                        </h2>
                        <p className="text-xl opacity-60 leading-relaxed">
                            Engineered for the modern deep-worker. Meow isn't just a timer; it's a structural upgrade for your browser environment.
                        </p>
                    </div>
                    <div className="flex gap-4 pb-2">
                        <div className="w-12 h-1 bg-foreground opacity-10 rounded-full" />
                        <div className="w-12 h-1 bg-foreground opacity-40 rounded-full" />
                        <div className="w-24 h-1 bg-foreground opacity-100 rounded-full" />
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative p-10 bg-foreground/[0.02] border border-foreground/[0.05] hover:bg-foreground/[0.04] transition-all duration-500 overflow-hidden"
                        >
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground/10 group-hover:border-foreground/40 transition-colors" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground/10 group-hover:border-foreground/40 transition-colors" />

                            <div className="flex justify-between items-start mb-12">
                                <div className="w-14 h-14 rounded-xl bg-foreground text-background flex items-center justify-center group-hover:rotate-[15deg] transition-transform duration-500 shadow-xl">
                                    {feature.icon}
                                </div>
                                <span className="text-[10px] font-bold tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity">
                                    ID: 00{index + 1} // {feature.tag}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:translate-x-1 transition-transform">{feature.title}</h3>
                            <p className="opacity-50 group-hover:opacity-80 leading-relaxed text-sm transition-opacity">
                                {feature.description}
                            </p>

                            {/* Technical background detail */}
                            <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <MousePointer2 size={150} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
