const { app, BrowserWindow, Tray, Menu, shell, ipcMain, screen } = require("electron");
const path = require("path");
const activeWin = require("active-win");
const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const { networkInterfaces } = require("os");
const { logSession, logTab, getStats, clearDB } = require("../tracker/database");

// ═══════════════════════════════════════════════════
//  MEOW TRACKER (original functionality)
// ═══════════════════════════════════════════════════
const TRACKER_PORT = 5263;
let tray = null;
let win = null;
let lastApp = null;
let lastTitle = null;
let startTime = Date.now();
let trackerWss = null;

// ═══════════════════════════════════════════════════
//  FOCUSSYNC (desktop app functionality)
// ═══════════════════════════════════════════════════
let timerOverlay = null;
let callPopupOverlay = null;
let dashboardWindow = null;
let focusWss = null;
let focusSessionActive = false;
let focusStartTime = null;
let isTimerDragging = false;
const FOCUS_WS_PORT = 8080;

// ───────────────────────────────────────────────────
//  TRACKER: Broadcast to tracker WebSocket clients
// ───────────────────────────────────────────────────
function trackerBroadcast(data) {
  if (trackerWss) {
    trackerWss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

// ───────────────────────────────────────────────────
//  TRACKER: Start local server and WebSocket
// ───────────────────────────────────────────────────
function startTrackerServer() {
  const serverApp = express();
  serverApp.use(cors());

  serverApp.get("/stats", (req, res) => {
    res.json(getStats());
  });

  serverApp.post("/clear", (req, res) => {
    clearDB();
    trackerBroadcast({ type: 'stats', data: getStats() });
    res.json({ success: true });
  });

  const server = serverApp.listen(TRACKER_PORT, '0.0.0.0', () => {
    console.log(`🟢 Meow Tray Backend running on http://localhost:${TRACKER_PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${TRACKER_PORT} already in use. Tracker may already be running.`);
    } else {
      console.error('❌ Tracker server error:', err);
    }
  });

  trackerWss = new WebSocket.Server({ server });

  trackerWss.on("connection", (ws) => {
    console.log("🔗 Frontend connected to Tray");
    ws.send(JSON.stringify({ type: 'init', data: getStats() }));

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'TAB_LOG') {
          logTab(data.domain, data.title, data.duration, data.id);
          trackerBroadcast({ type: 'stats', data: getStats() });
        } else if (data.type === 'CLEAR_DATA') {
          clearDB();
          trackerBroadcast({ type: 'stats', data: getStats() });
        }
      } catch (e) {
        console.error("Msg error:", e);
      }
    });
  });
}

// ───────────────────────────────────────────────────
//  TRACKER: Activity monitoring loop
// ───────────────────────────────────────────────────
function startTracking() {
  setInterval(async () => {
    try {
      const current = await activeWin();
      if (!current) return;

      const currentApp = current.owner?.name || "Unknown";
      const currentTitle = current.title || "No Title";

      if (lastApp && (currentApp !== lastApp || currentTitle !== lastTitle)) {
        console.log(`✨ Scope Change: ${currentApp} | ${currentTitle}`);
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration > 1) {
          logSession(lastApp, lastTitle, duration);
          trackerBroadcast({ type: 'stats', data: getStats() });
        }
        startTime = Date.now();
      }
      lastApp = currentApp;
      lastTitle = currentTitle;

      // Real-time broadcast for the "Focusing on" widget
      trackerBroadcast({
        type: 'update',
        app: currentApp,
        title: currentTitle
      });
    } catch (err) {
      console.error("Tracking Error:", err);
    }
  }, 500);
}

// ═══════════════════════════════════════════════════
//  FOCUSSYNC: Dashboard Window
// ═══════════════════════════════════════════════════
function createDashboardWindow() {
  if (dashboardWindow) {
    dashboardWindow.show();
    return;
  }

  dashboardWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    resizable: true,
    icon: path.join(__dirname, "Meow_logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  dashboardWindow.loadFile(path.join(__dirname, "dashboard.html"));

  // Open DevTools for debugging
  dashboardWindow.webContents.openDevTools({ mode: 'detach' });

  dashboardWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      dashboardWindow.hide();
    }
  });

  dashboardWindow.on('closed', () => {
    dashboardWindow = null;
  });

  dashboardWindow.once('ready-to-show', () => {
    dashboardWindow.show();
  });

  console.log('✅ Dashboard window created');
}

// ═══════════════════════════════════════════════════
//  FOCUSSYNC: Timer Overlay
// ═══════════════════════════════════════════════════
function createTimerOverlay() {
  if (timerOverlay) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const windowWidth = 250;
  const notchWidth = 200;
  const notchHeight = 42;

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
    focusable: true,
    hasShadow: false,
    icon: path.join(__dirname, "Meow_logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  timerOverlay.loadFile(path.join(__dirname, "timer.html"));

  // Open DevTools for debugging
  timerOverlay.webContents.openDevTools({ mode: 'detach' });

  // Log when window is ready
  timerOverlay.webContents.on('did-finish-load', () => {
    console.log('✅ Timer overlay loaded');
  });

  timerOverlay.on('closed', () => {
    timerOverlay = null;
  });

  // Test: Log mouse events on the window
  timerOverlay.on('focus', () => console.log('Timer window focused'));
  timerOverlay.on('blur', () => console.log('Timer window blurred'));

  console.log('✅ Timer overlay created');
}

// ═══════════════════════════════════════════════════
//  FOCUSSYNC: Call Popup Overlay
// ═══════════════════════════════════════════════════
function showCallPopup(callData) {
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
    icon: path.join(__dirname, "Meow_logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  callPopupOverlay.loadFile(path.join(__dirname, "call-popup.html"));
  callPopupOverlay.webContents.on('did-finish-load', () => {
    callPopupOverlay?.webContents.send('incoming-call', callData);
  });

  callPopupOverlay.on('closed', () => {
    callPopupOverlay = null;
  });
}

function hideCallPopup() {
  if (callPopupOverlay) {
    callPopupOverlay.close();
    callPopupOverlay = null;
  }
}

// ═══════════════════════════════════════════════════
//  FOCUSSYNC: Focus Actions
// ═══════════════════════════════════════════════════
function startFocus(broadcast = true, startTimeOverride) {
  if (focusSessionActive) return;
  focusSessionActive = true;
  focusStartTime = startTimeOverride || Date.now();
  createTimerOverlay();
  if (broadcast) {
    focusBroadcast({
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
    focusBroadcast({ type: 'focus-stopped' });
  }
}

// ═══════════════════════════════════════════════════
//  FOCUSSYNC: WebSocket Server for phone pairing
// ═══════════════════════════════════════════════════
function focusBroadcast(msg) {
  if (!focusWss) return;
  focusWss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(msg));
    }
  });
}

