# Verify Database Setup

## Current Configuration
- **Database:** sakhistore_hitesh_testing
- **Username:** postgres
- **Password:** Thynktech

## Check These Issues

### 1. PostgreSQL Service Running?
```powershell
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```

If stopped, start it:
```powershell
Start-Service -Name "postgresql-x64-XX"  # Replace XX with version
```

### 2. Database Exists?
Connect to PostgreSQL and check:
```sql
-- Using pgAdmin or psql
psql -U postgres

-- List databases
\l

-- If sakhistore_hitesh_testing doesn't exist:
CREATE DATABASE sakhistore_hitesh_testing;
```

### 3. Password Correct?
The password is case-sensitive. Make sure it's exactly: **Thynktech**

### 4. Test Connection Manually
```powershell
# Set password
$env:PGPASSWORD = "Thynktech"

# Test connection
psql -U postgres -d sakhistore_hitesh_testing -c "SELECT 1;"
```

## If Still Failing

Try these password variations (case-sensitive):
- Thynktech
- thynktech
- THYNKTECH
- ThynkTech

Or check pgAdmin for the exact password format.

