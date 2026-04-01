# PCSensei

PCSensei is a PC and laptop recommendation platform focused on budget-aware builds, compatibility checks, and price visibility for the Indian market.

## What is in this repo

- `frontend/`: React + Tailwind app (Vite)
  - `frontend/src/pages/HomePage.jsx`
  - `frontend/src/pages/ConfigurationWizard.jsx`
  - `frontend/src/components/wizard/*`
- `data/components.json`: Component catalog consumed by the frontend
- `backend/`: API and operational scripts

## Quick start

1. Install frontend dependencies:
   - `cd frontend`
   - `npm install`
2. Start React frontend:
   - `npm run dev`
3. Open:
   - `http://localhost:5173/?page=home`
   - `http://localhost:5173/?page=wizard`
4. If you use backend APIs, configure `localStorage.pcsenseiApiBaseUrl` to your API base URL.
5. Keep `data/components.json` updated for local/offline catalog fallback.

## Admin and operations

- Backend scripts and API server are in `backend/`.

## Notes

- Legacy static HTML website pages were removed.
- Vercel redirects old HTML routes to the React app at `/frontend`.
