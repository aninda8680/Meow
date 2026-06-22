"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Play, Pause, Square, Timer, Phone, PhoneOff,
  PhoneMissed, Smartphone, Shield, Zap, Clock, SkipForward,
  Bell, BellOff, Wifi, WifiOff, Focus
} from "lucide-react";

type SessionState = "idle" | "running" | "paused";
type TimerMode = "stopwatch" | "pomodoro" | "countdown";

const POMODORO_DURATIONS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "1 hour", seconds: 60 * 60 },
  { label: "Unlimited", seconds: 0 },
];

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Mock incoming call popup
function IncomingCallPopup({ onClose }: { onClose: () => void }) {
  const [ringing, setRinging] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setRinging(p => p + 1), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-6 right-6 z-[200] w-80"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-2xl opacity-30"
          style={{ background: "radial-gradient(ellipse at top, rgba(34,197,94,0.3) 0%, transparent 70%)" }} />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-400/80">Incoming Call</span>
            <span className="ml-auto text-[10px] font-mono text-white/30">{ringing}s</span>
          </div>

          {/* Caller info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👩</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black flex items-center justify-center">
                <Phone size={8} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-base tracking-tight">Mom</p>
              <p className="text-white/40 text-xs font-mono mt-0.5">+91 98765 43210</p>
              <p className="text-white/30 text-[10px] mt-1 uppercase tracking-widest">Mobile</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all active:scale-95">
              <Phone size={16} className="text-green-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">Accept</span>
            </button>
            <button
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all active:scale-95"
            >
              <PhoneOff size={16} className="text-red-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Decline</span>
            </button>
            <button
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
            >
              <BellOff size={16} className="text-white/50" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Silence</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FocusSyncPage() {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [timerMode, setTimerMode] = useState<TimerMode>("stopwatch");
  const [elapsed, setElapsed] = useState(0);
  const [selectedPomodoro, setSelectedPomodoro] = useState(POMODORO_DURATIONS[0]);
  const [remaining, setRemaining] = useState(POMODORO_DURATIONS[0].seconds);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [allowedContacts, setAllowedContacts] = useState(["Mom", "Dad", "Boss"]);
  const [dndActive, setDndActive] = useState(false);

  // Stopwatch tick
  useEffect(() => {
    if (sessionState !== "running") return;
    const id = setInterval(() => {
      setElapsed(p => p + 1);
      if (timerMode === "pomodoro" && selectedPomodoro.seconds > 0) {
        setRemaining(p => Math.max(0, p - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sessionState, timerMode, selectedPomodoro]);

  const startSession = () => {
    setSessionState("running");
    setElapsed(0);
    if (timerMode === "pomodoro") setRemaining(selectedPomodoro.seconds);
    if (phoneConnected) setDndActive(true);
  };

  const pauseSession = () => setSessionState(p => p === "running" ? "paused" : "running");

  const stopSession = () => {
    setSessionState("idle");
    setElapsed(0);
    setRemaining(selectedPomodoro.seconds);
    setDndActive(false);
  };

  const displayTime = timerMode === "pomodoro" && selectedPomodoro.seconds > 0
    ? formatTime(remaining)
    : formatTime(elapsed);

  const progress = timerMode === "pomodoro" && selectedPomodoro.seconds > 0
    ? 1 - remaining / selectedPomodoro.seconds
    : 0;

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(60px)" }} />
        {sessionState === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
          />
        )}
      </div>

      {/* HUD — top left */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 opacity-30">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em]" style={{ fontFamily: "var(--font-malinton)" }}>
          MEOW // FOCUSSYNC
        </span>
      </div>

      {/* Back link */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/portal"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--font-malinton)" }}
        >
          <ArrowLeft size={14} />
          Back to Portal
        </Link>
      </div>

      {/* Incoming call popup */}
      <AnimatePresence>
        {showCallPopup && <IncomingCallPopup onClose={() => setShowCallPopup(false)} />}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">

        {/* ═══ LEFT PANEL — Timer ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Focus size={16} className="text-indigo-400 opacity-70" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400/70">FocusSync</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ fontFamily: "var(--font-malinton)" }}>
              DEEP WORK
            </h1>
            <p className="text-foreground/40 text-xs tracking-widest uppercase mt-2">Tray-based focus & call management</p>
          </motion.div>

          {/* Mode Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-1 p-1 rounded-xl bg-foreground/5 border border-foreground/[0.08] mb-10"
          >
            {(["stopwatch", "pomodoro", "countdown"] as TimerMode[]).map(m => (
              <button
                key={m}
                onClick={() => { if (sessionState === "idle") setTimerMode(m); }}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  timerMode === m
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "text-foreground/40 hover:text-foreground/70"
                } ${sessionState !== "idle" ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {m === "stopwatch" ? "Stopwatch" : m === "pomodoro" ? "Pomodoro" : "Countdown"}
              </button>
            ))}
          </motion.div>

          {/* Circular Timer */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="relative mb-10"
          >
            <svg width="220" height="220" className="-rotate-90">
              <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              {sessionState !== "idle" && (
                <motion.circle
                  cx="110" cy="110" r="90" fill="none"
                  stroke="url(#timerGradient)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={timerMode === "pomodoro" && selectedPomodoro.seconds > 0
                    ? circumference * (1 - progress)
                    : circumference * 0.75
                  }
                  animate={{ strokeDashoffset: timerMode === "pomodoro" && selectedPomodoro.seconds > 0
                    ? circumference * (1 - progress)
                    : circumference * 0.2
                  }}
                  transition={{ duration: 1 }}
                />
              )}
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sessionState}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  {sessionState === "idle" ? (
                    <>
                      <span className="text-foreground/20 text-2xl font-black tracking-tighter" style={{ fontFamily: "var(--font-malinton)" }}>READY</span>
                      <span className="text-foreground/20 text-[10px] uppercase tracking-widest mt-1">Start a session</span>
                    </>
                  ) : (
                    <>
                      <span className="text-foreground text-4xl font-black tracking-tighter tabular-nums" style={{ fontFamily: "var(--font-malinton)" }}>
                        {displayTime}
                      </span>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${sessionState === "running" ? "bg-indigo-400 animate-pulse" : "bg-amber-400"}`} />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/40">
                          {sessionState === "running" ? "Focus Active" : "Paused"}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Pomodoro duration picker */}
          <AnimatePresence>
            {timerMode === "pomodoro" && sessionState === "idle" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 mb-8 overflow-hidden"
              >
                {POMODORO_DURATIONS.map(d => (
                  <button
                    key={d.label}
                    onClick={() => { setSelectedPomodoro(d); setRemaining(d.seconds); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      selectedPomodoro.label === d.label
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                        : "border-foreground/10 text-foreground/40 hover:border-foreground/30 hover:text-foreground/70"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {sessionState === "idle" ? (
              <button
                onClick={startSession}
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}
              >
                <Play size={16} />
                Start Focus
              </button>
            ) : (
              <>
                <button
                  onClick={pauseSession}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-foreground/20 text-xs font-bold uppercase tracking-wider hover:bg-foreground/5 transition-all active:scale-95"
                >
                  {sessionState === "running" ? <Pause size={14} /> : <Play size={14} />}
                  {sessionState === "running" ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={stopSession}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-red-500/30 text-xs font-bold uppercase tracking-wider text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95"
                >
                  <Square size={14} />
                  End
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* ═══ RIGHT PANEL — Phone & Call Management ═══ */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-foreground/[0.06] p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto"
        >

          {/* Phone Connection */}
          <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone size={14} className={phoneConnected ? "text-green-400" : "text-foreground/30"} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Phone Sync</span>
              </div>
              <button
                onClick={() => setPhoneConnected(p => !p)}
                className={`relative w-10 h-5 rounded-full transition-all ${phoneConnected ? "bg-green-500/80" : "bg-foreground/10"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${phoneConnected ? "left-5.5 left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {phoneConnected ? (
                <motion.div key="connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400/80 font-mono">Device Connected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06]">
                      <Shield size={12} className="text-indigo-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-widest text-foreground/40">DND</p>
                      <p className="text-xs font-bold text-foreground/70 mt-0.5">{sessionState === "running" ? "Active" : "Off"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06]">
                      <Wifi size={12} className="text-green-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-widest text-foreground/40">Sync</p>
                      <p className="text-xs font-bold text-green-400/70 mt-0.5">Live</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="disconnected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-2">
                    <WifiOff size={12} className="text-foreground/20" />
                    <span className="text-[10px] text-foreground/30 font-mono">No device — toggle to simulate</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Allowed Contacts */}
          <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={14} className="text-amber-400/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Priority Contacts</span>
            </div>
            <div className="flex flex-col gap-2">
              {allowedContacts.map(c => (
                <div key={c} className="flex items-center justify-between px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">
                      {c[0]}
                    </div>
                    <span className="text-xs font-semibold text-foreground/70">{c}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-foreground/20 mt-3 uppercase tracking-widest">Calls from these contacts bypass DND</p>
          </div>

          {/* Simulate Call */}
          <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Phone size={14} className="text-foreground/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Call Popup Preview</span>
            </div>
            <p className="text-[10px] text-foreground/30 mb-4 leading-relaxed">
              Simulate an incoming call overlay — appears globally above all your apps during focus sessions.
            </p>
            <button
              onClick={() => setShowCallPopup(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-indigo-500/30 text-indigo-400/70 hover:bg-indigo-500/10 hover:text-indigo-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              <PhoneMissed size={14} />
              Simulate Incoming Call
            </button>
          </div>

          {/* Status Strip */}
          <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-4 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sessionState === "running" ? "bg-indigo-400 animate-pulse" : sessionState === "paused" ? "bg-amber-400" : "bg-foreground/20"}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/30">System Status</span>
              <span className="text-xs font-bold text-foreground/60 mt-0.5">
                {sessionState === "running"
                  ? `Focus Active — ${formatTime(elapsed)}`
                  : sessionState === "paused"
                  ? "Session Paused"
                  : "Standby"}
              </span>
            </div>
            {sessionState === "running" && (
              <div className="ml-auto flex items-center gap-1.5">
                <Zap size={10} className="text-indigo-400/60" />
                <span className="text-[10px] text-indigo-400/60 font-mono">SYNC</span>
              </div>
            )}
          </div>

          {/* Download Tray App CTA */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-indigo-400/60" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/60">Tray App</span>
            </div>
            <p className="text-[10px] text-foreground/30 mb-4 leading-relaxed">
              For the full FocusSync experience — floating timer, always-on-top overlays, and real-time phone sync — use the Meow tray app.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/60">Tray App: In Development</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes timer-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
