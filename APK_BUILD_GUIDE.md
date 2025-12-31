# React Native Android APK Build Guide

## Prerequisites

### 1. Install Android Studio & SDK
```powershell
# Download from: https://developer.android.com/studio
# During installation, install:
# - Android SDK
# - Android SDK Platform-Tools
# - Android Emulator
# - Android SDK Build-Tools (version 33+)
```

### 2. Set Environment Variables
```powershell
# Add to Windows Environment Variables (System Properties > Environment Variables)

# ANDROID_HOME - Path to Android SDK
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\%USERNAME%\AppData\Local\Android\Sdk", [EnvironmentVariableTarget]::Machine)

# JAVA_HOME - Path to Java
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17.0.x", [EnvironmentVariableTarget]::Machine)

# Add to PATH
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\build-tools\33.0.0", [EnvironmentVariableTarget]::Machine)

# Verify after setting:
echo %ANDROID_HOME%
echo %JAVA_HOME%
adb version
```

### 3. Install Node Dependencies
```powershell
cd "C:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend"
npm install
```

---

## Build APK Step-by-Step

### Option 1: Debug APK (Faster, for testing)
```powershell
cd "C:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend"

# Clean build
npm run android:build

# Or manually:
cd android
gradlew.bat clean
gradlew.bat assembleDebug

# Output: android\app\build\outputs\apk\debug\app-debug.apk
```

### Option 2: Release APK (For production/Play Store)
```powershell
cd "C:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend\android"

# Generate keystore (first time only)
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# Build release APK
gradlew.bat assembleRelease

# Output: android\app\build\outputs\apk\release\app-release.apk
```

---

## Troubleshooting

### Issue: Gradle not found
```powershell
# Solution: Use ./gradlew.bat instead of gradlew
cd Frontend\android
./gradlew.bat --version
```

### Issue: Build fails with "JAVA_HOME not set"
```powershell
# Verify JAVA_HOME
echo %JAVA_HOME%

# If empty, set it:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.x"

# Or permanently:
setx JAVA_HOME "C:\Program Files\Java\jdk-17.0.x"
```

### Issue: Android SDK not found
```powershell
# Download SDKs via Android Studio:
# 1. Open Android Studio
# 2. Tools > SDK Manager
# 3. Install Android SDK Platform 33+
# 4. Install Android SDK Build-Tools 33+
# 5. Install Android Emulator
```

### Issue: Build fails with native modules
```powershell
# Clean cache and rebuild
cd Frontend\android
./gradlew.bat clean
./gradlew.bat assembleDebug --stacktrace
```

### Issue: Out of memory
```powershell
# Increase Gradle heap size
# Edit: Frontend\android\gradle.properties

# Add/modify:
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

---

## Installing APK on Device/Emulator

### Connect Device
```powershell
# Enable USB Debugging on Android device
# Connect device via USB

# Check connected devices
adb devices

# Install APK
adb install -r "Frontend\android\app\build\outputs\apk\debug\app-debug.apk"

# Or use npm script:
npm run android:transfer
```

---

## Build Output Location
- **Debug APK**: `Frontend\android\app\build\outputs\apk\debug\app-debug.apk`
- **Release APK**: `Frontend\android\app\build\outputs\apk\release\app-release.apk`

## Useful Commands
```powershell
# Check Android SDK version
adb shell getprop ro.build.version.sdk

# List connected devices
adb devices

# View build logs
cd Frontend\android
./gradlew.bat assembleDebug --info

# Force clean build
./gradlew.bat clean assembleDebug

# Check Gradle version
./gradlew.bat --version
```

## Production Release Checklist
- [ ] Update app version in android/app/build.gradle (versionCode, versionName)
- [ ] Update API endpoints to production URLs in .env.production
- [ ] Generate release keystore
- [ ] Build release APK
- [ ] Test on physical device
- [ ] Sign APK
- [ ] Upload to Google Play Console

## Environment Variables for Build
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17.0.x
GRADLE_HOME=C:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend\android\gradle
```
