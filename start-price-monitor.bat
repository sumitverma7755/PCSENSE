@echo off
echo ==========================================
echo   PCSensei - Continuous Price Monitoring
echo ==========================================
echo.
echo Starting daily price monitoring...
echo Default schedule: 09:00 local time
echo Optional env override:
echo   set PCSENSEI_DAILY_CHECK_HOUR=8
echo   set PCSENSEI_DAILY_CHECK_MINUTE=30
echo Press Ctrl+C to stop
echo.
pushd "%~dp0backend"
node price-monitor.js --daily
popd
pause
