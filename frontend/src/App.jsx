import { useCallback, useEffect, useState } from 'react';
import ConfigurationWizard from './pages/ConfigurationWizard';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

const PAGE_KEY = 'page';
const VALID_PAGES = new Set(['home', 'wizard', 'admin']);

function normalizePathname(pathname) {
  const normalized = String(pathname || '/').replace(/\/+$/, '');
  return normalized || '/';
}

function getPageFromPath(pathname) {
  const normalized = normalizePathname(pathname);
  if (normalized.endsWith('/admin')) return 'admin';
  if (normalized.endsWith('/wizard')) return 'wizard';
  if (normalized.endsWith('/home')) return 'home';
  return '';
}

function getBasePath(pathname) {
  const normalized = normalizePathname(pathname);
  const stripped = normalized.replace(/\/(admin|wizard|home)$/, '');
  return stripped || '/';
}

function getCurrentPage() {
  const fromPath = getPageFromPath(window.location.pathname);
  if (VALID_PAGES.has(fromPath)) {
    return fromPath;
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get(PAGE_KEY) || 'home';
  return VALID_PAGES.has(requested) ? requested : 'home';
}

function setCurrentPage(page) {
  if (!VALID_PAGES.has(page)) return;

  const url = new URL(window.location.href);
  url.pathname = getBasePath(url.pathname);
  url.searchParams.set(PAGE_KEY, page);
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export default function App() {
  const [page, setPage] = useState(getCurrentPage);

  useEffect(() => {
    const handlePopState = () => setPage(getCurrentPage());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToWizard = useCallback(() => {
    setCurrentPage('wizard');
    setPage('wizard');
  }, []);

  const goHome = useCallback(() => {
    setCurrentPage('home');
    setPage('home');
  }, []);

  const goAdmin = useCallback(() => {
    setCurrentPage('admin');
    setPage('admin');
  }, []);

  if (page === 'admin') {
    return <AdminPage onGoHome={goHome} />;
  }

  if (page === 'wizard') {
    return <ConfigurationWizard onGoHome={goHome} />;
  }

  return <HomePage onStartWizard={goToWizard} onOpenAdmin={goAdmin} />;
}
