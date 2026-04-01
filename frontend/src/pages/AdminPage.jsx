import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const TOKEN_KEY = 'pcsenseiAdminToken';
const API_BASE_KEY = 'pcsenseiApiBaseUrl';
const AUTH_MODE_KEY = 'pcsenseiAdminMode';

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function sanitizeApiBase(value) {
  const cleaned = normalizeBaseUrl(value);
  if (!cleaned) return '';

  try {
    const url = new URL(cleaned);
    return url.origin;
  } catch {
    return cleaned;
  }
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
  const saved = sanitizeApiBase(window.localStorage.getItem(API_BASE_KEY));
  return saved || getDefaultApiBase();
}

function formatLastUpdate(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === 'Not available') return 'Not available';

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return parsed.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

async function readTextSafe(response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function getNoticeStyle(type) {
  if (type === 'success') return 'border-emerald-300/35 bg-emerald-500/10 text-emerald-100';
  if (type === 'error') return 'border-red-300/35 bg-red-500/10 text-red-100';
  return 'border-amber-300/35 bg-amber-500/10 text-amber-100';
}

function getAuthBadge(authMode) {
  if (authMode === 'env') {
    return {
      label: 'Secure Env Mode',
      className: 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100'
    };
  }

  if (authMode === 'demo') {
    return {
      label: 'Demo Auth Mode',
      className: 'border-amber-300/35 bg-amber-500/10 text-amber-100'
    };
  }

  return {
    label: 'Auth Mode Unknown',
    className: 'border-white/20 bg-white/[0.04] text-slate-200'
  };
}

export default function AdminPage({ onGoHome }) {
  const [apiBaseInput, setApiBaseInput] = useState(getInitialApiBase);
  const [apiBase, setApiBase] = useState(getInitialApiBase);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [token, setToken] = useState(() => window.sessionStorage.getItem(TOKEN_KEY) || '');
  const [authMode, setAuthMode] = useState(() => window.sessionStorage.getItem(AUTH_MODE_KEY) || '');
  const [authUser, setAuthUser] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRunningPriceCheck, setIsRunningPriceCheck] = useState(false);

  const [notice, setNotice] = useState(null);

  const [healthStatus, setHealthStatus] = useState('Unknown');
  const [componentCount, setComponentCount] = useState(0);
  const [catalogBreakdown, setCatalogBreakdown] = useState([]);
  const [lastUpdateText, setLastUpdateText] = useState('Not available');
  const [priceSummary, setPriceSummary] = useState('No summary loaded.');
  const [loadingState, setLoadingState] = useState('idle');
  const [loadError, setLoadError] = useState('');

  const notify = (type, message) => {
    setNotice({ type, message, id: Date.now() });
  };

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    window.localStorage.setItem(API_BASE_KEY, apiBase);
  }, [apiBase]);

  useEffect(() => {
    window.sessionStorage.setItem(AUTH_MODE_KEY, authMode || '');
  }, [authMode]);

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
        setAuthMode('');
      }
    };

    void verifySession();
    return () => controller.abort();
  }, [apiBase, token]);

  useEffect(() => {
    const controller = new AbortController();

    const tryLoad = async (baseUrl) => {
      const [healthRes, componentsRes, summaryRes, updateRes] = await Promise.allSettled([
        fetch(`${baseUrl}/api/health`, { signal: controller.signal }),
        fetch(`${baseUrl}/api/components`, { signal: controller.signal }),
        fetch(`${baseUrl}/api/price-summary`, { signal: controller.signal }),
        fetch(`${baseUrl}/api/last-update`, { signal: controller.signal })
      ]);

      return { healthRes, componentsRes, summaryRes, updateRes };
    };

    const loadAdminData = async () => {
      setLoadingState('loading');
      setLoadError('');

      try {
        let activeBase = apiBase;
        let { healthRes, componentsRes, summaryRes, updateRes } = await tryLoad(activeBase);

        const defaultBase = getDefaultApiBase();
        const firstRoundAllFailed =
          healthRes.status !== 'fulfilled' &&
          componentsRes.status !== 'fulfilled' &&
          summaryRes.status !== 'fulfilled' &&
          updateRes.status !== 'fulfilled';

        if (firstRoundAllFailed && activeBase !== defaultBase) {
          activeBase = defaultBase;
          setApiBase(activeBase);
          setApiBaseInput(activeBase);
          ({ healthRes, componentsRes, summaryRes, updateRes } = await tryLoad(activeBase));
          notify('warning', `Saved endpoint was unreachable. Automatically reset to ${activeBase}.`);
        }

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

        const hasSomeSuccess =
          (healthRes.status === 'fulfilled' && healthRes.value.ok) ||
          (componentsRes.status === 'fulfilled' && componentsRes.value.ok) ||
          (summaryRes.status === 'fulfilled' && summaryRes.value.ok) ||
          (updateRes.status === 'fulfilled' && updateRes.value.ok);

        if (!hasSomeSuccess) {
          setLoadError(`Unable to load admin data from ${activeBase}.`);
          setLoadingState('error');
        } else {
          setLoadingState('success');
        }
      } catch {
        setHealthStatus('Offline');
        setLoadError(`Unable to load admin data from ${apiBase}.`);
        setLoadingState('error');
      }
    };

    void loadAdminData();
    return () => controller.abort();
  }, [apiBase, token]);

  const statusTone = healthStatus === 'Online' ? 'text-emerald-200' : 'text-amber-200';
  const authBadge = getAuthBadge(authMode);
  const formattedUpdate = useMemo(() => formatLastUpdate(lastUpdateText), [lastUpdateText]);

  const summaryPreview = useMemo(() => {
    const lines = String(priceSummary || '').split(/\r?\n/);
    return lines.slice(0, 26).join('\n').trim();
  }, [priceSummary]);

  const saveApiBase = () => {
    const normalized = sanitizeApiBase(apiBaseInput);
    if (!normalized) {
      notify('error', 'Enter a valid API base URL.');
      return;
    }
    setApiBase(normalized);
    notify('success', `API base updated to ${normalized}`);
  };

  const resetApiBase = () => {
    const fallback = getDefaultApiBase();
    setApiBaseInput(fallback);
    setApiBase(fallback);
    notify('success', `Endpoint reset to ${fallback}`);
  };

  const login = async () => {
    const nextErrors = {
      username: username.trim() ? '' : 'Username is required.',
      password: password.trim() ? '' : 'Password is required.'
    };
    setFieldErrors(nextErrors);
    if (nextErrors.username || nextErrors.password) {
      return;
    }

    setIsSigningIn(true);
    try {
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const body = await readTextSafe(response);
      let payload = {};
      try {
        payload = body ? JSON.parse(body) : {};
      } catch {
        payload = { message: body };
      }

      if (!response.ok) {
        throw new Error(payload?.message || 'Login failed.');
      }

      const nextToken = payload?.token || '';
      if (!nextToken) {
        throw new Error('Missing auth token in response.');
      }

      window.sessionStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
      setAuthUser(payload?.username || username.trim());
      setAuthMode(payload?.authMode || authMode || 'unknown');
      setPassword('');
      notify('success', 'Admin login successful.');
    } catch (error) {
      notify('error', error?.message || 'Login failed.');
    } finally {
      setIsSigningIn(false);
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
      // ignore logout API errors
    }

    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(AUTH_MODE_KEY);
    setToken('');
    setAuthUser('');
    setAuthMode('');
    notify('success', 'Logged out.');
  };

  const runPriceCheck = async () => {
    if (!token) {
      notify('warning', 'Login required to run a price check.');
      return;
    }

    setIsRunningPriceCheck(true);
    try {
      const response = await fetch(`${apiBase}/api/run-price-check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const body = await readTextSafe(response);
      let payload = {};
      try {
        payload = body ? JSON.parse(body) : {};
      } catch {
        payload = { message: body };
      }

      if (!response.ok) {
        throw new Error(payload?.message || 'Price check failed.');
      }

      notify('success', payload?.message || 'Price check executed successfully.');
    } catch (error) {
      notify('error', error?.message || 'Price check failed.');
    } finally {
      setIsRunningPriceCheck(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(priceSummary || '');
      notify('success', 'Price summary copied to clipboard.');
    } catch {
      notify('error', 'Unable to copy summary. Check browser permissions.');
    }
  };

  const downloadSummary = () => {
    const blob = new Blob([priceSummary || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pcsensei-price-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
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
            <p className="mt-1 text-sm subtle-copy">A control panel for authentication, catalog health, and pricing operations.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${authBadge.className}`}>
              {authBadge.label}
            </span>
            <button
              type="button"
              onClick={onGoHome}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
            >
              Back To Home
            </button>
          </div>
        </header>

        {notice ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`panel-shell border p-4 text-sm ${getNoticeStyle(notice.type)}`}
          >
            {notice.message}
          </motion.section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Backend Health</p>
            <p className={`mt-2 text-2xl font-bold ${statusTone}`}>{healthStatus}</p>
            <p className="mt-1 text-xs subtle-copy">
              {loadingState === 'loading'
                ? 'Refreshing status...'
                : loadingState === 'error'
                  ? 'Endpoint unreachable'
                  : 'Connected'}
            </p>
          </div>

          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Catalog Items</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatNumber(componentCount)}</p>
            <p className="mt-1 text-xs subtle-copy">Total indexed items across all categories.</p>
          </div>

          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Last Price Update</p>
            <p className="mt-2 text-sm font-semibold text-slate-100">{formattedUpdate}</p>
            <p className="mt-1 text-xs subtle-copy">Timestamp from the latest summary/update source.</p>
          </div>

          <div className="panel-shell p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current Session</p>
            <p className="mt-2 text-sm font-semibold text-slate-100">{token ? `Signed in as ${authUser || 'admin'}` : 'Not signed in'}</p>
            <p className="mt-1 text-xs subtle-copy">Use secure environment credentials in production.</p>
          </div>
        </section>

        {loadError ? (
          <section className="panel-shell border border-amber-300/35 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-100">{loadError}</p>
          </section>
        ) : null}

        <section className="panel-shell p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Advanced Settings</p>
              <p className="mt-1 text-sm subtle-copy">Change backend endpoint only if your API is hosted elsewhere.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="rounded-xl border border-white/20 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          {showAdvanced ? (
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Backend API Base URL</label>
                <input
                  value={apiBaseInput}
                  onChange={(event) => setApiBaseInput(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-300/45"
                  placeholder="http://localhost:3001"
                />
                <p className="mt-2 text-xs subtle-copy">Current endpoint: {apiBase}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetApiBase}
                  className="rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Reset Endpoint
                </button>
                <button
                  type="button"
                  onClick={saveApiBase}
                  className="rounded-xl border border-blue-300/40 btn-gradient px-5 py-3 text-sm font-semibold text-white btn-glow"
                >
                  Save Endpoint
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-4">
            <div className="panel-shell p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin Authentication</p>

              {!token ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-300/45"
                      placeholder="Admin username"
                    />
                    {fieldErrors.username ? (
                      <p className="mt-1 text-xs text-red-200">{fieldErrors.username}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void login();
                          }
                        }}
                        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 pr-28 text-sm text-white outline-none transition-colors focus:border-blue-300/45"
                        placeholder="Admin password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/20 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className="mt-1 text-xs text-red-200">{fieldErrors.password}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={login}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-white transition-colors ${
                      isSigningIn
                        ? 'cursor-not-allowed border-white/12 bg-slate-800/70 text-slate-400'
                        : 'border-blue-300/40 btn-gradient btn-glow'
                    }`}
                  >
                    {isSigningIn ? 'Signing In...' : 'Sign In'}
                  </button>

                  <p className="text-xs subtle-copy">
                    Tip: press Enter in password field to sign in quickly.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Signed in as <span className="font-bold">{authUser || 'admin'}</span>
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="panel-shell p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Operations</p>

              {token ? (
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={runPriceCheck}
                    disabled={isRunningPriceCheck}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-white transition-colors ${
                      isRunningPriceCheck
                        ? 'cursor-not-allowed border-white/12 bg-slate-800/70 text-slate-400'
                        : 'border-blue-300/40 btn-gradient btn-glow'
                    }`}
                  >
                    {isRunningPriceCheck ? 'Running Price Check...' : 'Run Price Check'}
                  </button>
                  <p className="text-xs subtle-copy">
                    In Vercel serverless mode, this action returns guidance if background scripts are unavailable.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/12 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-slate-100">Sign in required for operations</p>
                  <p className="mt-1 text-xs subtle-copy">Authenticate with admin credentials to access protected actions.</p>
                </div>
              )}
            </div>
          </div>

          <div className="panel-shell p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Catalog Breakdown</p>
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                {formatNumber(componentCount)} items
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {catalogBreakdown.map((item) => (
                <div key={item.key} className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.key}</p>
                  <p className="mt-1 text-lg font-bold text-white">{formatNumber(item.count)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Price Summary Preview</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copySummary}
                  className="rounded-lg border border-white/20 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={downloadSummary}
                  className="rounded-lg border border-white/20 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Download
                </button>
              </div>
            </div>

            <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-white/12 bg-black/25 p-3 text-[11px] leading-relaxed text-slate-200">
              {summaryPreview || 'No summary available.'}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
