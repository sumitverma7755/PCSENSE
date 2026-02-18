@echo off
echo Starting API Server for Admin Panel...
echo.
echo The API server allows the admin panel to trigger price updates
echo Server will run on http://localhost:3001
echo.
echo IMPORTANT: set PCSENSEI_ADMIN_PASSWORD before starting:
echo   set PCSENSEI_ADMIN_PASSWORD=your-password
echo.
echo Press Ctrl+C to stop the server
echo.
cd backend
node api-server.js
pause
