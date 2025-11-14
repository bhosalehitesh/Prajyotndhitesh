# 📦 Installation Guide - SakhiHP

## 📋 Prerequisites

Before installing, ensure you have:

- **Windows 10/11** (or Mac/Linux)
- **Administrator access** (for installing software)
- **Internet connection** (for downloading dependencies)

---

## ✅ Step 1: Install Java JDK 17+

### Check if Java is Installed

```cmd
java -version
```

**If you see:** `openjdk version "17.x.x"` or higher → ✅ Java is installed, skip to Step 2

**If not installed:**

1. Download Java JDK 17+ from: https://adoptium.net/
2. Run the installer
3. Follow installation wizard
4. Verify: `java -version`

---

## ✅ Step 2: Install Node.js 16+

### Check if Node.js is Installed

```cmd
node --version
```

**If you see:** `v16.x.x` or higher → ✅ Node.js is installed, skip to Step 3

**If not installed:**

1. Download Node.js from: https://nodejs.org/
2. Download **LTS version** (recommended)
3. Run the installer
4. Verify: `node --version` and `npm --version`

---

## ✅ Step 3: Install PostgreSQL

### Download & Install PostgreSQL

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download **PostgreSQL Installer** for Windows

2. **Run the Installer:**
   - Run as Administrator
   - During installation:
     - **Port**: `5432` (default - keep this)
     - **Superuser password**: `Thynktech` (or remember your password)
     - **Locale**: Default (English)
     - **Components**: 
       - ✅ PostgreSQL Server
       - ✅ pgAdmin 4
       - ✅ Command Line Tools
       - ✅ Stack Builder (optional)

3. **Complete Installation:**
   - Wait for installation to finish
   - PostgreSQL service should start automatically

### Verify PostgreSQL Installation

```cmd
# Check PostgreSQL version
psql --version

# Test connection
psql -U postgres -c "SELECT version();"
```

*Enter password when prompted: `Thynktech` (or your password)*

### Create Database

**Option A: Using Command Line**

```cmd
# Connect to PostgreSQL
psql -U postgres

# Enter password: Thynktech
```

Then in PostgreSQL prompt:
```sql
CREATE DATABASE sakhistore;
\l  -- Verify database was created
\q  -- Exit
```

**Option B: Using pgAdmin (GUI)**

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to PostgreSQL server
   - Password: `Thynktech` (or your password)
3. Right-click **Databases** → **Create** → **Database**
4. Name: `sakhistore`
5. Click **Save**

### Set PostgreSQL to Auto-Start (Recommended)

1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Find **PostgreSQL** service (e.g., `postgresql-x64-16`)
4. Right-click → **Properties**
5. Set **Startup type** to **Automatic**
6. Click **OK**

---

## ✅ Step 4: Install Maven

### Download & Install Maven

1. **Download Maven:**
   - Go to: https://maven.apache.org/download.cgi
   - Download: `apache-maven-X.X.X-bin.zip` (latest version)

2. **Extract Maven:**
   - Extract to: `C:\Program Files\Apache\maven`
   - You should have: `C:\Program Files\Apache\maven\bin\mvn.cmd`

3. **Add to PATH:**
   - Press `Windows + R` → Type `sysdm.cpl` → Press Enter
   - Go to **Advanced** tab → Click **Environment Variables**
   - Under **System Variables**, find **Path** → Click **Edit**
   - Click **New** → Add: `C:\Program Files\Apache\maven\bin`
   - Click **OK** on all dialogs

4. **Restart Terminal/PowerShell**

5. **Verify Installation:**
   ```cmd
   mvn -version
   ```
   *Should show: `Apache Maven X.X.X`*

### Alternative: Install via Chocolatey

If you have Chocolatey installed:
```cmd
choco install maven
```

---

## ✅ Step 5: Install Android Studio (For Mobile Development)

### Download & Install Android Studio

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download Android Studio installer

2. **Run the Installer:**
   - Follow installation wizard
   - Install Android SDK (comes with installer)
   - Install Android Virtual Device (AVD) - for emulator

3. **Verify ADB Installation:**
   ```cmd
   adb version
   ```
   *Should show: `Android Debug Bridge version X.X.X`*

### Setup Android Emulator (Optional)

1. Open Android Studio
2. Go to **Tools** → **Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 5)
5. Download a system image (e.g., Android 13)
6. Finish setup

---

## ✅ Step 6: Install Project Dependencies

### Install Frontend Dependencies

```cmd
cd Frontend
npm install
```

**Wait for installation to complete** (may take a few minutes)

### Verify Backend Dependencies

Backend dependencies are managed by Maven and will be downloaded automatically when you run the backend.

---

## ✅ Post-Installation Verification

Run these commands to verify everything is installed:

```cmd
# Check Java
java -version
# Expected: openjdk version "17.x.x" or higher

# Check Node.js
node --version
# Expected: v16.x.x or higher

# Check npm
npm --version
# Expected: v8.x.x or higher

# Check PostgreSQL
psql --version
# Expected: psql (PostgreSQL) XX.x

# Check Maven
mvn --version
# Expected: Apache Maven X.X.X

# Check ADB
adb version
# Expected: Android Debug Bridge version X.X.X
```

---

## 🐛 Troubleshooting Installation

### PostgreSQL Issues

**Problem: PostgreSQL service won't start**
- Check Windows Event Viewer for errors
- Verify port 5432 is not in use: `netstat -an | findstr :5432`
- Try restarting the service manually

**Problem: Can't connect to PostgreSQL**
- Verify service is running: Services app → PostgreSQL
- Check password is correct
- Verify port is 5432

**Problem: psql command not found**
- Add PostgreSQL bin folder to PATH:
  - Usually: `C:\Program Files\PostgreSQL\16\bin`
- Restart terminal after adding to PATH

### Maven Issues

**Problem: mvn command not found**
- Verify Maven is added to PATH
- Restart terminal after adding to PATH
- Check path is correct: `C:\Program Files\Apache\maven\bin`

**Problem: Maven download fails**
- Check internet connection
- Check firewall settings
- Try using Maven wrapper: `.\mvnw.cmd` (in Backend/store directory)

### Node.js Issues

**Problem: npm install fails**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

**Problem: Permission errors**
- Run terminal as Administrator
- Check folder permissions

---

## ✅ Installation Complete!

After completing all steps, you should have:

- ✅ Java JDK 17+ installed
- ✅ Node.js 16+ installed
- ✅ PostgreSQL installed and running
- ✅ Database `sakhistore` created
- ✅ Maven installed
- ✅ Android Studio installed (optional, for emulator)
- ✅ ADB available
- ✅ Project dependencies installed

---

## 🎯 Next Steps

After installation, proceed to:

1. **Read:** `RUNNING_GUIDE.md` - Complete guide to run the application
2. **Quick Start:** `QUICK_START.md` - Daily startup guide

---

## 📚 Additional Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Maven Docs**: https://maven.apache.org/guides/
- **Node.js Docs**: https://nodejs.org/docs/
- **Android Studio Docs**: https://developer.android.com/studio/intro

---

**Installation complete!** 🎉 You're ready to run the application.
