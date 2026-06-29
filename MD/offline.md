# Meow Offline Tracking Architecture

This document explains how the Meow system tracks and stores data when the main dashboard website is closed or not actively being used.

## 1. Browser Tabs (Browser Extension)
The Meow browser extension operates entirely independently of the website. It has its own built-in local database (`chrome.storage.local`) that silently records all your tab activity throughout the day. 

* **Offline Behavior:** Your tab data is completely safe even if you close the browser or turn off your computer. It is written to the extension's persistent hard storage.
* **Syncing:** When you eventually open the Meow website at the end of the day, the website instantly connects to the extension via a secure bridge, pulls all the accumulated data for the entire day, and synchronizes it with the backend to display your full report.

## 2. Desktop Apps (Electron Tracker)
The Meow Electron app runs silently in the background as a system tray application. As long as this background process is running, it natively tracks your active applications and durations.

* **Offline Behavior:** It continuously logs the data into an active tracking database.
* **Important Caveat (Data Persistence):** Currently, the desktop app stores its tracking data in **temporary computer memory (RAM)** (`ephemeralSessions`). This means:
  * If you leave your computer on (or asleep) and Meow remains in the tray, your data is perfectly safe.
  * ⚠️ If you **completely Quit** the Meow Electron app from the system tray or **turn off/restart your computer**, the desktop app data for that current session will be lost.
* **Syncing:** Just like the extension, when you open the Meow dashboard, it pulls the complete desktop app history directly from the background tray application.

## Future Improvement
If desktop data persistence across computer reboots is required in the future, the Electron tracker's database (`tracker/database.js`) should be upgraded to write data to a local file (such as a SQLite database or a JSON file) instead of relying solely on temporary RAM.
