@echo off
echo ========================================
echo Opening Windows Firewall Port 8080
echo ========================================
echo.
echo This script needs Administrator privileges.
echo.
pause

netsh advfirewall firewall add rule name="Backend Server Port 8080" dir=in action=allow protocol=TCP localport=8080

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! Port 8080 is now open.
    echo.
    echo Your backend should now be accessible from mobile devices.
    echo Make sure your mobile device is on the same WiFi network.
    echo.
) else (
    echo.
    echo ❌ FAILED! Make sure you're running as Administrator.
    echo Right-click this file and select "Run as administrator"
    echo.
)

pause
