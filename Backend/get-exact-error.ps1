# Get exact error message from server startup

Write-Host "Starting server to capture exact error..." -ForegroundColor Yellow
Write-Host ""

$process = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory (Get-Location) -NoNewWindow -PassThru -RedirectStandardError "error.log" -RedirectStandardOutput "output.log"

Start-Sleep -Seconds 15

Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue

Write-Host "=== ERROR LOG ===" -ForegroundColor Red
Get-Content "error.log" | Select-String -Pattern "FATAL|password|authentication|Exception|Error" -Context 1 | Select-Object -First 20

Write-Host ""
Write-Host "=== OUTPUT LOG (Last 30 lines) ===" -ForegroundColor Yellow
Get-Content "output.log" | Select-Object -Last 30

Remove-Item "error.log", "output.log" -ErrorAction SilentlyContinue

