# Production Deployment Guide
## SmartBiz.ltd - Manual Deployment to Windows Server via SolidCP

**Project Architecture:**
- **Backend:** Spring Boot 3.5.7 (Java 17) - REST API
- **Frontend:** React with Vite - Web Application
- **Database:** PostgreSQL
- **Hosting:** Windows Server with SolidCP Control Panel
- **Domain:** smartbiz.ltd

---

## Phase 1: Pre-Deployment Setup (Development Machine)

### Step 1.1: Prepare Backend JAR File

```bash
# Navigate to backend directory
cd "c:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Backend"

# Build production JAR
mvn clean package -DskipTests -P production

# JAR will be created at: Backend\target\sakhistore-0.0.1-SNAPSHOT.jar
```

**What this does:**
- Compiles Spring Boot application
- Runs without tests for faster build
- Creates executable JAR file (~80-100MB)

---

### Step 1.2: Prepare React Frontend Build

```bash
# Navigate to frontend directory
cd "c:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend(react)"

# Install dependencies
npm install

# Create production build
npm run build

# Output folder: Frontend(react)\dist
# This contains optimized static files for production
```

**Output:**
- `dist/` folder with minified HTML, CSS, JS, and assets (~5-15MB)
- Ready to serve via web server (IIS/Nginx)

---

## Phase 2: Windows Server & SolidCP Setup

### Step 2.1: Access SolidCP Control Panel

```
1. Login to SolidCP at: https://your-solidcp-server:9002
2. Navigate to Hosting Packages
3. Select your hosting package or create new one
4. Set resource limits (disk space, bandwidth, etc.)
```

### Step 2.2: Create Application Spaces in SolidCP

#### For Spring Boot Backend:

```
1. In SolidCP: Hosting Packages > Your Package > Web Sites
2. Click "New Web Site"
3. Configure:
   - Domain Name: api.smartbiz.ltd (or smartbiz.ltd/api)
   - Port: 8080 (or 80 if using reverse proxy)
   - Home Folder: D:\WebSites\api-sakhistore
   - IP Address: Assign dedicated or shared IP
4. Click Create
```

#### For React Frontend:

```
1. In SolidCP: Hosting Packages > Your Package > Web Sites
2. Click "New Web Site"
3. Configure:
   - Domain Name: smartbiz.ltd (or www.smartbiz.ltd)
   - Port: 80/443
   - Home Folder: D:\WebSites\smartbiz-frontend
   - IP Address: Same as backend or different
4. Click Create
```

---

### Step 2.3: Configure PostgreSQL Database in Windows Server

#### Option A: Using Windows Built-in PostgreSQL Service

```powershell
# RDP into Windows Server

# 1. Download PostgreSQL Windows Installer
# From: https://www.postgresql.org/download/windows/

# 2. Run installer with these settings:
#    - Installation directory: C:\Program Files\PostgreSQL\15
#    - Port: 5432
#    - Superuser password: [Strong-Password]
#    - Locale: English
#    - Service Name: postgresql-x64-15

# 3. Verify installation
psql -U postgres -c "SELECT version();"

# 4. Create production database
psql -U postgres -c "CREATE DATABASE sakhistore_prod;"
psql -U postgres -c "CREATE USER smartbiz_user WITH PASSWORD 'Prod@Pass123#Secure';"
psql -U postgres -c "ALTER ROLE smartbiz_user SET client_encoding TO 'utf8';"
psql -U postgres -c "ALTER ROLE smartbiz_user SET default_transaction_isolation TO 'read committed';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sakhistore_prod TO smartbiz_user;"
psql -U postgres -c "\c sakhistore_prod"
psql -U postgres -d sakhistore_prod -c "GRANT USAGE ON SCHEMA public TO smartbiz_user;"
psql -U postgres -d sakhistore_prod -c "GRANT CREATE ON SCHEMA public TO smartbiz_user;"
```

#### Option B: Using PostgreSQL in SolidCP (if available)

```
1. In SolidCP: Hosting > Databases > Add Database
2. Database Name: sakhistore_prod
3. Database User: smartbiz_user
4. Password: [Strong-Password]
5. Confirm creation
6. Note: Connection String for later use
```

