"use client";

import { useSystemTracker } from "@/hooks/useSystemTracker";
import { ReportSidebar } from "@/components/layouts/ReportSidebar";
import { motion } from "framer-motion";
import { MonitorSmartphone } from "lucide-react";
import { useMemo } from "react";

export default function AppReportPage() {
  const { stats, status } = useSystemTracker();

  const appData = useMemo(() => {
    const apps = stats.sessions.filter((s) => s.type === "app");
    
    const totals = Object.entries(stats.appTotals)
      .sort((a, b) => b[1].totalDuration - a[1].totalDuration)
      .map(([app, data]) => ({ app, ...data }));

    return { sessions: apps, totals };
  }, [stats]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] font-[family-name:var(--font-malinton)] flex flex-col md:flex-row">
      <ReportSidebar />

      <div className="flex-1 p-6 lg:p-12 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tight flex items-center gap-4">
              <MonitorSmartphone className="text-purple-500 w-12 h-12" /> App Tracking
            </h1>
            <p className="text-foreground/50 text-sm lg:text-base font-medium">
              Detailed breakdown of your desktop application activity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Apps */}
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-6">
                Most Used Applications
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {appData.totals.length === 0 ? (
                  <div className="text-center py-8 text-sm text-foreground/50">
                    {status === "connected" ? "No app data logged yet." : "System Offline. Desktop app might not be running."}
                  </div>
                ) : (
                  appData.totals.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group py-3 hover:bg-foreground/5 transition-colors border-b border-foreground/5 last:border-0"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden pr-4">
                        <span className="font-bold text-sm truncate">
                          {item.app}
                        </span>
                      </div>
                      <div className="text-sm font-black tabular-nums shrink-0 text-right">
                        {formatDuration(item.totalDuration)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-6">
                Recent App Sessions
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {appData.sessions.length === 0 ? (
                  <div className="text-center py-8 text-sm text-foreground/50">
                    No recent sessions.
                  </div>
                ) : (
                  appData.sessions.slice(0, 50).map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0"
                    >
                      <div className="flex flex-col overflow-hidden pr-4">
                        <span className="text-[10px] font-bold opacity-50 mb-0.5 truncate">
                          {session.app}
                        </span>
                        <span className="text-xs font-semibold truncate">
                          {session.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold shrink-0 opacity-80">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
