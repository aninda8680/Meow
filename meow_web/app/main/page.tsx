"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CatEyes from "@/components/Eyes";
import Timer from "@/components/Timer";
import { SettingsButton } from "@/components/SettingsButton";
import TaskSection from "@/components/widgets/TaskSection";
import AppTracker from "@/components/widgets/AppTracker";
import TabTracker from "@/components/widgets/TabTracker";
import CompletionToast from "@/components/CompletionToast";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
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
    rain: true,
    tabHistory: true,
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
        const parsed = JSON.parse(storedWidgets);
        setWidgets(prev => ({ ...prev, ...parsed }));
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

  const Component = widgets.rain ? BackgroundBeamsWithCollision : "div";

  return (
    <Component className={widgets.rain ? "min-h-screen" : "relative min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-500"}>

      <SettingsButton />

      {/* Main Layout Container */}
      <div className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-8 lg:gap-0">
        
        {/* Left Side: App Tracker (Desktop) */}
        <div className="lg:fixed lg:bottom-12 lg:left-12 z-40 w-full lg:w-auto flex flex-col items-center lg:items-start animate-enter [animation-delay:200ms]">
          <AnimatePresence>
            {widgets.activity && <AppTracker />}
          </AnimatePresence>
        </div>

        {/* Center: Hero Section (Eyes & Timer) */}
        <main className="flex flex-col items-center justify-center gap-12 lg:gap-16 w-full max-w-2xl z-10 lg:-translate-y-8">
           {/* Branding (Mobile) */}
           <div className="lg:hidden flex flex-col items-center gap-2 mb-4 opacity-40">
             <span className="text-[10px] font-semibold uppercase tracking-[0.5em]">Meow Companion</span>
           </div>

          <div className="flex flex-col items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="transition-all duration-700 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <CatEyes
                baseMood={getMoodFromState(timerState)}
                catXFraction={catXFraction}
              />
            </motion.div>
          </div>

          <Timer
            mode={mode}
            onModeChange={setMode}
            onStateChange={setTimerState}
            onComplete={handleTimerComplete}
            onSessionEnd={handleSessionEnd}
          />
        </main>

        {/* Right Side: Tasks & Tab History (Desktop) */}
        <div className="lg:fixed lg:top-12 lg:right-12 lg:bottom-12 z-40 w-full lg:w-auto flex flex-col gap-6 items-center lg:items-end lg:justify-between animate-enter [animation-delay:400ms]">
          <div className="w-full lg:w-auto">
            <AnimatePresence>
              {widgets.tasks && (
                <TaskSection
                  activeTaskId={activeTaskId}
                  onSetActiveTask={setActiveTaskId}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="w-full lg:w-auto">
            <AnimatePresence>
              {widgets.tabHistory && (
                <TabTracker />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Profile Hook */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:fixed top-6 left-6 flex items-center gap-3 z-50 select-none group transition-all p-4 lg:p-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity border border-foreground/10">
            <img
              src={`/Avatars Icons/users-insights-svg-icons/${userInfo.avatar}`}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] leading-none mb-1">Pilot</span>
            <span className="text-xs font-semibold truncate max-w-[120px]">
              {userInfo.name || "Stray Cat"}
            </span>
          </div>
        </motion.div>
      </div>

      <CompletionToast
        show={showCompletion}
        onClose={() => setShowCompletion(false)}
        message="Session Complete"
        subMessage={`Nice. You focused for ${Math.floor(lastSessionTime / 60)}m ${lastSessionTime % 60}s 🎯`}
      />

      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none lg:pointer-events-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="mode-toggle-wrapper px-1 py-1 pointer-events-auto">
            <div className="mode-toggle relative flex w-[260px] h-[40px] bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-md rounded-full overflow-hidden">
              <motion.div
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-foreground rounded-full shadow-lg"
                animate={{ x: mode === "countup" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                className={`flex-1 relative z-10 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300 ${mode === "countup" ? "text-background" : "text-foreground opacity-50 hover:opacity-100"}`}
                onClick={() => setMode("countup")}
              >
                Count Up
              </button>
              <button
                className={`flex-1 relative z-10 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300 ${mode === "countdown" ? "text-background" : "text-foreground opacity-50 hover:opacity-100"}`}
                onClick={() => setMode("countdown")}
              >
                Count Down
              </button>
            </div>
          </div>
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
    </Component>
  );
}
