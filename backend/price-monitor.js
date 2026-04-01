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
    baselinePath: path.join(__dirname, '..', 'shared', 'data', 'price-baseline.json'),
    logPath: path.join(__dirname, '..', 'shared', 'logs', 'price-updates.log'),
    logMirrorDirs: [
        path.join(__dirname, '..', 'logs'),
        path.join(__dirname, '..', 'frontend', 'logs')
    ],
    checkInterval: 24 * 60 * 60 * 1000, // 24 hours
    priceVariation: {
        min: 0.97, // -3% maximum step per run
        max: 1.03  // +3% maximum step per run
    },
    baselineBounds: {
        default: { min: 0.82, max: 1.12 },
        laptops: { min: 0.85, max: 1.15 },
        cpus: { min: 0.82, max: 1.12 },
        gpus: { min: 0.80, max: 1.15 },
        mobos: { min: 0.85, max: 1.12 },
        ram: { min: 0.80, max: 1.08 },
        storage: { min: 0.75, max: 1.00 },
        psu: { min: 0.85, max: 1.12 },
        case: { min: 0.80, max: 1.08 }
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
        this.baselineIndex = {};
    }

    baselineKey(category, itemId) {
        return `${category}:${itemId}`;
    }

    getBaselineBounds(category) {
        return CONFIG.baselineBounds[category] || CONFIG.baselineBounds.default;
    }

    async loadBaselineIndex() {
        try {
            const data = await fs.readFile(CONFIG.baselinePath, 'utf8');
            const parsed = JSON.parse(data);
            if (parsed && typeof parsed === 'object' && parsed.items && typeof parsed.items === 'object') {
                this.baselineIndex = parsed.items;
                return;
            }

            if (parsed && typeof parsed === 'object') {
                this.baselineIndex = parsed;
                return;
            }
        } catch {
            // Baseline file is optional on first run.
        }

        this.baselineIndex = {};
    }

    async saveBaselineIndex() {
        const payload = {
            version: 1,
            generatedAt: new Date().toISOString(),
            source: 'price-monitor',
            items: this.baselineIndex
        };

        await fs.mkdir(path.dirname(CONFIG.baselinePath), { recursive: true });
        await fs.writeFile(CONFIG.baselinePath, JSON.stringify(payload, null, 2), 'utf8');
    }

    resolveBaselinePrice(item, category) {
        const currentPrice = Number(item?.price) || 0;
        const itemBaseline = Number(item?.basePrice) || 0;
        const indexedBaseline = Number(this.baselineIndex[this.baselineKey(category, item?.id)]) || 0;
        const candidate = itemBaseline || indexedBaseline || currentPrice;
        return candidate > 0 ? Math.round(candidate) : 0;
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
        if (currentPrice <= 0) {
            return 0;
        }

        const baselinePrice = this.resolveBaselinePrice(item, category) || currentPrice;
        const marketFactors = this.calculateMarketFactors(category);
        const seasonalFactor = this.getSeasonalFactor();
        const demandFactor = this.getDemandFactor(category);

        const priceMultiplier = marketFactors * seasonalFactor * demandFactor;
        const targetPrice = Math.round(baselinePrice * priceMultiplier);
        const bounds = this.getBaselineBounds(category);
        const minBaselinePrice = Math.max(1, Math.round(baselinePrice * bounds.min));
        const maxBaselinePrice = Math.max(minBaselinePrice, Math.round(baselinePrice * bounds.max));
        const boundedTarget = Math.max(minBaselinePrice, Math.min(maxBaselinePrice, targetPrice));

        const minPrice = Math.round(currentPrice * CONFIG.priceVariation.min);
        const maxPrice = Math.round(currentPrice * CONFIG.priceVariation.max);
        const steppedPrice = Math.max(minPrice, Math.min(maxPrice, boundedTarget));

        return Math.max(minBaselinePrice, Math.min(maxBaselinePrice, steppedPrice));
    }

    calculateMarketFactors(category) {
        const trends = {
            laptops: 1.005,
            cpus: 0.998,
            gpus: 0.992,
            mobos: 1.000,
            ram: 0.992,
            storage: 0.985,
            psu: 1.003,
            case: 1.000
        };

        // Add random variation (-1% to +1%)
        const variation = 0.99 + (Math.random() * 0.02);
        return (trends[category] || 1.0) * variation;
    }

    getSeasonalFactor() {
        const month = new Date().getMonth();

        // Keep seasonal impact gentle to avoid runaway drift.
        if (month >= 10) return 1.01;
        if (month <= 1) return 0.99;
        return 1.0;
    }

    getDemandFactor(category) {
        const highDemand = ['gpus', 'cpus', 'laptops'];
        const mediumDemand = ['ram', 'storage', 'mobos'];

        if (highDemand.includes(category)) {
            return 0.995 + (Math.random() * 0.02); // -0.5% to +1.5%
        }

        if (mediumDemand.includes(category)) {
            return 0.99 + (Math.random() * 0.02); // -1% to +1%
        }

        return 0.99 + (Math.random() * 0.02); // -1% to +1%
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
            await this.loadBaselineIndex();
            const db = await this.loadDatabase();
            const updates = [];
            let metadataUpdated = false;
            let baselineUpdated = false;

            for (const category of CONFIG.categories) {
                const categoryItems = Array.isArray(db[category]) ? db[category] : [];
                if (categoryItems.length === 0) {
                    continue;
                }

                console.log(`Checking ${category}...`);

                for (let index = 0; index < categoryItems.length; index += 1) {
                    const item = categoryItems[index];
                    const oldPrice = Number(item.price) || 0;
                    if (oldPrice <= 0) {
                        continue;
                    }

                    const baselinePrice = this.resolveBaselinePrice(item, category) || oldPrice;
                    if (Number(item.basePrice) !== baselinePrice) {
                        db[category][index].basePrice = baselinePrice;
                        metadataUpdated = true;
                    }

                    const baselineKey = this.baselineKey(category, item.id);
                    if (baselinePrice > 0 && !this.baselineIndex[baselineKey]) {
                        this.baselineIndex[baselineKey] = baselinePrice;
                        baselineUpdated = true;
                    }

                    const newPrice = await this.fetchMarketPrice(db[category][index], category);

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

            if (baselineUpdated) {
                await this.saveBaselineIndex();
            }

            if (updates.length > 0 || metadataUpdated) {
                await this.saveDatabase(db);
            }

            if (updates.length > 0) {
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
