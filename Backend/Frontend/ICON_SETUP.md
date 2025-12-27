# App Icon Setup Guide

## SmartBiz Sakhi Store Logo as App Icon

This guide will help you set up the SmartBiz Sakhi Store logo as your mobile app icon.

### Logo Description
- **Background**: Black
- **Main Element**: Pink square with rounded corners containing a black shopping bag silhouette
- **Text**: "SmartBiz" in pink, "Sakhi Store" in dark grey
- **Copyright**: "© TiyakTech Venture" in dark grey

### Step 1: Prepare Your Icon Image

1. Create or export your logo as a PNG file
2. Recommended size: **1024x1024 pixels** (square)
3. Save it as: `Frontend/src/assets/images/app-icon.png`

**Important**: 
- The icon should have a transparent background OR a solid background
- For best results, use a square image with the logo centered
- Ensure the logo is clearly visible at small sizes

### Step 2: Generate Android Icons

#### Option A: Using the Script (Requires ImageMagick)

1. Install ImageMagick:
   - Windows: Download from https://imagemagick.org/script/download.php
   - Mac: `brew install imagemagick`
   - Linux: `sudo apt-get install imagemagick`

2. Place your icon at: `Frontend/src/assets/images/app-icon.png`

3. Run the generation script:
   ```bash
   cd Frontend
   node generate-icons.js
   ```

#### Option B: Using Online Tool (Recommended - No Installation)

1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

2. Upload your `app-icon.png` (1024x1024)

3. Configure:
   - **Foreground**: Your logo (with transparent background)
   - **Background**: Choose a color or image
   - **Shape**: Square or Round (or both)

4. Download the generated icons

5. Extract and copy the icons to:
   ```
   Frontend/android/app/src/main/res/
   ├── mipmap-mdpi/
   │   ├── ic_launcher.png
   │   └── ic_launcher_round.png
   ├── mipmap-hdpi/
   │   ├── ic_launcher.png
   │   └── ic_launcher_round.png
   ├── mipmap-xhdpi/
   │   ├── ic_launcher.png
   │   └── ic_launcher_round.png
   ├── mipmap-xxhdpi/
   │   ├── ic_launcher.png
   │   └── ic_launcher_round.png
   └── mipmap-xxxhdpi/
       ├── ic_launcher.png
       └── ic_launcher_round.png
   ```

### Step 3: Verify Icon Configuration

The AndroidManifest.xml is already configured to use:
- `@mipmap/ic_launcher` (square icon)
- `@mipmap/ic_launcher_round` (round icon)

### Step 4: Test the Icon

1. Clean and rebuild your Android app:
   ```bash
   cd Frontend/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

2. Check the app icon on your device/emulator

### Icon Sizes Reference

| Density | Folder | Size (px) |
|---------|--------|-----------|
| mdpi    | mipmap-mdpi | 48x48 |
| hdpi    | mipmap-hdpi | 72x72 |
| xhdpi   | mipmap-xhdpi | 96x96 |
| xxhdpi  | mipmap-xxhdpi | 144x144 |
| xxxhdpi | mipmap-xxxhdpi | 192x192 |

### Troubleshooting

- **Icon not updating**: Try uninstalling and reinstalling the app
- **Icon looks blurry**: Ensure you're using the correct size for each density folder
- **Icon has wrong background**: Make sure your source image has the correct background

### Notes

- The icon files are located in: `Frontend/android/app/src/main/res/mipmap-*/`
- Both square (`ic_launcher.png`) and round (`ic_launcher_round.png`) versions are needed
- Android will automatically select the appropriate size based on device density

