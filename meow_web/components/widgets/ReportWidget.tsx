"use client";

import { useSystemTracker } from "@/hooks/useSystemTracker";
import { categorizeActivity, calculateFocusScore } from "@/lib/categorizer";
import { useMemo } from "react";
import Link from "next/link";
import { Activity, Target, TrendingUp, TrendingDown, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReportWidgetProps {
  className?: string;
}

export function ReportWidget({ className }: ReportWidgetProps) {
  const { stats } = useSystemTracker();

  const metrics = useMemo(() => {
    let productive = 0;
    let distracting = 0;
    let neutral = 0;

    stats.sessions.forEach((session) => {
      const category = categorizeActivity(session.app || session.domain || session.title);
      if (category === 'Productive') productive += session.duration;
      else if (category === 'Distracting') distracting += session.duration;
      else neutral += session.duration;
    });

    const focusScore = calculateFocusScore(productive, distracting);

    return {
      productive: Math.round(productive / 60), // in minutes
      distracting: Math.round(distracting / 60), // in minutes
      neutral: Math.round(neutral / 60), // in minutes
      focusScore,
    };
  }, [stats]);

  const totalTime = metrics.productive + metrics.distracting;
  const prodPct = totalTime > 0 ? (metrics.productive / totalTime) * 100 : 0;
  const distPct = totalTime > 0 ? (metrics.distracting / totalTime) * 100 : 0;

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full md:w-72 bg-foreground/4 border border-foreground/15 backdrop-blur-xl rounded-4xl p-6 flex flex-col gap-4 group transition-all shadow-2xl shadow-black/10 hover:border-foreground/30 ${className}`}
        style={{ fontFamily: 'var(--font-malinton)' }}
    >
      <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-widest font-semibold opacity-30">Daily Focus</span>
              <span className="text-[8px] uppercase font-bold text-foreground/60">
                 Categorized
              </span>
          </div>
          <Link
              href="/report"
              className="p-1 px-1.5 rounded-lg hover:bg-foreground/5 opacity-0 group-hover:opacity-100 transition-all text-foreground/40 hover:text-foreground"
              title="Full Report"
          >
              <Maximize2 size={12} />
          </Link>
      </div>

      <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-30">Focus Score</span>
          <div className="flex items-center gap-2">
              <span className="text-4xl font-black tabular-nums">{metrics.focusScore}%</span>
              {metrics.focusScore >= 70 ? (
                <TrendingUp size={24} className="text-green-500/80" />
              ) : metrics.focusScore <= 40 ? (
                <TrendingDown size={24} className="text-red-500/80" />
              ) : (
                <Target size={24} className="text-yellow-500/80" />
              )}
          </div>
      </div>

      <div className="h-px w-full bg-foreground/5" />

      <div className="flex flex-col gap-3">
        {/* Productive Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className="text-green-500/70">Productive</span>
            <span className="opacity-50">{metrics.productive}m</span>
          </div>
          <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500/60 rounded-full transition-all duration-1000" 
              style={{ width: `${prodPct}%` }}
            />
          </div>
        </div>

        {/* Distracting Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className="text-red-500/70">Distracting</span>
            <span className="opacity-50">{metrics.distracting}m</span>
          </div>
          <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500/60 rounded-full transition-all duration-1000" 
              style={{ width: `${distPct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
