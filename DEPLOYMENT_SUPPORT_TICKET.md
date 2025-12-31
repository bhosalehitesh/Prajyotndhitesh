# SUPPORT TICKET - PRODUCTION DEPLOYMENT REQUEST

**Ticket ID:** DEPLOY-SMARTBIZ-001  
**Date Created:** 2025-12-31  
**Priority:** HIGH  
**Status:** PENDING  
**Project:** SmartBiz.ltd - Multi-tier Web Application  
**Environment:** Production  

---

## 1. TICKET SUMMARY

Request for production deployment of SmartBiz web application across multiple hosting platforms with specific port configurations and database setup.

---

## 2. PROJECT DETAILS

### 2.1 Project Information
| Field | Value |
|-------|-------|
| **Application Name** | SmartBiz Store Management System |
| **Domain** | smartbiz.ltd, www.smartbiz.ltd |
| **Project Type** | Full-stack Web Application |
| **Primary Language** | Java (Backend), JavaScript/React (Frontend) |
| **Database** | PostgreSQL |
| **Target Deployment** | HapiHost + Windows Server + SolidCP |

### 2.2 Architecture Overview
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  HapiHost Platform                              │
│  ├── React Frontend (Port 443/80)              │
│  ├── Spring Boot Backend (Port 8080)           │
│  └── PostgreSQL Database                       │
│                                                 │
└─────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│  Windows Server + SolidCP                       │
│  ├── IIS Web Server (Port 80/443)              │
│  ├── Spring Boot Service (Port 8080)           │
│  └── PostgreSQL Server                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 3. DEPLOYMENT REQUIREMENTS

### 3.1 Infrastructure Setup Required

#### HapiHost Configuration:
- [ ] Virtual Private Server (VPS) or Cloud Instance
- [ ] OS: Linux (Ubuntu 20.04 LTS or later) OR Windows Server 2019+
- [ ] Minimum Resources:
  - CPU: 4 cores (2+ GHz)
  - RAM: 8GB minimum (16GB recommended)
  - Storage: 100GB SSD (for application + database)
  - Bandwidth: Unlimited or 5TB+/month
  - Public IP Address: 1 (static)

#### Windows Server + SolidCP Configuration:
- [ ] Windows Server 2019 or 2022
- [ ] SolidCP Control Panel installed
- [ ] Resources:
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 100GB SSD
  - Network: Dedicated or shared IP

---

## 4. PORT CONFIGURATION

### 4.1 Port Allocation & Usage

```
┌─────────────────────────────────────────────────┐
│ PORT CONFIGURATION TABLE                        │
├─────────────────────────────────────────────────┤
│ PORT │ PROTOCOL │ SERVICE      │ EXTERNAL │ HOST│
├──────┼──────────┼──────────────┼──────────┼─────┤
│ 80   │ HTTP     │ IIS/Nginx    │ Public   │ Any │
│ 443  │ HTTPS    │ IIS/Nginx    │ Public   │ Any │
│ 8080 │ HTTP     │ Spring Boot  │ Internal │ *   │
│ 5432 │ PGSQL    │ PostgreSQL   │ Internal │ Yes │
│ 9002 │ HTTPS    │ SolidCP      │ Internal │ Yes │
│ 22   │ SSH      │ Remote Access│ Internal │ Yes │
└─────────────────────────────────────────────────┘

* Port 8080: Used internally by Spring Boot backend
  - Will be accessed via reverse proxy (IIS/Nginx)
  - NOT directly exposed to internet
  - Should be restricted to localhost/127.0.0.1
  - Firewall rule: Allow only from proxy server
```

### 4.2 Service Port Mapping

**Spring Boot Backend - Port 8080:**
```
External Request: https://smartbiz.ltd/api/...
                         ↓
                    Port 443 (HTTPS)
                         ↓
                    IIS/Nginx Proxy
                         ↓
                    Port 8080 (localhost)
                         ↓
                    Spring Boot Application
```

