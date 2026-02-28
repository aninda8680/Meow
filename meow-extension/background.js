import {
  getTodayKey,
  getDomain,
  shouldIgnore,
  calculateDuration,
  createEmptyDay
} from "./utils.js";

let currentTab = null;
let startTime = null;

function saveSession(tab, endTime) {
  if (!tab || !startTime) return;

  const duration = calculateDuration(startTime, endTime);
  if (duration < 5) return;

  const domain = getDomain(tab.url);
  if (!domain) return;

  const today = getTodayKey();

  chrome.storage.local.get([today], (result) => {
    const dayData = result[today] || createEmptyDay();

    // Raw session
    dayData.sessions.push({
      id: Date.now(),
      title: tab.title,
      url: tab.url,
      domain,
      startTime,
      endTime,
      duration
    });

    // Aggregation
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
  });
}

function handleTabChange(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (shouldIgnore(tab.url)) return;

    const now = Date.now();

    if (currentTab) {
      saveSession(currentTab, now);
    }

    currentTab = tab;
    startTime = now;
  });
}

chrome.tabs.onActivated.addListener(handleTabChange);

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (currentTab) {
      saveSession(currentTab, Date.now());
      currentTab = null;
      startTime = null;
    }
  }
});