import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Index from './pages/Index';
import Order from './pages/Order';
import Newsletter from './pages/Newsletter';
import Success from './pages/Success';
import Datenschutz from './pages/Datenschutz';

function TrackingInitializer() {
  const { search, hash } = useLocation();

  useEffect(() => {
    // Wenn in der URL ein Supabase Access Token (Magic Link) vorhanden ist,
    // brechen wir hier ab, damit der Login-Redirect nicht gestört wird.
    if (hash && hash.includes('access_token')) {
      return;
    }

    const urlParams = new URLSearchParams(search);
    const source = urlParams.get('src');
    if (source) {
      try { sessionStorage.setItem('acquisition_source_code', source.slice(0, 100)); } catch { /* optional attribution */ }
    }
  }, [search, hash]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TrackingInitializer />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/bestellen" element={<Order />} />
        <Route path="/waitlist" element={<Navigate to="/bestellen" replace />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/success" element={<Success />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;