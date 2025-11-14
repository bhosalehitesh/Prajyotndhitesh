# 🚀 Running Guide - SakhiHP

## 📋 Project Overview

**SakhiHP** is a store management mobile application:
- **Frontend**: React Native (TypeScript) - Android/iOS mobile app
- **Backend**: Spring Boot (Java 17) - REST API server on port 8080
- **Database**: PostgreSQL - Data storage on port 5432

---

## ✅ Prerequisites

Before running, ensure you have completed installation (see `INSTALLATION_GUIDE.md`):

- [x] Java JDK 17+ installed
- [x] Node.js 16+ installed
- [x] PostgreSQL installed and running
- [x] Database `sakhistore` created
- [x] Maven installed
- [x] Android device/emulator ready

---

## 🗄️ Step 1: Start PostgreSQL

### Check if PostgreSQL is Running

```cmd
netstat -an | findstr :5432
```

**If you see `LISTENING`:** ✅ PostgreSQL is running, skip to Step 2

**If not running:**

**Option A: Using Services GUI**
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Find **PostgreSQL** service
4. Right-click → **Start**

**Option B: Using Command Line**
```cmd
net start postgresql-x64-16
```
*(Replace `postgresql-x64-16` with your actual service name)*

### Verify Database Exists

```cmd
psql -U postgres -p 5432 -c "\l"
```

Look for `sakhistore` in the list. If not found, create it:

```cmd
psql -U postgres -p 5432 -c "CREATE DATABASE sakhistore;"
```

---

## 🔧 Step 2: Configure Backend

### Update Database Password (If Different)

**File:** `Backend/store/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sakhistore
spring.datasource.username=postgres
spring.datasource.password=Thynktech  # Change if your password is different
```

**⚠️ Important:** If your PostgreSQL password is NOT `Thynktech`, update the `spring.datasource.password` value.

---

## 🚀 Step 3: Start Backend Server

### Navigate to Backend Directory

```cmd
cd Backend\store
```

### Start Backend Server

```cmd
mvn spring-boot:run
```

**Wait for:** `Started SakhiStoreApplication`

**✅ Success Indicators:**
- ✅ Message: `Started SakhiStoreApplication in X.XXX seconds`
- ✅ No database connection errors
- ✅ Server listening on port 8080
- ✅ Database tables created automatically

**Keep this terminal running!**

### Verify Backend is Running

**Test Health Endpoint:**

Open browser: `http://localhost:8080/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Sakhi Store Backend is running"
}
```

---

## 📱 Step 4: Configure Frontend Connection

### Connect Android Device

**Connect your Android device via USB** (or start Android emulator)

**Enable USB Debugging** (if not already enabled):
- Settings → About Phone → Tap "Build Number" 7 times
- Settings → Developer Options → Enable "USB Debugging"

**Verify device is connected:**
```cmd
adb devices
```
*Should show your device listed*

### Setup ADB Reverse Port Forwarding

```cmd
adb reverse tcp:8080 tcp:8080
```

**Verify it's set:**
```cmd
adb reverse --list
```
*Should show: `UsbFfs tcp:8080 tcp:8080`*

**⚠️ Note:** You need to run this command each time you reconnect your device.

---

## 🎨 Step 5: Start Metro Bundler

**Open a new terminal:**

```cmd
cd Frontend
npm start
```

**✅ Success:** You should see:
- `Welcome to Metro!`
- `Metro waiting on port 8081`

**Keep this terminal running!**

**Metro Bundler Commands:**
- Press `R` twice to reload app
- Press `Ctrl+C` to stop

---

## 📲 Step 6: Run Mobile App

**Open another terminal:**

```cmd
cd Frontend
npm run android
```

**✅ Success:** App should launch on your device/emulator

**For iOS (Mac only):**
```cmd
npm run ios
```

---

## 🔐 Step 7: Testing Authentication

### Current OTP Configuration

**Status:** **Console Mode** (Development)

OTP codes appear in **backend console** (terminal where `mvn spring-boot:run` is running)

### Test Signup Flow

1. **Open Mobile App** → Navigate to Sign Up
2. **Enter Details:**
   - Full Name: `Test User`
   - Phone: `9876543210`
   - Password: `test123`
   - Click "Send OTP"
3. **Check Backend Console** (Terminal 1):
   - Look for OTP code displayed:
   ```
   ================================================
   🔧 [DEV MODE] SMS DISABLED - OTP in Console
   📱 Phone Number: 9876543210
   🔢 OTP Code: 123456
   ⏰ Valid for 5 minutes
   ================================================
   ```
4. **Enter OTP** in app → Complete signup
5. **Test Login:**
   - Phone: `9876543210`
   - Password: `test123`
   - Should login successfully

---

## 🔄 Switching to Real SMS (Kutility)

When Kutility SMS credentials arrive:

### Step 1: Update Configuration

**File:** `Backend/store/src/main/resources/application.properties`

**Change:**
```properties
# Change this:
sms.dev.mode=true

# To this:
sms.dev.mode=false

# Fill in your credentials:
sms.kutility.api.key=YOUR_API_KEY_HERE
sms.kutility.api.secret=YOUR_API_SECRET_HERE
```

