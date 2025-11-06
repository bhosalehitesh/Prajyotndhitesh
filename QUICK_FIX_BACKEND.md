# 🚀 Quick Fix: Backend Connection Error

## ⚡ One-Time Setup (Takes 2 minutes)

### Step 1: Connect Your Device
- Connect Android device via USB OR start Android emulator
- Enable USB Debugging (Settings → Developer Options)

### Step 2: Setup ADB Reverse
```bash
cd Frontend
npm run setup-adb
```

### Step 3: Start Backend
```bash
cd Backend/store
mvn spring-boot:run
```

### Step 4: Run App
```bash
cd Frontend
npm run android
```

**✅ Done! Your app will connect automatically.**

---

## 🔄 If Problem Persists

### Option A: Use IP Address Instead

1. **Find your IP:**
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Edit `Frontend/src/utils/apiConfig.ts`:**
   ```typescript
   export const API_BASE_URL_DEV_IP = 'http://192.168.1.100:8080'; // Your IP
   export const USE_IP_ADDRESS = true; // Change to true
   ```

3. **Restart app**

### Option B: Check ADB Connection
```bash
adb devices                    # Should show your device
adb reverse --list            # Should show tcp:8080
```

---

## 📖 Full Guide
See `Frontend/BACKEND_CONNECTION_SETUP.md` for complete troubleshooting guide.

