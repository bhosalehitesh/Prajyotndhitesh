# 🚀 Quick Start Guide - Daily Startup

## ✅ Steps to Start Everything Tomorrow

Follow these steps in order to get your SakhiHP app running:

---

## Step 1: Start PostgreSQL (if not auto-starting)

**Check if PostgreSQL is running:**
```cmd
netstat -an | findstr :5432
```

**If you see `LISTENING`, PostgreSQL is already running. Skip to Step 2.**

**If not running, start it:**

**Option A: Using Services GUI (Easiest)**
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Find "PostgreSQL" service (look for version 16)
4. Right-click → **Start**

**Option B: Using Command Line**
```cmd
net start postgresql-x64-16
```
*(Replace `postgresql-x64-16` with your actual service name if different)*

**Verify PostgreSQL is running:**
```cmd
psql -U postgres -p 5432 -c "SELECT version();"
```
*Enter password: `Thynktech`*

---

## Step 2: Start Backend Server

**Open Terminal 1 (Command Prompt or PowerShell):**

```cmd
cd C:\Users\Admin\Desktop\SakhiHP\Backend\store
mvn spring-boot:run
```

**Wait for:** `Started SakhiStoreApplication`

**✅ Success:** You should see:
- `Started SakhiStoreApplication in X.XXX seconds`
- No database connection errors
- Server listening on port 8080

**Test Backend:** Open browser → `http://localhost:8080/api/health`
- Should return: `{"status":"OK","message":"Sakhi Store Backend is running"}`

**Keep this terminal running!**

---

## Step 3: Connect Your Android Device

**Connect your Android device via USB** (or start Android emulator)

**Enable USB Debugging** (if not already enabled):
- Settings → About Phone → Tap "Build Number" 7 times
- Settings → Developer Options → Enable "USB Debugging"

**Verify device is connected:**
```cmd
adb devices
```
*Should show your device listed*

---

## Step 4: Setup ADB Reverse Port Forwarding

**Open Terminal 2:**

```cmd
adb reverse tcp:8080 tcp:8080
```

**Verify it's set:**
```cmd
adb reverse --list
```
*Should show: `UsbFfs tcp:8080 tcp:8080`*

**Note:** You need to run this command each time you reconnect your device.

---

## Step 5: Start Metro Bundler

**Open Terminal 3:**

```cmd
cd C:\Users\Admin\Desktop\SakhiHP\Frontend
npm start
```

**✅ Success:** You should see:
- `Welcome to Metro!`
- `Metro waiting on port 8081`

**Keep this terminal running!**

---

## Step 6: Run Mobile App

**Open Terminal 4 (or use Android Studio):**

```cmd
cd C:\Users\Admin\Desktop\SakhiHP\Frontend
npm run android
```

**✅ Success:** App should launch on your device/emulator

---

## 🎯 Complete Command Sequence (Copy & Paste)

**Terminal 1 - Backend:**
```cmd
cd C:\Users\Admin\Desktop\SakhiHP\Backend\store
mvn spring-boot:run
```

**Terminal 2 - ADB Reverse:**
```cmd
adb reverse tcp:8080 tcp:8080
adb reverse --list
```

**Terminal 3 - Metro Bundler:**
```cmd
cd C:\Users\Admin\Desktop\SakhiHP\Frontend
npm start
```

**Terminal 4 - Run App:**
```cmd
cd C:\Users\Admin\Desktop\SakhiHP\Frontend
npm run android
```

---

## ✅ Quick Verification Checklist

After starting everything, verify:

- [ ] PostgreSQL is running (port 5432 listening)
- [ ] Backend started successfully (`Started SakhiStoreApplication`)
- [ ] Backend health check works (`http://localhost:8080/api/health`)
- [ ] Device connected (`adb devices` shows device)
- [ ] ADB reverse is set (`adb reverse --list` shows port 8080)
- [ ] Metro bundler is running (port 8081)
- [ ] Mobile app launched successfully
- [ ] Can sign up and see OTP in backend console

---

## 🔐 Testing OTP Flow

1. **Open Mobile App** → Sign Up
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
5. **Test Login** with phone and password

---

## 🐛 Common Issues & Quick Fixes

### Problem: PostgreSQL not starting
```cmd
# Find service name
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}

# Start service
net start postgresql-x64-16
```

### Problem: Backend connection refused
- Check PostgreSQL is running: `netstat -an | findstr :5432`
- Verify database exists: `psql -U postgres -p 5432 -c "\l"`
- Check backend is running: `netstat -an | findstr :8080`

### Problem: Device not connecting
```cmd
# Check device
adb devices

# If empty, reconnect USB cable
# Enable USB Debugging on device
# Try: adb kill-server && adb start-server
```

### Problem: ADB reverse not working
```cmd
# Remove old reverse
adb reverse --remove tcp:8080

# Set new reverse
adb reverse tcp:8080 tcp:8080

# Verify
adb reverse --list
```

### Problem: Metro bundler issues
```cmd
cd Frontend
npm start -- --reset-cache
```

### Problem: App can't connect to backend
1. Verify backend is running: `http://localhost:8080/api/health`
2. Check ADB reverse: `adb reverse --list`
3. Reload app: Shake device → Reload
4. Restart Metro bundler

---

## 📝 Important Notes

1. **PostgreSQL Service:**
   - Set it to auto-start: Services → PostgreSQL → Properties → Startup type: Automatic
   - This way you won't need to start it manually

2. **ADB Reverse:**
   - Must be set each time you reconnect device
   - Keep the command handy: `adb reverse tcp:8080 tcp:8080`

3. **Backend:**
   - Must be running before starting the app
   - Check console for OTP codes (dev mode)

4. **Metro Bundler:**
   - Keep running while developing
   - Press `R` twice to reload app
   - Press `Ctrl+C` to stop

5. **Database:**
   - Database `sakhistore` already exists
   - Tables auto-create on first backend start
   - No manual setup needed

---

## 🎉 You're All Set!

Follow these steps in order, and your app will be running in minutes!

**Remember:** 
- Backend must be running first
- ADB reverse must be set for USB-connected devices
- Metro bundler must stay running
- Check backend console for OTP codes

---

## 📚 Additional Resources

- **Full Guide**: `RUNNING_GUIDE.md`
- **Backend Setup**: `Backend/store/BACKEND_SETUP_COMPLETE.md`
- **Frontend Connection**: `Frontend/BACKEND_CONNECTION_SETUP.md`


