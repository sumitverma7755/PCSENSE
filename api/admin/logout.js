const { handlePreflight, sendJson } = require('../_lib/http');

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'POST') {
        sendJson(res, 405, { success: false, message: 'Method not allowed' });
        return;
    }

    sendJson(res, 200, { success: true, message: 'Logged out' });
};
