"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EdgeWidgetProps {
  side: "left" | "right";
  position: "top" | "bottom";
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  visible: boolean;
}

export default function EdgeWidget({
  side,
  position,
  icon,
  label,
  children,
  visible,
}: EdgeWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isPinned) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 150);
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 400);
  }, [isPinned]);

  const handleTabClick = useCallback(() => {
    if (isPinned) {
      setIsPinned(false);
      setIsExpanded(false);
    } else {
      setIsPinned(true);
      setIsExpanded(true);
    }
  }, [isPinned]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isExpanded || isPinned)) {
        setIsExpanded(false);
        setIsPinned(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, isPinned]);

  if (!visible) return null;

  const isLeft = side === "left";
  const isTop = position === "top";

  // Position classes for the entire container (tab + panel)
  const positionClasses = [
    "fixed transition-[z-index] duration-0",
    (isExpanded || isPinned) ? "z-[110]" : "z-[100]",
    isLeft ? "left-0" : "right-0",
    isTop ? "top-24" : "bottom-24",
    "pointer-events-auto",
  ].join(" ");

  // Tab styles
  const tabClasses = [
    "flex flex-col items-center justify-center gap-2",
    "w-10 py-5 cursor-pointer select-none",
    "transition-all duration-500",
    isLeft
      ? "rounded-r-3xl border-r border-t border-b border-foreground/10"
      : "rounded-l-3xl border-l border-t border-b border-foreground/10",
    isExpanded || isPinned
      ? "bg-foreground/10 backdrop-blur-3xl shadow-2xl"
      : "bg-foreground/[0.04] backdrop-blur-2xl hover:bg-foreground/[0.08]",
    isPinned ? "ring-2 ring-foreground/20" : "",
  ].join(" ");

  // Panel animation variants
  const panelVariants = {
    hidden: {
      opacity: 0,
      x: isLeft ? -10 : 10,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    },
    exit: {
      opacity: 0,
      x: isLeft ? -10 : 10,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className={positionClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ fontFamily: "var(--font-malinton)" }}
    >
      <div
        className={`flex ${isLeft ? "flex-row" : "flex-row-reverse"} items-start relative`}
      >
        {/* Collapsed Tab */}
        <button
          onClick={handleTabClick}
          className={tabClasses}
          title={isPinned ? `Unpin ${label}` : label}
        >
          <span className={`transition-transform duration-500 ${isExpanded ? 'scale-110' : ''} text-foreground/60`}>
            {icon}
          </span>
          <span
            className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/40 whitespace-nowrap"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            {label}
          </span>
          {isPinned && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground/60 shadow-lg" />
          )}
        </button>

        {/* The "Bridge" - prevents flicker when moving from tab to panel */}
        <div className={`${isLeft ? 'w-2' : 'w-2'} h-full pointer-events-auto`} />

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-72 max-h-[70vh] overflow-y-auto overflow-x-hidden ${isLeft ? "ml-1" : "mr-1"} my-0 shadow-2xl rounded-3xl border border-foreground/10 bg-background/40 backdrop-blur-3xl custom-scrollbar`}
              data-lenis-prevent
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--foreground-rgb), 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
