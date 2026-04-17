Write-Host "🐾 Starting Meow Release Packaging..." -ForegroundColor Cyan

Write-Host "`n[1/3] Building Windows Executable using electron-builder..." -ForegroundColor Yellow
# Run the npm build command and pipe its output to standard output
cmd.exe /c "npm run build-win"

Write-Host "`n[2/3] Zipping the Meow App Executable..." -ForegroundColor Yellow
# If the exe name updates, this wild card handles it as long as it starts with Meow and ends with .exe in downloads folder.
# We'll stick to the exact name for safety or match the generated executable.
$exePath = Get-ChildItem -Path "meow_web\public\downloads\Meow *.exe" | Select-Object -First 1
if ($exePath) {
    Compress-Archive -Path $exePath.FullName -DestinationPath "meow_web\public\downloads\meow-app.zip" -Force
    Write-Host "✅ Zipped to meow-app.zip" -ForegroundColor Green
} else {
    Write-Host "❌ Could not find Meow executable to zip. Did the build fail?" -ForegroundColor Red
}

Write-Host "`n[3/3] Zipping the Browser Extension..." -ForegroundColor Yellow
if (Test-Path -Path "meow-extension\*") {
    Compress-Archive -Path "meow-extension\*" -DestinationPath "meow_web\public\downloads\meow-extension.zip" -Force
    Write-Host "✅ Zipped to meow-extension.zip" -ForegroundColor Green
}

Write-Host "`n🎉 Release packaging complete! All files are updated in meow_web\public\downloads\" -ForegroundColor Green
