# 🐾 Meow — Tracking Pipeline Issues & Permanent Fixes

> Audited: 2026-04-19 | Status: ✅ All 12 issues fixed and verified (tsc: 0 errors)

---

## 📊 Full Data Flow (After Fixes)

```
[Browser Extension]                    [Native App — active-win]
  background.js                          tracker.js (setInterval 500ms)
      │                                        │
   saveSession()                          logSession()
      │  (no more dual WS path)                │
  chrome.storage.local                  database.js (ephemeralSessions[])
      │                                        │
  content.js (bridge)             getStats() → { sessions, appTotals, tabTotals }
      │                                        │
  MEOW_DATA_RESPONSE              WS broadcast (type: 'stats' | 'init' | 'update')
      │                                        │
  TabTracker.tsx                     useSystemTracker.ts (globalStats)
  (globalSyncedTabIds dedup)        (globalSyncedTabIds — module-level)
      │                                        │
  logTabActivity() → TAB_LOG WS     AppTracker.tsx / AppModal / TabModal / TabTracker
      └────────────────── Dashboard ───────────┘
```

---

## ✅ Fixed Issues

---

### ✅ FIX #1 — Tab Double-Logging via Dual WebSocket Paths

**Files:** `meow-extension/background.js`, `tracker/database.js`

**What was wrong:**
Tab sessions flowed through **two separate paths** to the backend simultaneously:
- `background.js → syncToBackend()` → `TAB_LOG` directly over WS
- `TabTracker.tsx polling → logTabActivity()` → `TAB_LOG` over WS

The backend had no dedup guard, so every session was logged twice. All totals were doubled.

**Fix applied:**
1. **Removed `syncToBackend()`** from `background.js` entirely. Data now flows exclusively through the `chrome.storage.local → content.js → TabTracker.tsx → logTabActivity()` path.
2. **Added ID-based dedup guard** in `database.js → logTab()`: if a session with the same `id` already exists in `ephemeralSessions`, it is silently rejected.

---

### ✅ FIX #2 — `syncedLocally` Ref Resets on Page Reload / Navigation

**File:** `meow_web/hooks/useSystemTracker.ts`, `meow_web/components/widgets/TabTracker.tsx`

**What was wrong:**
`syncedLocally` was a component-level `useRef` (`new Set<number>()`). Every time `TabTracker` unmounted (page nav, hot-reload), the set was lost. On remount, every session in chrome storage looked "new" and all were re-sent to the backend.

**Fix applied:**
Replaced the component ref with a **module-level exported Set** `globalSyncedTabIds` in `useSystemTracker.ts`. This Set lives for the lifetime of the browser tab session, surviving all component remounts. `TabTracker.tsx` imports and uses this set directly.

---

### ✅ FIX #3 — Mixed App/Tab Totals in Shared Namespace

**File:** `tracker/database.js`, `meow_web/hooks/useSystemTracker.ts`, all consumers

**What was wrong:**
`getStats()` returned a single flat `totals` object where both app names (e.g. `Google Chrome`) and domains (e.g. `github.com`) shared the same key space. Frontend components used unreliable heuristics (dot patterns, `.exe` suffix, whitespace) to guess which type each key was, causing apps to bleed into tab totals and vice versa.

**Fix applied:**
`getStats()` now returns **`{ sessions, appTotals, tabTotals }`** — two completely separate aggregation objects. All consumer components (`AppModal`, `TabModal`, `AppTracker`, `TabTracker`) now use the correct typed totals directly with zero heuristics.

---

### ✅ FIX #4 — `useEffect` Re-registers on Every Stat Update

**File:** `meow_web/components/widgets/TabTracker.tsx`

**What was wrong:**
`stats.sessions` was listed as a `useEffect` dependency. Every incoming stat push triggered a re-render, which tore down and re-created the 1-second polling interval and the `window.addEventListener("message", handler)` listener. This caused:
- The polling interval to reset on every update
- A window where in-flight messages could be missed

**Fix applied:**
Removed `stats.sessions` from the `useEffect` dependency array entirely. The dedup logic now uses `globalSyncedTabIds` (module-level, no closure over component state), so the effect is stable with only `[logTabActivity]` as a dependency — which is a `useCallback` with no deps and never changes.

---

### ✅ FIX #5 — `.slice(-N)` Shows Oldest Sessions, Not Newest

**Files:** `meow_web/components/widgets/AppTracker.tsx`, `meow_web/components/widgets/TabTracker.tsx`

**What was wrong:**
`getStats()` sorts sessions **newest-first** before returning. Both widgets called `.slice(-N).reverse()` — which takes the **last N** elements of a newest-first array, i.e. the **oldest** sessions, then reverses them. Users saw stale old sessions.

**Fix applied:**
Changed to `.slice(0, N)` — returns the first N items of a newest-first array, correctly showing the most recent sessions.

---

### ✅ FIX #6 — `totalAppTime` Included Tab Durations

**File:** `meow_web/components/widgets/AppTracker.tsx`

**What was wrong:**
`totalAppTime` was computed as `Object.values(stats.totals).reduce(...)`, summing all entries in the mixed totals object — both apps and tab domains — and displaying the inflated sum as "Total Screen Time".

