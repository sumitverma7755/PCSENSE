const { handlePreflight, sendJson, parseJsonBody } = require('../_lib/http');
const {
    SESSION_TIMEOUT_MS,
    isAuthConfigured,
    credentialsMatch,
    issueToken
} = require('../_lib/auth');

module.exports = async function handler(req, res) {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'POST') {
        sendJson(res, 405, { success: false, message: 'Method not allowed' });
        return;
    }

    let body;
    try {
        body = await parseJsonBody(req);
    } catch (error) {
        sendJson(res, 400, { success: false, message: error.message });
        return;
    }

    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');
    if (!username || !password) {
        sendJson(res, 400, { success: false, message: 'Username and password are required' });
        return;
    }

    if (!credentialsMatch(username, password)) {
        const hint = isAuthConfigured()
            ? ''
            : ' Demo mode credentials: admin / admin';
        sendJson(res, 401, { success: false, message: `Invalid credentials.${hint}` });
        return;
    }

    const { token, expiresAt } = issueToken(username);
    sendJson(res, 200, {
        success: true,
        token,
        expiresAt,
        username,
        sessionTimeoutMs: SESSION_TIMEOUT_MS,
        authMode: isAuthConfigured() ? 'env' : 'demo'
    });
};
