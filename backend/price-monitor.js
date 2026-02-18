// AI Price Monitoring System for PCSensei
// Automatically checks and updates component prices daily

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    dataPath: path.join(__dirname, '..', 'shared', 'data', 'components.json'),
    dataMirrorPaths: [
        path.join(__dirname, '..', 'data', 'components.json'),
        path.join(__dirname, '..', 'frontend', 'data', 'components.json')
    ],
    logPath: path.join(__dirname, '..', 'shared', 'logs', 'price-updates.log'),
    logMirrorDirs: [
        path.join(__dirname, '..', 'logs'),
        path.join(__dirname, '..', 'frontend', 'logs')
    ],
    checkInterval: 24 * 60 * 60 * 1000, // 24 hours
    priceVariation: {
        min: 0.95, // -5% minimum
        max: 1.10  // +10% maximum
    },
    categories: ['laptops', 'cpus', 'gpus', 'mobos', 'ram', 'storage', 'psu', 'case'],
    dailySchedule: {
        hour: 9,
        minute: 0
    }
};

class AIPriceMonitor {
    constructor() {
        this.priceHistory = new Map();
        this.lastUpdate = null;
        this.dailyTimer = null;
        this.dailySchedule = this.resolveDailySchedule();
    }

    resolveDailySchedule() {
        const rawHour = Number.parseInt(process.env.PCSENSEI_DAILY_CHECK_HOUR, 10);
        const rawMinute = Number.parseInt(process.env.PCSENSEI_DAILY_CHECK_MINUTE, 10);
        const hasValidHour = Number.isInteger(rawHour) && rawHour >= 0 && rawHour <= 23;
        const hasValidMinute = Number.isInteger(rawMinute) && rawMinute >= 0 && rawMinute <= 59;

        return {
            hour: hasValidHour ? rawHour : CONFIG.dailySchedule.hour,
            minute: hasValidMinute ? rawMinute : CONFIG.dailySchedule.minute
        };
    }

    getNextDailyRunTime() {
        const now = new Date();
        const nextRun = new Date(now);

        nextRun.setHours(this.dailySchedule.hour, this.dailySchedule.minute, 0, 0);
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }

