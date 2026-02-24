"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CatEyes from "@/components/Eyes";
import Timer from "@/components/Timer";
import { SettingsButton } from "@/components/SettingsButton";
import TaskSection from "@/components/widgets/TaskSection";
import ActivityTracker from "@/components/widgets/ActivityTracker";
import CompletionToast from "@/components/CompletionToast";
// import WalkingCat from "@/components/WalkingCat";

type TimerState = "idle" | "running" | "paused";
type TimerMode = "countup" | "countdown";

export default function Home() {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [mode, setMode] = useState<TimerMode>("countup");
  const [catXFraction, setCatXFraction] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState({ name: "", avatar: "users-1.svg" });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [lastSessionTime, setLastSessionTime] = useState(0);
  const [widgets, setWidgets] = useState({
    tasks: true,
    activity: true,
  });

  // Load user settings
  const loadUserSettings = useCallback(() => {
    const name = localStorage.getItem("meow-username") || "";
    const avatar = localStorage.getItem("meow-avatar") || "users-1.svg";
    const savedMode = localStorage.getItem("meow-mode") as TimerMode;
    const savedActiveTask = localStorage.getItem("meow-active-task");
    const savedState = localStorage.getItem("meow-timer-state") as TimerState;
    const storedWidgets = localStorage.getItem("meow-widgets");

    setUserInfo({ name, avatar });
    if (savedMode) setMode(savedMode);
    if (savedActiveTask) setActiveTaskId(savedActiveTask);
    if (savedState) setTimerState(savedState);
    if (storedWidgets) {
      try {
        setWidgets(JSON.parse(storedWidgets));
      } catch (e) {
        console.error("Failed to parse widgets", e);
      }
    }
  }, []);

  useEffect(() => {
    loadUserSettings();
    window.addEventListener('user-settings-changed', loadUserSettings);
    return () => window.removeEventListener('user-settings-changed', loadUserSettings);
  }, [loadUserSettings]);

  // Persist mode and active task
  useEffect(() => {
    if (mode) localStorage.setItem("meow-mode", mode);
  }, [mode]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem("meow-active-task", activeTaskId);
    } else {
      localStorage.removeItem("meow-active-task");
    }
  }, [activeTaskId]);

  const getMoodFromState = (state: TimerState) => {
    switch (state) {
      case "running": return "serious";
      case "paused": return "sleeping";
      default: return "neutral";
    }
  };

  const handleCatPosition = useCallback((xFrac: number) => {
    setCatXFraction(xFrac);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setShowCompletion(true);
  }, []);

  const handleSessionEnd = useCallback((duration: number) => {
    setLastSessionTime(duration);
    if (activeTaskId) {
      window.dispatchEvent(new CustomEvent("meow-focus-update", {
        detail: { taskId: activeTaskId, duration }
      }));
    }
  }, [activeTaskId]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-foreground/[0.03] blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-foreground/[0.03] blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <SettingsButton />

      {/* User Profile Hook */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 flex items-center gap-3 z-40 select-none group transition-all"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <img
            src={`/Avatars Icons/users-insights-svg-icons/${userInfo.avatar}`}
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] leading-none mb-1">Welcome</span>
          <span className="text-xs font-bold truncate max-w-[120px]">
            {userInfo.name || "Guest"}
          </span>
        </div>
      </motion.div>

      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 select-none pointer-events-none transition-opacity duration-500">
          {timerState === "idle" ? "Ready to focus" : timerState === "running" ? "Deep Work" : "Resting"}
        </span>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center -translate-y-8 w-full max-w-4xl px-6">
        <div className="flex flex-col items-center gap-12 lg:gap-16 w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="transition-all duration-700 hover:scale-105 active:scale-95 cursor-pointer">
              <CatEyes
                baseMood={getMoodFromState(timerState)}
                catXFraction={catXFraction}
              />
            </div>
          </div>

          <Timer
            mode={mode}
            onModeChange={setMode}
            onStateChange={setTimerState}
            onComplete={handleTimerComplete}
            onSessionEnd={handleSessionEnd}
          />
        </div>
      </main>

      <AnimatePresence>
        {widgets.tasks && (
          <TaskSection
            activeTaskId={activeTaskId}
            onSetActiveTask={setActiveTaskId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {widgets.activity && (
          <ActivityTracker />
        )}
      </AnimatePresence>

      <CompletionToast
        show={showCompletion}
        onClose={() => setShowCompletion(false)}
        message="Session Complete"
        subMessage={`Nice. You focused for ${Math.floor(lastSessionTime / 60)}m ${lastSessionTime % 60}s 🎯`}
      />

      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="mode-toggle-wrapper px-1 py-1">
            <div className="mode-toggle relative flex w-[260px] h-[40px] bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-md rounded-full">
              <motion.div
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-foreground rounded-full shadow-lg"
                animate={{ x: mode === "countup" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                className={`flex-1 relative z-10 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${mode === "countup" ? "text-background" : "text-foreground opacity-50 hover:opacity-100"}`}
                onClick={() => setMode("countup")}
              >
                Count Up
              </button>
              <button
                className={`flex-1 relative z-10 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${mode === "countdown" ? "text-background" : "text-foreground opacity-50 hover:opacity-100"}`}
                onClick={() => setMode("countdown")}
              >
                Count Down
              </button>
            </div>
          </div>

          <span className="text-[9px] tracking-[0.4em] uppercase font-bold opacity-40 pointer-events-none text-center">
            Meow Focus Companion
          </span>
        </div>
      </footer>

      {/* Walking cat lives at the bottom of the screen */}
      {/* <WalkingCat onPositionChange={handleCatPosition} /> */}

      <style jsx global>{`
        @keyframes bg-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse {
          animation: bg-pulse 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
