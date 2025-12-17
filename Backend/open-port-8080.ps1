# PowerShell script to open Windows Firewall port 8080 for backend server
# Run this as Administrator

Write-Host "Opening Windows Firewall port 8080 for backend server..." -ForegroundColor Yellow

# Add inbound rule for port 8080
netsh advfirewall firewall add rule name="Backend Server Port 8080" dir=in action=allow protocol=TCP localport=8080

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host "Port 8080 is now open for incoming connections." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add firewall rule. Make sure you're running as Administrator." -ForegroundColor Red
}

Write-Host "`nChecking current IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
Write-Host "Your current IP: $ipAddress" -ForegroundColor Cyan
Write-Host "`nMake sure your mobile device is on the same WiFi network!" -ForegroundColor Yellow