---

## Phase 3: Deploy Backend (Spring Boot)

### Step 3.1: Upload Backend Files to Server

Using SolidCP File Manager or RDP:

```
1. Open SolidCP > File Manager
2. Navigate to: D:\WebSites\api-sakhistore
3. Upload Backend\target\sakhistore-0.0.1-SNAPSHOT.jar
4. Create folder: config
5. Upload application-prod.properties (see Step 3.2)
```

### Step 3.2: Create Production Configuration

**Create file: `application-prod.properties`**

```properties
# ====================================================
# SERVER CONFIGURATION (PROD)
# ====================================================
server.port=8080
server.address=0.0.0.0
server.servlet.context-path=/api

# ====================================================
# DATABASE CONFIGURATION (PostgreSQL - PROD)
# ====================================================
spring.datasource.url=jdbc:postgresql://localhost:5432/sakhistore_prod
spring.datasource.username=smartbiz_user
spring.datasource.password=Prod@Pass123#Secure
spring.datasource.driver-class-name=org.postgresql.Driver

# ====================================================
# RAZORPAY (PRODUCTION KEYS)
# ====================================================
razorpay.key=rzp_live_XXXXXXXXXXXxxxx
razorpay.secret=XXXXXXXXXXXXXxxxx

# ====================================================
# JPA / HIBERNATE (PROD)
# ====================================================
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ====================================================
# FLYWAY (DATABASE MIGRATIONS - PROD)
# ====================================================
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# ====================================================
# HIKARI CONNECTION POOL (PROD)
# ====================================================
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.pool-name=HikariProdPool

# ====================================================
# LOGGING (MINIMAL FOR PROD)
# ====================================================
logging.level.root=INFO
logging.level.com.smartbiz=INFO
logging.file.name=logs/sakhistore.log
logging.file.max-size=10MB
logging.file.max-history=30

# ====================================================
# CORS & SECURITY (PROD)
# ====================================================
cors.allowed.origins=https://smartbiz.ltd,https://www.smartbiz.ltd
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.max.age=3600

# ====================================================
# SSL/TLS (PROD)
# ====================================================
server.ssl.enabled=false
# Note: Handle SSL at reverse proxy level (IIS/Nginx)

# ====================================================
# PERFORMANCE TUNING (PROD)
# ====================================================
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=10
server.tomcat.accept-count=100
```

### Step 3.3: Create Startup Script (Windows Batch)

**Create file: `D:\WebSites\api-sakhistore\start-backend.bat`**

```batch
@echo off
setlocal enabledelayedexpansion

REM Set Java Home
set JAVA_HOME=C:\Program Files\Java\jdk-17.0.x
set PATH=%JAVA_HOME%\bin;%PATH%

REM Backend Directory
cd /d "D:\WebSites\api-sakhistore"

REM Create logs directory if not exists
if not exist "logs" mkdir logs

REM Run Spring Boot with production profile
echo Starting SmartBiz Backend Service...
java -Xmx1024m -Xms512m ^
  -Dspring.profiles.active=prod ^
  -Dspring.config.location=file:./application-prod.properties ^
  -Dserver.port=8080 ^
  -jar sakhistore-0.0.1-SNAPSHOT.jar >> logs\backend.log 2>&1

REM Keep window open if errors occur
if errorlevel 1 pause
```

### Step 3.4: Create Windows Service for Auto-Restart

Using NSSM (Non-Sucking Service Manager):

```powershell
# Download NSSM from: https://nssm.cc/download

# Install NSSM (as Administrator)
# Extract to: C:\Program Files\nssm

# Create service
C:\Program Files\nssm\nssm.exe install SakhistoreBackend "D:\WebSites\api-sakhistore\start-backend.bat"

# Configure service to auto-start
C:\Program Files\nssm\nssm.exe set SakhistoreBackend Start SERVICE_AUTO_START

# Start service
net start SakhistoreBackend

# Verify
Get-Service | findstr "Sakhistore"
```

---

## Phase 4: Deploy Frontend (React)

### Step 4.1: Upload Frontend Files

