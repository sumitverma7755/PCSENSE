const { handlePreflight, sendJson, getBearerToken } = require('./_lib/http');
const { verifyToken } = require('./_lib/auth');
const { getComponentsDb, writeRuntimeArtifacts } = require('./_lib/storage');

let isPriceCheckRunning = false;

const CATEGORY_BOUNDS = {
    default: { min: 0.82, max: 1.12 },
    laptops: { min: 0.85, max: 1.15 },
    cpus: { min: 0.82, max: 1.12 },
    gpus: { min: 0.8, max: 1.15 },
    mobos: { min: 0.85, max: 1.12 },
    ram: { min: 0.8, max: 1.08 },
    storage: { min: 0.75, max: 1.0 },
    psu: { min: 0.85, max: 1.12 },
    case: { min: 0.8, max: 1.08 }
};

const CATEGORY_BIAS = {
    laptops: 1.004,
    cpus: 0.999,
    gpus: 0.992,
    mobos: 1.0,
    ram: 0.992,
    storage: 0.985,
    psu: 1.002,
    case: 1.0
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getSeasonalFactor() {
    const month = new Date().getMonth();
    if (month >= 10) return 1.01;
    if (month <= 1) return 0.99;
    return 1.0;
}

function getBounds(category) {
    return CATEGORY_BOUNDS[category] || CATEGORY_BOUNDS.default;
}

function computeNextPrice(item, category) {
    const currentPrice = Number(item?.price) || 0;
    if (currentPrice <= 0) return 0;

    const basePrice = Number(item?.basePrice) || currentPrice;
    const categoryBias = CATEGORY_BIAS[category] || 1.0;
    const variation = 0.992 + (Math.random() * 0.016);
    const demandFactor = category === 'gpus' || category === 'cpus' || category === 'laptops'
        ? 0.995 + (Math.random() * 0.02)
        : 0.99 + (Math.random() * 0.02);
    const targetPrice = Math.round(basePrice * categoryBias * variation * demandFactor * getSeasonalFactor());

    const bounds = getBounds(category);
    const minBase = Math.max(1, Math.round(basePrice * bounds.min));
    const maxBase = Math.max(minBase, Math.round(basePrice * bounds.max));
    const boundedTarget = clamp(targetPrice, minBase, maxBase);

    const stepMin = Math.round(currentPrice * 0.97);
    const stepMax = Math.round(currentPrice * 1.03);
    const steppedPrice = clamp(boundedTarget, stepMin, stepMax);

    return clamp(steppedPrice, minBase, maxBase);
}

function formatSummary(updates, totalItemsScanned, totalItemsUpdated, generatedAt) {
    const lines = [
        'PCSensei Price Update Summary',
        `Generated: ${generatedAt}`,
        '============================================================',
        '',
        `Scanned Items: ${totalItemsScanned}`,
        `Updated Items: ${totalItemsUpdated}`,
        ''
    ];

    if (!updates.length) {
        lines.push('No pricing changes were required in this run.');
        return lines.join('\n');
    }

    const byCategory = {};
    for (const update of updates) {
        if (!byCategory[update.category]) byCategory[update.category] = [];
        byCategory[update.category].push(update);
    }

    for (const [category, items] of Object.entries(byCategory)) {
        lines.push(category.toUpperCase());
        lines.push('------------------------------------------------------------');

        for (const entry of items) {
            const trend = entry.change >= 0 ? '+' : '-';
            const delta = Math.abs(entry.changePercent).toFixed(2);
            lines.push(
                `${entry.name}: Rs ${entry.oldPrice.toLocaleString('en-IN')} -> Rs ${entry.newPrice.toLocaleString('en-IN')} (${trend}${delta}%)`
            );
        }
        lines.push('');
    }

    const increases = updates.filter((item) => item.change > 0).length;
    const decreases = updates.filter((item) => item.change < 0).length;
    lines.push('Summary Statistics');
    lines.push('------------------------------------------------------------');
    lines.push(`Price Increases: ${increases}`);
    lines.push(`Price Decreases: ${decreases}`);
    lines.push(`No Change: ${Math.max(0, totalItemsScanned - updates.length)}`);

    return lines.join('\n');
}

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'POST') {
        sendJson(res, 405, { success: false, message: 'Method not allowed' });
        return;
    }

    const token = getBearerToken(req);
    const session = verifyToken(token);
    if (!session.ok) {
        sendJson(res, 401, { success: false, message: session.message });
        return;
    }

    if (isPriceCheckRunning) {
        sendJson(res, 409, { success: false, message: 'Price check is already running' });
        return;
    }

    isPriceCheckRunning = true;

    try {
        const db = getComponentsDb();
        const updatedDb = JSON.parse(JSON.stringify(db || {}));
        const updates = [];
        let scanned = 0;

        for (const [category, rawItems] of Object.entries(updatedDb)) {
            if (!Array.isArray(rawItems)) continue;

            for (let index = 0; index < rawItems.length; index += 1) {
                const item = rawItems[index];
                const oldPrice = Number(item?.price) || 0;
                if (oldPrice <= 0) continue;
                scanned += 1;

                const basePrice = Number(item?.basePrice) || oldPrice;
                updatedDb[category][index].basePrice = basePrice;
                const newPrice = computeNextPrice(updatedDb[category][index], category);
                if (newPrice === oldPrice) continue;

                const change = newPrice - oldPrice;
                const changePercent = oldPrice === 0 ? 0 : (change / oldPrice) * 100;
                updatedDb[category][index].price = newPrice;

                updates.push({
                    category,
                    id: item?.id || `${category}-${index}`,
                    name: item?.name || item?.id || `${category}-${index}`,
                    oldPrice,
                    newPrice,
                    change,
                    changePercent
                });
            }
        }

        const generatedAt = new Date().toISOString();
        const summary = formatSummary(updates, scanned, updates.length, generatedAt);
        const persisted = writeRuntimeArtifacts(updatedDb, summary);

        if (!persisted) {
            sendJson(res, 500, {
                success: false,
                message: 'Price check ran, but runtime artifacts could not be written.'
            });
            return;
        }

        sendJson(res, 200, {
            success: true,
            message: updates.length
                ? `Price check completed. Updated ${updates.length} items.`
                : 'Price check completed. No pricing changes were required.',
            generatedAt,
            scannedItems: scanned,
            updatedItems: updates.length
        });
    } catch (error) {
        sendJson(res, 500, {
            success: false,
            message: error?.message || 'Price check failed.'
        });
    } finally {
        isPriceCheckRunning = false;
    }
};
