# Fix Metro File Watcher Issue on Windows
# This script clears caches and fixes common Windows file watcher problems

Write-Host "Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\.metro") {
    Remove-Item -Recurse -Force "$PSScriptRoot\.metro"
    Write-Host "✓ Metro cache cleared" -ForegroundColor Green
}

Write-Host "Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\node_modules\.cache") {
    Remove-Item -Recurse -Force "$PSScriptRoot\node_modules\.cache"
    Write-Host "✓ Node modules cache cleared" -ForegroundColor Green
}

Write-Host "Clearing watchman cache (if installed)..." -ForegroundColor Yellow
if (Get-Command watchman -ErrorAction SilentlyContinue) {
    watchman watch-del-all 2>$null
    Write-Host "✓ Watchman cache cleared" -ForegroundColor Green
}

Write-Host "Clearing Gradle cache..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\android\.gradle") {
    Remove-Item -Recurse -Force "$PSScriptRoot\android\.gradle"
    Write-Host "✓ Gradle cache cleared" -ForegroundColor Green
}

Write-Host "Clearing Android build cache..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\android\build") {
    Remove-Item -Recurse -Force "$PSScriptRoot\android\build"
    Write-Host "✓ Android build cache cleared" -ForegroundColor Green
}

Write-Host "`nAll caches cleared! Now try running:" -ForegroundColor Cyan
Write-Host "  npm start -- --reset-cache" -ForegroundColor White
Write-Host "or" -ForegroundColor Cyan
Write-Host "  npm run android" -ForegroundColor White