```
1. In SolidCP: File Manager
2. Navigate to: D:\WebSites\smartbiz-frontend
3. Upload all files from Frontend(react)\dist folder
4. Maintain folder structure:
   - index.html
   - assets/
   - css/
   - js/
```

### Step 4.2: Configure IIS for React Router

**Create file: `D:\WebSites\smartbiz-frontend\web.config`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <!-- Enable compression -->
    <httpCompression>
      <dynamicTypes>
        <add mimeType="application/json" enabled="true" />
        <add mimeType="application/x-javascript" enabled="true" />
        <add mimeType="text/css" enabled="true" />
        <add mimeType="text/html; charset=UTF-8" enabled="true" />
      </dynamicTypes>
      <staticTypes>
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="text/css" enabled="true" />
        <add mimeType="application/json" enabled="true" />
      </staticTypes>
    </httpCompression>

    <!-- Enable static compression caching -->
    <urlCompression doStaticCompression="true" doDynamicCompression="false" />

    <!-- Browser caching rules -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
      <!-- Don't cache index.html -->
      <remove fileExtension=".html" />
      <mimeMap fileExtension=".html" mimeType="text/html; charset=UTF-8" />
    </staticContent>

    <!-- URL Rewrite rules for React Router -->
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchList" trackAllCaptures="false">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>

    <!-- Security headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

---

## Phase 5: Configure SSL/TLS Certificate

### Step 5.1: Obtain SSL Certificate

**Option A: Using Let's Encrypt (Free)**
```powershell
# Download Certbot from: https://certbot.eff.org/

# Request certificate
certbot certonly --standalone -d smartbiz.ltd -d www.smartbiz.ltd

# Certificate location:
# C:\Certbot\live\smartbiz.ltd\
```

**Option B: Using commercial certificate**
```
1. Purchase from: GoDaddy, Comodo, DigiCert, etc.
2. Download .crt and .key files
3. Convert to PFX: 
   openssl pkcs12 -export -in certificate.crt -inkey private.key -out certificate.pfx
```

### Step 5.2: Install Certificate in IIS via SolidCP

```
1. In SolidCP: SSL Certificates
2. Import SSL certificate
3. Bind certificate to domains:
   - smartbiz.ltd
   - www.smartbiz.ltd
4. Configure HTTP to HTTPS redirect
```

---

## Phase 6: Network & Domain Configuration

### Step 6.1: Configure DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

```dns
Type: A Record
Name: @
Value: [Your Server Public IP Address]
TTL: 3600

Type: A Record
Name: www
Value: [Your Server Public IP Address]
TTL: 3600

Type: A Record
Name: api
Value: [Your Server Public IP Address]
TTL: 3600

Type: MX Record (Optional - for email)
Name: @
Value: mail.smartbiz.ltd
Priority: 10
```

### Step 6.2: Configure Port Forwarding (If behind firewall)

```
In your router/firewall:
- Forward port 80 → Windows Server:80 (IIS)
- Forward port 443 → Windows Server:443 (IIS)
- Forward port 8080 → Windows Server:8080 (Spring Boot - optional if using reverse proxy)
```

---

## Phase 7: Reverse Proxy Configuration (Optional but Recommended)

### Step 7.1: Configure IIS as Reverse Proxy

Using URL Rewrite module in IIS:

**For API routing: `D:\WebSites\smartbiz-frontend\web.config`**

```xml
<rewrite>
  <rules>
    <!-- API requests to backend -->
    <rule name="API Proxy" stopProcessing="true">
      <match url="^api/(.*)$" />
      <action type="Rewrite" url="http://localhost:8080/api/{R:1}" />
    </rule>
  </rules>
  <outboundRules>
    <rule name="Proxy API Response Headers">
      <match serverVariable="RESPONSE_Content-Encoding" pattern=".*" />
      <action type="Rewrite" value="{HTTP_ACCEPT_ENCODING}" />
    </rule>
  </outboundRules>
</rewrite>
```

---

## Phase 8: Database Initialization

### Step 8.1: Run Database Migrations

