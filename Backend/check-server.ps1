# Quick Server Diagnostic Script

Write-Host "=== Backend Server Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check if port 8080 is accessible
Write-Host "1. Checking if server is running on port 8080..." -ForegroundColor Yellow
$portCheck = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portCheck) {
    Write-Host "   ✓ Server is running on port 8080" -ForegroundColor Green
} else {
    Write-Host "   ✗ Server is NOT running on port 8080" -ForegroundColor Red
    Write-Host "   → Start server with: mvn spring-boot:run" -ForegroundColor Yellow
}
Write-Host ""

# Check PostgreSQL service
Write-Host "2. Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service | Where-Object {$_.Name -like "*postgres*"} | Select-Object -First 1
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "   ✓ PostgreSQL service is running: $($pgService.Name)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ PostgreSQL service is stopped: $($pgService.Name)" -ForegroundColor Red
        Write-Host "   → Start with: Start-Service -Name '$($pgService.Name)'" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠ PostgreSQL service not found" -ForegroundColor Yellow
    Write-Host "   → Make sure PostgreSQL is installed" -ForegroundColor Yellow
}
Write-Host ""

# Check application.properties
Write-Host "3. Checking application.properties..." -ForegroundColor Yellow
$propsFile = "src\main\resources\application.properties"
if (Test-Path $propsFile) {
    $content = Get-Content $propsFile -Raw
    if ($content -match "spring\.datasource\.password=(.+)") {
        $password = $matches[1].Trim()
        if ($password -eq "root") {
            Write-Host "   ⚠ Password is set to 'root' - make sure this matches your PostgreSQL password" -ForegroundColor Yellow
        } else {
            Write-Host "   ✓ Password is configured" -ForegroundColor Green
        }
    }
    
    if ($content -match "razorpay\.key=(.+)") {
        $key = $matches[1].Trim()
        if ($key -and $key -ne "") {
            Write-Host "   ✓ Razorpay key is configured" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Razorpay key is missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ✗ application.properties not found" -ForegroundColor Red
}
Write-Host ""

# Test payment endpoint (if server is running)
if ($portCheck) {
    Write-Host "4. Testing payment endpoint..." -ForegroundColor Yellow
    try {
        $body = @{
            orderId = 1
            amount = 199
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8080/payment/create-razorpay-order" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "   ✓ Payment endpoint is working! Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   ✗ Payment endpoint error: $statusCode" -ForegroundColor Red
        if ($statusCode -eq 405) {
            Write-Host "   → This is a 405 Method Not Allowed - server may need restart" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "4. Skipping endpoint test (server not running)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Fix any issues shown above" -ForegroundColor White
Write-Host "2. Start server: mvn spring-boot:run" -ForegroundColor White
Write-Host "3. Test payment page: http://localhost:3000/pages/payment.html" -ForegroundColor White

