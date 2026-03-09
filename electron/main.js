const { app, BrowserWindow, Tray, Menu, shell, session } = require("electron");
const path = require("path");
const activeWin = require("active-win");
const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const { logSession, logTab, getStats, clearDB } = require("../tracker/database");

const PORT = 5263;
let tray = null;
let win = null;
let lastApp = null;
let lastTitle = null;
let startTime = Date.now();
let wss = null;

// Broadcast function to all connected clients
function broadcast(data) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

// Start local server and WebSocket
function startServer() {
  const serverApp = express();
  serverApp.use(cors());

  serverApp.get("/stats", (req, res) => {
    res.json(getStats());
  });

  serverApp.post("/clear", (req, res) => {
    clearDB();
    broadcast({ type: 'stats', data: getStats() });
    res.json({ success: true });
  });

  const server = serverApp.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 Meow Tray Backend running on http://localhost:${PORT}`);
  });

  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("🔗 Frontend connected to Tray");
    ws.send(JSON.stringify({ type: 'init', data: getStats() }));

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'TAB_LOG') {
          logTab(data.domain, data.title, data.duration, data.id);
          broadcast({ type: 'stats', data: getStats() });
        } else if (data.type === 'CLEAR_DATA') {
          clearDB();
          broadcast({ type: 'stats', data: getStats() });
        }
      } catch (e) {
        console.error("Msg error:", e);
      }
    });
  });
}

// High-efficiency activity tracking (No UI needed)
function startTracking() {
  setInterval(async () => {
    try {
      const current = await activeWin();
      if (!current) return;

      const currentApp = current.owner?.name || "Unknown";
      const currentTitle = current.title || "No Title";

      if (lastApp && (currentApp !== lastApp || currentTitle !== lastTitle)) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration > 1) {
          logSession(lastApp, lastTitle, duration);
          broadcast({ type: 'stats', data: getStats() });
        }
        startTime = Date.now();
      }
      lastApp = currentApp;
      lastTitle = currentTitle;

      // Real-time broadcast for the "Focusing on" widget
      broadcast({
        type: 'update',
        app: currentApp,
        title: currentTitle
      });
    } catch (err) {
      console.error("Tracking Error:", err);
    }
  }, 2000);
}

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
    { label: 'Quit Meow', click: () => app.quit() }
  ]);

  tray.setToolTip('Meow Productivity');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  startServer();
  createTray();
  startTracking();

  // On Windows, the app continues to run in the tray even if no windows are open
  if (process.platform === 'darwin') app.dock.hide();
});

app.on("window-all-closed", (e) => {
  e.preventDefault(); // Keep app running in tray
});