"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CatEyes from "@/components/Eyes";
import Timer from "@/components/Timer";
import { SettingsButton } from "@/components/SettingsButton";
import TaskSection from "@/components/widgets/TaskSection";
import AppTracker from "@/components/widgets/AppTracker";
import TabTracker from "@/components/widgets/TabTracker";
import { ReportWidget } from "@/components/widgets/ReportWidget";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { LogOut, LayoutGrid, EyeOff } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import CompletionToast from "@/components/CompletionToast";

type TimerState = "idle" | "running" | "paused";
type TimerMode = "countup" | "countdown";

export default function Home() {
  const { data: session } = useSession();
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [mode, setMode] = useState<TimerMode>("countup");
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

  // Load user settings from API
  const loadUserSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setUserInfo({ name: data.name || session?.user?.name || "", avatar: data.avatar || "users-1.svg" });
        setMode(data.mode || "countup");
        setWidgets(prev => ({ ...prev, ...data.widgets }));
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadUserSettings();
    }
  }, [session, loadUserSettings]);

  useEffect(() => {
    window.addEventListener('user-settings-changed', loadUserSettings);
    return () => window.removeEventListener('user-settings-changed', loadUserSettings);
  }, [loadUserSettings]);


  // Persist mode and other settings when they change
  useEffect(() => {
    if (!session) return;
    const saveSettings = async () => {
       await fetch('/api/settings', {
         method: 'POST',
         body: JSON.stringify({ mode, widgets })
       });
    };
    // Debounce this or only trigger on specific changes
    // For now, let's just use it sparingly
  }, [mode, widgets, session]);

  const toggleAllWidgets = () => {
    // Check if any widget is on. If so, turn them all off. Otherwise, turn them all on.
    const anyOn = widgets.tasks || widgets.activity || widgets.rain || widgets.tabHistory;
    const newState = !anyOn;
    setWidgets({
      tasks: newState,
      activity: newState,
      rain: newState,
      tabHistory: newState,
    });
  };

  const getMoodFromState = (state: TimerState) => {
    switch (state) {
      case "running": return "happy";
      case "paused": return "serious";
      default: return "neutral";
    }
  };

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const Component = widgets.rain ? BackgroundBeamsWithCollision : "div";

  return (
    <Component className={widgets.rain ? "min-h-screen" : "relative min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-500"}>

      {/* Navbar (Top Right) */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={toggleAllWidgets}
          className="p-3 rounded-full bg-foreground/5 dark:bg-foreground/5 backdrop-blur-md border border-foreground/10 shadow-lg hover:scale-110 active:scale-95 transition-all group"
          title="Toggle All Widgets"
        >
          {widgets.tasks || widgets.activity || widgets.rain || widgets.tabHistory ? (
            <EyeOff className="w-5 h-5 text-foreground opacity-70 group-hover:opacity-100 transition-all duration-300" />
          ) : (
            <LayoutGrid className="w-5 h-5 text-foreground opacity-70 group-hover:opacity-100 transition-all duration-300" />
          )}
        </button>
        <SettingsButton />
      </div>

      {/* Main Layout Container */}
      <div className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-8 lg:gap-0">
        
        {/* Left Side: App Tracker (Desktop) */}
        <div className="lg:fixed lg:bottom-12 lg:left-12 z-40 w-full lg:w-auto flex flex-col items-center lg:items-start animate-enter [animation-delay:200ms] gap-6">
          <AnimatePresence>
            {widgets.activity && <AppTracker />}
          </AnimatePresence>

          <AnimatePresence>
            {widgets.activity && <ReportWidget />}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold truncate max-w-[120px]">
                {userInfo.name || "Stray Cat"}
              </span>
              <button 
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 cursor-pointer p-0.5"
                title="Log out"
              >
                <LogOut size={12} />
              </button>
            </div>
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
