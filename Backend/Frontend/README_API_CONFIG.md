# API Configuration Guide

## 🎯 Default Setup (Recommended - No IP Changes Needed!)

The app is configured to use **localhost:8080** by default, which works for all team members without any IP address changes.

### Quick Start:
1. **Set up ADB reverse port forwarding** (one-time per device connection):
   ```bash
   npm run setup-adb
   # or manually: adb reverse tcp:8080 tcp:8080
   ```

2. **Start your backend** on port 8080

3. **Run the app** - it will connect to `http://localhost:8080`

That's it! No IP address configuration needed. ✅

---

## 🔧 Alternative: Using IP Address (Optional)

If you prefer to use your computer's IP address instead of localhost (e.g., for WiFi debugging), you can create a local config file:

### Option 1: Auto-detect and Setup (Easiest)
```bash
npm run setup-local-ip
```

This will:
- Auto-detect your current IP address
- Create `src/utils/apiConfig.local.ts` (gitignored)
- Configure the app to use your IP

### Option 2: Manual Setup
1. Copy the example file:
   ```bash
   cp src/utils/apiConfig.local.ts.example src/utils/apiConfig.local.ts
   ```

2. Edit `src/utils/apiConfig.local.ts`:
   - Set `USE_IP_ADDRESS = true`
   - Replace `YOUR_IP_HERE` with your actual IP address
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 📝 Important Notes

- **`apiConfig.local.ts` is gitignored** - each developer can have their own settings
- **Default behavior uses localhost** - no conflicts when pulling/pushing code
- **ADB reverse works for both emulator and physical devices** (USB connected)
- If you change networks, just run `npm run setup-local-ip` again to update your IP

---

## 🐛 Troubleshooting

### "Network request failed" error
1. **Check if backend is running**: `netstat -an | findstr :8080` (Windows)
2. **Verify ADB reverse**: `adb reverse --list` should show `tcp:8080 tcp:8080`
3. **If using IP**: Make sure your IP hasn't changed (run `npm run setup-local-ip` again)

### ADB reverse not working
- Make sure device/emulator is connected: `adb devices`
- Restart ADB: `adb kill-server && adb start-server`
- Re-run setup: `npm run setup-adb`

---

## 👥 For Team Members

When you pull the code:
- **No action needed!** The default uses localhost, which works for everyone
- Just run `npm run setup-adb` once per device connection
- If you prefer IP address, create your own `apiConfig.local.ts` (it's gitignored)

