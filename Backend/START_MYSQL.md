# Start MySQL Database - Quick Fix

## Problem
```
Connection refused: getsockopt
```
MySQL server is not running on port 3306.

## Solution

### Option 1: Start MySQL Service (Windows)

1. **Open Services:**
   - Press `Win + R`
   - Type: `services.msc`
   - Press Enter

2. **Find MySQL Service:**
   - Look for services named:
     - `MySQL` or `MySQL80` or `MySQL57`
     - Or `MySQL Server` with version number

3. **Start the Service:**
   - Right-click on the MySQL service
   - Click "Start"
   - Wait for status to change to "Running"

### Option 2: Start MySQL via Command Line

```powershell
# Find MySQL service name
Get-Service | Where-Object {$_.DisplayName -like "*mysql*"}

# Start MySQL (replace with actual service name)
Start-Service -Name "MySQL80"  # or "MySQL57" or "MySQL"
```

### Option 3: Start MySQL Manually (if installed as standalone)

If MySQL is installed but not as a service:

```powershell
# Navigate to MySQL bin directory (common locations)
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
# or
cd "C:\Program Files\MySQL\MySQL Server 5.7\bin"

# Start MySQL
.\mysqld.exe --console
```

### Option 4: Install MySQL (if not installed)

If MySQL is not installed:

1. **Download MySQL:**
   - Visit: https://dev.mysql.com/downloads/installer/
   - Download MySQL Installer for Windows

2. **Install MySQL:**
   - Run the installer
   - Choose "Developer Default" or "Server only"
   - Set root password to: `Thynktech@2025` (to match application.properties)
   - Complete installation

3. **Start MySQL service** (see Option 1)

## Verify MySQL is Running

After starting MySQL, verify it's accessible:

```powershell
# Test connection
Test-NetConnection -ComputerName localhost -Port 3306
```

Should return: `TcpTestSucceeded : True`

## Verify Database Exists

Connect to MySQL and check if database exists:

```powershell
# Connect to MySQL (replace password if different)
mysql -u root -pThynktech@2025

# In MySQL prompt, check databases:
SHOW DATABASES;

# If sakhistoretesting10 doesn't exist, create it:
CREATE DATABASE sakhistoretesting10;
```

## Start Backend Server

Once MySQL is running:

```powershell
cd Backend
mvn spring-boot:run
```

You should see:
```
Started SakhistoreApplication in X.XXX seconds
```

## Common MySQL Service Names

- `MySQL80` (MySQL 8.0)
- `MySQL57` (MySQL 5.7)
- `MySQL` (Generic)
- `MySQL Server 8.0`
- `MySQL Server 5.7`

## Alternative: Use XAMPP/WAMP

If you have XAMPP or WAMP installed:

1. **XAMPP:**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL

2. **WAMP:**
   - Open WAMP Control Panel
   - Click "Start All Services"

## Still Not Working?

1. **Check MySQL Port:**
   - Default is 3306
   - If using different port, update `application.properties`:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:YOUR_PORT/sakhistoretesting10
     ```

2. **Check Firewall:**
   - Windows Firewall might be blocking MySQL
   - Allow MySQL through firewall if needed

3. **Check MySQL Configuration:**
   - Verify `my.ini` or `my.cnf` has correct port setting
   - Usually in: `C:\ProgramData\MySQL\MySQL Server X.X\`





