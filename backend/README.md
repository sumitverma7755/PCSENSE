# PCSensei Backend

Node.js backend for admin auth, price monitoring, and data APIs.

## Files
- `api-server.js` - HTTP API server (default port `3001`)
- `price-monitor.js` - Automated price update engine
- `add-buy-links.js` - Add Amazon links and sync data mirrors
- `update-multi-store-links.js` - Add multi-store links and sync data mirrors
- `package.json` - Scripts and runtime requirements

## Runtime
- Node.js `20+`

## Setup
```bash
cd backend
npm install
```

## Configure Admin Login
Set environment variables before starting API server:

- `PCSENSEI_ADMIN_USER` (default: `admin`)
- `PCSENSEI_ADMIN_PASSWORD` (required)

PowerShell example:
```powershell
$env:PCSENSEI_ADMIN_USER='admin'
$env:PCSENSEI_ADMIN_PASSWORD='strong-password-here'
node api-server.js
```

## Run
```bash
# Start API server
npm run start

# One-time price update
npm run check-once

# Continuous price monitoring
npm run monitor

# Daily fixed-time monitoring (in-process)
npm run monitor-daily

# Install Windows Task Scheduler daily automation
npm run schedule-daily -- 09:00

# Remove Windows scheduled automation
npm run unschedule-daily
```

## Data Paths
- Source of truth: `../shared/data/components.json`
- Legacy mirrors kept in sync: `../data/components.json`, `../frontend/data/components.json`
- Logs: `../shared/logs/` plus mirrored copies for dashboard compatibility
