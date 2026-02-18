const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3001;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_BLOCK_MS = 60 * 1000;

const ADMIN_USERNAME = process.env.PCSENSEI_ADMIN_USER || 'sumit';
const ADMIN_PASSWORD = process.env.PCSENSEI_ADMIN_PASSWORD || 'jipaaji';

const PATHS = {
    components: path.join(__dirname, '..', 'shared', 'data', 'components.json'),
    summary: path.join(__dirname, '..', 'shared', 'logs', 'price-summary.txt')
};

const sessions = new Map();
const loginAttempts = new Map();
let isPriceCheckRunning = false;

function setCorsHeaders(req, res) {
    const origin = req.headers.origin;
    const allowOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
        ? origin
        : '*';

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(text);
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1_000_000) {
                reject(new Error('Request body too large'));
            }
        });

        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error('Invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
}

function readFileIfExists(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    return fs.readFileSync(filePath, 'utf8');
}

function createSession(username) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    sessions.set(token, { username, expiresAt });
    return { token, expiresAt };
}

function cleanupSessions() {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (session.expiresAt <= now) {
            sessions.delete(token);
        }
    }
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }

    return req.socket.remoteAddress || 'unknown';
}

function isBlocked(ip) {
    const state = loginAttempts.get(ip);
    if (!state) {
        return false;
    }

    if (Date.now() >= state.blockedUntil) {
        loginAttempts.delete(ip);
        return false;
    }

    return state.blockedUntil > Date.now();
}

function recordFailedAttempt(ip) {
    const now = Date.now();
    const state = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };

    state.count += 1;
    if (state.count >= MAX_LOGIN_ATTEMPTS) {
        state.blockedUntil = now + LOGIN_BLOCK_MS;
        state.count = 0;
    }

    loginAttempts.set(ip, state);
}

function clearFailedAttempts(ip) {
    loginAttempts.delete(ip);
}

function getBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
        return null;
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
}

function requireAuth(req, res) {
    cleanupSessions();
    const token = getBearerToken(req);

    if (!token) {
        sendJson(res, 401, { success: false, message: 'Missing admin token' });
        return null;
    }

    const session = sessions.get(token);
    if (!session) {
        sendJson(res, 401, { success: false, message: 'Invalid or expired session' });
        return null;
    }

    session.expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    sessions.set(token, session);

    return { token, ...session };
}