**Port Blocking Strategy:**
```powershell
# Firewall rules for Windows Server
# ALLOW:
# - 80/TCP from any (HTTP redirect to HTTPS)
# - 443/TCP from any (HTTPS for frontend)
# - 22/TCP from admin IP only (SSH/RDP)
# - 9002/TCP from admin IP only (SolidCP)

# BLOCK:
# - 8080/TCP from internet (backend internal only)
# - 5432/TCP from internet (database internal only)
```

---

## 5. INSTALLATION & CONFIGURATION CHECKLIST

### 5.1 HapiHost Pre-Deployment Tasks

**Environment Setup:**
- [ ] Server instance provisioned and accessible
- [ ] OS updated to latest patches: `apt update && apt upgrade -y` (Linux)
- [ ] Required software installed:
  - Java 17 JDK: `apt install openjdk-17-jdk-headless`
  - Node.js 18+: `apt install nodejs npm`
  - PostgreSQL 15+: `apt install postgresql postgresql-contrib`
  - Nginx: `apt install nginx`
  - Git: `apt install git`

**Network Configuration:**
- [ ] Static public IP assigned
- [ ] DNS records pointed to HapiHost IP
- [ ] Firewall configured (see Port Configuration)
- [ ] SSL certificate provisioned (Let's Encrypt)

**Directory Structure:**
```bash
/opt/smartbiz/
├── api-backend/
│   ├── sakhistore-0.0.1-SNAPSHOT.jar
│   ├── application-prod.properties
│   ├── logs/
│   └── config/
├── web-frontend/
│   ├── dist/
│   ├── index.html
│   └── nginx.conf
└── database/
    ├── backups/
    └── scripts/
```

### 5.2 Windows Server + SolidCP Pre-Deployment Tasks

**System Preparation:**
- [ ] Windows Server 2019/2022 installed
- [ ] SolidCP 1.5+ installed and configured
- [ ] Remote Desktop access enabled
- [ ] Windows Updates installed
- [ ] Firewall enabled and configured

**Software Installation (via SolidCP or Manual):**
- [ ] Java 17 JDK: `C:\Program Files\Java\jdk-17.x.x`
- [ ] PostgreSQL 15+: `C:\Program Files\PostgreSQL\15`
- [ ] IIS (Internet Information Services) enabled
- [ ] URL Rewrite Module installed
- [ ] Application Request Routing (ARR) installed

**Directory Structure:**
```
D:\WebSites\
├── smartbiz-frontend\
│   ├── index.html
│   ├── dist/
│   ├── web.config
│   └── assets/
├── api-sakhistore\
│   ├── sakhistore-0.0.1-SNAPSHOT.jar
│   ├── application-prod.properties
│   ├── start-backend.bat
│   └── logs/
└── backups\
    ├── database\
    └── application\
```

---

## 6. DATABASE INSTALLATION & CONFIGURATION

### 6.1 PostgreSQL Setup on HapiHost (Linux)

```bash
#!/bin/bash
# PostgreSQL Installation Script for HapiHost

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create production database and user
sudo -u postgres psql <<EOF
CREATE DATABASE sakhistore_prod;
CREATE USER smartbiz_user WITH PASSWORD 'Prod@Pass123#Secure';
ALTER ROLE smartbiz_user SET client_encoding TO 'utf8';
ALTER ROLE smartbiz_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartbiz_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE sakhistore_prod TO smartbiz_user;
\c sakhistore_prod
GRANT USAGE ON SCHEMA public TO smartbiz_user;
GRANT CREATE ON SCHEMA public TO smartbiz_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smartbiz_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smartbiz_user;
EOF

# Enable remote connections (if needed)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/15/main/postgresql.conf

# Add connection permissions (restrict to app server)
echo "host    sakhistore_prod    smartbiz_user    127.0.0.1/32    md5" | \
  sudo tee -a /etc/postgresql/15/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify installation
sudo -u postgres psql -d sakhistore_prod -c "SELECT 1"

echo "PostgreSQL setup complete!"
```

**Backup Credentials:**
```
Database: sakhistore_prod
Username: smartbiz_user
Password: Prod@Pass123#Secure
Host: localhost
Port: 5432
```

### 6.2 PostgreSQL Setup on Windows Server + SolidCP

```powershell
# Download and install PostgreSQL
# From: https://www.postgresql.org/download/windows/

# Post-Installation Steps:
$postgresBin = "C:\Program Files\PostgreSQL\15\bin"

# Create database
& "$postgresBin\psql.exe" -U postgres -c "CREATE DATABASE sakhistore_prod;"

# Create user
& "$postgresBin\psql.exe" -U postgres -c "CREATE USER smartbiz_user WITH PASSWORD 'Prod@Pass123#Secure';"

# Grant permissions
& "$postgresBin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sakhistore_prod TO smartbiz_user;"

# Verify
& "$postgresBin\psql.exe" -U smartbiz_user -d sakhistore_prod -c "SELECT NOW();"
```

---

## 7. BACKEND DEPLOYMENT (Port 8080)

### 7.1 Build Backend Application

```bash
# Clone or extract project
cd /opt/smartbiz/api-backend

# Build with Maven
./mvnw clean package -DskipTests -P production

# Output: target/sakhistore-0.0.1-SNAPSHOT.jar
```

### 7.2 Production Configuration File

**Location:** `/opt/smartbiz/api-backend/application-prod.properties`

```properties
# ====================================================
# SERVER CONFIGURATION - PORT 8080
# ====================================================
server.port=8080
server.address=127.0.0.1
server.servlet.context-path=/api

# ====================================================
# DATABASE CONFIGURATION (PostgreSQL)
# ====================================================
spring.datasource.url=jdbc:postgresql://localhost:5432/sakhistore_prod
spring.datasource.username=smartbiz_user
spring.datasource.password=Prod@Pass123#Secure
spring.datasource.driver-class-name=org.postgresql.Driver

# ====================================================
# DATABASE CONNECTION POOLING
# ====================================================
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# ====================================================
# RAZORPAY PAYMENT GATEWAY (PRODUCTION KEYS)
# ====================================================
razorpay.key=rzp_live_XXXXXXXXXXXXXXXXXX
razorpay.secret=XXXXXXXXXXXXXXXXXXXXXXXXXX

# ====================================================
# JPA / HIBERNATE
# ====================================================
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ====================================================
# FLYWAY DATABASE MIGRATIONS
# ====================================================
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# ====================================================
# CORS & SECURITY
# ====================================================
cors.allowed.origins=https://smartbiz.ltd,https://www.smartbiz.ltd
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.max.age=3600

# ====================================================
# LOGGING
# ====================================================
logging.level.root=INFO
logging.level.com.smartbiz=INFO
logging.file.name=logs/sakhistore.log
logging.file.max-size=10MB
logging.file.max-history=30

# ====================================================
# PERFORMANCE TUNING
# ====================================================
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=10
server.tomcat.accept-count=100
```

### 7.3 Deploy Backend on HapiHost (Linux)

```bash
#!/bin/bash
# Deploy Spring Boot Backend on HapiHost

BACKEND_HOME="/opt/smartbiz/api-backend"
LOG_DIR="$BACKEND_HOME/logs"
JAR_FILE="$BACKEND_HOME/sakhistore-0.0.1-SNAPSHOT.jar"

# Create logs directory
mkdir -p $LOG_DIR

# Create systemd service file
sudo tee /etc/systemd/system/smartbiz-backend.service > /dev/null <<EOF
[Unit]
Description=SmartBiz Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=smartbiz
WorkingDirectory=$BACKEND_HOME
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
Environment="JAVA_OPTS=-Xmx1024m -Xms512m"
ExecStart=/usr/lib/jvm/java-17-openjdk-amd64/bin/java \
    -Dspring.profiles.active=prod \
    -Dspring.config.location=file:$BACKEND_HOME/application-prod.properties \
    -Dserver.port=8080 \
    -jar $JAR_FILE
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/backend.log
StandardError=append:$LOG_DIR/backend.log

[Install]
WantedBy=multi-user.target
EOF

# Create smartbiz user
sudo useradd -r -s /bin/false smartbiz 2>/dev/null

# Set permissions
sudo chown -R smartbiz:smartbiz $BACKEND_HOME
sudo chmod +x $JAR_FILE

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable smartbiz-backend.service
sudo systemctl start smartbiz-backend.service

# Verify
sudo systemctl status smartbiz-backend.service

echo "Backend deployed on port 8080!"
```

### 7.4 Deploy Backend on Windows Server + SolidCP

**Create startup script:** `D:\WebSites\api-sakhistore\start-backend.bat`

```batch
@echo off
setlocal enabledelayedexpansion

set JAVA_HOME=C:\Program Files\Java\jdk-17.x.x
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "D:\WebSites\api-sakhistore"

if not exist "logs" mkdir logs

echo [%date% %time%] Starting SmartBiz Backend Service... >> logs\backend.log

java -Xmx1024m -Xms512m ^
  -Dspring.profiles.active=prod ^
  -Dspring.config.location=file:./application-prod.properties ^
  -Dserver.port=8080 ^
  -jar sakhistore-0.0.1-SNAPSHOT.jar >> logs\backend.log 2>&1

if errorlevel 1 (
  echo [%date% %time%] ERROR: Backend failed to start >> logs\backend.log
  pause
)
```

**Create Windows Service:**

```powershell
# Download NSSM from https://nssm.cc/download
# Extract to C:\Program Files\nssm

$nssm = "C:\Program Files\nssm\nssm.exe"

# Install service
& $nssm install SakhistoreBackend "D:\WebSites\api-sakhistore\start-backend.bat"

# Configure service
& $nssm set SakhistoreBackend Start SERVICE_AUTO_START
& $nssm set SakhistoreBackend AppThrottle 1500
& $nssm set SakhistoreBackend AppEvents Power
& $nssm set SakhistoreBackend LogFile "D:\WebSites\api-sakhistore\logs\service.log"

# Start service
net start SakhistoreBackend

# Verify
Get-Service | findstr "Sakhistore"
```

---

## 8. FRONTEND DEPLOYMENT

### 8.1 Build Frontend

```bash
cd Frontend\(react\)
npm install
npm run build
# Output: dist/ folder
```

### 8.2 Deploy Frontend on HapiHost (Nginx)

```bash
#!/bin/bash
# Deploy React Frontend on Nginx (HapiHost)

FRONTEND_HOME="/var/www/smartbiz"
DIST_SOURCE="/opt/smartbiz/web-frontend/dist"

# Create directory
sudo mkdir -p $FRONTEND_HOME
sudo cp -r $DIST_SOURCE/* $FRONTEND_HOME/

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/smartbiz.ltd > /dev/null <<'EOF'
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name smartbiz.ltd www.smartbiz.ltd;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name smartbiz.ltd www.smartbiz.ltd;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/smartbiz.ltd/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smartbiz.ltd/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root $FRONTEND_HOME;
    index index.html;

    # Frontend static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # React Router SPA catch-all
    location ~ ^(?!api|assets|css|js|images).*$ {
        rewrite ^(.*)$ /index.html break;
    }

    # API Proxy to Backend (Port 8080)
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    gzip_min_length 1000;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/smartbiz.ltd /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

echo "Frontend deployed successfully!"
```

### 8.3 Deploy Frontend on Windows Server + SolidCP (IIS)

**Upload files:**
- Copy all files from `Frontend(react)\dist` to `D:\WebSites\smartbiz-frontend`

**Create web.config:**

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
      </dynamicTypes>
    </httpCompression>

    <!-- Cache static assets -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>

    <!-- URL Rewrite for SPA -->
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
        
        <!-- Proxy API to Backend Port 8080 -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)$" />
          <action type="Rewrite" url="http://127.0.0.1:8080/api/{R:1}" />
        </rule>
      </rules>
    </rewrite>

    <!-- Security Headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

