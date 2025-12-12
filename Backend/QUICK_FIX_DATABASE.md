# Quick Fix - Database Connection

## Status Check
✅ PostgreSQL is running (versions 15 and 16)
✅ Password set to: Thynktech

## Possible Issues

### Issue 1: Database Doesn't Exist

**Check if database exists:**
```powershell
# Set password
$env:PGPASSWORD = "Thynktech"

# Connect and list databases
psql -U postgres -c "\l"
```

**If database doesn't exist, create it:**
```sql
-- In pgAdmin or psql
CREATE DATABASE sakhistore_hitesh_testing;
```

### Issue 2: Wrong PostgreSQL Version

You have both PostgreSQL 15 and 16 running. The connection might be going to the wrong port.

**Check which port each is using:**
- PostgreSQL 15: Usually port 5432
- PostgreSQL 16: Usually port 5433

**Update application.properties if needed:**
```properties
# For PostgreSQL 15 (default)
spring.datasource.url=jdbc:postgresql://localhost:5432/sakhistore_hitesh_testing

# OR for PostgreSQL 16
spring.datasource.url=jdbc:postgresql://localhost:5433/sakhistore_hitesh_testing
```

### Issue 3: Password Case Sensitivity

PostgreSQL passwords are case-sensitive. Try these variations:
- Thynktech (current)
- thynktech
- THYNKTECH
- ThynkTech

## Quick Test

**Test the connection manually:**
```powershell
$env:PGPASSWORD = "Thynktech"
psql -U postgres -d sakhistore_hitesh_testing -c "SELECT 1;"
```

If this works, the server should work too.

## Most Likely Fix

1. **Create the database** (if it doesn't exist):
   ```sql
   CREATE DATABASE sakhistore_hitesh_testing;
   ```

2. **Verify password** - Check in pgAdmin what the actual password is

3. **Try starting server again:**
   ```powershell
   cd Backend
   mvn spring-boot:run
   ```

