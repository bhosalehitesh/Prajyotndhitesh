# Fix Database Password and Start Server

Write-Host "=== Fixing Database Connection ===" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "⚠ psql not found in PATH. Trying common locations..." -ForegroundColor Yellow
    
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $env:Path += ";$(Split-Path $path -Parent)"
            Write-Host "✓ Found PostgreSQL at: $path" -ForegroundColor Green
            break
        }
    }
}

# Test common passwords
Write-Host ""
Write-Host "Testing common PostgreSQL passwords..." -ForegroundColor Yellow
Write-Host ""

$passwords = @("postgres", "root", "admin", "password", "1234", "")

$workingPassword = $null

foreach ($pwd in $passwords) {
    Write-Host "Testing: '$pwd'..." -NoNewline
    
    $env:PGPASSWORD = $pwd
    $testResult = & psql -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    $isSuccess = ($LASTEXITCODE -eq 0) -or (($testResult -notmatch "password authentication failed") -and ($testResult -notmatch "FATAL"))
    if ($isSuccess) {
        Write-Host " ✓ WORKS!" -ForegroundColor Green
        $workingPassword = $pwd
        break
    } else {
        Write-Host " ✗ Failed" -ForegroundColor Red
    }
}

if ($workingPassword) {
    Write-Host ""
    Write-Host "✓ Found working password: '$workingPassword'" -ForegroundColor Green
    Write-Host ""
    Write-Host "Updating application.properties..." -ForegroundColor Yellow
    
    # Update application.properties
    $propsFile = "src\main\resources\application.properties"
    if (Test-Path $propsFile) {
        $content = Get-Content $propsFile -Raw
        $content = $content -replace "spring\.datasource\.password=.*", "spring.datasource.password=$workingPassword"
        Set-Content -Path $propsFile -Value $content -NoNewline
        Write-Host "✓ Updated application.properties" -ForegroundColor Green
    } else {
        Write-Host "✗ application.properties not found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "=== Starting Server ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Starting Spring Boot server..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    
    # Start the server
    mvn spring-boot:run
    
} else {
    Write-Host ""
    Write-Host "✗ None of the common passwords worked." -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to:" -ForegroundColor Yellow
    Write-Host "1. Find your PostgreSQL password (check pgAdmin)" -ForegroundColor White
    Write-Host "2. OR reset it:" -ForegroundColor White
    Write-Host "   - Open pgAdmin" -ForegroundColor Gray
    Write-Host "   - Connect to server" -ForegroundColor Gray
    Write-Host "   - Run: ALTER USER postgres WITH PASSWORD 'postgres';" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Then manually update:" -ForegroundColor White
    Write-Host "   Backend/src/main/resources/application.properties" -ForegroundColor Gray
    Write-Host "   Line 16: spring.datasource.password=YOUR_PASSWORD" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Run: mvn spring-boot:run" -ForegroundColor White
}

