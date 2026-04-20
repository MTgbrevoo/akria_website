import { useEffect } from 'react';
import { setTrackingSource } from '../lib/cookies';

export function useSourceTracking() {
  useEffect(() => {
    // We run this once on mount
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const src = urlParams.get('src');
    
    // Also optionally capture 'trigger' if requested by your tracking setup
    // const trigger = urlParams.get('trigger');

    if (src) {
      // Save to cookie
      setTrackingSource(src);

      // Clean the URL without reloading the page
      urlParams.delete('src');
      
      const newSearch = urlParams.toString();
      const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);
}
