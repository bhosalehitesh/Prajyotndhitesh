# Test PostgreSQL Password Script

Write-Host "=== PostgreSQL Password Tester ===" -ForegroundColor Cyan
Write-Host ""

# Common passwords to try
$passwords = @("root", "postgres", "admin", "password", "1234", "")

Write-Host "Testing common passwords..." -ForegroundColor Yellow
Write-Host ""

$found = $false

foreach ($pwd in $passwords) {
    Write-Host "Testing password: '$pwd'..." -NoNewline
    
    # Try to connect using psql (if available)
    $env:PGPASSWORD = $pwd
    $result = & psql -U postgres -d sakhistore_hitesh_testing -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -notmatch "password authentication failed") {
        Write-Host " ✓ SUCCESS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your PostgreSQL password is: '$pwd'" -ForegroundColor Green
        Write-Host ""
        Write-Host "Update application.properties:" -ForegroundColor Yellow
        Write-Host "  spring.datasource.password=$pwd" -ForegroundColor White
        $found = $true
        break
    } else {
        Write-Host " ✗ Failed" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "None of the common passwords worked." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Check pgAdmin for saved password" -ForegroundColor White
    Write-Host "2. Reset PostgreSQL password:" -ForegroundColor White
    Write-Host "   ALTER USER postgres WITH PASSWORD 'root';" -ForegroundColor Gray
    Write-Host "3. Update application.properties with your actual password" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan

