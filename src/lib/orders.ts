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
export function useCheckoutConfig() {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => orderApi<CheckoutConfig>('config').then(value => { if (active) setConfig(value); }).catch(() => {});
    void refresh();
    const interval = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, []);
  return config;
}
export const formatMoney = (cents: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export const formatCutoff = (end: string) => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' }).format(new Date(new Date(end).getTime() - 1));
