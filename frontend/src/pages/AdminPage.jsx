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
  if (type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (type === 'error') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function getAuthBadge(authMode) {
  if (authMode === 'env') {
    return {
      label: 'Secure Env Mode',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
  }

  if (authMode === 'demo') {
    return {
      label: 'Demo Auth Mode',
      className: 'border-amber-200 bg-amber-50 text-amber-700'
    };
  }

  return {
    label: 'Auth Mode Unknown',
    className: 'border-slate-200 bg-slate-50 text-slate-600'
  };
}

function StatCard({ label, value, helper, tone = 'blue' }) {
  const iconTone = {
    blue: 'bg-blue-500/12 text-blue-600',
    pink: 'bg-fuchsia-500/12 text-fuchsia-600',
    green: 'bg-emerald-500/12 text-emerald-600',
    amber: 'bg-amber-500/12 text-amber-600'
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${iconTone}`}>
          {label.slice(0, 1)}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{helper}</p>
    </div>
  );
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

  const authBadge = getAuthBadge(authMode);
  const formattedUpdate = useMemo(() => formatLastUpdate(lastUpdateText), [lastUpdateText]);

  const summaryPreview = useMemo(() => {
    const lines = String(priceSummary || '').split(/\r?\n/);
    return lines.slice(0, 28).join('\n').trim();
  }, [priceSummary]);

  const topCategories = useMemo(
    () => [...catalogBreakdown].sort((a, b) => b.count - a.count).slice(0, 6),
    [catalogBreakdown]
  );

  const categoryMax = useMemo(() => {
    if (topCategories.length === 0) return 1;
    return Math.max(...topCategories.map((item) => item.count), 1);
  }, [topCategories]);

  const coveragePercent = useMemo(() => {
    if (catalogBreakdown.length === 0) return 0;
    const available = catalogBreakdown.filter((item) => item.count > 0).length;
    return Math.round((available / catalogBreakdown.length) * 100);
  }, [catalogBreakdown]);

  const healthy = healthStatus === 'Online';

  const donutStyle = useMemo(() => {
    const angle = Math.max(0, Math.min(360, Math.round((coveragePercent / 100) * 360)));
    return {
      background: `conic-gradient(#2563eb ${angle}deg, #e2e8f0 ${angle}deg 360deg)`
    };
  }, [coveragePercent]);

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
    <div className="relative min-h-screen overflow-hidden bg-[#edf1f6] px-4 py-6 text-slate-900 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-10 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[30px] border border-slate-200/85 bg-[#f8fafc]/90 p-4 shadow-[0_38px_80px_-46px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-6">
          <header className="rounded-[26px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-fuchsia-500 text-base font-bold text-white">
                  PC
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">PCSensei Admin</p>
                  <p className="text-xs text-slate-500">Project Management Overview</p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white">Dashboard</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600">Catalog</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600">Pricing</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600">Security</span>
              </nav>

              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${authBadge.className}`}>
                  {authBadge.label}
                </span>
                <button
                  type="button"
                  onClick={onGoHome}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Home
                </button>
              </div>
            </div>
          </header>

          {notice ? (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${getNoticeStyle(notice.type)}`}
            >
              {notice.message}
            </motion.section>
          ) : null}

          <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Backend Health"
              value={healthStatus}
              helper={
                loadingState === 'loading'
                  ? 'Refreshing status...'
                  : loadingState === 'error'
                    ? 'Endpoint unreachable'
                    : 'Realtime health connected'
              }
              tone={healthy ? 'green' : 'amber'}
            />
            <StatCard
              label="Catalog Items"
              value={formatNumber(componentCount)}
              helper="Indexed products across categories"
              tone="blue"
            />
            <StatCard
              label="Last Update"
              value={formattedUpdate === 'Not available' ? 'N/A' : formattedUpdate}
              helper="Latest timestamp from summary and API"
              tone="pink"
            />
            <StatCard
              label="Session"
              value={token ? authUser || 'admin' : 'Signed Out'}
              helper={token ? 'Authenticated admin session active' : 'Sign in to run protected operations'}
              tone={token ? 'green' : 'amber'}
            />
          </section>

          {loadError ? (
            <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">{loadError}</p>
            </section>
          ) : null}

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.22fr_0.78fr]">
            <div className="space-y-4">
              <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_42px_-34px_rgba(15,23,42,0.48)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Admin Access</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">Authentication & Operations</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    {showAdvanced ? 'Hide API Settings' : 'Show API Settings'}
                  </button>
                </div>

                {showAdvanced ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Backend API Base URL</label>
                    <input
                      value={apiBaseInput}
                      onChange={(event) => setApiBaseInput(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-blue-400 transition focus:border-blue-300 focus:ring"
                      placeholder="http://localhost:3001"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={resetApiBase}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        Reset Endpoint
                      </button>
                      <button
                        type="button"
                        onClick={saveApiBase}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        Save Endpoint
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Current endpoint: {apiBase}</p>
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Admin Login</p>
                    {!token ? (
                      <div className="mt-3 space-y-3">
                        <div>
                          <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-blue-400 transition focus:border-blue-300 focus:ring"
                            placeholder="Admin username"
                          />
                          {fieldErrors.username ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.username}</p> : null}
                        </div>

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
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-20 text-sm text-slate-900 outline-none ring-blue-400 transition focus:border-blue-300 focus:ring"
                            placeholder="Admin password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                          {fieldErrors.password ? <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p> : null}
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          disabled={isSigningIn}
                          onClick={login}
                          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                            isSigningIn
                              ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </motion.button>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                          Signed in as <span className="font-semibold">{authUser || 'admin'}</span>
                        </p>
                        <button
                          type="button"
                          onClick={logout}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Operations</p>
                    <div className="mt-3 space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={runPriceCheck}
                        disabled={isRunningPriceCheck || !token}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          isRunningPriceCheck || !token
                            ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                            : 'bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white hover:brightness-110'
                        }`}
                      >
                        {isRunningPriceCheck ? 'Running Price Check...' : 'Run Price Check'}
                      </motion.button>
                      <p className="text-xs text-slate-500">
                        Trigger a server-side price refresh and recommendation sync. Authentication is required.
                      </p>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500">
                        Mode: {token ? 'Active admin session' : 'Read-only until sign in'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_42px_-34px_rgba(15,23,42,0.48)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Catalog Breakdown</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Inventory Distribution</h2>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {formatNumber(componentCount)} items
                  </span>
                </div>

                {topCategories.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {topCategories.map((item, index) => {
                      const width = Math.max(8, Math.round((item.count / categoryMax) * 100));
                      const barClass =
                        index % 3 === 0
                          ? 'from-blue-500 to-cyan-400'
                          : index % 3 === 1
                            ? 'from-fuchsia-500 to-pink-400'
                            : 'from-emerald-500 to-lime-400';

                      return (
                        <div key={item.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="font-semibold uppercase tracking-[0.1em]">{item.key}</span>
                            <span>{formatNumber(item.count)}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ duration: 0.55, ease: 'easeOut' }}
                              className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Catalog data is not available yet.
                  </div>
                )}
              </article>
            </div>

            <div className="space-y-4">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_42px_-34px_rgba(15,23,42,0.48)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Project Status</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Coverage & Stability</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {healthStatus}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[120px_1fr] items-center gap-4">
                  <div className="relative mx-auto h-28 w-28 rounded-full p-[8px]" style={donutStyle}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-slate-900">{coveragePercent}%</p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">coverage</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">Endpoint</p>
                      <p className="truncate text-sm font-semibold text-slate-700">{apiBase}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">Last Price Update</p>
                      <p className="text-sm font-semibold text-slate-700">{formattedUpdate}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Productivity Trend</p>
                  <svg viewBox="0 0 320 84" className="mt-2 h-24 w-full">
                    <path d="M0 48 C24 38, 42 60, 68 52 S118 28, 146 42 S198 66, 226 50 S276 32, 320 40" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0 64 C30 70, 56 48, 86 60 S136 76, 164 66 S212 42, 242 56 S282 72, 320 62" fill="none" stroke="#d946ef" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_42px_-34px_rgba(15,23,42,0.48)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Price Summary</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Preview & Export</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copySummary}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={downloadSummary}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <pre className="mt-3 max-h-[18.5rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                  {summaryPreview || 'No summary available.'}
                </pre>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
