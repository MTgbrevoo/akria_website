import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Waitlist from './pages/Waitlist';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/warteliste" element={<Waitlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
