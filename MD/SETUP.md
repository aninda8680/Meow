# 🐾 Meow - Complete Setup Guide

Follow these steps to get your local, privacy-first productivity companion up and running.

---

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   A Web Browser (Brave, Chrome, or Edge)
*   [Git](https://git-scm.com/) (to clone the project)

---

## 🚀 Step 1: Install Dependencies
Open your terminal in the root folder of the project and run:

```powershell
# Install root dependencies (Concurrently, Electron, etc.)
npm install

# Install tracker dependencies
cd tracker
npm install

# Install Web Dashboard dependencies
cd ../meow_web
npm install
```

---

## 🧩 Step 2: Install the Browser Extension
To track your website usage, you need to load the Meow extension into your browser:

1.  Open your browser and go to the **Extensions** page:
    *   Brave: `brave://extensions`
    *   Chrome: `chrome://extensions`
2.  Enable **"Developer mode"** (usually a toggle in the top-right corner).
3.  Click **"Load unpacked"**.
4.  Navigate to your project folder and select the **`meow-extension`** folder.
5.  The "Meow Tab Tracker" should now appear in your extension list.

---

## 🟢 Step 3: Run the Ecosystem (Zero-Clone Setup)

The easiest way to run Meow is to use **npx**. You don't even need to clone this repository! Just run this in your terminal:

```powershell
npx meow-tracker
```

### What happens now?
*   **Background Tracker**: Starts a light process that watches your app switching.
*   **Data Storage**: Your data is saved to `~/.meow-activity-log.json` (your home folder).
*   **Web Dashboard**: Simply visit `https://hi-meow.vercel.app` (or your own Vercel URL).

---

## 🛠️ Step 4: First-Time Interaction
1.  Open `http://localhost:3000` in your browser.
2.  Look at the **Tab Tracker** (bottom right). It should show **🟢 Local Sync active**.
3.  Browse a few websites (e.g., GitHub, YouTube) for at least 10 seconds.
4.  Switch back to the Meow dashboard—you should see your website and app history appearing instantly.

---

## 💾 Where is my data?
Your data is stored in **`tracker/activity_log.json`**. 
*   This file is **never** uploaded to any server.
*   You can back it up, move it, or delete it whenever you want.
*   The dashboard reads directly from this file for all your history and graphs.

---

## ❓ Troubleshooting
*   **"Sync Offline"**: Ensure you ran `npm run dev` from the **root** folder, not just inside `meow_web`.
*   **No Tabs showing**: Ensure the extension is "Pinned" and enabled. Refresh the dashboard after installing the extension.
*   **App Tracking not working**: Make sure you have given the terminal permission to "Record the screen" or "Accessibility" if your OS asks for it.

---
*Happy Focusing! 🐾*
