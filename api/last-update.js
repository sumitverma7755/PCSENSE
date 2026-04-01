const fs = require('fs');
const { handlePreflight, sendJson } = require('./_lib/http');
const { PATHS, getPriceSummaryText, getGeneratedTimestamp } = require('./_lib/storage');

function readLastModified(targetPath) {
    try {
        if (!fs.existsSync(targetPath)) return '';
        return fs.statSync(targetPath).mtime.toISOString();
    } catch {
        return '';
    }
}

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'GET') {
        sendJson(res, 405, { success: false, message: 'Method not allowed' });
        return;
    }

    const summary = getPriceSummaryText();
    const parsed = getGeneratedTimestamp(summary);
    const fallback =
        readLastModified(PATHS.summary) ||
        readLastModified(PATHS.summaryFallback) ||
        readLastModified(PATHS.components) ||
        readLastModified(PATHS.componentsFallback);

    sendJson(res, 200, {
        success: true,
        lastUpdate: parsed || fallback || 'Not available'
    });
};
