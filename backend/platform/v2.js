const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const STORES = [
    ["amazon", "Amazon"],
    ["flipkart", "Flipkart"],
    ["croma", "Croma"],
    ["mdcomputers", "MDComputers"],
    ["vedant", "Vedant Computers"]
];

const ALLOC = {
    gaming: { cpu: 0.22, gpu: 0.42, motherboard: 0.10, ram: 0.10, storage: 0.08, psu: 0.05, case: 0.03 },
    editing: { cpu: 0.30, gpu: 0.30, motherboard: 0.11, ram: 0.12, storage: 0.09, psu: 0.05, case: 0.03 },
    streaming: { cpu: 0.27, gpu: 0.34, motherboard: 0.10, ram: 0.11, storage: 0.09, psu: 0.06, case: 0.03 },
    office: { cpu: 0.28, gpu: 0.22, motherboard: 0.12, ram: 0.12, storage: 0.11, psu: 0.10, case: 0.05 },
    ai: { cpu: 0.22, gpu: 0.46, motherboard: 0.09, ram: 0.11, storage: 0.07, psu: 0.03, case: 0.02 },
    balanced: { cpu: 0.25, gpu: 0.35, motherboard: 0.10, ram: 0.10, storage: 0.10, psu: 0.07, case: 0.03 }
};

const GAMES = [
    { game: "Fortnite", difficulty: 1.00, quality: "High" },
    { game: "GTA V", difficulty: 1.18, quality: "Very High" },
    { game: "Cyberpunk 2077", difficulty: 1.95, quality: "Medium-High" },
    { game: "Valorant", difficulty: 0.80, quality: "High" },
    { game: "Apex Legends", difficulty: 1.28, quality: "High" }
];

const RES_FACTOR = { "1080p": 1.0, "1440p": 0.78, "4k": 0.52 };

const n = (v, f = 0) => {
    const p = Number(v);
    return Number.isFinite(p) ? p : f;
};
const t = (v) => String(v || "").trim().toLowerCase();
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function h(text) {
    let x = 2166136261;
    const s = String(text || "");
    for (let i = 0; i < s.length; i += 1) {
        x ^= s.charCodeAt(i);
        x += (x << 1) + (x << 4) + (x << 7) + (x << 8) + (x << 24);
    }
    return x >>> 0;
}

function watt(text) {
    const m = String(text || "").match(/(\d{2,4})\s*w/i);
    return m ? Number(m[1]) : 0;
}

function gb(text) {
    const s = String(text || "");
    const tb = s.match(/(\d+(?:\.\d+)?)\s*tb/i);
    if (tb) return Math.round(Number(tb[1]) * 1024);
    const g = s.match(/(\d{2,5})\s*gb/i);
    return g ? Number(g[1]) : 0;
}

function purpose(raw) {
    const v = t(raw);
    if (ALLOC[v]) return v;
    if (v.includes("game")) return "gaming";
    if (v.includes("edit") || v.includes("creative")) return "editing";
    if (v.includes("stream")) return "streaming";
    if (v.includes("office") || v.includes("work")) return "office";
    if (v.includes("ai") || v.includes("ml")) return "ai";
    return "balanced";
}

function resolution(raw) {
    const v = t(raw);
    if (v.includes("4k")) return "4k";
    if (v.includes("1440")) return "1440p";
    return "1080p";
}

function tier(gpu) {
    const x = `${t(gpu && gpu.tier)} ${t(gpu && gpu.name)}`;
    if (x.includes("integrated") || x.includes("igpu")) return "integrated";
    if (x.includes("4090") || x.includes("4080") || x.includes("7900")) return "enthusiast";
    if (x.includes("4070") || x.includes("7800") || x.includes("7700")) return "high";
    if (x.includes("4060") || x.includes("7600") || x.includes("6700") || x.includes("3060")) return "mid";
    return "entry";
}

