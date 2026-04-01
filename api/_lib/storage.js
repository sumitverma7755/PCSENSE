const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const PATHS = {
    components: path.join(ROOT_DIR, 'shared', 'data', 'components.json'),
    componentsFallback: path.join(ROOT_DIR, 'data', 'components.json'),
    summary: path.join(ROOT_DIR, 'shared', 'logs', 'price-summary.txt'),
    summaryFallback: path.join(ROOT_DIR, 'logs', 'price-summary.txt')
};

function readTextIfExists(targetPath) {
    try {
        if (!fs.existsSync(targetPath)) {
            return '';
        }
        return fs.readFileSync(targetPath, 'utf8');
    } catch {
        return '';
    }
}

function readJsonIfExists(targetPath) {
    try {
        if (!fs.existsSync(targetPath)) {
            return null;
        }
        const raw = fs.readFileSync(targetPath, 'utf8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getComponentsDb() {
    return readJsonIfExists(PATHS.components) || readJsonIfExists(PATHS.componentsFallback) || {};
}

function getPriceSummaryText() {
    return readTextIfExists(PATHS.summary) || readTextIfExists(PATHS.summaryFallback);
}

function getGeneratedTimestamp(summaryText) {
    const lines = String(summaryText || '').split(/\r?\n/);
    const generatedLine = lines.find((line) => line.startsWith('Generated:'));
    if (!generatedLine) return '';
    return generatedLine.replace('Generated:', '').trim();
}

function formatSnapshotSummary(db) {
    const now = new Date().toISOString();
    const categories = Object.entries(db).filter(([, value]) => Array.isArray(value));
    const total = categories.reduce((sum, [, items]) => sum + items.length, 0);

    const lines = [
        'PCSensei Price Update Summary',
        `Generated: ${now}`,
        '============================================================',
        '',
        `Dataset snapshot total items: ${total}`,
        ''
    ];

    for (const [category, items] of categories) {
        const prices = items
            .map((item) => Number(item?.price) || 0)
            .filter((price) => price > 0);

        if (!prices.length) {
            lines.push(`${category.toUpperCase()}: no priced entries`);
            continue;
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length);
        lines.push(`${category.toUpperCase()}: count=${items.length}, min=${min}, avg=${avg}, max=${max}`);
    }

    return lines.join('\n');
}

module.exports = {
    PATHS,
    getComponentsDb,
    getPriceSummaryText,
    getGeneratedTimestamp,
    formatSnapshotSummary
};
