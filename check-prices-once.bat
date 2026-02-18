@echo off
echo ========================================
echo PCSensei One-Time Price Check
echo ========================================
echo.
echo Running AI price check...
echo.

pushd "%~dp0backend"
node price-monitor.js --once
popd

echo.
echo Press any key to exit...
pause > nul
