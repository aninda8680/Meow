"use client";

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Settings } from 'lucide-react';

export default function NotchTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [showSettings, setShowSettings] = useState(false);
  const [pomoDuration, setPomoDuration] = useState(25 * 60); // 25 minutes default
  const [editHours, setEditHours] = useState('00');
  const [editMinutes, setEditMinutes] = useState('25');
  const [editSeconds, setEditSeconds] = useState('00');
  
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const windowStartX = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    
    if (mode === 'stopwatch') {
      const interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Pomodoro countdown
      const interval = setInterval(() => {
        setSeconds(s => {
          if (s <= 0) {
            setIsPaused(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, mode]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleMode = () => {
    const newMode = mode === 'stopwatch' ? 'pomodoro' : 'stopwatch';
    setMode(newMode);
    setIsPaused(true);
    if (newMode === 'pomodoro') {
      setSeconds(pomoDuration);
    } else {
      setSeconds(0);
    }
  };

  const handleReset = () => {
    if (mode === 'pomodoro') {
      setSeconds(pomoDuration);
    } else {
      setSeconds(0);
    }
    setIsPaused(true);
  };

  const handleSavePomoDuration = () => {
    const hours = parseInt(editHours) || 0;
    const minutes = parseInt(editMinutes) || 0;
    const secs = parseInt(editSeconds) || 0;
    const duration = (hours * 3600) + (minutes * 60) + secs;
    setPomoDuration(duration);
    setSeconds(duration);
    setShowSettings(false);
  };

  const handleOpenSettings = () => {
    const h = Math.floor(pomoDuration / 3600);
    const m = Math.floor((pomoDuration % 3600) / 60);
    const s = pomoDuration % 60;
    setEditHours(h.toString().padStart(2, '0'));
    setEditMinutes(m.toString().padStart(2, '0'));
    setEditSeconds(s.toString().padStart(2, '0'));
    setShowSettings(true);
  };

  const handleTimeInputChange = (value: string, setter: (val: string) => void, max: number) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned === '') {
      setter('');
      return;
    }
    const num = parseInt(cleaned);
    if (num <= max) {
      setter(cleaned);
    }
  };

  const handleTimeInputBlur = (value: string, setter: (val: string) => void) => {
    if (value === '') {
      setter('00');
    } else {
      setter(value.padStart(2, '0'));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartX.current = e.screenX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.screenX - dragStartX.current;
    const newX = windowStartX.current + deltaX;

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        (window as any).electronAPI?.moveTimerWindow(newX);
        rafRef.current = null;
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const deltaX = e.screenX - dragStartX.current;
    const finalX = windowStartX.current + deltaX;
    (window as any).electronAPI?.moveTimerWindow(finalX);
    windowStartX.current = finalX;
  };

  const handleMouseEnter = async () => {
    (window as any).electronAPI?.setIgnoreMouseEvents(false);
    if (!isDragging.current) {
      const pos = await (window as any).electronAPI?.getTimerPosition?.();
      if (pos && !isDragging.current) {
        windowStartX.current = pos.x;
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) {
      (window as any).electronAPI?.setIgnoreMouseEvents(true, { forward: true });
    }
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] flex items-start justify-center bg-transparent selection:bg-transparent">
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center justify-center py-1 bg-black rounded-none rounded-b-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing relative overflow-hidden border border-t-0 border-white/10"
        style={{ width: showSettings ? '240px' : '200px', height: '42px', transition: 'width 0.3s ease' }}
      >
        {!showSettings ? (
          <div className="flex items-center gap-3 w-full h-full justify-center">
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggleMode}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              title={mode === 'stopwatch' ? 'Switch to Pomodoro' : 'Switch to Stopwatch'}
            >
              <TimerIcon size={14} />
            </button>

            <div className="flex items-center gap-2">
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsPaused(!isPaused)}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
              </button>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleReset}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            
            <div className="text-lg font-medium tracking-widest text-white/95 pointer-events-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(seconds)}
            </div>

            {mode === 'pomodoro' && (
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleOpenSettings}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <Settings size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full h-full justify-center px-2">
            <input
              type="text"
              value={editHours}
              onChange={(e) => handleTimeInputChange(e.target.value, setEditHours, 23)}
              onBlur={(e) => handleTimeInputBlur(e.target.value, setEditHours)}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 px-1 py-1 bg-white/10 text-white text-sm text-center rounded focus:outline-none focus:bg-white/20"
              maxLength={2}
              placeholder="00"
            />
            <span className="text-white/60 text-sm">:</span>
            <input
              type="text"
              value={editMinutes}
              onChange={(e) => handleTimeInputChange(e.target.value, setEditMinutes, 59)}
              onBlur={(e) => handleTimeInputBlur(e.target.value, setEditMinutes)}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 px-1 py-1 bg-white/10 text-white text-sm text-center rounded focus:outline-none focus:bg-white/20"
              maxLength={2}
              placeholder="00"
            />
            <span className="text-white/60 text-sm">:</span>
            <input
              type="text"
              value={editSeconds}
              onChange={(e) => handleTimeInputChange(e.target.value, setEditSeconds, 59)}
              onBlur={(e) => handleTimeInputBlur(e.target.value, setEditSeconds)}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 px-1 py-1 bg-white/10 text-white text-sm text-center rounded focus:outline-none focus:bg-white/20"
              maxLength={2}
              placeholder="00"
            />
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleSavePomoDuration}
              className="px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded transition-colors"
            >
              ✓
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setShowSettings(false)}
              className="text-white/60 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