```powershell
# RDP into Windows Server

# Navigate to backend
cd "D:\WebSites\api-sakhistore"

# First run - let Spring Boot migrate database
# The backend will run Flyway migrations automatically on startup

# Verify database migration:
psql -U smartbiz_user -d sakhistore_prod -c "\dt"

# You should see tables: users, products, orders, etc.
```

### Step 8.2: Import Initial Data (if needed)

```sql
-- Connect to production database
psql -U smartbiz_user -d sakhistore_prod

-- Run seed data if available
\i seed-data.sql

-- Verify data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
```

---

## Phase 9: Verify Deployment

### Step 9.1: Test API Endpoint

```bash
# Test backend health check
curl https://smartbiz.ltd/api/health

# Expected response: {"status":"UP"}

# Or in PowerShell:
Invoke-WebRequest -Uri "https://smartbiz.ltd/api/health"
```

### Step 9.2: Test Frontend Access

```
1. Open browser: https://smartbiz.ltd
2. Verify page loads without errors
3. Open Developer Console (F12)
4. Check for any API errors in Network tab
```

### Step 9.3: Check Logs

```powershell
# Backend logs
Get-Content "D:\WebSites\api-sakhistore\logs\backend.log" -Tail 50

# Windows Event Viewer (for service logs)
# Event Viewer > Windows Logs > Application
```

---

## Phase 10: Monitoring & Maintenance

### Step 10.1: Set Up Health Checks

**Create monitoring script: `C:\Scripts\health-check.ps1`**

```powershell
# Health check script
$backendUrl = "https://smartbiz.ltd/api/health"
$response = $null

try {
    $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend is down! Attempting restart..." -ForegroundColor Red
    Restart-Service -Name SakhistoreBackend -Force
    Send-Email -To "admin@smartbiz.ltd" -Subject "Backend Service Restarted"
}

# Check database connection
$connString = "Server=localhost;User Id=smartbiz_user;Password=Prod@Pass123#Secure;Database=sakhistore_prod"
try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connString)
    $conn.Open()
    $conn.Close()
    Write-Host "✓ Database is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Database connection failed!" -ForegroundColor Red
}
```

### Step 10.2: Schedule Health Checks

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-File C:\Scripts\health-check.ps1"

$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) `
  -RepetitionDuration (New-TimeSpan -Days 30) -AtStartup

Register-ScheduledTask -Action $action -Trigger $trigger `
  -TaskName "SmartBiz-HealthCheck" -Description "Health check every 5 minutes"
```

### Step 10.3: Backup Strategy

**Daily Backup Script: `C:\Scripts\backup-db.ps1`**

```powershell
# PostgreSQL backup
$backupPath = "D:\Backups\Database"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"

# Create backup directory
if (!(Test-Path $backupPath)) { New-Item -ItemType Directory -Path $backupPath }

# Backup database
$env:PGPASSWORD = "Prod@Pass123#Secure"
& 'C:\Program Files\PostgreSQL\15\bin\pg_dump.exe' `
  -h localhost `
  -U smartbiz_user `
  -d sakhistore_prod `
  -F c `
  -f "$backupPath\sakhistore_prod_$timestamp.dump"

# Backup application files
$appBackup = "D:\Backups\Application\backend_$timestamp.zip"
Compress-Archive -Path "D:\WebSites\api-sakhistore\*" `
  -DestinationPath $appBackup

# Keep only last 30 days of backups
Get-ChildItem $backupPath -Filter "*.dump" | 
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
  Remove-Item
```

---

## Phase 11: Troubleshooting Guide

### Issue: Backend Service Won't Start

```powershell
# Check service status
Get-Service | findstr "Sakhistore"

# View service logs
Get-EventLog -LogName Application -Source "nssm" -Newest 10

# Manual test
cd "D:\WebSites\api-sakhistore"
java -jar sakhistore-0.0.1-SNAPSHOT.jar -Dspring.profiles.active=prod

