# Test Database Connection

Write-Host "=== Testing PostgreSQL Connection ===" -ForegroundColor Cyan
Write-Host ""

$propsFile = "src\main\resources\application.properties"
if (Test-Path $propsFile) {
    $content = Get-Content $propsFile -Raw
    
    if ($content -match "spring\.datasource\.url=(.+?)\r?\n") {
        $url = $matches[1].Trim()
        Write-Host "Database URL: $url" -ForegroundColor Yellow
    }
    
    if ($content -match "spring\.datasource\.username=(.+?)\r?\n") {
        $username = $matches[1].Trim()
        Write-Host "Username: $username" -ForegroundColor Yellow
    }
    
    if ($content -match "spring\.datasource\.password=(.+?)\r?\n") {
        $password = $matches[1].Trim()
        Write-Host "Password: $password" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Testing connection..." -ForegroundColor Yellow
    
    # Try to test with psql if available
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlPath) {
        $env:PGPASSWORD = $password
        $testResult = & psql -U $username -d sakhistore_hitesh_testing -c "SELECT 1;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Connection successful!" -ForegroundColor Green
        } else {
            Write-Host "✗ Connection failed!" -ForegroundColor Red
            Write-Host "Error: $testResult" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ psql not found. Cannot test connection directly." -ForegroundColor Yellow
        Write-Host "Please verify:" -ForegroundColor Yellow
        Write-Host "1. PostgreSQL is running" -ForegroundColor White
        Write-Host "2. Database 'sakhistore_hitesh_testing' exists" -ForegroundColor White
        Write-Host "3. Password is correct" -ForegroundColor White
    }
} else {
    Write-Host "✗ application.properties not found!" -ForegroundColor Red
}

Write-Host ""

