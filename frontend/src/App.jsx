import { useCallback, useEffect, useState } from 'react';
import ConfigurationWizard from './pages/ConfigurationWizard';
import HomePage from './pages/HomePage';

const PAGE_KEY = 'page';
const VALID_PAGES = new Set(['home', 'wizard']);

function getCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get(PAGE_KEY) || 'home';
  return VALID_PAGES.has(requested) ? requested : 'home';
}

function setCurrentPage(page) {
  if (!VALID_PAGES.has(page)) return;
  const url = new URL(window.location.href);
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

  if (page === 'wizard') {
    return <ConfigurationWizard onGoHome={goHome} />;
  }

  return <HomePage onStartWizard={goToWizard} />;
}
