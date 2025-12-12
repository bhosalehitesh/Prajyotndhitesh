# URGENT: Fix Database Password to Start Server

## The Problem
Your server CANNOT start because PostgreSQL is rejecting the password.

## Quick Fix (Choose ONE)

### Option 1: Update application.properties (EASIEST)

1. **Open:** `Backend/src/main/resources/application.properties`

2. **Find line 16:**
   ```properties
   spring.datasource.password=root
   ```

3. **Replace `root` with your actual PostgreSQL password**

   **Common passwords to try:**
   - Your Windows password
   - `postgres` (default)
   - `admin`
   - `password`
   - `1234`
   - Or whatever you set when installing PostgreSQL

4. **Save the file**

5. **Restart server:**
   ```powershell
   cd Backend
   mvn spring-boot:run
   ```

### Option 2: Reset PostgreSQL Password to "root"

**If you want to use "root" as the password:**

1. **Open pgAdmin** (PostgreSQL GUI tool)
   - Or use command line: `psql -U postgres`

2. **Run this SQL command:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'root';
   ```

3. **Restart server:**
   ```powershell
   cd Backend
   mvn spring-boot:run
   ```

### Option 3: Find Your PostgreSQL Password

**If you forgot your password:**

1. **Check pgAdmin:**
   - Open pgAdmin
   - Right-click on "PostgreSQL" server
   - Click "Properties"
   - Go to "Connection" tab
   - The password might be saved there

2. **Check Windows Credential Manager:**
   - Press `Win + R`
   - Type: `control /name Microsoft.CredentialManager`
   - Look for "postgres" entries

3. **Reset via pg_hba.conf:**
   - Find `pg_hba.conf` file (usually in PostgreSQL data directory)
   - Temporarily change authentication to `trust`
   - Restart PostgreSQL
   - Connect without password
   - Change password
   - Revert pg_hba.conf

## Verify It's Fixed

After updating the password, you should see:
```
Started SakhistoreApplication in X.XXX seconds
```

**NOT:**
```
FATAL: password authentication failed
```

## Still Not Working?

1. **Make sure PostgreSQL is running:**
   ```powershell
   Get-Service -Name postgresql*
   ```

2. **Make sure database exists:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- List databases
   \l
   
   -- If sakhistore_hitesh_testing doesn't exist:
   CREATE DATABASE sakhistore_hitesh_testing;
   ```

3. **Check the exact error** in the terminal output

## Once Server Starts

After the server starts successfully:
- Payment endpoint will work at: `http://192.168.1.21:8080/payment/create-razorpay-order`
- Test at: `http://localhost:3000/pages/payment.html`

