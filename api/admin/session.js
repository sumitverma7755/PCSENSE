const { handlePreflight, sendJson, getBearerToken } = require('../_lib/http');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'GET') {
        sendJson(res, 405, { success: false, message: 'Method not allowed' });
        return;
    }

    const token = getBearerToken(req);
    const session = verifyToken(token);
    if (!session.ok) {
        sendJson(res, 401, { success: false, message: session.message });
        return;
    }

    sendJson(res, 200, {
        success: true,
        username: session.username,
        expiresAt: session.expiresAt
    });
};
