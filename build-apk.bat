@echo off
REM PowerShell-based APK Build Script
REM Run as Administrator

echo.
echo =====================================
echo React Native APK Build Script
echo =====================================
echo.

setlocal enabledelayedexpansion

cd "C:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend"

echo Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not installed or not in PATH
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Check Java
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not installed or not in PATH
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java installed

REM Check Android SDK
if not defined ANDROID_HOME (
    echo WARNING: ANDROID_HOME not set
    echo Set it in: System Properties ^> Environment Variables
    echo Value: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    pause
    exit /b 1
)
echo [OK] ANDROID_HOME=%ANDROID_HOME%

REM Check Gradle
if not exist "android\gradlew.bat" (
    echo ERROR: Gradle wrapper not found at android\gradlew.bat
    pause
    exit /b 1
)
echo [OK] Gradle wrapper found

echo.
echo =====================================
echo Building APK...
echo =====================================
echo.

REM Install dependencies
echo Step 1: Installing npm dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Done!

REM Build APK
echo.
echo Step 2: Building Android APK...
cd android

echo Running: gradlew.bat clean assembleDebug
call gradlew.bat clean assembleDebug

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    echo Try: ./gradlew.bat assembleDebug --stacktrace
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo =====================================
echo APK Build Completed!
echo =====================================
echo.
echo APK Location: %cd%\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next Steps:
echo 1. Connect Android device with USB debugging enabled
echo 2. Run: adb devices (to verify connection)
echo 3. Run: npm run android:transfer
echo    Or: adb install -r android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
