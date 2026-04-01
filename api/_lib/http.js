function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handlePreflight(req, res) {
    if (req.method !== 'OPTIONS') {
        return false;
    }
    setCors(res);
    res.statusCode = 204;
    res.end();
    return true;
}

function sendJson(res, statusCode, payload) {
    setCors(res);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, value) {
    setCors(res);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(String(value || ''));
}

function parseJsonBody(req) {
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

function getBearerToken(req) {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') return '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : '';
}

module.exports = {
    handlePreflight,
    sendJson,
    sendText,
    parseJsonBody,
    getBearerToken
};
