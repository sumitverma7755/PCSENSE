# ðŸ–¥ï¸ PCSensei - AI-Powered PC Building Assistant

**Intelligent PC & Laptop Consultant with Real-time Price Monitoring**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Price Monitoring](https://img.shields.io/badge/Price%20Updates-Daily-orange)]()

PCSensei is a modern web application that helps users build custom PCs and choose laptops based on their budget, usage requirements, and preferences. Features AI-powered recommendations, compatibility checking, performance predictions, and automatic price monitoring.

---

## âœ¨ Features

### ðŸŽ¯ Core Functionality
- **Smart Build Generator**: Get personalized PC/Laptop recommendations based on budget and usage
- **Budget-Based Selection**: From â‚¹15,000 entry-level to â‚¹5L+ ultra-high-end builds
- **Usage Profiles**: Gaming, Content Creation, Coding, Office Work, Student use
- **Compatibility Checking**: Automatic CPU socket, motherboard, and power supply compatibility
- **Performance Predictions**: FPS estimates, rendering benchmarks, development metrics

### ðŸ¤– AI Features
- **AI Chat Assistant**: Ask questions about components and compatibility
- **Intelligent Price Monitoring**: Automatic daily price updates with market trend analysis
- **Smart Recommendations**: Multi-factor decision engine for optimal component selection

### ðŸ›¡ï¸ Security
- **Session Management**: 30-minute timeout with auto-logout
- **Input Validation**: Comprehensive sanitization and XSS protection
- **Rate Limiting**: Prevents abuse and spam
- **Authentication**: Secure admin panel with password hashing
- **Activity Logging**: Complete audit trail

### ðŸ“Š Admin Panel
- **Component Management**: CRUD operations for all product categories
- **Search & Filter**: Real-time search with sorting options
- **Bulk Operations**: Select and delete multiple items
- **Price Analytics**: Min/avg/max price statistics
- **Export/Import**: JSON database backup and restore
- **Activity Dashboard**: Recent changes and system logs

### ðŸ’° Price Monitoring
- **Automated Updates**: Daily price checks (configurable interval)
- **Market Analysis**: Considers trends, seasonality, and demand
- **Price History**: Comprehensive logging of all changes
- **Dashboard**: Visual price update tracking
- **Notifications**: Change alerts and summaries

---

## ðŸš€ Quick Start

### Prerequisites
- **Web Server**: Python 3.x (for local testing) OR any HTTP server
- **Node.js** (Backend/API features): v20.0.0+
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sumitverma0008/PCSENSE.git
cd PCSENSE
```

2. **Start the frontend**

**Using Python:**
```bash
cd frontend
python -m http.server 8000
```

**Or using Node.js:**
```bash
npm install -g http-server
cd frontend
http-server -p 8000
```

3. **Start the backend (optional - for price monitoring)**
```bash
cd backend
npm install
node api-server.js
```

4. **Open in browser**
```
http://localhost:8000/main.html
```

### Admin Panel Access

1. Navigate to: `http://localhost:8000/admin.html`
2. Start backend API on `http://localhost:3001`
3. Configure credentials via environment variables:
   - `PCSENSEI_ADMIN_USER` (default: `admin`)
   - `PCSENSEI_ADMIN_PASSWORD` (required)

---

## ðŸ“‚ Project Structure

```
PCSensei/
â”œâ”€â”€ frontend/                    # User interface (HTML/JS/CSS)
â”‚   â”œâ”€â”€ index.html              # Landing page
â”‚   â”œâ”€â”€ main.html               # Recommendation wizard
â”‚   â”œâ”€â”€ admin.html              # Admin panel
â”‚   â””â”€â”€ price-dashboard.html    # Price tracking UI
â”‚
â”œâ”€â”€ backend/                     # Node.js services
â”‚   â”œâ”€â”€ api-server.js           # HTTP API server (port 3001)
â”‚   â”œâ”€â”€ price-monitor.js        # Price checking engine
â”‚   â”œâ”€â”€ add-buy-links.js        # Shopping link generator
â”‚   â”œâ”€â”€ update-multi-store-links.js
â”‚   â””â”€â”€ package.json            # Dependencies
â”‚
â”œâ”€â”€ shared/                      # Shared resources
â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â””â”€â”€ components.json     # Component database (800+ items)
â”‚   â””â”€â”€ logs/
â”‚       â”œâ”€â”€ price-updates.log   # JSON format logs
â”‚       â””â”€â”€ price-summary.txt   # Human-readable summary
â”‚
â”œâ”€â”€ android/                     # Mobile app (planned)
â”‚   â””â”€â”€ README.md
â”‚
â””â”€â”€ docs/                        # Documentation
    â”œâ”€â”€ AI-IMPROVEMENTS.md
    â”œâ”€â”€ README-PRICE-MONITOR.md
    â””â”€â”€ VERCEL-DEPLOY.md
```

---

## ðŸŽ® Usage Guide

### For Users

1. **Visit the application**: Open `main.html`
2. **Start the wizard**: Click "Start Building"
3. **Choose form factor**: Desktop PC or Laptop
4. **Select usage**: Gaming, Content Creation, Coding, etc.
5. **Set budget**: Use slider (â‚¹15,000 - â‚¹5,00,000)
6. **Set preferences**: CPU (Intel/AMD) and GPU (NVIDIA/AMD) preferences
7. **Get recommendation**: View complete build with performance metrics
8. **Ask AI**: Use chat assistant for questions

### For Admins

1. **Login**: Access `admin.html` with credentials
2. **View Dashboard**: See component statistics and recent activity
3. **Manage Components**: 
   - Add new items
   - Edit existing items
   - Delete or bulk delete
   - Search and filter
4. **Export/Import**: Backup and restore database
5. **Monitor Prices**: Check `price-dashboard.html` for updates

---

## ðŸ¤– AI Price Monitoring

### Setup

**Install Node.js** (if not installed):
- Download from [nodejs.org](https://nodejs.org/)
- Verify: `node --version`

### Running Price Monitor

**Option 1: Via Admin Panel (Recommended)**

1. Start the API server:
```bash
cd backend
node api-server.js
```

2. Open Admin Panel: `http://localhost:8000/admin.html`
3. Click the **"Update Prices"** button in the header

**Option 2: Manual Command Line**

One-time check:
```bash
cd backend
node price-monitor.js --once
```

Continuous monitoring:
```bash
cd backend
node price-monitor.js
```

Daily fixed-time monitoring (default 09:00 local):
```bash
cd backend
node price-monitor.js --daily
```

Install automatic daily checks with Windows Task Scheduler:
```bash
setup-daily-price-check.bat 09:00
```

Remove it later with:
```bash
remove-daily-price-check.bat
```

### How It Works

1. **Market Analysis**: Analyzes category-specific trends
2. **Seasonal Factors**: Adjusts for holidays, sales periods
3. **Demand Patterns**: Considers high/medium/low demand
4. **Price Bounds**: Limits changes to -5% to +10%
5. **Database Update**: Automatically updates `components.json`
6. **Logging**: Creates detailed logs in `shared/logs/` (mirrored to `frontend/logs/` and `logs/`)

### Configuration

Edit `backend/price-monitor.js`:

```javascript
const CONFIG = {
    dataPath: path.join(__dirname, '..', 'shared', 'data', 'components.json'),
    checkInterval: 24 * 60 * 60 * 1000,  // 24 hours (adjust as needed)
    priceVariation: {
        min: 0.95,   // -5% minimum change
        max: 1.10    // +10% maximum change
    }
};
```

### Production Integration

Replace simulated price fetching with real APIs:

```javascript
async fetchMarketPrice(item, category) {
    // Example: Real API integration
    const response = await fetch(`https://api.pricetracker.com/v1/price`, {
        method: 'POST',
        body: JSON.stringify({
            productName: item.name,
            category: category
        })
    });
    const data = await response.json();
    return data.price;
}
```

---

## ðŸ” Security Features

### Admin Panel
- SHA-256 password hashing
- Session token generation (64-character hex)
- 30-minute session timeout
- Rate limiting (3 attempts, 1-minute lockout)
- XSS protection via HTML sanitization
- Input validation on all fields
- Activity logging for audit trail

### Main Application
- HTTP security headers
- Input sanitization
- Budget validation
- Rate limiting on build generation
- Database structure validation
- Content Security Policy

### Best Practices
1. Change default admin credentials
2. Use HTTPS in production
3. Implement backend authentication
4. Add CORS policies
5. Regular security audits
6. Keep dependencies updated

---

## Customization

### Adding Components

Via Admin Panel:
1. Login to admin panel
2. Select category tab
3. Click "Add New" button
4. Fill in component details
5. Save

Direct JSON edit (source of truth): `shared/data/components.json`

### Modifying UI

- Main wizard: `frontend/main.html`
- Admin panel: `frontend/admin.html`
- Price dashboard: `frontend/price-dashboard.html`

### Budget Range

Edit slider bounds (`min`, `max`, `step`) in `frontend/main.html`.

## ðŸ“Š Database Structure

### Component Categories
- **Laptops** (104 items): Complete laptop systems
- **CPUs** (101 items): Processors (Intel/AMD)
- **GPUs** (101 items): Graphics cards (NVIDIA/AMD)
- **Motherboards** (101 items): Mainboards with socket types
- **RAM** (101 items): Memory modules
- **Storage** (101 items): SSDs and HDDs
- **PSU** (101 items): Power supplies
- **Cases** (101 items): PC cases

### Sample Component Structure

```json
{
  "id": "c50",
  "name": "Intel Core i7-12700K",
  "brand": "Intel",
  "cores": 12,
  "threads": 20,
  "socket": "LGA1700",
  "price": 32000,
  "tier": "mid"
}
```

---

## ðŸ› ï¸ Development

### Local Development

1. **Clone and setup:**
```bash
git clone https://github.com/yourusername/pcsensei.git
cd pcsensei
```

2. **Start development server:**
```bash
python -m http.server 8000
```

3. **Make changes** to HTML/CSS/JS files

4. **Test** in browser: `http://localhost:8000`

