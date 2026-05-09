import {
  getTodayKey,
  getDomain,
  shouldIgnore,
  calculateDuration,
  createEmptyDay
} from "./utils.js";

// FIX #11: Use a session counter alongside timestamp to prevent ID collisions
let sessionCounter = 0;
function generateSessionId() {
  return Date.now() * 10000 + (++sessionCounter % 10000);
}

const BACKEND_URL = "ws://localhost:5263";
let socket = null;

function connectBackend() {
  socket = new WebSocket(BACKEND_URL);
  socket.onopen = () => console.log("✅ Extension linked to Meow Backend");
  socket.onclose = () => {
    socket = null;
    setTimeout(connectBackend, 5000);
  };
  socket.onerror = () => {
    socket = null;
  };
}

connectBackend();

// FIX #1: REMOVED syncToBackend() — tab data now flows exclusively through
// the chrome.storage.local → content.js → TabTracker.tsx → logTabActivity() path.
// This eliminates the dual-path double-logging issue.

let currentTab = null;
let startTime = null;

function saveSession(tab, endTime) {
  if (!tab || !startTime) return;

  const duration = calculateDuration(startTime, endTime);
  if (duration < 1) return;

  const domain = getDomain(tab.url);
  if (!domain) return;

  const today = getTodayKey();
  const id = generateSessionId(); // collision-safe unique ID

  chrome.storage.local.get([today], (result) => {
    const dayData = result[today] || createEmptyDay();

    // Store raw session for the bridge
    dayData.sessions.push({
      id,
      title: tab.title,
      url: tab.url,
      domain,
      startTime,
      endTime,
      duration
    });

    // Local aggregation (used by the extension only, not sent to backend)
    if (!dayData.totals[domain]) {
      dayData.totals[domain] = {
        title: tab.title,
        totalDuration: 0,
        visits: 0
      };
    }
    dayData.totals[domain].totalDuration += duration;
    dayData.totals[domain].visits += 1;

    chrome.storage.local.set({ [today]: dayData });

    // NOTE: No syncToBackend() here — TabTracker.tsx handles syncing
    // via the content.js postMessage bridge to avoid double-logging.
  });
}

function handleTabChange(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    const now = Date.now();

    // 1. Always save the previous session first
    if (currentTab) {
      saveSession(currentTab, now);
      currentTab = null;
      startTime = null;
    }

    // 2. Track the new tab if not ignored
    if (shouldIgnore(tab?.url)) return;

    currentTab = tab;
    startTime = now;
  });
}

chrome.tabs.onActivated.addListener(handleTabChange);

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Lost focus — save current session
    if (currentTab) {
      saveSession(currentTab, Date.now());
      currentTab = null;
      startTime = null;
    }
  } else {
    // Gained focus — pick up active tab in this window
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]) {
        handleTabChange({ tabId: tabs[0].id });
      }
    });
  }
});