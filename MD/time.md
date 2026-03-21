# Time Tracking in Meow

This document explains how the **App Tracker** widget calculates and displays total screen time.

## Data Flow Overview

1. The tracker backend monitors the currently active window on the OS.
2. Whenever the focused app or window title changes, the previous session is closed and its duration (in seconds) is logged.
3. All sessions and per-app totals are stored in a JSON file in the user’s home directory.
4. The frontend connects to the backend, receives the `stats` object, and uses it in the App Tracker widget to compute and display totals.

---

## Backend: Session Logging

Backend files:
- tracker/tracker.js
- tracker/database.js

### Session capture loop

In `tracker/tracker.js`, an interval runs every 500ms and uses `active-win` to inspect the current active window:

- It tracks `lastApp`, `lastTitle`, and `startTime` for the current session.
- When the active app or title changes, it:
  - Computes `duration = floor((Date.now() - startTime) / 1000)` in seconds.
  - If `duration > 1`, calls `logSession(lastApp, lastTitle, duration)`.
  - Resets `startTime = Date.now()` for the new session.
- After logging, it broadcasts updated stats to all connected WebSocket clients.

### Database structure

In `tracker/database.js`, data is stored in a file named `.meow-activity-log.json` under the user’s home directory:

```jsonc
{
  "sessions": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "app": "Code.exe",
      "title": "index.tsx - Meow",
      "duration": 123,
      "type": "app"
    },
    // ...
  ],
  "tabs": [
    // Browser tab sessions (logged separately)
  ],
  "totals": {
    "Code.exe": { "totalDuration": 3600, "visits": 10 },
    "chrome.exe": { "totalDuration": 5400, "visits": 15 }
    // ...
  }
}
```

#### `logSession(app, title, duration)`

When a window session ends:

- A new entry is pushed into `db.sessions` with fields:
  - `timestamp`: ISO string when logged
  - `app`: executable / app name
  - `title`: window title
  - `duration`: session length in seconds
  - `type`: `'app'`
- `db.totals[app]` is updated:
  - If missing, it’s initialized to `{ totalDuration: 0, visits: 0 }`.
  - `totalDuration += duration`
  - `visits += 1`
- The database is written back to disk after each log.

#### `logTab(domain, title, duration, id)`

Browser tab sessions are logged similarly, but with:

- `domain` instead of `app`.
- `type: 'tab'`.
- Deduplication by `id` to avoid double-logging the same tab session.

#### `getStats()` and `clearDB()`

- `getStats()` returns the entire in-memory `db` object.
- `clearDB()` resets it to `{ sessions: [], tabs: [], totals: {} }` and saves.

---

## Frontend: App Tracker Widget

Frontend files:
- meow_web/hooks/useSystemTracker.ts
- meow_web/components/widgets/AppTracker.tsx

### Hook: `useSystemTracker`

The hook:

- Opens a WebSocket connection to the backend.
- On `init` and `stats` messages, updates local `stats` state with the data from `getStats()`.
- Exposes:
  - `currentApp`: the live current app + title information.
  - `stats`: the full stats object (`sessions`, `tabs`, `totals`).
  - `clearData()`: sends a clear request.
  - `status`: connection status (`connected` / `offline`).

### Widget: `AppTracker`

In `AppTracker.tsx`:

```ts
const { currentApp, stats, clearData, status } = useSystemTracker();
```

#### Total Screen Time calculation

`Total Screen Time` is derived purely from the `totals` map, which already contains per-app accumulated durations:

```ts
const totalAppTime = Object.values(stats.totals)
  .reduce((acc, curr) => acc + curr.totalDuration, 0);
```

- `stats.totals` is an object where each value has:
  - `totalDuration`: sum of all logged durations for that app (seconds).
  - `visits`: number of sessions.
- `Object.values` collects all per-app totals.
- `reduce` sums the `totalDuration` from each entry to produce `totalAppTime` in **seconds**.

#### Formatting for display

The widget converts raw seconds into a human-readable string:

```ts
const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};
```

- If `hrs > 0`, it shows `Xh Ym`.
- Otherwise, it shows just `Ym`.

The value displayed in the card is:

```tsx
<span className="text-2xl font-black tabular-nums">
  {formatTime(totalAppTime)}
</span>
```

So **Total Screen Time** =

$$
\text{Total Screen Time (seconds)} = \sum_{app \in \text{totals}} \text{totalDuration}_\text{app}
$$

and the UI shows that total converted into hours and minutes.

---

## Top Apps and Recent Apps

In addition to the overall total, the widget also surfaces:

- **Recent Apps**: last two `app`-type sessions from `stats.sessions`, with their individual `duration` formatted via `formatTime`.
- **Top Apps**: entries from `stats.totals` where the key does **not** contain a dot (`!key.includes('.')`, to hide domains), sorted by `totalDuration` descending and taking the top three.

These use the same underlying `duration` and `totalDuration` values as the Total Screen Time section.