### Step 2: Restart Backend

```cmd
# Stop backend (Ctrl+C)
# Then restart:
cd Backend\store
mvn spring-boot:run
```

### Step 3: Test

- Sign up with real phone number
- Check phone for SMS with OTP
- OTP will no longer appear in console

---

## 🎯 Complete Running Flow (Quick Reference)

**Terminal 1 - Backend:**
```cmd
cd Backend\store
mvn spring-boot:run
```

**Terminal 2 - ADB Reverse:**
```cmd
adb reverse tcp:8080 tcp:8080
adb reverse --list
```

**Terminal 3 - Metro Bundler:**
```cmd
cd Frontend
npm start
```

**Terminal 4 - Run App:**
```cmd
cd Frontend
npm run android
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection refused**
```cmd
# Check PostgreSQL is running
netstat -an | findstr :5432

# Verify database exists
psql -U postgres -p 5432 -c "\l"

# Check password in application.properties
```

**Problem: Port 8080 already in use**
```cmd
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID_NUMBER> /F
```

**Problem: Maven not found**
- Verify Maven is installed: `mvn --version`
- Check PATH environment variable
- Use Maven wrapper: `.\mvnw.cmd spring-boot:run`

### Frontend Issues

**Problem: Cannot connect to backend**
```cmd
# Verify backend is running
# Open browser: http://localhost:8080/api/health

# Check ADB reverse is set
adb reverse --list

# Restart ADB reverse
adb reverse tcp:8080 tcp:8080
```

**Problem: Device not connecting**
```cmd
# Check device
adb devices

# If empty:
# 1. Reconnect USB cable
# 2. Enable USB Debugging
# 3. Try: adb kill-server && adb start-server
```

**Problem: Metro bundler issues**
```cmd
cd Frontend
npm start -- --reset-cache
```

**Problem: App crashes on startup**
```cmd
# Clear React Native cache
cd Frontend
npm start -- --reset-cache

# Rebuild Android app
cd android
.\gradlew clean
cd ..
npm run android
```

---

## ✅ Success Checklist

After following all steps, verify:

- [ ] PostgreSQL is running (port 5432 listening)
- [ ] Database `sakhistore` exists
- [ ] Backend started successfully (`Started SakhiStoreApplication`)
- [ ] Backend health check works (`http://localhost:8080/api/health`)
- [ ] Device connected (`adb devices` shows device)
- [ ] ADB reverse is set (`adb reverse --list` shows port 8080)
- [ ] Metro bundler is running (port 8081)
- [ ] Mobile app launched successfully
- [ ] Can sign up and see OTP in backend console
- [ ] Can login with created account

---

## 📝 Important Notes

1. **PostgreSQL Service:**
   - Set to auto-start: Services → PostgreSQL → Properties → Startup type: Automatic
   - This way you won't need to start it manually

2. **ADB Reverse:**
   - Must be set each time you reconnect device
   - Keep command handy: `adb reverse tcp:8080 tcp:8080`

3. **Backend:**
   - Must be running before starting the app
   - Check console for OTP codes (dev mode)

4. **Metro Bundler:**
   - Keep running while developing
   - Press `R` twice to reload app

5. **Database:**
   - Tables auto-create on first backend start
   - No manual table creation needed

---

## 🔒 Production Security Notes

Before deploying to production with thousands of users, you **must** fix these critical security issues:

### Critical (Must Fix):

1. **JWT Secret** - Change from default:
   ```properties
   # Current (INSECURE):
   app.jwt.secret=your_very_strong_secret_key_here
   
   # Change to (use environment variable):
   app.jwt.secret=${JWT_SECRET}
   ```
   Generate strong secret: `openssl rand -base64 32`

2. **Database Password** - Use environment variable:
   ```properties
   spring.datasource.password=${DB_PASSWORD}
   ```
   Never commit passwords to Git!

3. **HTTPS/SSL** - Enable in production:
   ```properties
   server.ssl.enabled=true
   server.ssl.key-store=classpath:keystore.p12
   ```

4. **Rate Limiting** - Add for OTP and login endpoints
5. **CORS** - Configure for production domain only

### Important (Should Fix):

- Account lockout after failed login attempts
- Stronger password requirements (8+ chars, numbers, letters)
- Security logging and monitoring
- Input validation and sanitization

**Current Status:** ✅ Good for development/testing  
**Production Ready:** ⚠️ After fixing critical issues above

---

## 🎉 You're All Set!

Your SakhiHP application should now be running with:
- ✅ PostgreSQL database connected
- ✅ Backend API server on port 8080
- ✅ Mobile app connected to backend
- ✅ OTP testing in console mode

**Next Steps:**
- Test all features in the mobile app
- When Kutility SMS credentials arrive, switch to real SMS
- Deploy backend to production server when ready
- Build production APK/IPA when ready

---

## 📚 Additional Resources

- **Quick Start**: `QUICK_START.md` - Daily startup guide
- **Installation**: `INSTALLATION_GUIDE.md` - Complete installation guide

---

**Happy Coding!** 🚀
