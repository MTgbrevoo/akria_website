import { useEffect, useState } from 'react';
import { SUPABASE_URL } from '../integrations/supabase/client';
export const CONTACT_EMAIL = 'meyertiffertgbr@gmail.com';
export type CheckoutConfig = {
  campaign: string; preorder_until: string; preorder_price_cents: number; regular_price_cents: number;
  unit_price_cents: number; currency: 'EUR'; ordering_open: boolean;
};
export type OrderInput = {
  firstname: string; lastname: string; email: string; street: string; house_number: string;
  zip: string; city: string; country: string; quantity: number;
  source: string; expected_price_cents: number; request_id: string; website: string;
};
export type Receipt = Omit<OrderInput, 'source' | 'expected_price_cents' | 'request_id' | 'website'> & {
  id: string; order_number?: string; created_at: string; campaign: string; unit_price_cents: number; total_cents: number; currency: 'EUR';
};
export class OrderApiError extends Error {
  constructor(public code: string, public status: number, public details: Record<string, unknown>) {
    super(typeof details.message === 'string' ? details.message : code);
  }
}
export async function orderApi<T>(action: string, body?: unknown, token?: string): Promise<T> {
  // Older mobile browsers support AbortController but not AbortSignal.timeout.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/orders-api/${action}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new OrderApiError(data.error || 'unknown', response.status, data);
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
const PRICE_REFRESH_MS = 5 * 60 * 1000;
let landingConfig: CheckoutConfig | null = null;
let lastPriceAttempt = -Infinity;
let pendingPrice: Promise<CheckoutConfig | null> | null = null;

// Share requests across mounted consumers and route changes, including failed attempts.
// Checkout itself still calls orderApi directly for a fresh quote.
function loadLandingConfig(): Promise<CheckoutConfig | null> {
  if (pendingPrice) return pendingPrice;
  if (Date.now() - lastPriceAttempt < PRICE_REFRESH_MS) return Promise.resolve(landingConfig);
  lastPriceAttempt = Date.now();
  pendingPrice = orderApi<CheckoutConfig>('config')
    .then(value => (landingConfig = value))
    .catch(() => landingConfig)
    .finally(() => { pendingPrice = null; });
  return pendingPrice;
}

export function useCheckoutConfig() {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      void loadLandingConfig().then(value => { if (active) setConfig(value); });
    };
    void refresh();
    const interval = window.setInterval(refresh, PRICE_REFRESH_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return config;
}
export const formatMoney = (cents: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export const formatCutoff = (end: string) => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' }).format(new Date(new Date(end).getTime() - 1));
