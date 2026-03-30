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
The NPX command `npx meow-tracker` works only after the package is published to npm.

1.  **Code Changes**: Modify files in the `tracker/` directory.
2.  **Testing**: Run `node tracker/tracker.js` locally to verify changes.
3.  **Repo-local fallback**: In a cloned repo, run `npm run tracker` from root.
3.  **Updating NPX**:
    *   If you have published `meow-tracker` to npm, increment the version in `tracker/package.json` and run `npm publish` from the `tracker/` folder.
    *   If you are using a direct GitHub link, simply push your changes to the main branch of your repository.

---

## 🖥️ 3. System Trap App (Electron / Tray)
This is the native desktop application.

1.  **Code Changes**: Modify files in `electron/` or the root `package.json` (for Electron config).
2.  **Local Test**: Run `npm run electron` from the root to test the app tray and tracking hooks.
3.  **Update Downloadable App**:
    To compile the `.exe` for public download on the landing page, run:
    ```powershell
    npm run build-win
    ```
    This will automatically build and place the `.exe` file into `meow_web/public/downloads/Meow 1.0.0.exe`.
4.  **Deployment**: Push your changes to the project repository. Vercel will pick up the newly generated `.exe` file on the next deployment.
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
