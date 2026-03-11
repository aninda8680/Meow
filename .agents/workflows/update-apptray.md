---
description: How to update the downloadable meow-app zip file (Tray App)
---

This workflow guides you through updating the native tray app zip file available for download on the landing page.

### Steps

1. **Modify the App Code**
   Make any necessary changes inside the `electron/` or `tracker/` directories.

2. **Zip the Tray App**
   Run the following command in PowerShell to compress the necessary files.
   // turbo
   ```powershell
   Compress-Archive -Path "d:\PROJECTS\ONGOING\Meow\electron\*", "d:\PROJECTS\ONGOING\Meow\tracker\*", "d:\PROJECTS\ONGOING\Meow\package.json" -DestinationPath "d:\PROJECTS\ONGOING\Meow\meow_web\public\downloads\meow-app.zip" -Force
   ```

3. **Verify**
   Check that the file `meow_web/public/downloads/meow-app.zip` has been updated with your new changes.

4. **Deploy**
   The next time you deploy `meow_web`, the new zip file will be included in the public assets and available for users to download.
