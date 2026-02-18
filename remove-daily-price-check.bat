@echo off
echo ==========================================
echo   PCSensei - Remove Daily Price Check Task
echo ==========================================
echo.

pushd "%~dp0backend"
node remove-daily-task.js
popd

echo.
pause
