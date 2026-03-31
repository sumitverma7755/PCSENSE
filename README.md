# PCSensei

PCSensei is a PC and laptop recommendation platform focused on budget-aware builds, compatibility checks, and price visibility for the Indian market.

## What is in this repo

- `main.html`: Primary web app shell (landing, guided builder, manual builder, results)
- Route wrappers:
  - `home.html`
  - `mode-selection.html`
  - `guided-builder.html`
  - `manual-builder.html`
  - `results.html`
  - `pc-builder.html`
  - `laptop-finder.html`
- Utility pages:
  - `about.html`
  - `help.html`
  - `price-dashboard.html`
  - `admin.html`
- `data/components.json`: Component catalog consumed by the frontend
- `backend/`: API and operational scripts

## Quick start

1. Open `index.html` or `main.html` for the frontend flow.
2. If you use backend APIs, configure `localStorage.pcsenseiApiBaseUrl` to your API base URL.
3. Keep `data/components.json` updated for local/offline catalog fallback.

## Admin and operations

- Admin panel: `admin.html`
- Price dashboard: `price-dashboard.html`
- Backend scripts and API server are in `backend/`.

## Notes

- Root website pages have production hardening for metadata, redirects, and link consistency.
- Route pages are intentionally thin wrappers that redirect into `main.html` views.