---

## 9. SSL/TLS CERTIFICATE INSTALLATION

### 9.1 HapiHost - Let's Encrypt (Free)

```bash
#!/bin/bash
# Install Let's Encrypt SSL Certificate

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Request certificate
sudo certbot certonly --standalone -d smartbiz.ltd -d www.smartbiz.ltd

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify
sudo certbot certificates

echo "SSL Certificate installed successfully!"
```

### 9.2 Windows Server + SolidCP

```
1. In SolidCP: SSL Certificates
2. Generate CSR (Certificate Signing Request) OR
3. Import existing certificate
4. Bind to domains:
   - smartbiz.ltd
   - www.smartbiz.ltd
```

---

## 10. DOMAIN & DNS CONFIGURATION

### 10.1 DNS Records Required

```dns
Type: A Record
Name: @
Value: [HapiHost/Server Public IP]
TTL: 3600

Type: A Record
Name: www
Value: [HapiHost/Server Public IP]
TTL: 3600

Type: A Record
Name: api
Value: [Same IP]
TTL: 3600

Type: CNAME Record (Optional)
Name: cdn
Value: smartbiz.ltd
TTL: 3600
```

### 10.2 Firewall Configuration

**HapiHost (Linux - UFW):**
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (admin only)
sudo ufw allow from [ADMIN_IP] to any port 22

