const { handlePreflight, sendJson, getBearerToken } = require('./_lib/http');
const { verifyToken } = require('./_lib/auth');

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

    sendJson(res, 501, {
        success: false,
        message: 'Price check execution is not available in Vercel serverless mode. Run backend/price-monitor.js on your backend host.'
    });
};
