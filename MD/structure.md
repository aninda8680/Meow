# Meow Ecosystem Architecture & Data Flow

This document details how the three core components of Meow—the **Browser Extension (Tab Tracker)**, the **Windows App Tracker**, and the **Web Dashboard**—communicate and synchronize data to provide a unified productivity tracking experience.

## 1. The Three Core Components

### A. Tab Tracker (Browser Extension)
- **Location:** `meow-extension/`
- **Role:** Monitors browser tab activity, recording the active domain (e.g., `github.com`), the page title, and the session duration.
- **Mechanism:** It uses Chrome's `chrome.tabs.onActivated` and `chrome.windows.onFocusChanged` APIs to calculate exact usage durations.

### B. Windows App Tracker (Central Hub)
- **Location:** `tracker/tracker.js` & `tracker/database.js`
- **Role:** A Node.js background process that monitors system-level application activity (e.g., VS Code, Spotify) and acts as the central data bridge for the entire ecosystem.
- **Mechanism:** It polls the OS every 500ms using the `active-win` library to detect the currently focused window and calculates the session duration when the active window changes.

### C. Web Dashboard
- **Location:** `meow_web/`
- **Role:** A React/Next.js frontend that displays all analytics, charts, and currently active applications.

---

## 2. The Network Link: WebSocket Server & MongoDB

The secret to how everything is connected lies in the **Windows App Tracker**. Instead of being a passive script, it runs an active local server:
1. The **Tracker** hosts a local WebSocket server running on `ws://localhost:5263`.
2. It also maintains a direct connection to a backend **MongoDB** database (`mongodb+srv://...`) via Mongoose.

Both the Browser Extension and the Web Dashboard behave as **clients** to this central WebSocket server.

---

## 3. Step-by-Step Data Flow (How Data Reaches the Portal)

### Step 1: Data Generation
- **From Windows OS (Apps):** Every time you switch an application on your machine, the App Tracker notes the change. If the app was open for more than 1 second, it calls `logSession()` to save this "App Session" directly into MongoDB.
- **From the Browser (Tabs):** When you switch browser tabs, the Extension calculates the time spent on the previous tab. It then seamlessly sends a WebSocket message formatted as `{ type: 'TAB_LOG', domain, duration, title }` to `ws://localhost:5263`.

### Step 2: Ingestion & Storage
- When the App Tracker's WebSocket Server receives a `TAB_LOG` message from the Extension, it processes it via `logTab()` and saves this "Tab Session" into the same **MongoDB** database.
- Both System Apps and Browser Tabs are seamlessly unified into the `Activity` collection in the cloud database, marked respectively with `type: 'app'` or `type: 'tab'`.

### Step 3: Pushing to the Dashboard
- When the **Web Dashboard** is opened, its `useSystemTracker` React hook initiates a WebSocket connection to `ws://localhost:5263`.
- **Initialization:** The Tracker immediately sends an `init` message, which contains the latest historical stats pulled directly from MongoDB (`getStats()`).
- **Data Updates:** Every time a new session is saved to MongoDB (either from an app change or a tab switch), the Tracker broadcasts a real-time `stats` payload to all connected dashboard WebSockets.
- **Live Now View:** Additionally, the Tracker broadcasts an `update` message every 500ms with the OS window changes, allowing the Dashboard to display the *"Currently Active App"* instantly.

### Step 4: Visualizing the Data
- The React state within `meow_web` receives these WebSockets payloads and automatically updates its state (using `setStats` and `setCurrentApp`).
- The Frontend Components take these arrays of MongoDB sessions and map them into beautifully styled charts, grids, and analytic modules for you to view.

---

## 4. Developer Workflow: Distributing Updates to Random Users

When a developer modifies the internal code (e.g., changing the app to temporarily pause app/tab history pushing to the cloud database), those changes need to be packaged into downloadable release files. This ensures that any random user visiting the web dashboard can download the most recent native components and connect them seamlessly to their session.

Here are the proper steps for compiling and distributing updates:

### Step 1: Update the Windows App Executable (`meow-app.zip`)
1. **Compile the Native App:** Run the build command `npm run build-win` from the root project folder. This leverages `electron-builder` to bundle the Node.js tracker, Express/Websocket servers, and Electron wrappers into a standalone Windows executable.
2. **File Generation:** The raw executable is automatically generated as `Meow 1.0.0.exe` and dumped sequentially inside the `meow_web/public/downloads/` directory.
3. **Zip and Package:** To allow for safe browser downloading, compress `Meow 1.0.0.exe` into a single zip archive.
   - **Target File Output:** `meow_web/public/downloads/meow-app.zip`

### Step 2: Update the Browser Extension (`meow-extension.zip`)
1. **Gather Files:** The raw source code of the extension resides in the `meow-extension/` root directory.
2. **Zip the Extension:** Compress the entire contents of that folder.
   - **Target File Output:** `meow_web/public/downloads/meow-extension.zip`

### Step 3: Deploy the Central Web Dashboard
With `meow-app.zip` and `meow-extension.zip` now cleanly updated natively inside the `meow_web/public/downloads/` directory, the developer deploys the `meow_web` Next.js dashboard to production. 

When a new, random user visits the site, they can click "Download Desktop App" and "Download Extension". The `meow_web` server will successfully serve these newly minted binaries—guaranteeing their local system successfully syncs with the updated cloud!
