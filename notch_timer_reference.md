# Notch Timer Feature Reference

This document combines the Electron backend code and the React frontend code used to create the macOS-style notch timer feature.

## 1. Backend (`electron/main.ts`)

This file runs the Electron main process. It manages the creation of the transparent, frameless window that forces the UI to stay on top and simulate a notch at the top center of the screen.

### Key Functions
- `createTimerOverlay()`: Initializes a hidden top-level `BrowserWindow` with features like `transparent: true`, `frame: false`, and `alwaysOnTop: true`. It also skips the taskbar and forces the window to visually act as an overlay instead of a standard window. Additionally, it adjusts window bounds with `setIgnoreMouseEvents` initially to allow clicking through the window until hover occurs.
- `startFocus(broadcast, startTime)`: Triggers the creation of the Notch layer / Timer overlay and starts the focus session. It initiates broadcast through a WebSocket to connect with an external client (syncing purposes).
- `stopFocus(broadcast)`: Cleans up the Notch layer / Timer overlay window, ends focus, and broadcasts this shutdown event.
- `broadcastWebSocketMessage(msg)`: General-purpose WebSockets server logic to ping connected devices (like phones) that the focus notch was opened/closed.

```typescript
import { app, BrowserWindow, ipcMain, Tray, Menu, screen } from 'electron';
import path from 'path';
import { networkInterfaces } from 'os';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let tray: Tray | null = null;
let timerOverlay: BrowserWindow | null = null;
let callPopupOverlay: BrowserWindow | null = null;
let dashboardWindow: BrowserWindow | null = null;

let wss: WebSocketServer | null = null;
let focusSessionActive = false;
let focusStartTime: number | null = null;

// Create main hidden window (dashboard/QR)
function createDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false, // Initially hidden
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    dashboardWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    dashboardWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  dashboardWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      dashboardWindow?.hide();
    }
  });
}

// Create Timer Overlay
function createTimerOverlay() {
  if (timerOverlay) return;
  
  const primaryDisplay = screen.getPrimaryDisplay();
  const windowWidth = 250;

  timerOverlay = new BrowserWindow({
    width: windowWidth,
    height: 100,
    x: Math.floor((primaryDisplay.bounds.width - windowWidth) / 2),
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Make the window click-through except for the notch area
  timerOverlay.setIgnoreMouseEvents(true, { forward: true });

  const url = process.env.VITE_DEV_SERVER_URL 
    ? `${process.env.VITE_DEV_SERVER_URL}#/timer` 
    : `file://${path.join(__dirname, '../dist/index.html')}#/timer`;

  timerOverlay.loadURL(url);
}

// Create Call Popup Overlay
function showCallPopup(callData: any) {
  if (callPopupOverlay) {
    callPopupOverlay.webContents.send('incoming-call', callData);
    return;
  }
  
  callPopupOverlay = new BrowserWindow({
    width: 320,
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  const url = process.env.VITE_DEV_SERVER_URL 
    ? `${process.env.VITE_DEV_SERVER_URL}#/call` 
    : `file://${path.join(__dirname, '../dist/index.html')}#/call`;

  callPopupOverlay.loadURL(url);
  callPopupOverlay.webContents.on('did-finish-load', () => {
    callPopupOverlay?.webContents.send('incoming-call', callData);
  });
}

function hideCallPopup() {
  if (callPopupOverlay) {
    callPopupOverlay.close();
    callPopupOverlay = null;
  }
}

// Setup System Tray
function setupTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'FocusSync', enabled: false },
    { type: 'separator' },
    { label: 'Show Dashboard / QR', click: () => dashboardWindow?.show() },
    { type: 'separator' },
    { label: 'Start Focus', click: () => startFocus() },
    { label: 'Stop Focus', click: () => stopFocus() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      app.isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('FocusSync');
  tray.setContextMenu(contextMenu);
}

// Focus Actions
function startFocus(broadcast = true, startTime?: number) {
  if (focusSessionActive) return;
  focusSessionActive = true;
  focusStartTime = startTime || Date.now();
  createTimerOverlay();
  if (broadcast) {
    broadcastWebSocketMessage({ 
      type: 'focus-started', 
      startTime: focusStartTime 
    });
  }
}

function stopFocus(broadcast = true) {
  if (!focusSessionActive) return;
  focusSessionActive = false;
  focusStartTime = null;
  if (timerOverlay) {
    timerOverlay.close();
    timerOverlay = null;
  }
  if (broadcast) {
    broadcastWebSocketMessage({ type: 'focus-stopped' });
  }
}

// WebSocket Server
function startWebSocketServer() {
  wss = new WebSocketServer({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('Phone connected');
    ws.send(JSON.stringify({ 
      type: 'status', 
      focusActive: focusSessionActive,
      startTime: focusStartTime
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'incoming-call') {
          if (focusSessionActive) {
            showCallPopup(data.payload);
          }
        } else if (data.type === 'call-ended') {
          hideCallPopup();
        } else if (data.type === 'focus-started') {
          startFocus(false); // Don't broadcast back
        } else if (data.type === 'focus-stopped') {
          stopFocus(false); // Don't broadcast back
        }
      } catch (err) {
        console.error('WebSocket msg error:', err);
      }
    });

    ws.on('close', () => console.log('Phone disconnected'));
  });
}

