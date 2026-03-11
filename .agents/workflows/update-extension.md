---
description: How to update the downloadable meow-extension zip file
---

This workflow guides you through updating the extension zip file available for download on the landing page.

### Steps

1. **Modify the Extension**
   Make any necessary changes inside the `meow-extension` directory at the root of the project.

2. **Zip the Extension**
   Run the following command in PowerShell to compress the extension files.
   // turbo
   ```powershell
   Compress-Archive -Path "d:\PROJECTS\ONGOING\Meow\meow-extension\*" -DestinationPath "d:\PROJECTS\ONGOING\Meow\meow_web\public\downloads\meow-extension.zip" -Force
   ```

3. **Verify**
   Check that the file `meow_web/public/downloads/meow-extension.zip` has been updated with your new changes.

4. **Deploy**
   The next time you deploy `meow_web`, the new zip file will be included in the public assets and available for users to download.
