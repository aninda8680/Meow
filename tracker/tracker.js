#!/usr/bin/env node

const activeWin = require("active-win");
const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const { logSession, logTab, getStats } = require("./database");

const PORT = 5263;
const app = express();
app.use(cors());

// REST endpoint for initial data sync
app.get("/stats", (req, res) => {
    res.json(getStats());
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🐾 MEOW BACKEND ACTIVE`);
    console.log(`🟢 Listening on: http://127.0.0.1:${PORT}`);
    console.log(`🔗 Connect your Dashboard to this local backend.\n`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️  Port ${PORT} is already in use.`);
        console.log(`💡 Meow is likely already running in the background.\n`);
        process.exit(0);
    } else {
        console.error('❌ Server error:', err);
    }
});

const wss = new WebSocket.Server({ server });

let lastApp = null;
let lastTitle = null;
let startTime = Date.now();

wss.on("connection", (ws) => {
    console.log("🔗 Frontend connected");

    // Send initial stats
    ws.send(JSON.stringify({ type: 'init', data: getStats() }));

    const interval = setInterval(async () => {
        try {
            const win = await activeWin();
            if (!win) return;

            const currentApp = win.owner.name;
            const currentTitle = win.title;

            // If app changed, log the previous session
            if (lastApp && (currentApp !== lastApp || currentTitle !== lastTitle)) {
                const duration = Math.floor((Date.now() - startTime) / 1000);
                if (duration > 1) { // Only log if > 1s
                    logSession(lastApp, lastTitle, duration);
                }
                startTime = Date.now();
            }

            lastApp = currentApp;
            lastTitle = currentTitle;

            // Send real-time update
            ws.send(
                JSON.stringify({
                    type: 'update',
                    app: currentApp,
                    title: currentTitle,
                })
            );
        } catch (err) {
            console.error("Error:", err);
        }
    }, 2000);

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'TAB_LOG') {
                logTab(data.domain, data.title, data.duration, data.id);
                // Broadcast updated stats
                ws.send(JSON.stringify({ type: 'stats', data: getStats() }));
            }
        } catch (e) {
            console.error("Msg error:", e);
        }
    });

    ws.on("close", () => {
        console.log("❌ Frontend disconnected");
        clearInterval(interval);
    });
});