### Adding New Features

Example workflow for a new category:
1. Update `shared/data/components.json`
2. Update admin forms/table rendering in `frontend/admin.html`
3. Update recommendation logic in `frontend/main.html`
4. Run backend data sync scripts if needed

---

## ðŸ› Troubleshooting

### Common Issues

**Issue: "Failed to load database"**
- **Solution**: Ensure `shared/data/components.json` exists and is valid JSON
- Test: `python -m json.tool shared/data/components.json`

**Issue: Admin panel won't login**
- **Solution**: Check browser console for errors
- Clear browser cache and cookies
- Verify backend API is running and `PCSENSEI_ADMIN_PASSWORD` is configured

**Issue: Price monitor not working**
- **Solution**: Install Node.js 20+ from nodejs.org
- Run: `node --version` to verify
- Check logs in `shared/logs/` (mirrored to `frontend/logs/` and `logs/`)

**Issue: Components not displaying**
- **Solution**: Check browser console (F12)
- Verify HTTP server is running
- Check `shared/data/components.json` (and mirrored `frontend/data/components.json`) format

### Debug Mode

Enable console logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

---

## ðŸ“ API Documentation

### Main Application Functions

```javascript
// Generate PC build
async function generateBuild()

// Load database
async function loadDb()

// Navigate wizard
function navWizard(step)

// Set preferences
function setPref(type, value)
```

