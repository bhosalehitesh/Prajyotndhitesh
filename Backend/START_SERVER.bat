@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.
echo Current password in config: postgres
echo.
echo If this fails, you need to update:
echo   src\main\resources\application.properties
echo   Line 16: spring.datasource.password=YOUR_PASSWORD
echo.
echo ========================================
echo.

mvn spring-boot:run

pause

