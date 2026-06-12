import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Index from './pages/Index';
import Waitlist from './pages/Waitlist';
import Success from './pages/Success';

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
      sessionStorage.setItem('acquisition_source_code', source);
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
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;