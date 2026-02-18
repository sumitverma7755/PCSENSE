# PCSensei Frontend

HTML/JavaScript frontend for PC and laptop recommendations.

## Files
- `index.html` - Landing page
- `main.html` - Recommendation wizard
- `admin.html` - Admin panel
- `price-dashboard.html` - Price update dashboard

## Running Locally
```bash
cd frontend
python -m http.server 8000
# Visit: http://localhost:8000/main.html
```

## Data and API Behavior
- `main.html` loads component data from local `data/components.json`, with fallback to `http://localhost:3001/api/components`.
- `admin.html` and `price-dashboard.html` read price summaries from API first (`http://localhost:3001/api/price-summary`), then fallback to local `logs/price-summary.txt`.
- Admin login requires backend API (`http://localhost:3001`) and server-side credentials.
