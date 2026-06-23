"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TimerState = "idle" | "running" | "paused";
type TimerMode = "countup" | "countdown";

interface TimerProps {
    mode: TimerMode;
    // Called when the Master Clock pushes a mode change (notch → website)
    onModeChange: (mode: TimerMode) => void;
    // Called when the user clicks the mode toggle on the website (website → notch)
    onSendModeChange?: (sendFn: (mode: TimerMode) => void) => void;
    onStateChange?: (state: TimerState) => void;
    onComplete?: () => void;
    onSessionEnd?: (seconds: number) => void;
}

// Larger Minimal SVG Icons
const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
);

const PauseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="3" height="16" fill="currentColor" />
        <rect x="15" y="4" width="3" height="16" fill="currentColor" />
    </svg>
);

const RestartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

export default function Timer({
    mode,
    onModeChange,
    onSendModeChange,
    onStateChange,
    onComplete,
    onSessionEnd
}: TimerProps) {
    const [time, setTime] = useState<number>(0);
    const [isMounted, setIsMounted] = useState(false);
    const [timerState, setTimerState] = useState<TimerState>("idle");
    const [duration, setDuration] = useState<number>(1500); // Default 25m
    const [customMinutes, setCustomMinutes] = useState<string>("25");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const modeRef = useRef<TimerMode>(mode);

    // Keep modeRef in sync so onmessage closure always sees the latest mode
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    // WebSocket setup — runs ONCE on mount, no mode/onModeChange in deps
    useEffect(() => {
        setIsMounted(true);

        const connect = () => {
            const socket = new WebSocket("ws://localhost:5263");

            socket.onopen = () => {
                console.log("Timer connected to Master Clock");
                wsRef.current = socket;
                setWs(socket);
            };

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'TIMER_STATE') {
                        const state = msg.data;
                        setTime(state.seconds);
                        setTimerState(state.isPaused ? (state.seconds === 0 ? "idle" : "paused") : "running");

                        const newMode = state.mode === 'pomodoro' ? 'countdown' : 'countup';
                        if (newMode === 'countdown') {
                            setDuration(state.pomoDuration);
                        }
                        // Use modeRef to avoid stale closure — no WS recreation needed
                        if (modeRef.current !== newMode) {
                            onModeChange(newMode);
                        }
                    }
                } catch (e) {
                    console.error("Timer WebSocket error:", e);
                }
            };

            socket.onclose = () => {
                wsRef.current = null;
                setWs(null);
            };

            return socket;
        };

        const socket = connect();
        return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally empty — we use refs for live values

    // Sync time when mode changes ONLY if idle
    useEffect(() => {
        if (timerState === "idle" && isMounted) {
            if (mode === "countup") {
                setTime(0);
            } else {
                setTime(duration);
            }
        }
    }, [mode, duration, timerState, isMounted]);

    const sendAction = (action: any) => {
        const sock = wsRef.current;
        if (sock && sock.readyState === WebSocket.OPEN) {
            sock.send(JSON.stringify({ type: 'TIMER_ACTION', action }));
        }
    };

    // Expose sendModeChange upward so the dashboard toggle can reach the master clock
    useEffect(() => {
        if (onSendModeChange) {
            onSendModeChange((newMode: TimerMode) => {
                const masterMode = newMode === 'countdown' ? 'pomodoro' : 'stopwatch';
                const sock = wsRef.current;
                if (sock && sock.readyState === WebSocket.OPEN) {
                    sock.send(JSON.stringify({
                        type: 'TIMER_ACTION',
                        action: { type: 'SET_MODE', mode: masterMode }
                    }));
                }
                // Local time reset regardless of Electron state
                if (newMode === 'countup') setTime(0);
            });
        }
    }, [onSendModeChange]);

    const start = () => {
        if (timerState === "running") return;
        sendAction({ type: 'TOGGLE_PLAY' });
    };

    const pause = () => {
        sendAction({ type: 'TOGGLE_PLAY' });
    };

    const restart = () => {
        sendAction({ type: 'RESET' });
    };

    const setCountdownDuration = (mins: number) => {
        const secs = mins * 60;
        sendAction({ type: 'SET_MODE', mode: 'pomodoro', pomoDuration: secs });
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mins = parseInt(customMinutes);
        if (!isNaN(mins) && mins > 0) {
            setCountdownDuration(mins);
        }
    };

    const formatTime = (t: number) => {
        const hrs = Math.floor(t / 3600);
        const mins = Math.floor((t % 3600) / 60);
        const secs = t % 60;

        return {
            h: hrs > 0 ? String(hrs) : null,
            m: String(mins).padStart(2, "0"),
            s: String(secs).padStart(2, "0")
        };
    };

    const formatted = formatTime(time);

    if (!isMounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="timer-container"
        >
            <div className="display-wrapper">
                {formatted.h && (
                    <>
                        <span className="digit">{formatted.h}</span>
                        <span className="separator">:</span>
                    </>
                )}
                <span className="digit">{formatted.m}</span>
                <span className="separator">:</span>
                <span className="digit">{formatted.s}</span>
            </div>

            <div className="controls-layer">
                <AnimatePresence mode="wait">
                    {timerState !== "running" ? (
                        <motion.button
                            key="play-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={start}
                            className="icon-btn"
                            aria-label="Start"
                        >
                            <PlayIcon />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="pause-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={pause}
                            className="icon-btn"
                            aria-label="Pause"
                        >
                            <PauseIcon />
                        </motion.button>
                    )}
                </AnimatePresence>

                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.15, rotate: -30 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={restart}
                    className="icon-btn secondary"
                    aria-label="Restart"
                >
                    <RestartIcon />
                </motion.button>
            </div>

            <div className="settings-layer">
                <AnimatePresence mode="wait">
                    {mode === "countdown" && (
                        <motion.div
                            key="countdown-settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="duration-presets-wrapper"
                        >
                            <div className="duration-presets">
                                {[25, 45, 60].map((m) => (
                                    <button
                                        key={m}
                                        className={`preset-btn ${duration === m * 60 ? "selected" : ""}`}
                                        onClick={() => setCountdownDuration(m)}
                                    >
                                        {m}m
                                    </button>
                                ))}
                                <form onSubmit={handleCustomSubmit} className="custom-input-form">
                                    <div className="custom-input-wrapper">
                                        <input
                                            type="text"
                                            value={customMinutes}
                                            onChange={(e) => setCustomMinutes(e.target.value)}
                                            placeholder="Min"
                                            className="custom-input"
                                        />
                                        <button type="submit" className="custom-submit-btn">Set</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
        .timer-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          user-select: none;
          max-width: 600px;
          width: 100%;
          margin-top: 40px;
          position: relative; /* Anchor for absolute settings */
        }

        .settings-layer {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding-top: 24px;
        }

        .duration-presets-wrapper {
            overflow: hidden;
            width: 100%;
        }

        .duration-presets {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          padding: 4px 0;
        }

        .preset-btn {
          padding: 8px 12px;
          border-radius: 0;
          border: none;
          background: transparent;
          color: var(--foreground);
          opacity: 0.4;
          font-family: var(--font-geist-sans), system-ui;
          font-weight: 500;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 2px solid transparent;
        }

        .preset-btn:hover {
          opacity: 1;
          transform: translateY(-2px);
        }

        .preset-btn.selected {
          opacity: 1;
          border-bottom-color: var(--foreground);
        }

        .custom-input-form {
          display: flex;
          align-items: center;
          margin-left: 12px;
        }

        .custom-input-wrapper {
            display: flex;
            align-items: center;
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(var(--foreground-rgb), 0.1);
            padding: 0;
            transition: all 0.2s ease;
        }

        .custom-input-wrapper:focus-within {
            border-bottom-color: var(--foreground);
        }

        .custom-input {
          width: 45px;
          padding: 6px 4px;
          border: none;
          background: transparent;
          color: var(--foreground);
          font-family: var(--font-geist-sans), system-ui;
          font-weight: 500;
          font-size: 13px;
          text-align: center;
          outline: none;
        }

        .custom-submit-btn {
          padding: 6px 10px;
          border: none;
          background: transparent;
          color: var(--foreground);
          font-[700];
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.4;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .custom-submit-btn:hover {
          opacity: 1;
        }

        .display-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-vast-shadow), system-ui;
          color: var(--foreground);
          font-weight: 500;
          font-size: clamp(70px, 15vw, 140px);
          line-height: 1;
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
          pointer-events: none;
          user-select: none;
          margin: 0;
        }

        .digit {
          min-width: 1.1ch;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }

        .separator {
          opacity: 0.3;
          margin-top: -4px;
        }

        .controls-layer {
          display: flex;
          gap: 24px;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          margin-top: 10px;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 8px;
          opacity: 0.8;
        }

        .icon-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .icon-btn.secondary {
          opacity: 0.4;
        }

        .icon-btn.secondary:hover {
          opacity: 1;
        }

        .icon-btn:active {
            transform: scale(0.95);
        }

        @media (max-width: 640px) {
          .timer-container {
            gap: 15px;
          }
          .display-wrapper {
            font-size: clamp(50px, 20vw, 100px);
          }
          .controls-layer {
            gap: 16px;
          }
        }
      `}</style>
        </motion.div>
    );
}
