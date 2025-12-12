# Fix Database Connection Error

## Problem
```
FATAL: password authentication failed for user "postgres"
```

## Solution

The PostgreSQL password in `application.properties` doesn't match your actual PostgreSQL password.

### Option 1: Update application.properties (Recommended)

1. Open `Backend/src/main/resources/application.properties`

2. Find the database configuration (around line 14-16):
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/sakhistore_hitesh_testing
   spring.datasource.username=postgres
   spring.datasource.password=root
   ```

3. Update the password to match your actual PostgreSQL password:
   ```properties
   spring.datasource.password=YOUR_ACTUAL_POSTGRES_PASSWORD
   ```

4. Save the file

5. Restart the server:
   ```bash
   cd Backend
   mvn spring-boot:run
   ```

### Option 2: Reset PostgreSQL Password

If you don't know your PostgreSQL password:

1. **Windows (using pgAdmin or psql):**
   - Open pgAdmin
   - Right-click on PostgreSQL server → Properties → Change password
   - Or use psql command line:
     ```sql
     ALTER USER postgres WITH PASSWORD 'root';
     ```

2. **Or create a new user:**
   ```sql
   CREATE USER sakhistore_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sakhistore_hitesh_testing TO sakhistore_user;
   ```

### Option 3: Verify Database Exists

Make sure the database `sakhistore_hitesh_testing` exists:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Check if database exists
\l

-- If it doesn't exist, create it
CREATE DATABASE sakhistore_hitesh_testing;
```

### Option 4: Check PostgreSQL is Running

**Windows:**
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# If not running, start it
Start-Service -Name postgresql-x64-XX  # Replace XX with your version
```

**Or check in Services:**
- Press `Win + R`, type `services.msc`
- Find "postgresql" service
- Right-click → Start (if stopped)

## Quick Test

After fixing the password, test the connection:

```powershell
# Test PostgreSQL connection (if psql is in PATH)
psql -U postgres -d sakhistore_hitesh_testing -h localhost
```

## After Fixing

Once the database connection works, the server should start successfully and you'll see:
```
Started SakhistoreApplication in X.XXX seconds
```

Then you can test the payment endpoint at:
- `http://localhost:3000/pages/payment.html`

