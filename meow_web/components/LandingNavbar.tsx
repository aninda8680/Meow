"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${scrolled
                ? "bg-background/70 backdrop-blur-xl border-b border-foreground/[0.05] py-3 shadow-2xl"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div /> {/* Spacer to keep tabs centered */}

                {/* SlideTabs Integrated Here */}
                <div className="hidden md:block">
                    <SlideTabs />
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/main">
                        <button className="px-8 py-3 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-lg hover:shadow-2xl">
                            Launch App
                        </button>
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}

const SlideTabs = () => {
    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });

    return (
        <ul
            onMouseLeave={() => {
                setPosition((pv) => ({
                    ...pv,
                    opacity: 0,
                }));
            }}
            className="relative mx-auto flex w-fit rounded-full border border-foreground/10 bg-foreground/[0.03] p-1"
        >
            <Tab setPosition={setPosition} href="#features">Capabilities</Tab>
            <Tab setPosition={setPosition} href="#how-to">Deployment</Tab>
            <Tab setPosition={setPosition} href="#hero">System</Tab>

            <Cursor position={position} />
        </ul>
    );
};

const Tab = ({ children, setPosition, href }: { children: React.ReactNode, setPosition: any, href: string }) => {
    const ref = useRef<HTMLLIElement>(null);

    return (
        <li
            ref={ref}
            onMouseEnter={() => {
                if (!ref?.current) return;

                const { width } = ref.current.getBoundingClientRect();

                setPosition({
                    left: ref.current.offsetLeft,
                    width,
                    opacity: 1,
                });
            }}
            className="relative z-10 block cursor-pointer px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground mix-blend-difference md:px-5 md:py-2"
        >
            <a href={href}>{children}</a>
        </li>
    );
};

const Cursor = ({ position }: { position: any }) => {
    return (
        <motion.li
            animate={{
                ...position,
            }}
            className="absolute z-0 h-7 rounded-full bg-foreground md:h-8"
        />
    );
};
