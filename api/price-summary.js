const { handlePreflight, sendText } = require('./_lib/http');
const { getComponentsDb, getPriceSummaryText, formatSnapshotSummary } = require('./_lib/storage');

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'GET') {
        sendText(res, 405, 'Method not allowed');
        return;
    }

    const summary = getPriceSummaryText();
    if (summary) {
        sendText(res, 200, summary);
        return;
    }

    const db = getComponentsDb();
    sendText(res, 200, formatSnapshotSummary(db));
};
