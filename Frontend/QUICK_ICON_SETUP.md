# Quick App Icon Setup - SmartBiz Sakhi Store

## ✅ Your Logo File Found!
Found: `src/assets/images/logo.png.jpg`

## 🚀 Quick Setup (Choose One Method)

### Method 1: Online Tool (Easiest - No Installation) ⭐ RECOMMENDED

1. **Open the online tool:**
   - Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

2. **Upload your logo:**
   - Click "Image" tab
   - Upload: `Frontend/src/assets/images/logo.png.jpg`
   - Or drag and drop the file

3. **Configure:**
   - **Foreground**: Your logo (adjust if needed)
   - **Background**: Choose a color (pink #e61580 matches your theme) or keep transparent
   - **Shape**: Select "Square" and "Round" (or just Square)

4. **Download:**
   - Click "Download" button
   - Extract the ZIP file

5. **Copy icons to project:**
   - Open the extracted folder
   - Copy all folders (mipmap-mdpi, mipmap-hdpi, etc.) 
   - Paste them into: `Frontend/android/app/src/main/res/`
   - Replace existing files when prompted

6. **Done!** Rebuild your app:
   ```bash
   cd Frontend/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

---

### Method 2: Using ImageMagick (If Installed)

1. **Install ImageMagick:**
   - Windows: Download from https://imagemagick.org/script/download.php
   - Mac: `brew install imagemagick`
   - Linux: `sudo apt-get install imagemagick`

2. **Run the script:**
   ```bash
   cd Frontend
   node setup-app-icon.js
   ```

3. **Rebuild your app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

---

## 📁 Icon File Locations

After setup, your icons should be in:
```
Frontend/android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

## ✅ Verification

After rebuilding:
1. Uninstall the app from your device/emulator
2. Reinstall: `npx react-native run-android`
3. Check the app icon on your home screen

## 🎨 Logo Details

Your SmartBiz Sakhi Store logo features:
- Pink square with rounded corners
- Black shopping bag silhouette
- "SmartBiz" text in pink
- "Sakhi Store" text in dark grey

Make sure the icon is clearly visible at small sizes!

