# Direct PostgreSQL Connection Test

Write-Host "=== Testing PostgreSQL Connection ===" -ForegroundColor Cyan
Write-Host ""

$password = "Thynktech"
$username = "postgres"
$database = "sakhistore_hitesh_testing"

Write-Host "Testing with:" -ForegroundColor Yellow
Write-Host "  Username: $username" -ForegroundColor White
Write-Host "  Password: $password" -ForegroundColor White
Write-Host "  Database: $database" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host ""

# Try to find psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        Write-Host "Found psql at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psql) {
    $psql = Get-Command psql -ErrorAction SilentlyContinue
    if ($psql) {
        $psql = $psql.Path
    }
}

if (-not $psql) {
    Write-Host "✗ psql not found. Cannot test connection." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please test manually in pgAdmin:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin" -ForegroundColor White
    Write-Host "2. Connect to PostgreSQL server" -ForegroundColor White
    Write-Host "3. Check if database 'sakhistore_hitesh_testing' exists" -ForegroundColor White
    Write-Host "4. If not, create it: CREATE DATABASE sakhistore_hitesh_testing;" -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "Test 1: Check if database exists..." -ForegroundColor Yellow
$env:PGPASSWORD = $password
$dbCheck = & $psql -U $username -d postgres -c "\l" 2>&1 | Select-String "sakhistore_hitesh_testing"

if ($dbCheck) {
    Write-Host "✓ Database exists!" -ForegroundColor Green
} else {
    Write-Host "✗ Database does NOT exist!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating database..." -ForegroundColor Yellow
    $createResult = & $psql -U $username -d postgres -c "CREATE DATABASE sakhistore_hitesh_testing;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        Write-Host "Error: $createResult" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test 2: Test connection to database..." -ForegroundColor Yellow
$testResult = & $psql -U $username -d $database -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== SUCCESS ===" -ForegroundColor Green
    Write-Host "Database connection is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now start the server:" -ForegroundColor Yellow
    Write-Host "  mvn spring-boot:run" -ForegroundColor White
} else {
    Write-Host "✗ Connection failed!" -ForegroundColor Red
    Write-Host "Error output:" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    
    if ($testResult -match "password authentication failed") {
        Write-Host "→ Password is incorrect!" -ForegroundColor Yellow
        Write-Host "  Check the exact password in pgAdmin" -ForegroundColor White
    } elseif ($testResult -match "does not exist") {
        Write-Host "→ Database does not exist!" -ForegroundColor Yellow
        Write-Host "  Create it manually in pgAdmin" -ForegroundColor White
    } else {
        Write-Host "→ Check PostgreSQL is running and accessible" -ForegroundColor Yellow
    }
}

Write-Host ""