function cpuPerf(cpu) {
    const direct = n(cpu && cpu.score, 0);
    if (direct > 0) return clamp(direct, 0, 100);
    const x = t(cpu && cpu.name);
    if (x.includes("ryzen 9") || x.includes("i9")) return 92;
    if (x.includes("ryzen 7") || x.includes("i7")) return 80;
    if (x.includes("ryzen 5") || x.includes("i5")) return 67;
    if (x.includes("ryzen 3") || x.includes("i3")) return 52;
    if (x.includes("athlon") || x.includes("celeron") || x.includes("pentium")) return 30;
    return 50;
}

function gpuPerf(gpu) {
    const map = { integrated: 22, entry: 40, mid: 58, high: 74, enthusiast: 90 };
    return map[tier(gpu)] || 40;
}

function perf(cat, c) {
    if (cat === "cpu") return cpuPerf(c);
    if (cat === "gpu") return gpuPerf(c);
    if (cat === "motherboard") return 46 + (t(c && c.type).includes("ddr5") ? 12 : 6);
    if (cat === "ram") return clamp(30 + gb(c && c.name) * 1.6 + (t(c && c.type).includes("ddr5") ? 10 : 4), 0, 100);
    if (cat === "storage") return clamp(28 + Math.min(gb(c && c.name) / 25, 55) + (t(c && c.name).includes("nvme") ? 16 : 7), 0, 100);
    if (cat === "psu") return clamp(22 + watt(c && c.name) / 30 + (t(c && c.name).includes("gold") ? 24 : 14), 0, 100);
    return 40;
}

function score(cat, c, target, brands) {
    const price = n(c && c.price, 0);
    const p = perf(cat, c);
    const value = clamp((p / Math.max(price, 1)) * 25000, 0, 100);
    const available = clamp(Object.keys((c && c.shopLinks) || {}).length * 14, 0, 100);
    const b = Array.isArray(brands) && brands.length
        ? brands.some((z) => t(c && c.name).includes(z) || t(c && c.brand).includes(z))
            ? 100 : 62
        : 100;
    const fit = target > 0 ? clamp(100 - (Math.abs(price - target) / target) * 120, 0, 100) : 70;
    return p * 0.35 + value * 0.25 + available * 0.10 + b * 0.15 + fit * 0.15;
}

function best(list, cat, budget, brands, filterFn) {
    const valid = (Array.isArray(list) ? list : []).filter((x) => x && n(x.price, -1) >= 0 && (!filterFn || filterFn(x)));
    if (!valid.length) return null;
    const within = valid.filter((x) => n(x.price, 1e15) <= budget);
    const candidates = within.length ? within : valid;
    let out = candidates[0];
    let s = -1;
    for (const c of candidates) {
        const v = score(cat, c, budget, brands);
        if (v > s) { s = v; out = c; }
    }
    return out;
}

function payload(c) {
    if (!c) return null;
    return {
        id: c.id,
        name: c.name,
        price: n(c.price, 0),
        brand: c.brand || null,
        spec: c.spec || null,
        socket: c.socket || null,
        type: c.type || null,
        tdp: c.tdp || null,
        buyLink: c.buyLink || null,
        shopLinks: c.shopLinks || {}
    };
}

function requiredPsu(cpu, gpu) {
    return Math.ceil((Math.max(watt(cpu && cpu.tdp), 65) + Math.max(watt(gpu && gpu.tdp), 120) + 100) * 1.2);
}

