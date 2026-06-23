"use client";

import { motion } from "framer-motion";
import { Download, Terminal, Monitor, Globe, AlertCircle } from "lucide-react";
import Link from "next/link";

const steps = [
    {
        id: "01",
        icon: Download,
        title: "Install the Extension",
        subtitle: "Browser Tab Telemetry",
        description:
            "Install the core bypass extension. This enables real-time browser telemetry and event hooks required for active tab mapping.",
        action: { label: "Download Extension", href: "/downloads/meow-extension.zip", download: "meow-extension.zip" },
    },
    {
        id: "02",
        icon: Terminal,
        title: "Run the CLI Tracker",
        subtitle: "App Activity Monitor",
        description:
            "Run the zero-clone app tracker via Node.js. No installation required — just execute the mission-critical command.",
        action: { label: "npx meow-tracker", href: "#", isCode: true },
    },
    {
        id: "03",
        icon: Monitor,
        title: "Download the Tray App",
        subtitle: "Native Desktop Shell",
        description:
            "A dedicated Electron-powered binary for system-wide focus containment and native OS hooks with system tray integration.",
        action: { label: "Download App", href: "/downloads/Meow.exe", download: "Meow.exe" },
    },
    {
        id: "04",
        icon: Globe,
        title: "Open Mission Control",
        subtitle: "Web Dashboard",
        description:
            "Launch the web-based dashboard. Your primary interface for focus visualisation and deep session management.",
        action: { label: "Open Dashboard →", href: "/dashboard" },
    },
];

export default function LandingHowTo() {
    return (
        <section
            id="how-to"
            className="py-32 px-6 relative overflow-hidden"
            style={{ backgroundColor: "#F5F5F2" }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-24"
                >
                    <span
                        className="text-[12px] font-medium uppercase tracking-[0.4em] mb-4 block"
                        style={{ color: "rgba(23,23,23,0.35)", fontFamily: "var(--font-pixel)" }}
                    >
                        Deployment
                    </span>
                    <h2
                        className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]"
                        style={{ fontFamily: "var(--font-malinton)", color: "#171717" }}
                    >
                        Set it up in
                        <br />
                        <span style={{ color: "rgba(23,23,23,0.25)" }}>four steps.</span>
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* The vertical line */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-[27px] top-0 bottom-0 w-[2px] origin-top"
                        style={{ backgroundColor: "rgba(23,23,23,0.08)" }}
                    />

                    <div className="flex flex-col gap-0">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            const isLast = i === steps.length - 1;
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                    className={`relative flex gap-8 ${isLast ? "pb-0" : "pb-14"}`}
                                >
                                    {/* Circle node on the line */}
                                    <div className="flex-shrink-0 relative z-10 flex flex-col items-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: i * 0.12 + 0.2, type: "spring", stiffness: 300 }}
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                            style={{
                                                backgroundColor: "#fff",
                                                border: "2px solid rgba(23,23,23,0.08)",
                                                boxShadow: "0 2px 12px rgba(23,23,23,0.06)",
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                style={{ color: "rgba(23,23,23,0.6)" }}
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pt-3 pb-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span
                                                className="text-[11px] font-medium uppercase tracking-widest"
                                                style={{ color: "rgba(23,23,23,0.35)", fontFamily: "var(--font-pixel)" }}
                                            >
                                                Step {step.id}
                                            </span>
                                            <span
                                                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: "rgba(23,23,23,0.35)",
                                                    backgroundColor: "rgba(23,23,23,0.05)",
                                                }}
                                            >
                                                {step.subtitle}
                                            </span>
                                        </div>

                                        <h3
                                            className="text-xl md:text-2xl font-black tracking-tight mb-3"
                                            style={{ fontFamily: "var(--font-malinton)", color: "#171717" }}
                                        >
                                            {step.title}
                                        </h3>

                                        <p
                                            className="text-sm leading-relaxed mb-4 max-w-lg"
                                            style={{ color: "rgba(23,23,23,0.5)" }}
                                        >
                                            {step.description}
                                        </p>

                                        {step.action && (
                                            step.action.isCode ? (
                                                <div
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-bold"
                                                    style={{
                                                        backgroundColor: "rgba(23,23,23,0.05)",
                                                        border: "1px solid rgba(23,23,23,0.08)",
                                                        color: "#171717",
                                                    }}
                                                >
                                                    <Terminal size={14} style={{ color: "rgba(23,23,23,0.4)" }} />
                                                    {step.action.label}
                                                </div>
                                            ) : (
                                                <a
                                                    href={step.action.href}
                                                    download={step.action.download}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-200"
                                                    style={{
                                                        color: "#171717",
                                                        textDecoration: "underline",
                                                        textDecorationColor: "rgba(23,23,23,0.25)",
                                                        textUnderlineOffset: "4px",
                                                        fontFamily: "var(--font-malinton)",
                                                    }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLAnchorElement).style.textDecorationColor = "#171717";
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLAnchorElement).style.textDecorationColor = "rgba(23,23,23,0.25)";
                                                    }}
                                                >
                                                    {step.action.label}
                                                </a>
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-24 relative rounded-3xl p-10 md:p-14 overflow-hidden"
                    style={{ backgroundColor: "#171717" }}
                >
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                        }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                <AlertCircle size={13} style={{ color: "#60a5fa" }} />
                                <span
                                    className="text-[11px] font-medium uppercase tracking-widest"
                                    style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-pixel)" }}
                                >
                                    Idea Incubator
                                </span>
                            </div>
                            <h3
                                className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-4"
                                style={{ fontFamily: "var(--font-malinton)", color: "#FAFAF8" }}
                            >
                                HAVE A <span style={{ color: "rgba(255,255,255,0.3)" }}>VISION?</span>
                            </h3>
                            <p
                                className="text-sm leading-relaxed max-w-md"
                                style={{ color: "rgba(255,255,255,0.5)" }}
                            >
                                Meow is built by the obsessed, for the obsessed. If you have a feature suggestion or a unique workflow — we're all ears.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                            <button
                                className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-200 hover:opacity-90"
                                style={{
                                    fontFamily: "var(--font-malinton)",
                                    backgroundColor: "#FAFAF8",
                                    color: "#171717",
                                }}
                            >
                                Suggest Feature
                            </button>
                            <button
                                className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-200"
                                style={{
                                    fontFamily: "var(--font-malinton)",
                                    backgroundColor: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "rgba(255,255,255,0.7)",
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.1)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                                }}
                            >
                                Join the Lab
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
