"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, History, Maximize2 } from "lucide-react";
import { useSystemTracker } from "@/hooks/useSystemTracker";
import { TabModal } from "../pages/TabModal";

interface TabTrackerProps {
  className?: string;
}

export default function TabTracker({ className }: TabTrackerProps) {
  const { logTabActivity, stats, status } = useSystemTracker();
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from extension
  useEffect(() => {
    const requestData = () => {
      window.postMessage({ type: "MEOW_GET_DATA" }, "*");
    };

    // Request immediately and then every 1 second to sync new sessions
    requestData();
    const interval = setInterval(requestData, 1000);

    const handler = (event: MessageEvent) => {
      if (event.data.type === "MEOW_DATA_RESPONSE") {
        setExtensionInstalled(true);
        const sessions = event.data.payload.sessions || [];

        // Get already tracked IDs from stats
        const trackedIds = new Set(stats.sessions.filter(s => s.type === 'tab').map(s => s.id));

        // Only log new sessions that haven't been tracked yet
        sessions.forEach((s: any) => {
          if (!trackedIds.has(s.id)) {
            logTabActivity(s.domain, s.title, s.duration, s.id);
          }
        });
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
      clearInterval(interval);
    };
  }, [logTabActivity, stats.sessions]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Filter for tabs in the unified stats - Limit to 2 for the widget view
  const recentTabs = stats.sessions
    .filter(s => s.type === 'tab')
    .slice(-2)
    .reverse();

  const tabTotals = Object.entries(stats.totals)
    .filter(([key]) => {
      // Improved heuristic for domains vs apps
      const isApp = key.toLowerCase().endsWith('.exe') || key.includes(' ');
      const hasDomainPattern = key.includes('.') && key.split('.').pop()!.length >= 2;
      return hasDomainPattern && !isApp;
    })
    .sort((a, b) => b[1].totalDuration - a[1].totalDuration)
    .slice(0, 2);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full md:w-72 bg-foreground/4 border border-foreground/15 backdrop-blur-xl rounded-4xl p-6 flex flex-col gap-6 group transition-all shadow-2xl hover:border-foreground/30 ${className}`}
        style={{ fontFamily: 'var(--font-malinton)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest font-semibold opacity-30">Sync Status</span>
            <span className={`text-[8px] uppercase font-bold ${status === 'connected' ? 'text-green-500/60' : 'text-red-500/60'}`}>
              {status === 'connected' ? '● System Connected' : '○ System Offline'}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 hover:bg-foreground/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {!extensionInstalled && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500/80 font-bold leading-relaxed">
            Browser Extension Missing. Install to enable tab tracking.
          </div>
        )}

        {/* Recent Sessions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={14} />
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-40">
              Recent Tabs
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {recentTabs.map((session, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-foreground/5"
              >
                <div className="flex justify-between text-[10px] opacity-50 mb-1">
                  <span className="truncate max-w-30">{session.domain}</span>
                  <span>{formatDuration(session.duration)}</span>
                </div>
                <div className="text-[11px] font-bold truncate">
                  {session.title}
                </div>
              </div>
            ))}
            {recentTabs.length === 0 && (
              <div className="text-[10px] opacity-20 text-center py-4">No data tracked yet</div>
            )}
          </div>
        </div>
      </motion.div>

      <TabModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