function compat(build) {
    const errors = [];
    const warnings = [];
    const checks = [];
    const cpu = build.cpu; const gpu = build.gpu; const m = build.motherboard; const r = build.ram; const p = build.psu; const c = build.case;
    if (cpu && m) {
        const ok = !t(cpu.socket) || !t(m.socket) || t(cpu.socket) === t(m.socket);
        checks.push({ rule: "cpu_motherboard_socket", ok, message: ok ? "CPU + motherboard socket match." : "Socket mismatch." });
        if (!ok) errors.push("CPU and motherboard sockets do not match.");
    }
    if (r && m) {
        const rt = t(r.type || r.name).includes("ddr5") ? "ddr5" : "ddr4";
        const mt = t(m.type || m.name).includes("ddr5") ? "ddr5" : "ddr4";
        const ok = rt === mt;
        checks.push({ rule: "ram_motherboard_type", ok, message: ok ? "RAM type matches motherboard." : "RAM type mismatch." });
        if (!ok) errors.push("RAM type does not match motherboard.");
    }
    const need = requiredPsu(cpu, gpu);
    const pw = watt(p && p.name);
    if (p) {
        const ok = pw >= need;
        checks.push({ rule: "psu_wattage", ok, message: `PSU ${pw || "Unknown"}W, required ${need}W` });
        if (!ok) errors.push(`PSU is too weak. Need at least ${need}W.`);
        if (ok && pw < need + 80) warnings.push("PSU headroom is tight for future upgrades.");
    }
    if (gpu && c) {
        const compact = t(c.name).includes("mini") || t(c.name).includes("itx") || t(c.name).includes("micro");
        const big = tier(gpu) === "high" || tier(gpu) === "enthusiast";
        if (compact && big) warnings.push("Potential GPU clearance issue in compact case.");
        checks.push({ rule: "gpu_clearance", ok: !(compact && big), message: compact && big ? "Case may be tight for GPU." : "Case/GPU fit looks fine." });
    }
    return { isCompatible: !errors.length, errors, warnings, checks, requiredPsuWattage: need };
}

function buildScore(build) {
    return clamp(Math.round(gpuPerf(build.gpu) * 0.62 + cpuPerf(build.cpu) * 0.33 + clamp(gb(build.ram && build.ram.name) / 4, 0, 8)), 0, 100);
}

function fps(build, res, p) {
    const bonus = p === "gaming" ? 1.08 : 1.0;
    const factor = RES_FACTOR[res] || 1.0;
    const base = buildScore(build);
    return GAMES.map((g) => ({ game: g.game, fps: Math.max(22, Math.round((base * 2.1 * factor * bonus) / g.difficulty)), quality: g.quality, resolution: res }));
}

function link(comp, store) {
    const x = (comp && comp.shopLinks) || {};
    if (x[store]) return x[store];
    const q = encodeURIComponent((comp && comp.name) || "pc component");
    if (store === "amazon") return `https://www.amazon.in/s?k=${q}`;
    if (store === "flipkart") return `https://www.flipkart.com/search?q=${q}`;
    if (store === "croma") return `https://www.croma.com/search?q=${q}`;
    if (store === "mdcomputers") return `https://mdcomputers.in/index.php?route=product/search&search=${q}`;
    if (store === "vedant") return `https://www.vedantcomputers.com/index.php?route=product/search&search=${q}`;
    return `https://www.google.com/search?q=${q}`;
}

function offers(comp) {
    const base = n(comp && comp.price, 0);
    return STORES.map(([id, name]) => {
        const d = ((h(`${comp.id}:${id}`) % 1101) - 550) / 10000;
        const trend = ((h(`trend:${comp.id}:${id}`) % 1401) - 700) / 100;
        return { storeId: id, storeName: name, price: Math.max(0, Math.round(base * (1 + d))), trend7dPercent: Number(trend.toFixed(2)), buyUrl: link(comp, id), isEstimate: true };
    }).sort((a, b) => a.price - b.price);
}

function categoryKey(x) {
    const v = t(x);
    if (v === "cpu" || v === "cpus") return "cpus";
    if (v === "gpu" || v === "gpus") return "gpus";
    if (v === "motherboard" || v === "mobo" || v === "mobos") return "mobos";
    if (v === "ram") return "ram";
    if (v === "storage" || v === "ssd") return "storage";
    if (v === "psu" || v === "power") return "psu";
    if (v === "case" || v === "chassis") return "case";
    if (v === "laptop" || v === "laptops") return "laptops";
    return null;
}