# Allow HTTP/HTTPS (public)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# PostgreSQL (internal only)
sudo ufw allow from 127.0.0.1 to any port 5432

# Port 8080 (internal only - blocked from internet)
sudo ufw allow from 127.0.0.1 to any port 8080

sudo ufw enable
sudo ufw status
```

**Windows Server - Windows Firewall:**
```powershell
# Allow Port 80 (HTTP)
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow Port 443 (HTTPS)
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Allow Port 8080 from localhost only
New-NetFirewallRule -DisplayName "Allow Port 8080 Local" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1

# Block Port 8080 from internet
New-NetFirewallRule -DisplayName "Block Port 8080 External" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Block -RemoteAddress "RemoteSubnet"
```

---

## 11. VERIFICATION & TESTING

### 11.1 Test Backend API

```bash
# Check backend is running on port 8080
curl http://localhost:8080/api/health

# Expected response:
# {"status":"UP"}
```

### 11.2 Test Frontend Access

```
1. Open browser: https://smartbiz.ltd
2. Should load React application
3. Open Developer Console (F12)
4. Check Network tab - no errors
5. Test API calls work properly
```

### 11.3 Test Database Connection

```bash
# PostgreSQL connection test
psql -h localhost -U smartbiz_user -d sakhistore_prod -c "SELECT COUNT(*) FROM information_schema.tables;"

