# 🔄 Meow Update & Deployment Guide

This guide explains how to update and deploy the various components of the Meow ecosystem so that other developers and users can get the latest features.

---

## 🧩 1. Tab Tracker (Browser Extension)
When you modify files in the `meow-extension/` directory:

1.  **Zip the Extension**:
    Run this PowerShell command from the root directory:
    ```powershell
    Compress-Archive -Path "meow-extension\*" -DestinationPath "meow_web\public\downloads\meow-extension.zip" -Force
    ```
2.  **Verify**: Ensure `meow_web/public/downloads/meow-extension.zip` is updated.
3.  **Deploy**: Push the changes to your repository. The next Vercel deployment of `meow_web` will serve the updated zip file.

---

## 📜 2. App Tracker (Node.js / NPX)
The NPX command `npx meow-tracker` allows users to run the tracker without cloning the repo.

1.  **Code Changes**: Modify files in the `tracker/` directory.
2.  **Testing**: Run `node tracker/tracker.js` locally to verify changes.
3.  **Updating NPX**:
    *   If you have published `meow-tracker` to npm, increment the version in `tracker/package.json` and run `npm publish` from the `tracker/` folder.
    *   If you are using a direct GitHub link, simply push your changes to the main branch of your repository.

---

## 🖥️ 3. System Trap App (Electron / Tray)
This is the native desktop application.

1.  **Code Changes**: Modify files in `electron/` or the root `package.json` (for Electron config).
2.  **Local Test**: Run `npm run electron` from the root to test the app tray and tracking hooks.
3.  **Update Downloadable Zip**: 
    To update the `meow-app.zip` for public download on the landing page, run:
    ```powershell
    Compress-Archive -Path "electron\*", "tracker\*", "package.json" -DestinationPath "meow_web\public\downloads\meow-app.zip" -Force
    ```
4.  **Building for Distribution (Optional/Advanced)**:
    *   Ensure you have `electron-builder` installed.
    *   Run `npx electron-builder build --win --dir` to generate a portable folder.


---

## 🌐 4. Mission Control (Web Dashboard)
1.  **Code Changes**: Modify files in `meow_web/`.
2.  **Deployment**: Push to your connected branch (e.g., `main`). Vercel will automatically build and deploy the new version.

---

### ✅ Summary of Regular Maintenance
*   **Extension**: Zip and push to `meow_web/public/downloads`.
*   **NPX**: Publish to npm (if applicable) or push to GitHub.
*   **Web**: Push to GitHub (Vercel handles the rest).

*Last Updated: 2026-03-11*
