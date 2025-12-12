# 🚀 QUICK START - Get Server Running NOW

## ⚠️ CURRENT ERROR
```
FATAL: password authentication failed for user "postgres"
```

## ✅ FIX IN 2 STEPS

### Step 1: Fix Password (30 seconds)

**Open:** `Backend/src/main/resources/application.properties`

**Change line 16 from:**
```properties
spring.datasource.password=root
```

**To your actual PostgreSQL password:**
```properties
spring.datasource.password=YOUR_REAL_PASSWORD
```

**Don't know your password? Try these:**
- `postgres` (most common default)
- `admin`
- `password`
- `1234`
- Your Windows login password
- Or check pgAdmin if you have it installed

### Step 2: Start Server

```powershell
cd Backend
mvn spring-boot:run
```

**Wait for:**
```
Started SakhistoreApplication in X.XXX seconds
```

## ✅ SUCCESS!

Once you see "Started SakhistoreApplication", your server is running!

**Test payment:**
- Open: `http://localhost:3000/pages/payment.html`
- Click "Pay Now"

## 🔧 Still Not Working?

### Option A: Reset PostgreSQL Password

1. Open **pgAdmin** (PostgreSQL GUI)
2. Connect to server
3. Run SQL:
   ```sql
   ALTER USER postgres WITH PASSWORD 'root';
   ```
4. Restart server

### Option B: Test Password

Run this script to find your password:
```powershell
cd Backend
.\test-db-password.ps1
```

### Option C: Check PostgreSQL is Running

```powershell
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```

If stopped, start it:
```powershell
Start-Service -Name "postgresql-x64-14"  # Replace with your version
```

## 📝 Files to Edit

- **`Backend/src/main/resources/application.properties`** - Line 16 (password)

## 🎯 That's It!

Fix the password → Start server → Test payment page

