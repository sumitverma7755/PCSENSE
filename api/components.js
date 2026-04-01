const { handlePreflight, sendJson } = require('./_lib/http');
const { getComponentsDb } = require('./_lib/storage');

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'GET') {
        sendJson(res, 405, { success: false, message: 'Method not allowed' });
        return;
    }

    const db = getComponentsDb();
    sendJson(res, 200, db);
};