# Common fixes:
# 1. Verify Java is installed: java -version
# 2. Check database credentials in application-prod.properties
# 3. Ensure port 8080 is not in use: netstat -ano | findstr 8080
# 4. Check disk space: Get-Volume
```

### Issue: Frontend Showing Blank Page

```
1. Check IIS is running: Get-Service W3SVC
2. Verify index.html exists: Test-Path "D:\WebSites\smartbiz-frontend\index.html"
3. Check web.config syntax: Open in Visual Studio or XML validator
4. Review IIS logs: C:\inetpub\logs\LogFiles\W3SVC1\
5. Browser console errors (F12) - usually API connection issues
```

### Issue: Database Connection Errors

```powershell
# Test PostgreSQL connection
psql -h localhost -U smartbiz_user -d sakhistore_prod -c "SELECT 1"

# Check PostgreSQL service
Get-Service postgresql-*

# Verify database exists
psql -U postgres -l | grep sakhistore_prod

# Check user permissions
psql -U postgres -d sakhistore_prod -c "\du"
```

### Issue: SSL/TLS Certificate Errors

```powershell
# List installed certificates
Get-ChildItem Cert:\LocalMachine\My

# View certificate details
Get-ChildItem Cert:\LocalMachine\My | Select-Object Thumbprint, Subject, NotAfter

# Renew certificate (Let's Encrypt)
certbot renew --standalone

# Update in SolidCP: SSL Certificates > Re-import new certificate
```

---

## Phase 12: Performance Optimization

### Step 12.1: Enable Database Query Caching

```properties
# In application-prod.properties
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.cache.redis.time-to-live=600000
```

### Step 12.2: Enable Response Compression

```properties
# In application-prod.properties
server.compression.enabled=true
server.compression.min-response-size=1024
server.compression.excluded-mime-types=image/png,image/jpeg
```

### Step 12.3: Frontend Optimization

```bash
# Already optimized by Vite build
# Additional: Configure CDN for static assets
# Update Frontend\vite.config.js to use CDN URLs
```

---

## Phase 13: Security Checklist

- [ ] Firewall enabled on Windows Server
- [ ] Only required ports open (80, 443, 5432)
- [ ] Database password is strong (16+ characters, mixed case, numbers, symbols)
- [ ] API rate limiting enabled (if needed)
- [ ] CORS properly configured for frontend domain only
- [ ] SSL/TLS certificate valid and not self-signed
- [ ] Regular security patches applied
- [ ] Database backups stored separately
- [ ] Admin credentials rotated monthly
- [ ] Logs monitored for unauthorized access attempts

---

## Quick Reference Commands

```powershell
# Start/Stop services
net start SakhistoreBackend
net stop SakhistoreBackend

# Check service status
Get-Service | findstr "Sakhistore"

# View real-time logs
Get-Content "D:\WebSites\api-sakhistore\logs\backend.log" -Wait

# Check port usage
netstat -ano | findstr :8080
netstat -ano | findstr :80
netstat -ano | findstr :5432

# Restart IIS
iisreset /restart

# Verify database connection
psql -h localhost -U smartbiz_user -d sakhistore_prod -c "SELECT NOW()"

# Clear backend logs
Clear-Content "D:\WebSites\api-sakhistore\logs\backend.log"
```

---

## Support & Resources

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Docs:** https://react.dev
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **SolidCP Docs:** https://www.solidcp.com/
- **IIS Documentation:** https://docs.microsoft.com/en-us/iis/
- **NSSM Documentation:** https://nssm.cc/

---

## Deployment Checklist

### Pre-Deployment
- [ ] Backend JAR built successfully
- [ ] Frontend dist folder generated
- [ ] Production properties file created
- [ ] PostgreSQL installed on Windows Server
- [ ] Java 17 installed on Windows Server
- [ ] Domain DNS records updated

### During Deployment
- [ ] Backend JAR uploaded to server
- [ ] Frontend files uploaded to server
- [ ] application-prod.properties configured
- [ ] Windows service created for backend
- [ ] IIS configured for frontend
- [ ] SSL certificate installed
- [ ] Database migrations ran successfully

### Post-Deployment
- [ ] API endpoint responding to requests
- [ ] Frontend loading without errors
- [ ] Database connectivity verified
- [ ] Logs monitored for errors
- [ ] Health check script running
- [ ] Backup system active
- [ ] Team notified of deployment completion

---

**Last Updated:** 2025-12-31
**Project:** SmartBiz - Production Deployment v1.0
