import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const TOKEN_KEY = 'pcsenseiAdminToken';
const API_BASE_KEY = 'pcsenseiApiBaseUrl';

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getDefaultApiBase() {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  return window.location.origin;
}

function getInitialApiBase() {
  const saved = normalizeBaseUrl(window.localStorage.getItem(API_BASE_KEY));
  return saved || getDefaultApiBase();
}

async function readTextSafe(response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export default function AdminPage({ onGoHome }) {
  const [apiBaseInput, setApiBaseInput] = useState(getInitialApiBase);
  const [apiBase, setApiBase] = useState(getInitialApiBase);
  const [token, setToken] = useState(() => window.sessionStorage.getItem(TOKEN_KEY) || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authUser, setAuthUser] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [alert, setAlert] = useState('');
  const [healthStatus, setHealthStatus] = useState('Unknown');
  const [componentCount, setComponentCount] = useState(0);
  const [catalogBreakdown, setCatalogBreakdown] = useState([]);
  const [lastUpdateText, setLastUpdateText] = useState('Not available');
  const [priceSummary, setPriceSummary] = useState('No summary loaded.');

  useEffect(() => {
    window.localStorage.setItem(API_BASE_KEY, apiBase);
  }, [apiBase]);

  useEffect(() => {
    if (!token) {
      setAuthUser('');
      return;
    }

    const controller = new AbortController();
    const verifySession = async () => {
      try {
        const response = await fetch(`${apiBase}/api/admin/session`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const payload = await response.json();
        setAuthUser(payload?.username || 'admin');
      } catch {
        window.sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
        setAuthUser('');
      }
    };

    void verifySession();
    return () => controller.abort();
  }, [apiBase, token]);

  useEffect(() => {
    const controller = new AbortController();
    const loadAdminData = async () => {
      try {
        const [healthRes, componentsRes, summaryRes, updateRes] = await Promise.allSettled([
          fetch(`${apiBase}/api/health`, { signal: controller.signal }),
          fetch(`${apiBase}/api/components`, { signal: controller.signal }),
          fetch(`${apiBase}/api/price-summary`, { signal: controller.signal }),
          fetch(`${apiBase}/api/last-update`, { signal: controller.signal })
        ]);

        if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
          setHealthStatus('Online');
        } else {
          setHealthStatus('Offline');
        }

        if (componentsRes.status === 'fulfilled' && componentsRes.value.ok) {
          const data = await componentsRes.value.json();
          const categoryEntries = Object.entries(data || {}).filter(([, value]) => Array.isArray(value));
          const counts = categoryEntries.map(([key, items]) => ({ key, count: items.length }));
          setCatalogBreakdown(counts);
          setComponentCount(counts.reduce((sum, item) => sum + item.count, 0));
        } else {
          setCatalogBreakdown([]);
          setComponentCount(0);
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
          const summaryText = await summaryRes.value.text();
          setPriceSummary(summaryText || 'Price summary is empty.');
        } else {
          setPriceSummary('Unable to fetch price summary.');
        }

        if (updateRes.status === 'fulfilled' && updateRes.value.ok) {
          const payload = await updateRes.value.json();
          const value = payload?.lastUpdate || payload?.timestamp || payload?.message || 'Not available';
          setLastUpdateText(String(value));
        } else {
          setLastUpdateText('Not available');
        }
      } catch {
        setHealthStatus('Offline');
      }
    };

    void loadAdminData();
    return () => controller.abort();
  }, [apiBase, token]);

  const statusTone = healthStatus === 'Online' ? 'text-emerald-200' : 'text-amber-200';

  const previewSummary = useMemo(() => {
    const lines = String(priceSummary || '').split(/\r?\n/).filter(Boolean);
    return lines.slice(0, 14).join('\n');
  }, [priceSummary]);

  const saveApiBase = () => {
    const normalized = normalizeBaseUrl(apiBaseInput);
    if (!normalized) {
      setAlert('Enter a valid API base URL.');
      return;
    }
    setApiBase(normalized);
    setAlert(`API base updated to ${normalized}`);
  };

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setAlert('Username and password are required.');
      return;
    }

    setIsBusy(true);
    setAlert('');
    try {
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      if (!response.ok) {
        const body = await readTextSafe(response);
        throw new Error(body || 'Login failed');
      }

      const payload = await response.json();
      const nextToken = payload?.token || '';
      if (!nextToken) {
        throw new Error('Missing auth token in response.');
      }

      window.sessionStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
      setAuthUser(payload?.username || username.trim());
      setPassword('');
      setAlert('Admin login successful.');
    } catch (error) {
      setAlert(error?.message || 'Login failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const logout = async () => {
    if (!token) return;

    try {
      await fetch(`${apiBase}/api/admin/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch {
      // ignore logout request errors
    }

    window.sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setAuthUser('');
    setAlert('Logged out.');
  };

  const runPriceCheck = async () => {
    if (!token) {
      setAlert('Login required to run a price check.');
      return;
    }

    setIsBusy(true);
    setAlert('');
    try {
      const response = await fetch(`${apiBase}/api/run-price-check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const text = await readTextSafe(response);
        throw new Error(text || 'Price check failed');
      }

      const payload = await response.json();
      setAlert(payload?.message ? `Price check: ${payload.message}` : 'Price check started successfully.');
    } catch (error) {
      setAlert(error?.message || 'Price check failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 sm:py-10">
      <div className="wizard-grid-bg pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-500/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-14 h-72 w-72 rounded-full bg-violet-500/16 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="panel-shell flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="section-tag mb-2">Admin Console</p>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Operations & Price Monitoring</h1>
            <p className="mt-1 text-sm subtle-copy">Manage catalog health, authenticate admins, and trigger price checks.</p>
          </div>
          <button
            type="button"
            onClick={onGoHome}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Back To Home
          </button>
        </header>

        <section className="panel-shell grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Backend API Base URL</label>
            <input
              value={apiBaseInput}
              onChange={(event) => setApiBaseInput(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-300/45"
              placeholder="http://localhost:3001"
            />
          </div>
          <button
            type="button"
            onClick={saveApiBase}
            className="rounded-xl border border-blue-300/40 btn-gradient px-5 py-3 text-sm font-semibold text-white btn-glow"
          >
            Save Endpoint
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Backend Health</p>
            <p className={`mt-2 text-2xl font-bold ${statusTone}`}>{healthStatus}</p>
          </div>
          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Catalog Items</p>
            <p className="mt-2 text-2xl font-bold text-white">{componentCount}</p>
          </div>
          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Last Price Update</p>
            <p className="mt-2 text-sm font-semibold text-slate-200">{lastUpdateText}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin Authentication</p>

            {!token ? (
              <div className="mt-4 space-y-3">
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-300/45"
                  placeholder="Admin username"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-300/45"
                  placeholder="Admin password"
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={login}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-white transition-colors ${
                    isBusy
                      ? 'cursor-not-allowed border-white/12 bg-slate-800/70 text-slate-400'
                      : 'border-blue-300/40 btn-gradient btn-glow'
                  }`}
                >
                  {isBusy ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Signed in as <span className="font-bold">{authUser || 'admin'}</span>
                </p>
                <button
                  type="button"
                  onClick={runPriceCheck}
                  disabled={isBusy}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-white transition-colors ${
                    isBusy
                      ? 'cursor-not-allowed border-white/12 bg-slate-800/70 text-slate-400'
                      : 'border-blue-300/40 btn-gradient btn-glow'
                  }`}
                >
                  {isBusy ? 'Running Price Check...' : 'Run Price Check'}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Logout
                </button>
              </div>
            )}

            {alert ? (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
              >
                {alert}
              </motion.p>
            ) : null}
          </div>

          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Catalog Breakdown</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {catalogBreakdown.map((item) => (
                <div key={item.key} className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.key}</p>
                  <p className="mt-1 text-lg font-bold text-white">{item.count}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Price Summary Preview</p>
            <pre className="mt-2 max-h-72 overflow-auto rounded-xl border border-white/12 bg-black/20 p-3 text-xs leading-relaxed text-slate-300">
              {previewSummary}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