function startFocusWebSocketServer() {
  try {
    focusWss = new WebSocket.Server({ port: FOCUS_WS_PORT });

    focusWss.on('connection', (ws) => {
      console.log('📱 Phone connected (FocusSync)');
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
          console.error('FocusSync WS msg error:', err);
        }
      });

      ws.on('close', () => console.log('📱 Phone disconnected (FocusSync)'));
    });

    focusWss.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  FocusSync port ${FOCUS_WS_PORT} already in use.`);
      } else {
        console.error('FocusSync WS error:', err);
      }
    });

    console.log(`🟢 FocusSync WebSocket running on ws://localhost:${FOCUS_WS_PORT}`);
  } catch (err) {
    console.error('Failed to start FocusSync WebSocket:', err);
  }
}

// ═══════════════════════════════════════════════════
//  SYSTEM TRAY (unified)
// ═══════════════════════════════════════════════════
function createTray() {
  const iconPath = path.join(__dirname, "Meow_logo.png");
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: '🐾 Meow is Tracking...', enabled: false },
    { type: 'separator' },
    {
      label: 'Open Dashboard',
      click: () => shell.openExternal("https://hi-meow.vercel.app/main")
    },
    {
      label: 'View Local Stats',
      click: () => {
        if (!win) {
          win = new BrowserWindow({ width: 400, height: 600, show: false });
          win.on('closed', () => win = null);
        }
        win.loadURL("http://localhost:5263/stats");
        win.show();
      }
    },
    { type: 'separator' },
    { label: '🎯 Focus Dashboard', click: () => createDashboardWindow() },
    { label: '▶️ Start Focus', click: () => startFocus() },
    { label: '⏹️ Stop Focus', click: () => stopFocus() },
    { type: 'separator' },
    { label: 'Quit Meow', click: () => {
      app.isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('Meow Productivity');
  tray.setContextMenu(contextMenu);
}

// ═══════════════════════════════════════════════════
//  IPC HANDLERS (FocusSync)
// ═══════════════════════════════════════════════════

// QR Code data - get local IP for phone pairing
ipcMain.handle('get-qr-data', () => {
  const nets = networkInterfaces();
  let localIp = 'localhost';

  for (const name of Object.keys(nets)) {
    // Skip WSL, Docker, and VMware virtual adapters
    if (name.toLowerCase().includes('wsl') ||
        name.toLowerCase().includes('vethernet') ||
        name.toLowerCase().includes('virtual') ||
        name.toLowerCase().includes('vmware')) {
      continue;
    }

    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal && localIp === 'localhost') {
        localIp = net.address;
      }
    }
  }

  // Fallback
  if (localIp === 'localhost') {
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
    }
  }

  console.log('=== QR CODE IP:', localIp, '===');
  return { ip: localIp, port: FOCUS_WS_PORT };
});

// Call actions
ipcMain.on('call-action', (event, action) => {
  focusBroadcast({ type: 'call-action', payload: action });
  if (action !== 'accept') {
    hideCallPopup();
  }
});

// Timer window drag
ipcMain.on('move-timer-window', (event, x) => {
  if (timerOverlay) {
    timerOverlay.setPosition(Math.round(x), 0);
  }
});

ipcMain.handle('get-timer-position', () => {
  if (timerOverlay) {
    const [x, y] = timerOverlay.getPosition();
    return { x, y };
  }
  return { x: 0, y: 0 };
});

// Focus session control
ipcMain.on('start-focus', () => {
  startFocus();
});

ipcMain.on('stop-focus', () => {
  stopFocus();
});

ipcMain.on('restart-focus', () => {
  stopFocus();
  setTimeout(() => startFocus(), 100);
});

ipcMain.handle('get-focus-status', () => {
  return {
    active: focusSessionActive,
    startTime: focusStartTime
  };
});

// Mouse events for click-through timer overlay
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  if (bw) {
    bw.setIgnoreMouseEvents(ignore, options);
    console.log(`[TIMER] Mouse events ${ignore ? 'DISABLED' : 'ENABLED'}`, options || '');
  }
});

// ═══════════════════════════════════════════════════
//  APP LIFECYCLE
// ═══════════════════════════════════════════════════
app.whenReady().then(() => {
  // Start Meow tracking backend
  startTrackerServer();
  startTracking();

  // Start FocusSync phone-pairing WebSocket
  startFocusWebSocketServer();

  // Create system tray
  createTray();

  // On Windows, the app continues to run in the tray even if no windows are open
  if (process.platform === 'darwin') app.dock.hide();
});

app.on("window-all-closed", (e) => {
  e.preventDefault(); // Keep app running in tray
});