function broadcastWebSocketMessage(msg: any) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(msg));
    }
  });
}
```

## 2. Frontend (`src/Timer.tsx`)

This file renders the UI component inside the transparent Electron window initialized in `main.ts` and handles drag movements.

### Key Functions
- `useEffect` (Timer Logic): Updates the React state for either an upward-counting stopwatch or downward-counting pomodoro timer every 1000ms.
- `formatTime(totalSeconds)`: Mathematical format converter handling `HH:MM:SS` or `MM:SS`.
- `toggleMode()` / `handleReset()`: Allows users to flip between Stopwatch vs. Pomodoro, resetting values depending on the state constraints when required.
- `handleMouseEnter()` / `handleMouseLeave()`: Calls back across Electron's IPC bridge `(window as any).electronAPI?.setIgnoreMouseEvents` to allow users to interact with buttons in the Notch instead of clicking completely through it. Let's the system know you are interacting with it.
- `handlePointerDown()`, `handlePointerMove()`, `handlePointerUp()`: Captures mouse drag interactions locally and updates Window's specific global position `electronAPI?.moveTimerWindow` by taking delta coordinate points on drag. This allows the Notch layer to be repositioned left and right gracefully without stuttering.

```tsx
import { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Settings } from 'lucide-react';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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
    // Allow only digits
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
    // windowStartX.current is pre-fetched on enter
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

    // Update our start X so next drag starts from correct pos
    const deltaX = e.screenX - dragStartX.current;
    const finalX = windowStartX.current + deltaX;
    (window as any).electronAPI?.moveTimerWindow(finalX);
    windowStartX.current = finalX;
  };

  const handleMouseEnter = async () => {
    (window as any).electronAPI?.setIgnoreMouseEvents(false);
    
    // Only fetch and update the starting position if we aren't currently dragging.
    // If we update this while dragging, the deltaX gets added to the new position,
    // causing a runaway feedback loop where the window drags itself!
    if (!isDragging.current) {
      const pos = await (window as any).electronAPI?.getTimerPosition();
      // Double check dragging state hasn't changed while we were awaiting the IPC call
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
    <div className="w-screen h-screen flex items-start justify-center bg-transparent selection:bg-transparent overflow-hidden">
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center justify-center py-1 bg-black rounded-none rounded-b-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing relative overflow-hidden"
        style={{ width: showSettings ? '240px' : '200px', height: '42px', transition: 'width 0.3s ease' }}
      >
        {!showSettings ? (
          /* Timer View */
          <div className="flex items-center gap-3 w-full h-full justify-center">
            {/* Mode Toggle */}
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggleMode}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              title={mode === 'stopwatch' ? 'Switch to Pomodoro' : 'Switch to Stopwatch'}
            >
              <TimerIcon size={14} />
            </button>

            {/* Controls */}
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
            
            {/* Time Display */}
            <div className="text-lg font-medium tracking-widest text-white/95 pointer-events-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(seconds)}
            </div>

            {/* Settings (only for Pomodoro) */}
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
          /* Settings View */
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
```