# Should return table count
```

### 11.4 Test SSL Certificate

```bash
# Check certificate validity
curl -I https://smartbiz.ltd

# Should show: HTTP/2 200
# And certificate info
```

---

## 12. MONITORING & MAINTENANCE

### 12.1 Log Files Location

**HapiHost:**
```
Backend Logs:    /opt/smartbiz/api-backend/logs/backend.log
Nginx Logs:      /var/log/nginx/access.log
                 /var/log/nginx/error.log
System Logs:     /var/log/syslog
```

**Windows Server:**
```
Backend Logs:    D:\WebSites\api-sakhistore\logs\backend.log
IIS Logs:        C:\inetpub\logs\LogFiles\W3SVC1\
Event Viewer:    Windows Logs > Application
```

### 12.2 Health Check Script (HapiHost)

```bash
#!/bin/bash
# Save as: /opt/smartbiz/scripts/health-check.sh

LOG_FILE="/var/log/smartbiz-health.log"

echo "[$(date)] Running health check..." >> $LOG_FILE

# Check backend service
if systemctl is-active --quiet smartbiz-backend; then
    echo "[$(date)] ✓ Backend service running" >> $LOG_FILE
else
    echo "[$(date)] ✗ Backend service DOWN - restarting..." >> $LOG_FILE
    systemctl restart smartbiz-backend
    # Send alert email
fi

# Check backend API
if curl -s http://localhost:8080/api/health > /dev/null; then
    echo "[$(date)] ✓ Backend API responding" >> $LOG_FILE
else
    echo "[$(date)] ✗ Backend API not responding" >> $LOG_FILE
fi

# Check database
if psql -U smartbiz_user -d sakhistore_prod -c "SELECT 1" > /dev/null 2>&1; then
    echo "[$(date)] ✓ Database connection OK" >> $LOG_FILE
