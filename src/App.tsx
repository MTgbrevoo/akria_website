import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Waitlist from './pages/Waitlist';
import Success from './pages/Success';
import { useSourceTracking } from './hooks/useSourceTracking';

function App() {
  useSourceTracking();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
