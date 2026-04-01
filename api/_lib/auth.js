const crypto = require('crypto');

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function getSecret() {
    return (
        process.env.PCSENSEI_ADMIN_SECRET ||
        process.env.PCSENSEI_ADMIN_PASSWORD ||
        process.env.VERCEL_URL ||
        'pcsensei-fallback-secret'
    );
}

function sign(value) {
    return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

function encode(payload) {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decode(tokenPart) {
    try {
        const raw = Buffer.from(tokenPart, 'base64url').toString('utf8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function isAuthConfigured() {
    const user = process.env.PCSENSEI_ADMIN_USER;
    const pass = process.env.PCSENSEI_ADMIN_PASSWORD;
    return Boolean(user && user.trim() && pass && pass.trim());
}

function credentialsMatch(username, password) {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '');

    if (isAuthConfigured()) {
        return (
            cleanUser === String(process.env.PCSENSEI_ADMIN_USER).trim() &&
            cleanPass === String(process.env.PCSENSEI_ADMIN_PASSWORD)
        );
    }

    // Demo mode fallback for deployments without admin env vars.
    return cleanUser === 'admin' && cleanPass === 'admin';
}

function issueToken(username) {
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    const payload = {
        username: String(username || 'admin'),
        expiresAt
    };
    const body = encode(payload);
    const signature = sign(body);
    return {
        token: `${body}.${signature}`,
        expiresAt
    };
}

function verifyToken(token) {
    const raw = String(token || '');
    const parts = raw.split('.');
    if (parts.length !== 2) {
        return { ok: false, message: 'Missing or malformed token' };
    }

    const [body, signature] = parts;
    if (sign(body) !== signature) {
        return { ok: false, message: 'Invalid token signature' };
    }

    const payload = decode(body);
    if (!payload || typeof payload !== 'object') {
        return { ok: false, message: 'Invalid token payload' };
    }

    const expiresAt = Number(payload.expiresAt) || 0;
    if (!expiresAt || Date.now() > expiresAt) {
        return { ok: false, message: 'Session expired' };
    }

    return {
        ok: true,
        username: String(payload.username || 'admin'),
        expiresAt
    };
}

module.exports = {
    SESSION_TIMEOUT_MS,
    isAuthConfigured,
    credentialsMatch,
    issueToken,
    verifyToken
};
