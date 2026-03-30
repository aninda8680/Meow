# 🛠️ Meow - Development & User Setup Guide

This document separates the instructions for **Developers** (working with code on localhost) and **End Users** (just using the app).

---

## 🏗️ Part 1: Developer Setup (Localhost)
Use this if you want to modify the code, add features, or debug.

### 1. Initial Installation
Clone the repo and install dependencies in all relevant folders:

```powershell
# Install root dependencies
npm install

# Install web dashboard dependencies
cd meow_web
npm install
```

After root install, `meow-tracker` is available as a local binary (via `file:./tracker`).

### 2. Running for Development
The root `package.json` has a master command to start both the Frontend and the Tracker Backend at once:

```powershell
npm run dev
```

*   **Frontend**: [http://localhost:3000](http://localhost:3000)
*   **Backend**: [ws://localhost:5263](ws://localhost:5263) (Local connection)

### 3. Testing the Tray App (Execution)
If you are working on the **System Tray / Headless** version:

```powershell
npm run electron
```
*Note: The Electron app now contains its own server. You don't need to run `npm run tracker` if Electron is running.*

---

## 🐾 Part 2: End-User Setup (Zero-Clone)
Use this guide if you just want to use Meow without looking at the code.

### 1. The Dashboard
Simply visit the official link: **[hi-meow.vercel.app](https://hi-meow.vercel.app/)**

### 2. The Invisible Tracker (Choose ONE)
To track your app switching locally, you need the backend running on your machine.

**Option A: The NPX Command (Fastest)**
Open your terminal and type:
```powershell
npx meow-tracker
```
This works if the package is published on npm or if you're inside a cloned repo that has run `npm install` at the root.

If you're in a cloned repo and `npx meow-tracker` is unavailable, run:
```powershell
npm run tracker
```

**Option B: The Tray App (Prettiest)**
1.  Download the Meow Desktop App.
2.  Run the `.exe` file.
3.  The Meow icon will appear in your **System Tray** (bottom right).

### 3. The Browser Extension
1.  Download the `meow-extension` folder.
2.  Go to `chrome://extensions` and enable **Developer Mode**.
3.  Click **Load Unpacked** and select the folder.

### 4. Verification
On the dashboard, you should see:
*   **🟢 Sync Active**: You are connected to your local backend.
*   **Recent Tabs**: Your browsing history is being bridged.

---

## 💾 Data Management
*   **Storage Location**: `~/.meow-activity-log.json` (Your Home directory).
*   **Privacy**: Your data **never** leaves your laptop. The website only acts as a viewer for your local file.
*   **Clearing Data**: Use the Trash icon in the Activity widget or the Privacy section in Settings.



uploading extension file 
Compress-Archive -Path "d:\PROJECTS\ONGOING\Meow\meow-extension\*" -DestinationPath "d:\PROJECTS\ONGOING\Meow\meow_web\public\downloads\meow-extension.zip" -Force