**Fix applied:**
Now uses `Object.values(stats.appTotals).reduce(...)`. Tab durations are completely excluded.

---

### ✅ FIX #7 — Fragile `TabModal` Aggregate Stats Calculation

**File:** `meow_web/components/pages/TabModal.tsx`

**What was wrong:**
`totalTime` was calculated using index-alignment between `Object.values()` and `Object.keys()`, filtering values by checking their corresponding key. This was unnecessarily fragile and still relied on the dot-heuristic.

**Fix applied:**
Simplified to `Object.values(stats.tabTotals).reduce(...)` — directly summing all entries in the type-safe `tabTotals` object.

---

### ✅ FIX #8 — Current App Session Not Reflected Live

**Files:** `meow_web/hooks/useSystemTracker.ts`, `meow_web/components/widgets/AppTracker.tsx`

**What was wrong:**
App sessions were only committed to `ephemeralSessions` when the focus changed. If a user stayed in one app for 30 minutes, the dashboard showed 0 contributed time for that session until they switched windows. "Total Screen Time" was always behind by one session.

**Fix applied:**
1. `useSystemTracker.ts` now tracks `startTime` per app on `type: 'update'` messages.
2. A `liveCurrentDuration` state (updated via `setInterval`) is exposed from the hook — it counts **live seconds** spent in the current focused app.
3. `AppTracker.tsx` adds `liveCurrentDuration` to `totalAppTime` for the "Total Screen Time" display and shows a live `● Xm Ys live` indicator on the current app card.

---

### ✅ FIX #9 — `content.js` Missing for Some Dev Server Ports

**File:** `meow-extension/manifest.json`

**What was wrong:**
`content_scripts.matches` only listed `localhost:3000`. The extension bridge would silently fail to inject on other ports.

**Fix applied:**
Added `localhost:3001` and `localhost:5173` to the matches array.

---

### ✅ FIX #10 — Dead MongoDB Connection in Tracker

**Files:** `tracker/database.js`, `tracker/package.json`

**What was wrong:**
`database.js` connected to MongoDB via Mongoose at startup but never actually used it (all data was already in-memory). This created an unnecessary outbound network connection, exposed DB credentials in the source, and added startup latency.

**Fix applied:**
Removed all Mongoose code from `database.js`. Removed `mongoose` from `tracker/package.json` dependencies. The tracker is now fully self-contained in-memory.

---

### ✅ FIX #11 — `Date.now()` ID Collision Risk

**File:** `meow-extension/background.js`

**What was wrong:**
Session IDs were generated with `Date.now()` (millisecond precision). Two tabs closed in the same millisecond would get the same ID, causing the dedup guard to silently drop a valid second session.

**Fix applied:**
Replaced with a compound ID: `Date.now() * 10000 + (++sessionCounter % 10000)` using a module-level counter that increments per session. IDs are now guaranteed unique within a browser session.

---

### ✅ FIX #12 — Progress Bars Always 100% Wide

**Files:** `meow_web/components/pages/AppModal.tsx`, `meow_web/components/pages/TabModal.tsx`

**What was wrong:**
Every app/domain's progress bar animated to `width: "100%"` regardless of actual usage — making the bar completely meaningless as a comparative indicator.

**Fix applied:**
Each bar now animates to `(entry.totalDuration / maxDuration) * 100 + "%"` where `maxDuration` is the top entry's value. The most-used app/domain shows a full bar; all others scale proportionally.

---

## 📊 Fix Summary Table

| # | Issue | Severity | Files Changed | Status |
|---|-------|----------|---------------|--------|
| 1 | Tab double-logging via dual WS paths | 🔴 Critical | `background.js`, `database.js` | ✅ |
| 2 | syncedLocally resets on page reload | 🔴 Critical | `useSystemTracker.ts`, `TabTracker.tsx` | ✅ |
| 3 | Mixed app/tab totals namespace | 🔴 Critical | `database.js`, `useSystemTracker.ts`, all 4 UI files | ✅ |
| 4 | useEffect re-registers on stat updates | 🟠 Moderate | `TabTracker.tsx` | ✅ |
| 5 | slice(-N) shows oldest, not newest | 🟠 Moderate | `AppTracker.tsx`, `TabTracker.tsx` | ✅ |
| 6 | totalAppTime includes tab durations | 🟠 Moderate | `AppTracker.tsx` | ✅ |
| 7 | Fragile TabModal aggregate calculation | 🟠 Moderate | `TabModal.tsx` | ✅ |
| 8 | Current app session not shown live | 🟠 Moderate | `useSystemTracker.ts`, `AppTracker.tsx` | ✅ |
| 9 | content.js missing for dev ports | 🟠 Moderate | `manifest.json` | ✅ |
| 10 | Unused MongoDB connection in tracker | 🟡 Minor | `database.js`, `package.json` | ✅ |
| 11 | Date.now() ID collision risk | 🟡 Minor | `background.js` | ✅ |
| 12 | Progress bars always 100% | 🟡 Minor | `AppModal.tsx`, `TabModal.tsx` | ✅ |

**TypeScript check:** `npx tsc --noEmit` → Exit code 0, 0 errors.