        return nextRun;
    }

    scheduleNextDailyRun() {
        if (this.dailyTimer) {
            clearTimeout(this.dailyTimer);
        }

        const nextRun = this.getNextDailyRunTime();
        const delayMs = Math.max(1000, nextRun.getTime() - Date.now());
        console.log(`Next daily check scheduled at: ${nextRun.toLocaleString('en-IN')}`);

        this.dailyTimer = setTimeout(async () => {
            try {
                await this.checkAndUpdatePrices();
            } catch (error) {
                console.error('Scheduled daily monitoring run failed:', error);
            }

            this.scheduleNextDailyRun();
        }, delayMs);
    }

    // Simulate AI price checking with market trends
    async fetchMarketPrice(item, category) {
        const currentPrice = Number(item.price) || 0;
        const marketFactors = this.calculateMarketFactors(category);
        const seasonalFactor = this.getSeasonalFactor();
        const demandFactor = this.getDemandFactor(category);

        const priceMultiplier = marketFactors * seasonalFactor * demandFactor;
        const newPrice = Math.round(currentPrice * priceMultiplier);

        const minPrice = Math.round(currentPrice * CONFIG.priceVariation.min);
        const maxPrice = Math.round(currentPrice * CONFIG.priceVariation.max);

        return Math.max(minPrice, Math.min(maxPrice, newPrice));
    }

    calculateMarketFactors(category) {
        const trends = {
            laptops: 0.98,
            cpus: 1.02,
            gpus: 1.05,
            mobos: 0.99,
            ram: 0.97,
            storage: 0.95,
            psu: 1.01,
            case: 0.98
        };

        // Add random variation (-2% to +2%)
        const variation = 0.98 + (Math.random() * 0.04);
        return (trends[category] || 1.0) * variation;
    }

    getSeasonalFactor() {
        const month = new Date().getMonth();

        // Nov-Dec: higher prices, Jan-Feb: lower prices
        if (month >= 10) return 1.03;
        if (month <= 1) return 0.97;
        return 1.0;
    }

    getDemandFactor(category) {
        const highDemand = ['gpus', 'cpus', 'laptops'];
        const mediumDemand = ['ram', 'storage', 'mobos'];

        if (highDemand.includes(category)) {
            return 1.00 + (Math.random() * 0.03); // 0-3% increase
        }

        if (mediumDemand.includes(category)) {
            return 0.99 + (Math.random() * 0.02); // -1% to +1%
        }

        return 0.98 + (Math.random() * 0.02); // -2% to 0%
    }

    async loadDatabase() {
        try {
            const data = await fs.readFile(CONFIG.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load database:', error);
            throw error;
        }
    }

    async saveDatabase(db) {
        try {
            const serialized = JSON.stringify(db, null, 2);

            await fs.mkdir(path.dirname(CONFIG.dataPath), { recursive: true });
            await fs.writeFile(CONFIG.dataPath, serialized, 'utf8');

            // Keep legacy copies in sync while using shared/data as source of truth.
            for (const mirrorPath of CONFIG.dataMirrorPaths) {
                await fs.mkdir(path.dirname(mirrorPath), { recursive: true });
                await fs.writeFile(mirrorPath, serialized, 'utf8');
            }

            console.log('Database updated successfully');
        } catch (error) {
            console.error('Failed to save database:', error);
            throw error;
        }
    }

    async logPriceUpdate(updates) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            totalUpdates: updates.length,
            updates: updates.map((update) => ({
                category: update.category,
                id: update.id,
                name: update.name,
                oldPrice: update.oldPrice,
                newPrice: update.newPrice,
                change: update.change,
                changePercent: update.changePercent
            }))
        };

        try {
            const logLine = JSON.stringify(logEntry) + '\n';
            const summary = this.generateSummary(updates);

            const logTargets = [
                CONFIG.logPath,
                ...CONFIG.logMirrorDirs.map((dir) => path.join(dir, 'price-updates.log'))
            ];

            const summaryTargets = [
                path.join(path.dirname(CONFIG.logPath), 'price-summary.txt'),
                ...CONFIG.logMirrorDirs.map((dir) => path.join(dir, 'price-summary.txt'))
            ];

            for (const target of logTargets) {
                await fs.mkdir(path.dirname(target), { recursive: true });
                await fs.appendFile(target, logLine, 'utf8');
            }

            for (const target of summaryTargets) {
                await fs.mkdir(path.dirname(target), { recursive: true });
                await fs.writeFile(target, summary, 'utf8');
            }

            console.log(`Logged ${updates.length} price updates`);
        } catch (error) {
            console.error('Failed to write log:', error);
        }
    }

    generateSummary(updates) {
        const timestamp = new Date().toLocaleString('en-IN');
        let summary = 'PCSensei Price Update Summary\n';
        summary += `Generated: ${timestamp}\n`;
        summary += `${'='.repeat(60)}\n\n`;

        const byCategory = {};
        for (const update of updates) {
            if (!byCategory[update.category]) {
                byCategory[update.category] = [];
            }
            byCategory[update.category].push(update);
        }

        for (const [category, items] of Object.entries(byCategory)) {
            summary += `${category.toUpperCase()}\n${'-'.repeat(60)}\n`;
            for (const item of items) {
                const arrow = item.change > 0 ? '↑' : '↓';
                summary += `  ${item.name}\n`;
                summary += `    Old: ₹${item.oldPrice.toLocaleString('en-IN')} → `;
                summary += `New: ₹${item.newPrice.toLocaleString('en-IN')} `;
                summary += `(${arrow} ${Math.abs(item.changePercent).toFixed(2)}%)\n\n`;
            }
        }

        const totalIncreases = updates.filter((item) => item.change > 0).length;
        const totalDecreases = updates.filter((item) => item.change < 0).length;

        summary += '\nSummary Statistics:\n';
        summary += `  Total Updates: ${updates.length}\n`;
        summary += `  Price Increases: ${totalIncreases}\n`;
        summary += `  Price Decreases: ${totalDecreases}\n`;
        summary += `  No Change: ${updates.length - totalIncreases - totalDecreases}\n`;

        const ramUpdates = updates.filter((item) => item.category === 'ram');
        if (ramUpdates.length > 0) {
            const ramOldTotal = ramUpdates.reduce((sum, item) => sum + item.oldPrice, 0);
            const ramNewTotal = ramUpdates.reduce((sum, item) => sum + item.newPrice, 0);
            const ramAverageChangePercent = ramUpdates.reduce((sum, item) => sum + item.changePercent, 0) / ramUpdates.length;
            const trendPrefix = ramAverageChangePercent >= 0 ? '+' : '';

            summary += '\nRAM Watch:\n';
            summary += `  RAM Items Updated: ${ramUpdates.length}\n`;
            summary += `  Average Change: ${trendPrefix}${ramAverageChangePercent.toFixed(2)}%\n`;
            summary += `  Average Price: ₹${Math.round(ramOldTotal / ramUpdates.length).toLocaleString('en-IN')} → `;
            summary += `₹${Math.round(ramNewTotal / ramUpdates.length).toLocaleString('en-IN')}\n`;
        }

        return summary;
    }

    async checkAndUpdatePrices() {
        console.log('AI Price Monitor started...');
        console.log(new Date().toLocaleString('en-IN'));

        try {
            const db = await this.loadDatabase();
            const updates = [];

            for (const category of CONFIG.categories) {
                const categoryItems = Array.isArray(db[category]) ? db[category] : [];
                if (categoryItems.length === 0) {
                    continue;
                }

                console.log(`Checking ${category}...`);

                for (let index = 0; index < categoryItems.length; index += 1) {
                    const item = categoryItems[index];
                    const oldPrice = Number(item.price) || 0;
                    const newPrice = await this.fetchMarketPrice(item, category);

                    if (newPrice !== oldPrice) {
                        const change = newPrice - oldPrice;
                        const changePercent = oldPrice === 0 ? 0 : ((change / oldPrice) * 100);

                        updates.push({
                            category,
                            id: item.id,
                            name: item.name || item.id,
                            oldPrice,
                            newPrice,
                            change,
                            changePercent
                        });

                        db[category][index].price = newPrice;
                    }
                }
            }

            if (updates.length > 0) {
                await this.saveDatabase(db);
                await this.logPriceUpdate(updates);
                console.log(`Price check complete: ${updates.length} prices updated`);
            } else {
                console.log('Price check complete: no changes needed');
            }

            this.lastUpdate = new Date();
            return updates;
        } catch (error) {
            console.error('Price check failed:', error);
            throw error;
        }
    }

    startMonitoring() {
        console.log('Starting AI Price Monitoring Service');
        console.log(`Check interval: ${CONFIG.checkInterval / (1000 * 60 * 60)} hours`);

        // Run immediately on start
        this.checkAndUpdatePrices().catch((error) => {
            console.error('Initial monitoring run failed:', error);
        });

        // Schedule recurring checks
        setInterval(() => {
            this.checkAndUpdatePrices().catch((error) => {
                console.error('Scheduled monitoring run failed:', error);
            });
        }, CONFIG.checkInterval);

        console.log('Monitoring service started successfully');
    }

    startDailyMonitoring() {
        const hourLabel = String(this.dailySchedule.hour).padStart(2, '0');
        const minuteLabel = String(this.dailySchedule.minute).padStart(2, '0');
        console.log('Starting AI Price Monitoring Service (daily schedule mode)');
        console.log(`Daily check time: ${hourLabel}:${minuteLabel}`);

        this.checkAndUpdatePrices()
            .catch((error) => {
                console.error('Initial daily monitoring run failed:', error);
            })
            .finally(() => {
                this.scheduleNextDailyRun();
            });
    }

    async runManualCheck() {
        console.log('Manual price check triggered');
        return this.checkAndUpdatePrices();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPriceMonitor;
}

if (require.main === module) {
    const monitor = new AIPriceMonitor();
    const args = process.argv.slice(2);

    if (args.includes('--once')) {
        monitor.runManualCheck()
            .then(() => process.exit(0))
            .catch((error) => {
                console.error('Failed:', error);
                process.exit(1);
            });
    } else if (args.includes('--daily')) {
        monitor.startDailyMonitoring();
    } else {
        monitor.startMonitoring();
    }
}
