"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { History, Maximize2 } from "lucide-react";
import { useSystemTracker, globalSyncedTabIds } from "@/hooks/useSystemTracker";
import { TabModal } from "../pages/TabModal";

interface TabTrackerProps {
  className?: string;
}

export default function TabTracker({ className }: TabTrackerProps) {
  const { logTabActivity, stats, status } = useSystemTracker();
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FIX #4: logTabActivity is stable (useCallback with no deps), so this effect
  // only mounts once and never tears down / re-registers on stat updates.
  // FIX #2: Uses module-level globalSyncedTabIds instead of a component useRef,
  // so the set persists across unmounts, remounts, and page navigations.
  useEffect(() => {
    const requestData = () => {
      window.postMessage({ type: "MEOW_GET_DATA" }, "*");
    };

    requestData();
    const interval = setInterval(requestData, 1000);

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "MEOW_DATA_RESPONSE") return;

      console.log("📤 Dashboard received data from Extension");
      setExtensionInstalled(true);
      const sessions: Array<{ id: number; domain: string; title: string; duration: number }> =
        event.data.payload?.sessions || [];

      sessions.forEach((s) => {
        // FIX #2: globalSyncedTabIds is module-level — never resets on re-render/remount
        if (!globalSyncedTabIds.has(s.id)) {
          globalSyncedTabIds.add(s.id);
          logTabActivity(s.domain, s.title, s.duration, s.id);
        }
      });
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
      clearInterval(interval);
    };
  }, [logTabActivity]); // stable dep — effect never re-registers due to stat changes

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // FIX #3 + #5: Use stats.tabTotals directly (no heuristics needed).
  // getStats() sorts sessions newest-first, so .slice(0, N) gives the most recent.
  const recentTabs = stats.sessions
    .filter(s => s.type === 'tab')
    .slice(0, 2); // newest-first from backend — correct order

  const tabTotals = Object.entries(stats.tabTotals)
    .sort((a, b) => b[1].totalDuration - a[1].totalDuration)
    .slice(0, 2);

  return (
    <>
      <div
        className={`w-full bg-foreground/4 border border-foreground/15 backdrop-blur-xl rounded-4xl p-6 flex flex-col gap-6 group transition-all shadow-2xl hover:border-foreground/30 ${className}`}
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
                key={session.id ?? idx}
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
      </div>

      <TabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
