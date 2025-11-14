# ADB Reverse Setup Script
# Run this script every time you connect your device or restart ADB

Write-Host "Setting up ADB reverse port forwarding..." -ForegroundColor Cyan

# Check if device is connected
$devices = adb devices
if ($devices -notmatch "device") {
    Write-Host "❌ No device connected. Please connect your device and try again." -ForegroundColor Red
    Write-Host "Run: adb devices" -ForegroundColor Yellow
    exit 1
}

# Setup ADB reverse
Write-Host "Setting up reverse port forwarding: 8080 -> 8080" -ForegroundColor Yellow
adb reverse tcp:8080 tcp:8080

# Verify
Write-Host "`nVerifying ADB reverse setup..." -ForegroundColor Cyan
$reverse = adb reverse --list
if ($reverse -match "8080") {
    Write-Host "✅ ADB reverse is set up successfully!" -ForegroundColor Green
    Write-Host "`nReverse port forwarding:" -ForegroundColor Cyan
    adb reverse --list
} else {
    Write-Host "❌ Failed to set up ADB reverse" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Setup complete! Your app can now connect to backend at http://localhost:8080" -ForegroundColor Green
Write-Host "`nNote: Run this script again if you disconnect/reconnect your device" -ForegroundColor Yellow