function createV2Api({ PATHS, sendJson, parseBody, requireAuth }) {
    const state = { data: null, dataAt: 0, rl: new Map(), cache: new Map() };
    const ttl = n(process.env.PCSENSEI_CACHE_TTL_MS, 30000);
    const rlWindow = n(process.env.PCSENSEI_RATE_LIMIT_WINDOW_MS, 60000);
    const rlMax = n(process.env.PCSENSEI_RATE_LIMIT_MAX, 120);

    const load = () => {
        if (state.data && Date.now() - state.dataAt < ttl) return state.data;
        state.data = JSON.parse(fs.readFileSync(PATHS.components, "utf8"));
        state.dataAt = Date.now();
        return state.data;
    };

    const recommend = (input) => {
        const data = load();
        const b = clamp(Math.round(n(input.budget, 80000)), 15000, 5000000);
        const p = purpose(input.purpose || input.useCase || input.performanceGoal);
        const r = resolution(input.resolution || input.resolutionTarget);
        const brands = input.preferredBrands || {};
        const alloc = ALLOC[p] || ALLOC.balanced;
        const target = Object.fromEntries(Object.entries(alloc).map(([k, v]) => [k, Math.round(v * b)]));

        const cpu = best(data.cpus, "cpu", target.cpu, [].concat(brands.cpu || []).map(t));
        const gpuPool = (Array.isArray(data.gpus) ? data.gpus : []).filter((g) => !(p === "office" && b < 50000) || tier(g) === "integrated" || n(g.price, 0) <= target.gpu * 0.6);
        const gpu = best(gpuPool.length ? gpuPool : data.gpus, "gpu", target.gpu, [].concat(brands.gpu || []).map(t));
        const mobo = best(data.mobos, "motherboard", target.motherboard, [].concat(brands.motherboard || brands.mobo || []).map(t), (x) => !cpu || !cpu.socket || !x.socket || t(cpu.socket) === t(x.socket))
            || best(data.mobos, "motherboard", target.motherboard, [].concat(brands.motherboard || brands.mobo || []).map(t));
        const ram = best(data.ram, "ram", target.ram, [].concat(brands.ram || []).map(t), (x) => !mobo || (t(x.type || x.name).includes("ddr5") ? "ddr5" : "ddr4") === (t(mobo.type || mobo.name).includes("ddr5") ? "ddr5" : "ddr4"))
            || best(data.ram, "ram", target.ram, [].concat(brands.ram || []).map(t));
        const storage = best(data.storage, "storage", target.storage, [].concat(brands.storage || []).map(t));
        const need = requiredPsu(cpu, gpu);
        const psu = best(data.psu, "psu", target.psu, [].concat(brands.psu || []).map(t), (x) => watt(x && x.name) >= need)
            || best(data.psu, "psu", target.psu, [].concat(brands.psu || []).map(t));
        const casePart = best(data.case, "case", target.case, [].concat(brands.case || []).map(t));
        const cooling = need >= 450 || b >= 180000 || p === "ai"
            ? { name: "360mm AIO Liquid Cooler", type: "liquid", rationale: "Recommended for sustained heavy workloads." }
            : { name: "Dual Tower Air Cooler", type: "air", rationale: "Balanced thermals and acoustics." };

        const build = { cpu: payload(cpu), gpu: payload(gpu), motherboard: payload(mobo), ram: payload(ram), storage: payload(storage), psu: payload(psu), case: payload(casePart), cooling };
        const c = compat(build);
        const pc = [
            ["cpu", build.cpu], ["gpu", build.gpu], ["motherboard", build.motherboard],
            ["ram", build.ram], ["storage", build.storage], ["psu", build.psu], ["case", build.case]
        ].filter(([, x]) => x).map(([k, x]) => ({ category: k, componentId: x.id, componentName: x.name, offers: offers(x) }));
        const total = [build.cpu, build.gpu, build.motherboard, build.ram, build.storage, build.psu, build.case].reduce((sum, x) => sum + n(x && x.price, 0), 0);
        const upgrades = [];
        if (tier(build.gpu) === "integrated" || tier(build.gpu) === "entry") upgrades.push("Upgrade GPU first for the highest FPS gain.");
        if (gb(build.ram && build.ram.name) < 16) upgrades.push("Move to at least 16GB RAM.");
        if (gb(build.storage && build.storage.name) < 1000) upgrades.push("Add a 1TB NVMe SSD.");
        if (!c.isCompatible) upgrades.push("Fix compatibility issues before purchase.");
        if (!upgrades.length) upgrades.push("Build is balanced. Next upgrade should target GPU tier.");

        return {
            input: { budget: b, purpose: p, resolution: r, preferredBrands: brands, performanceGoal: input.performanceGoal || "balanced" },
            build,
            compatibility: c,
            performanceScore: buildScore(build),
            fpsPredictions: fps(build, r, p),
            upgradePath: upgrades,
            priceComparison: pc,
            meta: { totalPrice: total, budget: b, withinBudget: total <= b, requiredPsuWattage: need, generatedAt: new Date().toISOString() }
        };
    };

    const ip = (req) => (typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0].trim() : (req.socket && req.socket.remoteAddress) || "unknown");
    const allow = (req) => {
        const key = ip(req); const now = Date.now();
        const r = state.rl.get(key) || { count: 0, reset: now + rlWindow };
        if (now > r.reset) { r.count = 0; r.reset = now + rlWindow; }
        r.count += 1; state.rl.set(key, r);
        return r.count <= rlMax ? null : Math.ceil((r.reset - now) / 1000);
    };
    const cached = (k) => {
        const v = state.cache.get(k);
        if (!v || v.expires < Date.now()) { state.cache.delete(k); return null; }
        return v.payload;
    };
    const setCache = (k, payload) => state.cache.set(k, { payload, expires: Date.now() + ttl });

    function handle(req, res) {
        let url;
        try { url = new URL(req.url, "http://localhost"); } catch { return false; }
        if (!url.pathname.startsWith("/api/v2/")) return false;
        const retry = allow(req);
        if (retry !== null) { sendJson(res, 429, { success: false, message: "Too many requests.", retryAfterSec: retry }); return true; }

        if (url.pathname === "/api/v2/health" && req.method === "GET") {
            sendJson(res, 200, { status: "ok", service: "PCSensei v2 platform API", features: ["ai_builder", "compatibility_checker", "fps_prediction", "price_comparison", "featured_builds", "admin_upsert"], uptimeSec: Math.round(process.uptime()) });
            return true;
        }

        if (url.pathname === "/api/v2/build" && req.method === "POST") { parseBody(req).then((b) => sendJson(res, 200, { success: true, ...recommend(b || {}) })).catch((e) => sendJson(res, 400, { success: false, message: e.message || "Invalid request body" })); return true; }
        if (url.pathname === "/api/v2/compatibility" && req.method === "POST") { parseBody(req).then((b) => (b && b.build) ? sendJson(res, 200, { success: true, compatibility: compat(b.build) }) : sendJson(res, 200, { success: true, compatibility: recommend(b || {}).compatibility })).catch((e) => sendJson(res, 400, { success: false, message: e.message || "Invalid request body" })); return true; }
        if (url.pathname === "/api/v2/fps" && req.method === "POST") { parseBody(req).then((b) => { const r = recommend(b || {}); sendJson(res, 200, { success: true, fpsPredictions: r.fpsPredictions, performanceScore: r.performanceScore, meta: r.meta }); }).catch((e) => sendJson(res, 400, { success: false, message: e.message || "Invalid request body" })); return true; }

        if (url.pathname === "/api/v2/featured-builds" && req.method === "GET") {
            const key = `${req.method}:${url.pathname}:${url.search}`; const hit = cached(key); if (hit) { sendJson(res, 200, { success: true, cached: true, ...hit }); return true; }
            const featured = [
                { tier: "Starter", budget: 50000, purpose: "gaming", resolution: "1080p" },
                { tier: "Creator", budget: 100000, purpose: "editing", resolution: "1440p" },
                { tier: "Enthusiast", budget: 180000, purpose: "ai", resolution: "4k" }
            ].map((x) => { const r = recommend(x); return { ...x, performanceScore: r.performanceScore, totalPrice: r.meta.totalPrice, withinBudget: r.meta.withinBudget, keyParts: { cpu: r.build.cpu && r.build.cpu.name, gpu: r.build.gpu && r.build.gpu.name, ram: r.build.ram && r.build.ram.name, storage: r.build.storage && r.build.storage.name } }; });
            const out = { featuredBuilds: featured }; setCache(key, out); sendJson(res, 200, { success: true, ...out }); return true;
        }

        if (url.pathname === "/api/v2/prices" && req.method === "GET") {
            const key = `${req.method}:${url.pathname}:${url.search}`; const hit = cached(key); if (hit) { sendJson(res, 200, { success: true, cached: true, ...hit }); return true; }
            const cat = categoryKey(url.searchParams.get("category")); const id = t(url.searchParams.get("id")); const d = load();
            if (cat && id && Array.isArray(d[cat])) {
                const comp = d[cat].find((x) => t(x.id) === id);
                if (!comp) { sendJson(res, 404, { success: false, message: "Component not found." }); return true; }
                const out = { category: cat, componentId: id, componentName: comp.name, offers: offers(comp) }; setCache(key, out); sendJson(res, 200, { success: true, ...out }); return true;
            }
            const r = recommend({ budget: n(url.searchParams.get("budget"), 90000), purpose: url.searchParams.get("purpose") || "gaming", resolution: url.searchParams.get("resolution") || "1440p" });
            const out = { note: "Pass category and id for a specific component.", priceComparison: r.priceComparison }; setCache(key, out); sendJson(res, 200, { success: true, ...out }); return true;
        }

        if (url.pathname === "/api/v2/admin/summary" && req.method === "GET") {
            const auth = requireAuth(req, res); if (!auth) return true;
            const d = load(); const counts = Object.fromEntries(Object.keys(d).map((k) => [k, Array.isArray(d[k]) ? d[k].length : 0]));
            sendJson(res, 200, { success: true, admin: auth.username, counts, generatedAt: new Date().toISOString() }); return true;
        }

        if (url.pathname === "/api/v2/admin/components/upsert" && req.method === "POST") {
            const auth = requireAuth(req, res); if (!auth) return true;
            parseBody(req).then((body) => {
                const cat = categoryKey(body && body.category); const comp = body && body.component;
                if (!cat) { sendJson(res, 400, { success: false, message: "Invalid category." }); return; }
                if (!comp || typeof comp !== "object" || !comp.name || n(comp.price, -1) < 0) { sendJson(res, 400, { success: false, message: "component with name and non-negative price is required." }); return; }
                const d = load(); if (!Array.isArray(d[cat])) d[cat] = [];
                const id = comp.id ? String(comp.id) : `${cat[0]}${Date.now()}`;
                const merged = { ...comp, id, price: n(comp.price, 0), shopLinks: comp.shopLinks && typeof comp.shopLinks === "object" ? comp.shopLinks : {} };
                const idx = d[cat].findIndex((x) => t(x.id) === t(id));
                if (idx >= 0) d[cat][idx] = merged; else d[cat].push(merged);
                const txt = JSON.stringify(d, null, 2);
                const root = path.resolve(PATHS.components, "..", "..", "..");
                for (const p of [PATHS.components, path.join(root, "data", "components.json"), path.join(root, "frontend", "data", "components.json")]) {
                    fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, txt, "utf8");
                }
                state.data = null; state.dataAt = 0;
                sendJson(res, 200, { success: true, message: "Component upserted.", category: cat, id, count: d[cat].length });
            }).catch((e) => sendJson(res, 400, { success: false, message: e.message || "Invalid request body" }));
            return true;
        }

        sendJson(res, 404, { success: false, message: "v2 endpoint not found" });
        return true;
    }

    return { handleRequest: handle };
}

module.exports = { createV2Api };

