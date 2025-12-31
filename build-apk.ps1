param(
    [string]$BuildType = "debug",
    [switch]$Clean = $false,
    [switch]$Install = $false
)

$ErrorActionPreference = "Stop"

$frontendPath = "C:\Users\Aarav Comp\Desktop\Prajyotndhitesh\Frontend"
$androidPath = Join-Path $frontendPath "android"
$apkDebugPath = Join-Path $androidPath "app\build\outputs\apk\debug\app-debug.apk"
$apkReleasePath = Join-Path $androidPath "app\build\outputs\apk\release\app-release.apk"

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        Write-Success "Node.js installed"
    }
    else {
        Write-Error-Custom "Node.js not installed"
        exit 1
    }
    
    $java = Get-Command java -ErrorAction SilentlyContinue
    if ($java) {
        Write-Success "Java installed"
    }
    else {
        Write-Error-Custom "Java not installed"
        exit 1
    }
    
    if ($env:ANDROID_HOME) {
        Write-Success "ANDROID_HOME is set"
    }
    else {
        Write-Error-Custom "ANDROID_HOME not set"
        exit 1
    }
    
    $gradleWrapper = Join-Path $androidPath "gradlew.bat"
    if (Test-Path $gradleWrapper) {
        Write-Success "Gradle wrapper found"
    }
    else {
        Write-Error-Custom "Gradle wrapper not found"
        exit 1
    }
}

function Install-Dependencies {
    Write-Header "Installing npm Dependencies"
    
    try {
        Push-Location $frontendPath
        npm install
        Write-Success "Dependencies installed"
    }
    catch {
        Write-Error-Custom "Failed to install dependencies: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Build-APK {
    Write-Header "Building APK (Build Type: $BuildType)"
    
    try {
        Push-Location $androidPath
        
        if ($Clean) {
            Write-Host "Running gradle clean..."
            & ".\gradlew.bat" clean
            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Gradle clean failed"
                exit 1
            }
            Write-Success "Gradle clean completed"
        }
        
        if ($BuildType -eq "debug") {
            Write-Host "Running: gradlew assembleDebug..."
            & ".\gradlew.bat" assembleDebug --stacktrace
        }
        elseif ($BuildType -eq "release") {
            Write-Host "Running: gradlew assembleRelease..."
            & ".\gradlew.bat" assembleRelease --stacktrace
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Build failed"
            exit 1
        }
        
        Write-Success "APK built successfully"
    }
    catch {
        Write-Error-Custom "Build error: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Verify-APK {
    Write-Header "Verifying APK"
    
    if ($BuildType -eq "debug" -and (Test-Path $apkDebugPath)) {
        $filesize = (Get-Item $apkDebugPath).Length / 1MB
        $sizestr = [Math]::Round($filesize, 2)
        Write-Success "Debug APK found"
        Write-Success "Path: $apkDebugPath"
        Write-Success "Size: $sizestr MB"
        return $apkDebugPath
    }
    elseif ($BuildType -eq "release" -and (Test-Path $apkReleasePath)) {
        $filesize = (Get-Item $apkReleasePath).Length / 1MB
        $sizestr = [Math]::Round($filesize, 2)
        Write-Success "Release APK found"
        Write-Success "Path: $apkReleasePath"
        Write-Success "Size: $sizestr MB"
        return $apkReleasePath
    }
    else {
        Write-Error-Custom "APK not found"
        exit 1
    }
}

function Install-APK {
    param([string]$ApkPath)
    
    Write-Header "Installing APK on Device"
    
    try {
        Write-Host "Checking connected devices..."
        $devices = & adb devices
        
        if ($devices -match "device") {
            Write-Host "Connected devices:"
            Write-Host $devices
            
            Write-Host ""
            Write-Host "Installing APK..."
            & adb install -r $ApkPath
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "APK installed successfully"
            }
            else {
                Write-Error-Custom "APK installation failed"
            }
        }
        else {
            Write-Error-Custom "No connected Android devices found"
            Write-Host "Connect a device with USB debugging enabled and try again"
        }
    }
    catch {
        Write-Error-Custom "Installation error: $_"
    }
}

Write-Host ""
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   React Native APK Build Script    " -ForegroundColor Cyan
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Check-Prerequisites
Install-Dependencies

if ($Clean) {
    Write-Host "Clean build requested" -ForegroundColor Yellow
}

Build-APK
$apkFile = Verify-APK

Write-Header "Build Complete!"
Write-Host "APK Location: $apkFile"
Write-Host ""

if ($Install) {
    Install-APK $apkFile
}
else {
    Write-Host "To install on device, run:" -ForegroundColor Yellow
    Write-Host "adb install -r ""$apkFile"""
}

Write-Host ""
