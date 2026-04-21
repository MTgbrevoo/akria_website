import { useEffect } from 'react';

const TRACKING_KEY = 'akria_tracking_data';
const EXPIRATION_DAYS = 90;

interface TrackingData {
  src: string | null;
  trigger: string | null;
  capturedAt: string;
}

export function useSourceTracking() {
  useEffect(() => {
    // 1. Check if we have tracking parameters in URL
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src');
    const trigger = params.get('trigger');

    if (src || trigger) {
      // 2. Save to localStorage
      const trackingData: TrackingData = {
        src,
        trigger,
        capturedAt: new Date().toISOString()
      };
      
      localStorage.setItem(TRACKING_KEY, JSON.stringify(trackingData));

      // 3. Remove parameters from URL to keep it clean
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('src');
      newUrl.searchParams.delete('trigger');
      
      window.history.replaceState({}, '', newUrl.toString());
    }

    // 4. Cleanup expired tracking data
    const storedData = localStorage.getItem(TRACKING_KEY);
    if (storedData) {
      try {
        const parsed: TrackingData = JSON.parse(storedData);
        const capturedDate = new Date(parsed.capturedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - capturedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays > EXPIRATION_DAYS) {
          localStorage.removeItem(TRACKING_KEY);
        }
      } catch (e) {
        console.error('Error parsing tracking data:', e);
        localStorage.removeItem(TRACKING_KEY); // Remove if corrupted
      }
    }
  }, []);
}

export function getStoredTrackingData(): TrackingData | null {
  const storedData = localStorage.getItem(TRACKING_KEY);
  if (!storedData) return null;
  
  try {
    return JSON.parse(storedData);
  } catch (e) {
    return null;
  }
}
