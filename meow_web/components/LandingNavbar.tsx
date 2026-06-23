"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
            <AnimatePresence mode="wait">
                {!scrolled ? (
                    /* ── Transparent floating bar ── */
                    <motion.nav
                        key="transparent"
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[95%] max-w-7xl mx-auto flex items-center justify-between px-8 md:px-14 pt-4 pb-4 mt-6 rounded-3xl"
                        style={{
                            backgroundColor: "rgba(0,0,0,0.15)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
                        }}
                    >
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div
                                className="w-8 h-8 flex items-center justify-center rounded-lg"
                                style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                            >
                                <span
                                    className="text-[11px] font-black"
                                    style={{ color: "#fff", fontFamily: "var(--font-pixel)" }}
                                >
                                    M
                                </span>
                            </div>
                            <span
                                className="text-lg font-black tracking-tighter"
                                style={{ fontFamily: "var(--font-malinton)", color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
                            >
                                MEOW
                            </span>
                        </Link>

                        {/* Center links */}
                        <div className="hidden md:flex items-center gap-1">
                            {[
                                { label: "Features", href: "#features" },
                                { label: "Setup", href: "#how-to" },
                            ].map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200"
                                    style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-malinton)" }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.12)";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.75)";
                                    }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>

                        {/* Login button */}
                        <Link href="/login">
                            <button
                                className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-200"
                                style={{
                                    fontFamily: "var(--font-malinton)",
                                    backgroundColor: "rgba(255,255,255,0.15)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.25)",
                                    color: "#fff",
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.25)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.15)";
                                }}
                            >
                                Login
                            </button>
                        </Link>
                    </motion.nav>
                ) : (
                    /* ── Notch / pill — dark, compact, centered ── */
                    <motion.nav
                        key="notch"
                        initial={{ y: -50, opacity: 0, scale: 0.85 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -50, opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-3 flex items-center gap-1 px-2 py-1.5 rounded-full"
                        style={{
                            backgroundColor: "rgba(15,15,15,0.88)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
                        }}
                    >
                        {/* Logo pill */}
                        <Link href="/" className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full transition-colors duration-150 hover:bg-white/[0.06]">
                            <div
                                className="w-5 h-5 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: "#fff" }}
                            >
                                <span className="text-[8px] font-black" style={{ color: "#171717", fontFamily: "var(--font-pixel)" }}>M</span>
                            </div>
                            <span
                                className="text-[11px] font-black tracking-tight"
                                style={{ color: "#fff", fontFamily: "var(--font-malinton)" }}
                            >
                                MEOW
                            </span>
                        </Link>

                        <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

                        {[
                            { label: "Features", href: "#features" },
                            { label: "Setup", href: "#how-to" },
                        ].map(item => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-150"
                                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-malinton)" }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.08)";
                                    (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
                                }}
                            >
                                {item.label}
                            </a>
                        ))}

                        <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

                        <Link href="/login">
                            <button
                                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-150"
                                style={{
                                    fontFamily: "var(--font-malinton)",
                                    backgroundColor: "#fff",
                                    color: "#171717",
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                                }}
                            >
                                Login
                            </button>
                        </Link>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
}
