const fs = require('fs');
const path = require('path');

const SOURCE_DATA_PATH = path.join(__dirname, '..', 'shared', 'data', 'components.json');
const MIRROR_DATA_PATHS = [
    path.join(__dirname, '..', 'data', 'components.json'),
    path.join(__dirname, '..', 'frontend', 'data', 'components.json')
];
const LOG_PATH = path.join(__dirname, '..', 'shared', 'logs', 'price-updates.log');
const BASELINE_PATH = path.join(__dirname, '..', 'shared', 'data', 'price-baseline.json');

const CATEGORY_BOUNDS = {
    default: { min: 0.82, max: 1.12 },
    laptops: { min: 0.85, max: 1.15 },
    cpus: { min: 0.82, max: 1.12 },
    gpus: { min: 0.80, max: 1.15 },
    mobos: { min: 0.85, max: 1.12 },
    ram: { min: 0.80, max: 1.08 },
    storage: { min: 0.75, max: 1.00 },
    psu: { min: 0.85, max: 1.12 },
    case: { min: 0.80, max: 1.08 }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function roundPrice(value) {
    return Math.max(1, Math.round(Number(value) || 0));
}

function readJsonIfExists(targetPath, fallbackValue) {
    if (!fs.existsSync(targetPath)) {
        return fallbackValue;
    }

    try {
        return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    } catch (error) {
        console.warn(`Failed to parse JSON at ${targetPath}: ${error.message}`);
        return fallbackValue;
    }
}

function loadBaselineMapFromFile() {
    const baselinePayload = readJsonIfExists(BASELINE_PATH, {});

    if (baselinePayload && typeof baselinePayload === 'object' && baselinePayload.items && typeof baselinePayload.items === 'object') {
        return baselinePayload.items;
    }

    if (baselinePayload && typeof baselinePayload === 'object') {
        return baselinePayload;
    }

    return {};
}

function loadBaselinesFromLogs() {
    if (!fs.existsSync(LOG_PATH)) {
        console.warn(`Log file not found at ${LOG_PATH}. Continuing without log baselines.`);
        return {};
    }

    const baseline = {};
    const lines = fs
        .readFileSync(LOG_PATH, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    for (const line of lines) {
        let entry;
        try {
            entry = JSON.parse(line);
        } catch {
            continue;
        }

        const updates = Array.isArray(entry?.updates) ? entry.updates : [];
        for (const update of updates) {
            const key = `${update.category}:${update.id}`;
            const oldPrice = roundPrice(update.oldPrice);
            if (!baseline[key] && oldPrice > 0) {
                baseline[key] = oldPrice;
            }
        }
    }

    return baseline;
}

function writeDatabaseEverywhere(db) {
    const serialized = JSON.stringify(db, null, 2);
    const targets = [SOURCE_DATA_PATH, ...MIRROR_DATA_PATHS];

    for (const target of targets) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, serialized, 'utf8');
    }
}

function writeBaselineMap(baselineMap) {
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: 'rebalance-prices',
        items: baselineMap
    };

    fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

function rebalanceDatabase(db, fileBaseline, logBaseline) {
    const mergedBaseline = { ...fileBaseline };
    const stats = {
        totalItems: 0,
        changedItems: 0,
        categories: {}
    };
    const auditTimestamp = new Date().toISOString();

    for (const [category, items] of Object.entries(db)) {
        if (!Array.isArray(items)) {
            continue;
        }

        const bounds = CATEGORY_BOUNDS[category] || CATEGORY_BOUNDS.default;
        let categoryChanged = 0;

        for (const item of items) {
            const currentPrice = roundPrice(item?.price);
            if (currentPrice <= 0) {
                continue;
            }

            const key = `${category}:${item.id}`;
            const fallbackBaseline = roundPrice(item?.basePrice) || currentPrice;
            const baselinePrice = roundPrice(mergedBaseline[key] || logBaseline[key] || fallbackBaseline);
            mergedBaseline[key] = baselinePrice;

            const floorPrice = roundPrice(baselinePrice * bounds.min);
            const capPrice = Math.max(floorPrice, roundPrice(baselinePrice * bounds.max));
            const correctedPrice = clamp(currentPrice, floorPrice, capPrice);

            if (correctedPrice !== currentPrice) {
                item.price = correctedPrice;
                stats.changedItems += 1;
                categoryChanged += 1;
            }

            item.basePrice = baselinePrice;
            item.lastPriceAudit = auditTimestamp;
            stats.totalItems += 1;
        }

        stats.categories[category] = {
            total: items.length,
            changed: categoryChanged
        };
    }

    return { db, mergedBaseline, stats };
}

function main() {
    const db = readJsonIfExists(SOURCE_DATA_PATH, null);
    if (!db) {
        throw new Error(`Unable to load source database at ${SOURCE_DATA_PATH}`);
    }

    const baselineFromFile = loadBaselineMapFromFile();
    const baselineFromLog = loadBaselinesFromLogs();

    const { mergedBaseline, stats } = rebalanceDatabase(db, baselineFromFile, baselineFromLog);

    writeDatabaseEverywhere(db);
    writeBaselineMap(mergedBaseline);

    console.log('Price rebalance complete.');
    console.log(`Total products audited: ${stats.totalItems}`);
    console.log(`Total products adjusted: ${stats.changedItems}`);

    for (const [category, details] of Object.entries(stats.categories)) {
        console.log(
            `${category}: ${details.changed}/${details.total} adjusted`
        );
    }
}

try {
    main();
} catch (error) {
    console.error(`Price rebalance failed: ${error.message}`);
    process.exit(1);
}
