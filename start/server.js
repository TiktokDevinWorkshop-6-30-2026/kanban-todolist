const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    if (typeof process.loadEnvFile === 'function') {
        try { process.loadEnvFile(envPath); return; } catch (e) { /* fall through */ }
    }
    for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (key && process.env[key] === undefined) process.env[key] = val;
    }
}
loadEnvFile();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.DEVIN_API_KEY || '';
const ORG_ID = process.env.DEVIN_ORG_ID || '';
const USER_EMAIL = process.env.DEVIN_USER_EMAIL || '';
const DEVIN_HOST = 'api.devin.ai';
const ROOT = __dirname;

function devinEnabled() {
    return Boolean(API_KEY && ORG_ID && USER_EMAIL);
}

let cachedUserId = null;

function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
}

function devinRequest(method, apiPath, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            host: DEVIN_HOST,
            path: apiPath,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            }
        };
        if (data) {
            opts.headers['Content-Type'] = 'application/json';
            opts.headers['Content-Length'] = Buffer.byteLength(data);
        }
        const req = https.request(opts, (res) => {
            let chunks = '';
            res.on('data', (c) => { chunks += c; });
            res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function getUserId() {
    if (cachedUserId) return cachedUserId;
    const apiPath = `/v3beta1/organizations/${encodeURIComponent(ORG_ID)}/members/users?email=${encodeURIComponent(USER_EMAIL)}`;
    const r = await devinRequest('GET', apiPath);
    if (r.status !== 200) throw new Error(`Could not look up user for ${USER_EMAIL} (${r.status})`);
    const data = safeParse(r.body);
    const items = (data && Array.isArray(data.items)) ? data.items : [];
    const match = items.find(u => u.email && u.email.toLowerCase() === USER_EMAIL.toLowerCase()) || items[0];
    if (!match || !match.user_id) throw new Error(`No Devin user found for email ${USER_EMAIL}`);
    cachedUserId = match.user_id;
    return cachedUserId;
}

function sendJson(res, status, obj) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
}

function readJsonBody(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', (c) => {
            data += c;
            if (data.length > 1e6) req.destroy();
        });
        req.on('end', () => resolve(data ? safeParse(data) : {}));
    });
}

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(ROOT, path.normalize(urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(content);
    });
}

async function handleApi(req, res, url) {
    if (req.method === 'GET' && url === '/api/devin/config') {
        return sendJson(res, 200, { enabled: devinEnabled() });
    }

    if (!devinEnabled()) {
        return sendJson(res, 503, {
            error: 'Devin is not configured. Set DEVIN_API_KEY, DEVIN_ORG_ID and DEVIN_USER_EMAIL to enable sessions.'
        });
    }
    try {
        if (req.method === 'POST' && url === '/api/devin/sessions') {
            const payload = await readJsonBody(req);
            if (!payload || !payload.prompt || !String(payload.prompt).trim()) {
                return sendJson(res, 400, { error: 'prompt is required' });
            }
            const userId = await getUserId();
            const createBody = { prompt: String(payload.prompt), create_as_user_id: userId };
            if (payload.title) createBody.title = String(payload.title);
            createBody.tags = ['daily-task-tracker'];
            const r = await devinRequest('POST', `/v3/organizations/${ORG_ID}/sessions`, createBody);
            const parsed = safeParse(r.body);
            if (r.status < 200 || r.status >= 300) {
                return sendJson(res, r.status, { error: (parsed && parsed.detail) || 'Devin API error', detail: parsed });
            }
            return sendJson(res, 200, { session_id: parsed.session_id, url: parsed.url, status: parsed.status });
        }

        const m = url.match(/^\/api\/devin\/sessions\/([^/]+)$/);
        if (req.method === 'GET' && m) {
            const sid = decodeURIComponent(m[1]);
            const r = await devinRequest('GET', `/v3/organizations/${ORG_ID}/sessions/${encodeURIComponent(sid)}`);
            const parsed = safeParse(r.body);
            if (r.status < 200 || r.status >= 300) {
                return sendJson(res, r.status, { error: (parsed && parsed.detail) || 'Devin API error' });
            }
            return sendJson(res, 200, {
                session_id: parsed.session_id,
                url: parsed.url,
                status: parsed.status,
                status_detail: parsed.status_detail,
                structured_output: parsed.structured_output
            });
        }

        return sendJson(res, 404, { error: 'Unknown API route' });
    } catch (e) {
        return sendJson(res, 502, { error: 'Proxy error: ' + e.message });
    }
}

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (url.startsWith('/api/devin/')) {
        handleApi(req, res, url);
        return;
    }
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`Daily Task Tracker running at http://localhost:${PORT}`);
    if (devinEnabled()) {
        console.log(`Devin sessions enabled — org ${ORG_ID}, attributed to ${USER_EMAIL}.`);
    } else {
        const missing = [
            !API_KEY && 'DEVIN_API_KEY',
            !ORG_ID && 'DEVIN_ORG_ID',
            !USER_EMAIL && 'DEVIN_USER_EMAIL'
        ].filter(Boolean).join(', ');
        console.warn(`WARNING: Devin disabled (missing: ${missing}) — the "Run with Devin" UI will be hidden and /api/devin/* returns 503.`);
    }
});
