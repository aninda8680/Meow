---
description: How to update the downloadable meow-app zip file (Tray App)
---

This workflow guides you through updating the native tray app zip file available for download on the landing page.

### Steps

1. **Modify the App Code**
   Make any necessary changes inside the `electron/` or `tracker/` directories.

2. **Package the App**
   Run the following command to build the native Windows executable.
   // turbo
   ```powershell
   npm run build-win
   ```

3. **Zip the Executable**
   Compress the generated portable `.exe` into the public downloads folder.
   // turbo
   ```powershell
   Compress-Archive -Path "d:\PROJECTS\ONGOING\Meow\release\Meow.exe" -DestinationPath "d:\PROJECTS\ONGOING\Meow\meow_web\public\downloads\meow-app.zip" -Force
   ```

4. **Verify**
   Check that the file `meow_web/public/downloads/meow-app.zip` has been updated and contains the `Meow.exe` file.

5. **Deploy**
   The next time you deploy `meow_web`, the new zip file will be included in the public assets and available for users to download.