function timingSafeEqualString(a, b) {
    const aBuffer = crypto.createHash('sha256').update(String(a)).digest();
    const bBuffer = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function getTimestampFromSummary(summaryText) {
    const lines = summaryText.split('\n');
    const generatedLine = lines.find((line) => line.startsWith('Generated:'));
    if (!generatedLine) {
        return null;
    }

    return generatedLine.replace('Generated:', '').trim();
}

async function handleLogin(req, res) {
    const ip = getClientIp(req);

    if (isBlocked(ip)) {
        const state = loginAttempts.get(ip);
        const remainingMs = Math.max(0, state.blockedUntil - Date.now());
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        sendJson(res, 429, {
            success: false,
            message: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`
        });
        return;
    }

    if (!ADMIN_PASSWORD) {
        sendJson(res, 503, {
            success: false,
            message: 'Admin password is not configured. Set PCSENSEI_ADMIN_PASSWORD in the backend environment.'
        });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { success: false, message: error.message });
        return;
    }

    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
        sendJson(res, 400, { success: false, message: 'Username and password are required' });
        return;
    }

    const userOk = timingSafeEqualString(username, ADMIN_USERNAME);
    const passOk = timingSafeEqualString(password, ADMIN_PASSWORD);

    if (!userOk || !passOk) {
        recordFailedAttempt(ip);
        sendJson(res, 401, { success: false, message: 'Invalid credentials' });
        return;
    }

    clearFailedAttempts(ip);
    const { token, expiresAt } = createSession(username);

    sendJson(res, 200, {
        success: true,
        token,
        expiresAt,
        sessionTimeoutMs: SESSION_TIMEOUT_MS,
        username
    });
}

function handleLogout(req, res) {
    const auth = requireAuth(req, res);
    if (!auth) {
        return;
    }

    sessions.delete(auth.token);
    sendJson(res, 200, { success: true, message: 'Logged out' });
}

function handleSessionCheck(req, res) {
    const auth = requireAuth(req, res);
    if (!auth) {
        return;
    }

    sendJson(res, 200, {
        success: true,
        username: auth.username,
        expiresAt: auth.expiresAt
    });
}

function handlePriceCheck(req, res) {
    const auth = requireAuth(req, res);
    if (!auth) {
        return;
    }

    if (isPriceCheckRunning) {
        sendJson(res, 409, { success: false, message: 'Price check is already running' });
        return;
    }

    isPriceCheckRunning = true;

    const priceCheck = spawn('node', ['price-monitor.js', '--once'], {
        cwd: __dirname
    });

    let output = '';
    let errorOutput = '';

    priceCheck.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data.toString());
    });

    priceCheck.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data.toString());
    });

    priceCheck.on('close', (code) => {
        isPriceCheckRunning = false;

        if (code === 0) {
            sendJson(res, 200, {
                success: true,
                message: 'Price check completed successfully',
                output
            });
            return;
        }

        sendJson(res, 500, {
            success: false,
            message: 'Price check failed',
            error: errorOutput
        });
    });
}

function handleLastUpdate(res) {
    const summaryText = readFileIfExists(PATHS.summary);
    if (!summaryText) {
        sendJson(res, 200, { success: false, message: 'No price updates yet' });
        return;
    }

    const timestamp = getTimestampFromSummary(summaryText);
    if (!timestamp) {
        sendJson(res, 200, { success: false, message: 'Summary file found but timestamp is missing' });
        return;
    }

    sendJson(res, 200, { success: true, timestamp });
}

function handlePriceSummary(res) {
    const summaryText = readFileIfExists(PATHS.summary);
    if (!summaryText) {
        sendJson(res, 404, { success: false, message: 'No summary available yet' });
        return;
    }

    sendText(res, 200, summaryText);
}

function handleComponents(res) {
    const contents = readFileIfExists(PATHS.components);
    if (!contents) {
        sendJson(res, 404, { success: false, message: 'Component database not found' });
        return;
    }

    try {
        const parsed = JSON.parse(contents);
        sendJson(res, 200, parsed);
    } catch {
        sendJson(res, 500, { success: false, message: 'Component database is invalid JSON' });
    }
}

const server = http.createServer((req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/health' && req.method === 'GET') {
        sendJson(res, 200, {
            status: 'ok',
            message: 'API server running',
            authConfigured: Boolean(ADMIN_PASSWORD)
        });
        return;
    }

    if (req.url === '/api/admin/login' && req.method === 'POST') {
        handleLogin(req, res);
        return;
    }

    if (req.url === '/api/admin/logout' && req.method === 'POST') {
        handleLogout(req, res);
        return;
    }

    if (req.url === '/api/admin/session' && req.method === 'GET') {
        handleSessionCheck(req, res);
        return;
    }

    if (req.url === '/api/run-price-check' && req.method === 'POST') {
        handlePriceCheck(req, res);
        return;
    }

    if (req.url === '/api/last-update' && req.method === 'GET') {
        handleLastUpdate(res);
        return;
    }

    if (req.url === '/api/price-summary' && req.method === 'GET') {
        handlePriceSummary(res);
        return;
    }

    if (req.url === '/api/components' && req.method === 'GET') {
        handleComponents(res);
        return;
    }

    sendJson(res, 404, { success: false, message: 'Not found' });
});

setInterval(cleanupSessions, 5 * 60 * 1000);

server.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
    console.log('Admin login endpoint: POST /api/admin/login');
    console.log('Price check endpoint (auth): POST /api/run-price-check');
    if (!ADMIN_PASSWORD) {
        console.log('WARNING: PCSENSEI_ADMIN_PASSWORD is not set. Admin login will be disabled.');
    }
});
