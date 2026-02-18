@echo off
echo ==========================================
echo   PCSensei - Setup Daily Price Check Task
echo ==========================================
echo.
echo Usage:
echo   setup-daily-price-check.bat [HH:MM]
echo Example:
echo   setup-daily-price-check.bat 09:00
echo.

pushd "%~dp0backend"
node setup-daily-task.js %1
popd

echo.
pause
