"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock, History } from "lucide-react";

interface TabSession {
  id: number;
  title: string;
  domain: string;
  duration: number;
  startTime: number;
  endTime: number;
}

interface DomainTotal {
  title: string;
  totalDuration: number;
  visits: number;
}

export default function TabActivityTracker() {
  const [sessions, setSessions] = useState<TabSession[]>([]);
  const [totals, setTotals] = useState<Record<string, DomainTotal>>({});
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  // Fetch data from extension
  useEffect(() => {
    window.postMessage({ type: "MEOW_GET_DATA" }, "*");

    const handler = (event: MessageEvent) => {
      if (event.data.type === "MEOW_DATA_RESPONSE") {
        setExtensionInstalled(true);
        setSessions(event.data.payload.sessions || []);
        setTotals(event.data.payload.totals || {});
      }
    };

    window.addEventListener("message", handler);

    const timeout = setTimeout(() => {
      if (!extensionInstalled) {
        console.warn("Meow extension not detected.");
      }
    }, 1000);

    return () => {
      window.removeEventListener("message", handler);
      clearTimeout(timeout);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const sortedTotals = Object.entries(totals)
    .sort((a, b) => b[1].totalDuration - a[1].totalDuration);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-24 right-8 w-72 bg-foreground/[0.04] border border-foreground/[0.15] backdrop-blur-xl rounded-[2rem] p-6 flex flex-col gap-6 z-50 shadow-2xl"
    >
      {/* Extension Check */}
      {!extensionInstalled && (
        <div className="text-xs text-center opacity-50">
          Install Meow Extension to enable tracking
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History size={14} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            Recent Activity
          </h2>
        </div>

        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {sessions.slice(-5).reverse().map((session) => (
            <div
              key={session.id}
              className="p-3 rounded-xl bg-foreground/5"
            >
              <div className="flex justify-between text-xs opacity-50">
                <span>{session.domain}</span>
                <span>{formatDuration(session.duration)}</span>
              </div>
              <div className="text-xs font-bold truncate">
                {session.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-foreground/10" />

      {/* Aggregated Totals */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            Total Today
          </h2>
        </div>

        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {sortedTotals.map(([domain, data]) => (
            <div
              key={domain}
              className="p-3 rounded-xl bg-foreground/5 flex justify-between text-xs"
            >
              <span className="truncate">{domain}</span>
              <span className="font-bold">
                {formatDuration(data.totalDuration)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}