else
    echo "[$(date)] ✗ Database connection FAILED" >> $LOG_FILE
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    echo "[$(date)] ✓ Nginx service running" >> $LOG_FILE
else
    echo "[$(date)] ✗ Nginx service DOWN - restarting..." >> $LOG_FILE
    systemctl restart nginx
fi
```

**Schedule in crontab:**
```bash
# Run every 5 minutes
*/5 * * * * /opt/smartbiz/scripts/health-check.sh

# Install cron job
crontab -e
# Add line above, save and exit
```

### 12.3 Automated Backup Script

```bash
#!/bin/bash
# Save as: /opt/smartbiz/scripts/backup.sh

BACKUP_DIR="/opt/smartbiz/backups"
DB_NAME="sakhistore_prod"
DB_USER="smartbiz_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
echo "[$(date)] Database backup completed: $BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Backup application
tar -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" /opt/smartbiz/api-backend/
echo "[$(date)] Application backup completed: $BACKUP_DIR/app_$TIMESTAMP.tar.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +30 -delete

echo "[$(date)] Backup cleanup completed"
```

**Schedule daily backups:**
```bash
# Run at 2 AM daily
0 2 * * * /opt/smartbiz/scripts/backup.sh

# Install cron job
crontab -e
```

---

## 13. SUPPORT & ESCALATION

### 13.1 Contact Information

For deployment assistance, contact:
- **Email:** support@smartbiz.ltd
- **Phone:** +91-XXXX-XXXX-XXXX
- **Slack:** #smartbiz-deployment

### 13.2 Required Information to Provide

When requesting support, provide:
1. **HapiHost Details:**
   - Account number
   - Server IP address
   - Root/Admin username

2. **Windows Server + SolidCP Details:**
   - Server hostname
   - SolidCP account credentials
   - Hosting package details

3. **Domain Details:**
   - Domain registrar account
   - Domain name: smartbiz.ltd
   - DNS provider

4. **Application Details:**
   - Git repository access
   - Database backup files
   - Configuration credentials (encrypted)

---

## 14. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All code committed and tested
- [ ] Backend JAR built successfully
- [ ] Frontend dist folder generated
- [ ] Production configuration files prepared
- [ ] Database backup created
- [ ] SSL certificate ready
- [ ] DNS records prepared
- [ ] Team notified

### During Deployment
- [ ] HapiHost server provisioned
- [ ] Windows Server + SolidCP configured
- [ ] PostgreSQL installed and secured
- [ ] Backend deployed and running on port 8080
- [ ] Frontend deployed and accessible
- [ ] SSL certificate installed
- [ ] DNS records updated
- [ ] Firewall rules configured

### Post-Deployment
- [ ] API endpoint responding
- [ ] Frontend loading without errors
- [ ] Database connectivity verified
- [ ] Logs monitored
- [ ] Health check script activated
- [ ] Backup automation configured
- [ ] Monitoring alerts set up
- [ ] Team trained on operations

---

## 15. ISSUE RESOLUTION MATRIX

| Issue | Symptom | Resolution |
|-------|---------|-----------|
| Backend won't start on port 8080 | Service fails to start | Check Java version, database credentials, port availability |
| Frontend blank page | Shows white screen | Check IIS/Nginx config, browser console for JS errors |
| API calls failing | 500/503 errors | Check backend logs, database connection |
| SSL certificate error | Certificate warnings | Reinstall certificate, verify domain in DNS |
| Database migration fails | Schema errors on startup | Restore backup, check migration scripts |
| Port 8080 exposed to internet | Security vulnerability | Update firewall rules, restart proxy |

---

## 16. SIGN-OFF

**Requested By:** [Project Manager Name]  
**Requested Date:** 2025-12-31  
**Target Deployment Date:** [TBD]  
**Priority:** HIGH  
**Estimated Duration:** 4-6 hours  

**Approvals:**
- [ ] DevOps Team Lead
- [ ] Security Team
- [ ] Project Manager
- [ ] System Administrator

---

**Ticket Status:** READY FOR DEPLOYMENT  
**Next Step:** Assign to deployment team and schedule maintenance window

