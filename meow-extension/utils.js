// utils.js

export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

export function shouldIgnore(url) {
  if (!url) return true;

  const ignoredPrefixes = [
    "chrome://",
    "edge://",
    "about:",
    "brave://"
  ];

  if (ignoredPrefixes.some(prefix => url.startsWith(prefix))) {
    return true;
  }

  // Ignore Meow itself
  if (url.includes("hi-meow.vercel.app") || url.includes("localhost:3000") || url.includes("localhost:3001") || url.includes("localhost:3002") || url.includes("localhost:5173")) {
    return true;
  }

  return false;
}

export function calculateDuration(startTime, endTime) {
  return Math.floor((endTime - startTime) / 1000);
}

export function createEmptyDay() {
  return {
    sessions: [],
    totals: {}
  };
}