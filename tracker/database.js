const fs = require('fs');
const path = require('path');
const os = require('os');

// Store data in the user's home directory so it's persistent regardless of where the app runs
const DB_PATH = path.join(os.homedir(), '.meow-activity-log.json');

function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        return { sessions: [], tabs: [], totals: {} };
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { sessions: [], tabs: [], totals: {} };
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let db = loadDB();

// Log a window session
function logSession(app, title, duration) {
    const today = new Date().toISOString().split('T')[0];

    // Add to sessions log
    db.sessions.push({
        timestamp: new Date().toISOString(),
        app,
        title,
        duration,
        type: 'app'
    });

    // Update totals
    if (!db.totals[app]) {
        db.totals[app] = { totalDuration: 0, visits: 0 };
    }
    db.totals[app].totalDuration += duration;
    db.totals[app].visits += 1;

    // Persist every log for now (we can throttle this later)
    saveDB(db);
}

// Log a tab session (receives from frontend)
function logTab(domain, title, duration, id) {
    // Deduplicate using the ID from the extension
    const exists = db.sessions.some(s => s.id === id);
    if (exists) return;

    console.log(`🔹 Logging Tab: ${domain} (${id})`);

    db.sessions.push({
        id: id || Date.now(),
        timestamp: new Date().toISOString(),
        domain,
        title,
        duration,
        type: 'tab'
    });

    if (!db.totals[domain]) {
        db.totals[domain] = { totalDuration: 0, visits: 0 };
    }
    db.totals[domain].totalDuration += duration;
    db.totals[domain].visits += 1;

    saveDB(db);
}

function getStats() {
    return db;
}

function clearDB() {
    db = { sessions: [], tabs: [], totals: {} };
    saveDB(db);
    console.log("🧹 Database cleared.");
}

module.exports = { logSession, logTab, getStats, clearDB };
