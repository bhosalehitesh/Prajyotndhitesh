# 🔧 Permanent Solution: Backend Connection Setup

## ✅ Quick Fix (Recommended - Use ADB Reverse)

**ADB Reverse Port Forwarding** is the BEST solution because:
- ✅ Works for both Android emulator AND physical devices
- ✅ Works even if your IP address changes
- ✅ No need to find your IP address manually
- ✅ More reliable than WiFi IP connection

### Setup Steps:

1. **Connect your Android device via USB** (or start Android emulator)

2. **Enable USB Debugging** on your device:
   - Go to Settings → About Phone → Tap "Build Number" 7 times
   - Go to Settings → Developer Options → Enable "USB Debugging"

3. **Verify device is connected:**
   ```bash
   adb devices
   ```
   You should see your device listed.

4. **Setup ADB reverse port forwarding:**
   ```bash
   adb reverse tcp:8080 tcp:8080
   ```
   
   Or use the npm script:
   ```bash
   npm run setup-adb
   ```

5. **Start backend:**
   ```bash
   cd Backend/store
   mvn spring-boot:run
   ```

6. **Run the app:**
   ```bash
   npm run android
   ```
   
   Or use the combined script:
   ```bash
   npm run android-with-adb
   ```

**Done!** Your app will now connect to `http://localhost:8080` ✅

---

## 🔄 Alternative: Using IP Address (If ADB Doesn't Work)

If ADB reverse doesn't work for some reason, you can use your computer's IP address:

### Setup Steps:

1. **Find your computer's IP address:**
   ```bash
   # Windows PowerShell
   ipconfig
   
   # Look for "IPv4 Address" under your active network adapter
   # Example: 192.168.1.100
   ```

2. **Update `Frontend/src/utils/apiConfig.ts`:**
   ```typescript
   export const API_BASE_URL_DEV_IP = 'http://192.168.1.100:8080'; // Replace with your IP
   export const USE_IP_ADDRESS = true; // Change to true
   ```

3. **Important Requirements:**
   - ✅ Phone and computer must be on the **same WiFi network**
   - ✅ Windows Firewall must allow port 8080
   - ✅ Backend must be running

4. **Check Windows Firewall:**
   ```powershell
   # Allow port 8080 through firewall
   netsh advfirewall firewall add rule name="Backend Dev Server" dir=in action=allow protocol=TCP localport=8080
   ```

---

## 🎯 Which Method Should You Use?

| Method | When to Use | Pros | Cons |
|--------|-------------|------|------|
| **ADB Reverse** | ✅ **Recommended** - Works for emulator and USB-connected devices | Works even if IP changes, more reliable | Requires USB connection |
| **IP Address** | Use if ADB doesn't work or device is on WiFi only | Works over WiFi | IP can change, requires same WiFi network |

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to server"

**If using ADB Reverse:**
1. Check device is connected: `adb devices`
2. Verify reverse is set: `adb reverse --list` (should show tcp:8080)
3. Restart ADB reverse: `adb reverse tcp:8080 tcp:8080`
4. Ensure backend is running: `cd Backend/store && mvn spring-boot:run`

**If using IP Address:**
1. Verify IP is correct: `ipconfig` (check IPv4 Address)
2. Update `apiConfig.ts` with correct IP
3. Ensure phone and computer are on same WiFi
4. Check Windows Firewall allows port 8080
5. Test backend URL in browser: `http://YOUR_IP:8080/api/auth/signup`

### Problem: IP address keeps changing

**Solution:** Use ADB reverse instead! It doesn't depend on IP addresses.

### Problem: ADB not found

**Solution:** Install Android SDK Platform Tools or Android Studio (includes ADB)

---

## 📝 Configuration File

All configuration is in `Frontend/src/utils/apiConfig.ts`:

```typescript
// Use ADB reverse (recommended)
export const USE_IP_ADDRESS = false;

// Or use IP address
export const USE_IP_ADDRESS = true;
export const API_BASE_URL_DEV_IP = 'http://192.168.1.100:8080';
```

---

## ✅ Quick Checklist

- [ ] Device connected via USB (for ADB reverse) OR on same WiFi (for IP method)
- [ ] USB Debugging enabled
- [ ] ADB reverse set up: `adb reverse tcp:8080 tcp:8080`
- [ ] Backend running: `cd Backend/store && mvn spring-boot:run`
- [ ] Configuration correct in `apiConfig.ts`
- [ ] App restarted after configuration changes

---

**🎉 You're all set!** The connection should work permanently now.

