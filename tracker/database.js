// Ephemeral in-memory storage — no MongoDB needed here (auth lives in meow_web)
let ephemeralSessions = [];
const MAX_SESSIONS = 500;

// Log a window/app session (from native active-win tracking)
async function logSession(app, title, duration) {
    try {
        const newSession = {
            app,
            title,
            duration,
            type: 'app',
            timestamp: new Date()
        };
        ephemeralSessions.push(newSession);
        if (ephemeralSessions.length > MAX_SESSIONS) ephemeralSessions.shift();

        console.log(`✨ Logged App: ${app} (${duration}s)`);
    } catch (err) {
        console.error('❌ Failed to log session:', err);
    }
}

// Log a browser tab session (from extension via WebSocket)
// FIX #1: Guard against duplicate IDs before pushing
async function logTab(domain, title, duration, id) {
    try {
        // Reject duplicate session IDs — prevents double-logging from dual WS paths
        if (id !== undefined && id !== null) {
            if (ephemeralSessions.some(s => s.type === 'tab' && s.id === id)) {
                console.log(`⚠️  Duplicate tab ignored: ${domain} [id: ${id}]`);
                return;
            }
        }

        const newSession = {
            domain,
            title,
            duration,
            id,
            type: 'tab',
            timestamp: new Date()
        };
        ephemeralSessions.push(newSession);
        if (ephemeralSessions.length > MAX_SESSIONS) ephemeralSessions.shift();

        console.log(`🔹 Logged Tab: ${domain} (${duration}s)`);
    } catch (err) {
        console.error('❌ Failed to log tab:', err);
    }
}

// FIX #3: Return SEPARATE appTotals and tabTotals — no more mixed namespace / heuristics
async function getStats() {
    try {
        // Most recent 50 sessions, newest first
        const sessions = [...ephemeralSessions]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50);

        const appTotals = {};
        const tabTotals = {};

        ephemeralSessions.forEach(s => {
            if (s.type === 'app') {
                const key = s.app;
                if (!key) return;
                if (!appTotals[key]) appTotals[key] = { totalDuration: 0, visits: 0 };
                appTotals[key].totalDuration += s.duration;
                appTotals[key].visits += 1;
            } else if (s.type === 'tab') {
                const key = s.domain;
                if (!key) return;
                if (!tabTotals[key]) tabTotals[key] = { totalDuration: 0, visits: 0 };
                tabTotals[key].totalDuration += s.duration;
                tabTotals[key].visits += 1;
            }
        });

        return { sessions, appTotals, tabTotals };
    } catch (err) {
        console.error('❌ Failed to calculate stats:', err);
        return { sessions: [], appTotals: {}, tabTotals: {} };
    }
}

async function clearDB() {
    try {
        ephemeralSessions = [];
        console.log('🧹 In-memory database cleared.');
    } catch (err) {
        console.error('❌ Failed to clear memory:', err);
    }
}

module.exports = { logSession, logTab, getStats, clearDB };