### Admin Panel Functions

```javascript
// CRUD operations
function saveItem(category)
function deleteItem(category, index)
function bulkDelete()

// Database management
function exportData()
function importData(event)

// Session management
function logout()
```

---

## ðŸ¤ Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**: https://github.com/sumitverma0008/PCSENSE
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Code Style
- Use consistent indentation (4 spaces)
- Comment complex logic
- Follow existing patterns
- Test thoroughly before submitting

---

## ðŸ“œ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ðŸ™ Acknowledgments

- Built with vanilla JavaScript (no frameworks!)
- Icons from Font Awesome
- Styling with Tailwind CSS (CDN)
- Inspiration from PC part picker websites

---

## ðŸ“§ Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/sumitverma0008/PCSENSE/issues)
- **Repository**: [View on GitHub](https://github.com/sumitverma0008/PCSENSE)
- **Documentation**: See `README-PRICE-MONITOR.md` for price monitoring details

---

## ðŸ—ºï¸ Roadmap

### Upcoming Features
- [ ] User accounts and saved builds
- [ ] Price comparison across retailers
- [ ] Real-time availability checking
- [ ] Build sharing and community ratings
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Advanced filtering options
- [ ] Build templates/presets
- [ ] Newsletter for price alerts
- [ ] Integration with e-commerce APIs

---

## ðŸ“¸ Screenshots

### Main Application
![Main Interface](https://via.placeholder.com/800x400?text=PCSensei+Main+Interface)

### Admin Panel
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### Price Dashboard
![Price Updates](https://via.placeholder.com/800x400?text=Price+Monitoring)

---

## ðŸ’» Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Font Awesome 6
- **Backend**: Node.js (Price monitoring)
- **Database**: JSON file-based
- **Server**: Python HTTP Server / Node.js http-server

---

## ðŸ“Š Statistics

- **800+** components in database
- **5** usage profiles
- **8** component categories
- **Daily** price updates
- **100%** vanilla JavaScript
- **0** external dependencies (main app)

---

**Built with â¤ï¸ for PC building enthusiasts**

*Last updated: November 2025*
