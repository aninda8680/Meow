"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Timer from "@/components/Timer";
import { SettingsButton } from "@/components/SettingsButton";
import TaskSection from "@/components/widgets/TaskSection";
import AppTracker from "@/components/widgets/AppTracker";
import TabTracker from "@/components/widgets/TabTracker";
import { ReportWidget } from "@/components/widgets/ReportWidget";

import QuickNotes from "@/components/widgets/QuickNotes";
import { LogOut, LayoutGrid, EyeOff, Monitor, StickyNote, Globe, Target } from "lucide-react";
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
  // Ref to the sendModeChange fn exposed by Timer (used to push mode to master clock/notch)
  const sendModeChangeRef = useRef<((mode: TimerMode) => void) | null>(null);
  const [widgets, setWidgets] = useState({
    appTracker: true,
    tabHistory: true,
    quickNotes: true,
    focusReport: true,
    tasks: true,
  });

  const [isUIVisible, setIsUIVisible] = useState(true);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetUITimeout = useCallback(() => {
    setIsUIVisible(true);
    if (uiTimeoutRef.current) {
      clearTimeout(uiTimeoutRef.current);
    }
    uiTimeoutRef.current = setTimeout(() => {
      setIsUIVisible(false);
    }, 2500); // Hide UI after 2.5s of inactivity
  }, []);

  useEffect(() => {
    // Start the timer when mounted
    resetUITimeout();

    const handleMouseMove = () => {
      resetUITimeout();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [resetUITimeout]);

  // Load user settings from API
  const loadUserSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setUserInfo({ name: data.name || session?.user?.name || "", avatar: data.avatar || "users-1.svg" });
        setMode(data.mode || "countup");
        if (data.widgets) {
          // Migrate old 'activity' toggle to new split toggles
          const w = { ...data.widgets };
          if ('activity' in w && !('appTracker' in w)) {
            w.appTracker = w.activity;
            w.focusReport = w.activity;
            delete w.activity;
          }
          setWidgets(prev => ({ ...prev, ...w }));
        }
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

  const saveSettingsToApi = async (updates: any) => {
    try {
       await fetch('/api/settings', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(updates)
       });
    } catch (e) {
       console.error("Failed to save settings", e);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    // Push mode to the master clock / notch if Electron is connected
    if (sendModeChangeRef.current) {
      sendModeChangeRef.current(newMode);
    }
    if (session) saveSettingsToApi({ mode: newMode, widgets });
  };

  // Capture the sendModeChange fn from Timer
  const handleSendModeChange = useCallback((fn: (mode: TimerMode) => void) => {
    sendModeChangeRef.current = fn;
  }, []);

  const toggleAllWidgets = () => {
    const anyOn = widgets.tasks || widgets.appTracker || widgets.tabHistory || widgets.quickNotes || widgets.focusReport;
    const newState = !anyOn;
    const newWidgets = {
      tasks: newState,
      appTracker: newState,
      tabHistory: newState,
      quickNotes: newState,
      focusReport: newState,
    };
    setWidgets(newWidgets);
    if (session) saveSettingsToApi({ mode, widgets: newWidgets });
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

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-500">


      {/* Navbar (Top-Attached Tab) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex items-start justify-center pointer-events-none">
        <AnimatePresence>
          {isUIVisible && (
            <motion.div 
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              whileHover={{ scale: 1.02 }}
              className="group relative flex items-center gap-2 bg-foreground/10 dark:bg-black/40 backdrop-blur-2xl px-6 py-2 rounded-b-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-500 pointer-events-auto"
            >
              <button
                onClick={toggleAllWidgets}
                className="p-3 rounded-xl hover:bg-foreground/5 active:scale-90 transition-all group/btn"
                title="Toggle All Widgets"
              >
                {widgets.tasks || widgets.appTracker || widgets.tabHistory || widgets.quickNotes || widgets.focusReport ? (
                  <EyeOff className="w-5 h-5 text-foreground/70 group-hover/btn:text-foreground transition-all duration-300" />
                ) : (
                  <LayoutGrid className="w-5 h-5 text-foreground/70 group-hover/btn:text-foreground transition-all duration-300" />
                )}
              </button>

              {/* Vertical Separator */}
              <div className="w-[1px] h-6 bg-foreground/10 mx-1" />

              <SettingsButton className="!bg-transparent !border-none !shadow-none !p-3 rounded-xl hover:bg-foreground/5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════ DESKTOP WIDGETS (Direct on Dashboard) ═══════════ */}
      <div className="hidden lg:block pointer-events-none fixed inset-0 z-10">
        <AnimatePresence>
          {widgets.appTracker && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="absolute top-24 left-6 pointer-events-auto w-72 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
              <AppTracker />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {widgets.quickNotes && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="absolute bottom-32 left-6 pointer-events-auto w-72 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
              <QuickNotes />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {widgets.tasks && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }} 
              className="absolute top-24 right-6 pointer-events-auto w-72 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
              <TaskSection
                activeTaskId={activeTaskId}
                onSetActiveTask={setActiveTaskId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {widgets.tabHistory && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }} 
              className="absolute bottom-32 right-6 pointer-events-auto w-72 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
              <TabTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════ CENTER HERO ═══════════ */}

      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Center: Hero Section (Eyes & Timer) */}
        <main className="flex flex-col items-center justify-center gap-12 lg:gap-16 w-full max-w-2xl z-10">
           {/* Branding (Mobile) */}
           <div className="lg:hidden flex flex-col items-center gap-2 mb-4 opacity-40">
             <span className="text-[10px] font-semibold uppercase tracking-[0.5em]">Meow Companion</span>
           </div>



          <Timer
            mode={mode}
            onModeChange={setMode}
            onSendModeChange={handleSendModeChange}
            onStateChange={setTimerState}
            onComplete={handleTimerComplete}
            onSessionEnd={handleSessionEnd}
          />
        </main>

        {/* ═══════════ MOBILE WIDGETS (stacked below hero) ═══════════ */}
        <div className="lg:hidden flex flex-col gap-4 w-full max-w-sm mt-12">
          <AnimatePresence mode="wait">
            {widgets.appTracker && <AppTracker key="app-tracker-mobile" />}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {widgets.tasks && (
              <TaskSection
                key="task-section-mobile"
                activeTaskId={activeTaskId}
                onSetActiveTask={setActiveTaskId}
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {widgets.quickNotes && <QuickNotes key="quick-notes-mobile" />}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {widgets.tabHistory && <TabTracker key="tab-tracker-mobile" />}
          </AnimatePresence>
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

      {/* ═══════════ BOTTOM BAR: Report Strip + Mode Toggle ═══════════ */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-3 pb-6">
        {/* Report Strip */}
        <AnimatePresence>
          {widgets.focusReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto"
            >
              <ReportWidget />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Toggle */}
        <AnimatePresence>
          {isUIVisible && (
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center gap-4 pointer-events-auto"
            >
              <div className="mode-toggle-wrapper px-1 py-1">
                <div className="mode-toggle relative flex w-[260px] h-[40px] bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-md rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-foreground rounded-full shadow-lg"
                    animate={{ x: mode === "countup" ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button
                    className={`flex-1 relative z-10 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300 ${mode === "countup" ? "text-background" : "text-foreground opacity-50 hover:opacity-100"}`}
                    onClick={() => handleModeChange("countup")}
                  >
                    Count Up
                  </button>
                  <button
                    className={`flex-1 relative z-10 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300 ${mode === "countdown" ? "text-background" : "text-foreground opacity-50 hover:opacity-100"}`}
                    onClick={() => handleModeChange("countdown")}
                  >
                    Count Down
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>

      <style jsx global>{`
        @keyframes bg-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse {
          animation: bg-pulse 8s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--foreground-rgb), 0.1);
          border-radius: 10px;
        }
      `}
      </style>
    </div>
  );
}
