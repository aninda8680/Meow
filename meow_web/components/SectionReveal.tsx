"use client";

import { motion, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";

interface SectionRevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function SectionReveal({ children, delay = 0, className = "" }: SectionRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60, scale: 0.97, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.9,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// A more dramatic "rise from the abyss" reveal for the section header
export function SectionHeaderReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
