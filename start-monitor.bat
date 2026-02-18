@echo off
echo ========================================
echo PCSensei AI Price Monitor
echo ========================================
echo.
echo Starting AI-powered daily price monitoring...
echo.

pushd "%~dp0backend"
node price-monitor.js --daily
popd

pause
