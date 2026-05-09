"use client";

import { useSystemTracker } from "@/hooks/useSystemTracker";
import { categorizeActivity, calculateFocusScore } from "@/lib/categorizer";
import { useMemo } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Target, Maximize2 } from "lucide-react";
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
      productive: Math.round(productive / 60),
      distracting: Math.round(distracting / 60),
      neutral: Math.round(neutral / 60),
      focusScore,
    };
  }, [stats]);

  const totalTime = metrics.productive + metrics.distracting;
  const prodPct = totalTime > 0 ? (metrics.productive / totalTime) * 100 : 0;
  const distPct = totalTime > 0 ? (metrics.distracting / totalTime) * 100 : 0;

  return (
    <div
      className={`w-full max-w-lg bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-5 group hover:border-foreground/15 transition-all ${className}`}
      style={{ fontFamily: 'var(--font-malinton)' }}
    >
      {/* Focus Score */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xl font-black tabular-nums">{metrics.focusScore}%</span>
        {metrics.focusScore >= 70 ? (
          <TrendingUp size={16} className="text-green-500/80" />
        ) : metrics.focusScore <= 40 ? (
          <TrendingDown size={16} className="text-red-500/80" />
        ) : (
          <Target size={16} className="text-yellow-500/80" />
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-foreground/10 shrink-0" />

      {/* Bars */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-wider text-green-500/70 w-8 shrink-0">PRD</span>
          <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500/60 rounded-full transition-all duration-1000"
              style={{ width: `${prodPct}%` }}
            />
          </div>
          <span className="text-[8px] font-bold opacity-40 tabular-nums w-6 text-right shrink-0">{metrics.productive}m</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-wider text-red-500/70 w-8 shrink-0">DST</span>
          <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500/60 rounded-full transition-all duration-1000"
              style={{ width: `${distPct}%` }}
            />
          </div>
          <span className="text-[8px] font-bold opacity-40 tabular-nums w-6 text-right shrink-0">{metrics.distracting}m</span>
        </div>
      </div>

      {/* Expand Link */}
      <Link
        href="/report"
        className="p-1.5 rounded-lg hover:bg-foreground/5 opacity-0 group-hover:opacity-60 hover:opacity-100! transition-all shrink-0"
        title="Full Report"
      >
        <Maximize2 size={10} />
      </Link>
    </div>
  );
}
