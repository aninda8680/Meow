"use client";

import { useSystemTracker } from "@/hooks/useSystemTracker";
import { categorizeActivity, calculateFocusScore } from "@/lib/categorizer";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, TrendingDown, Sparkles, BrainCircuit, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportPage() {
  const { stats } = useSystemTracker();
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');

  const { metrics, topApps, aiInsight } = useMemo(() => {
    let productive = 0;
    let distracting = 0;
    let neutral = 0;
    let catTime: Record<string, number> = {};

    stats.sessions.forEach((session) => {
      const name = session.app || session.domain || session.title;
      const category = categorizeActivity(name);
      
      if (category === 'Productive') productive += session.duration;
      else if (category === 'Distracting') distracting += session.duration;
      else neutral += session.duration;

      if (name) {
          catTime[name] = (catTime[name] || 0) + session.duration;
      }
    });

    const focusScore = calculateFocusScore(productive, distracting);

    // Get top apps
    const sortedApps = Object.entries(catTime)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, duration]) => ({ name, duration, category: categorizeActivity(name) }));

    const topDistraction = sortedApps.find(a => a.category === 'Distracting');
    const topProductive = sortedApps.find(a => a.category === 'Productive');

    let insight = "Not enough data yet. Start focusing to get insights!";
    if (productive > distracting && productive > 3600) {
        insight = "Mew! Excellent focus today. You've spent a solid chunk of time on productive tasks. Keep this momentum going!";
    } else if (distracting > productive && distracting > 1800) {
        if (topDistraction) {
            insight = `Purr... I noticed you spent quite a bit of time on ${topDistraction.name}. Try taking a quick 5-minute break away from the screen instead to recharge! 🐾`;
        } else {
            insight = "Looks like distractions creeping in. Remember your goals! Use the countdown timer to lock in.";
        }
    } else if (productive > 0) {
        if (topProductive) {
             insight = `Great start! Your top tool is ${topProductive.name}. Let's push for 30 more minutes of deep work.`;
        } else {
           insight = "You're warming up! Let's get that focus score up.";
        }
    }

    return {
      metrics: {
          productive: Math.round(productive / 60),
          distracting: Math.round(distracting / 60),
          neutral: Math.round(neutral / 60),
          totalFocus: Math.round(productive / 3600 * 10) / 10,
          focusScore,
      },
      topApps: sortedApps,
      aiInsight: insight
    };
  }, [stats]);

  const formatTime = (minutes: number) => {
      if (minutes < 60) return `${minutes}m`;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] font-[family-name:var(--font-malinton)] p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/main" className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase text-[10px] font-bold tracking-widest">Back to Hub</span>
                </Link>
                <div className="flex bg-foreground/5 rounded-full p-1 border border-foreground/10">
                    <button 
                        onClick={() => setReportType('daily')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${reportType === 'daily' ? 'bg-foreground text-background' : 'text-foreground/50 hover:text-foreground/80'}`}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => setReportType('weekly')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all md:opacity-50 cursor-not-allowed`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            <motion.div 
                className="flex flex-col gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tight">Meow Report</h1>
                <p className="text-foreground/50 text-sm lg:text-base font-medium flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={16} /> Data-driven insights to sharpen your claws.
                </p>
            </motion.div>

            {/* AI Insight Banner */}
            <motion.div 
                className="bg-purple-900/10 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit size={64} />
                </div>
                <div className="relative z-10 flex gap-4 items-start">
                    <div className="bg-purple-500/20 p-3 rounded-2xl">
                        <span className="text-2xl">🐱</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">AI Companion Insight</div>
                        <p className="text-foreground/90 text-sm leading-relaxed font-medium">"{aiInsight}"</p>
                    </div>
                </div>
            </motion.div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Score */}
                <motion.div 
                    className="md:col-span-1 bg-foreground/5 border border-foreground/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center gap-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Focus Score</div>
                    <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-foreground/5" />
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                strokeDasharray={351.85} 
                                strokeDashoffset={351.85 - (351.85 * metrics.focusScore) / 100}
                                className={`${metrics.focusScore >= 70 ? 'text-green-500' : metrics.focusScore <= 40 ? 'text-red-500' : 'text-yellow-500'} transition-all duration-1500 ease-out`} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black">{metrics.focusScore}%</span>
                        </div>
                    </div>
                    <div className="text-xs text-foreground/50">
                        {metrics.focusScore > 80 ? 'Masterful Focus' : metrics.focusScore > 50 ? 'Good Session' : 'Needs Calibrating'}
                    </div>
                </motion.div>

                {/* Stats Breakdown */}
                <motion.div 
                    className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 flex flex-col justify-between">
                         <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2"><Target size={14} className="text-green-500" /> Deep Work Time</div>
                         <div className="text-3xl font-black text-foreground">{metrics.totalFocus} <span className="text-lg text-foreground/50">hrs</span></div>
                    </div>
                    <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 flex flex-col justify-between">
                         <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2"><Activity size={14} className="text-blue-500" /> Productive Used</div>
                         <div className="text-3xl font-black text-foreground">{formatTime(metrics.productive)}</div>
                    </div>
                    <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 flex flex-col justify-between col-span-1 sm:col-span-2">
                         <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2"><Clock size={14} className="text-red-500" /> Distraction Time</div>
                         <div className="w-full">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-xl font-bold text-foreground">{formatTime(metrics.distracting)}</div>
                                <div className="text-xs font-semibold text-red-500/80 uppercase tracking-wider">{metrics.distracting > 120 ? 'High' : metrics.distracting > 60 ? 'Medium' : 'Low'}</div>
                            </div>
                            <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${metrics.distracting > 120 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, (metrics.distracting / 240) * 100)}%` }} />
                            </div>
                         </div>
                    </div>
                </motion.div>

                {/* Top Apps Table */}
                <motion.div 
                    className="md:col-span-3 bg-foreground/5 border border-foreground/10 rounded-3xl p-6 lg:p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-6">Applications & Sites Breakdown</div>
                    
                    <div className="space-y-4">
                        {topApps.length === 0 ? (
                            <div className="text-center py-8 text-sm text-foreground/50">No activity data logged today.</div>
                        ) : topApps.map((app, i) => (
                            <div key={i} className="flex items-center justify-between group p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${app.category === 'Productive' ? 'bg-green-500' : app.category === 'Distracting' ? 'bg-red-500' : 'bg-gray-500'}`} />
                                    <span className="font-semibold text-sm">{app.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{app.category}</span>
                                     <span className="text-sm font-black tabular-nums">{formatTime(Math.round(app.duration / 60))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    </div>
  );
}