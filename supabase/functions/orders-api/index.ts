// Standalone: diesen vollständigen Inhalt im Supabase Dashboard als orders-api deployen.
// Keine CLI-Verknüpfung erforderlich. verify_jwt=false; privilegierte Aktionen unten gesondert geschützt.
type Json = Record<string, unknown>;
type Mail = { id: string; lease_id: string; kind: string; payload: Json };
const CONSENT_TEXT = 'Erhalte E-Mails zu kommenden Ernten und neuen AKRIA-Produkten. Jederzeit abmeldbar.';
const CONTACT = 'meyertiffertgbr@gmail.com';

export class InputError extends Error {}
export function validateOrder(body: Json): Json {
  const input: Json = {};
  for (const field of ['firstname', 'lastname', 'email', 'street', 'house_number', 'zip', 'city', 'country']) {
    if (typeof body[field] !== 'string') throw new InputError('Bitte fülle alle Pflichtfelder aus.');
    const value = (body[field] as string).trim();
    if (!value || value.length > 254 || /[\r\n\u0000-\u001f]/.test(value)) throw new InputError('Bitte prüfe deine Angaben.');
    input[field] = field === 'email' ? value.toLowerCase() : value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email as string)) throw new InputError('Bitte prüfe deine E-Mail-Adresse.');
  if (!['DE', 'CH'].includes(input.country as string)) throw new InputError('Wir liefern nach Deutschland und in die Schweiz.');
  if (!/^[0-9]{5}$/.test(input.zip as string) && input.country === 'DE') throw new InputError('Bitte gib eine fünfstellige deutsche PLZ ein.');
  if (!/^[0-9]{4}$/.test(input.zip as string) && input.country === 'CH') throw new InputError('Bitte gib eine vierstellige Schweizer PLZ ein.');
  if (!Number.isInteger(body.quantity) || Number(body.quantity) < 1 || Number(body.quantity) > 2147483647) throw new InputError('Bitte gib eine gültige ganze Stückzahl ein.');
  if (!Number.isInteger(body.expected_price_cents) || Number(body.expected_price_cents) < 1) throw new InputError('Bitte lade den aktuellen Preis neu.');
  if (typeof body.newsletter !== 'boolean') throw new InputError('Bitte prüfe die Newsletter-Auswahl.');
  input.quantity = body.quantity;
  input.expected_price_cents = body.expected_price_cents;
  input.newsletter = body.newsletter;
  input.source = typeof body.source === 'string' ? body.source.trim().slice(0, 100) : 'website';
  return input;
}
export async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}
function token() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', ''); }
function money(cents: unknown) { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(cents) / 100); }
export function mailContent(mail: Pick<Mail, 'kind' | 'payload'>) {
  const p = mail.payload;
  if (mail.kind === 'newsletter_confirm') return {
    to: String(p.email), subject: 'Bitte bestätige deine Anmeldung zu AKRIA-Neuigkeiten',
    text: `Du hast dich für AKRIA-Neuigkeiten angemeldet.\n${CONSENT_TEXT}\n\nBestätige deine Anmeldung innerhalb von 7 Tagen:\n${p.confirm_url}\n\nDeine Bestellung ist davon unabhängig. Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail.\nAbmelden / Anmeldung verwerfen: ${p.unsubscribe_url}\n\nAKRIA · Meyer & Tiffert GbR\n${CONTACT}`,
  };
  const orderNumber = p.order_number || p.id;
  return {
    to: String(p.email), subject: `Deine AKRIA-Bestellung ${orderNumber} ist eingegangen`,
    text: `Hallo ${p.firstname},\n\ndeine Bestellung ist eingegangen. Diese E-Mail bestätigt den Eingang; die Lieferzusage erhältst du nach unserer Prüfung separat.\n\nBestellnummer: ${orderNumber}\nErnte: ${p.campaign}\n${p.quantity} × 5-Liter-Bag-in-Box Olivenöl\nStückpreis: ${money(p.unit_price_cents)}\nWarenbetrag: ${money(p.total_cents)}\n\n${p.firstname} ${p.lastname}\n${p.street} ${p.house_number}\n${p.zip} ${p.city}\n${p.country === 'CH' ? 'Schweiz' : 'Deutschland'}\nE-Mail: ${p.email}\n\nLieferung im Frühjahr 2027. Im Dezember/Januar melden wir uns zur Auswahl zwischen kostenlosem Abhol-Event und Versand auf deine Kosten. Versandkosten sind im Warenbetrag nicht enthalten. Bezahlt wird bei Erhalt der Ware.\n\nFür Änderungen oder Fragen antworte bitte mit deiner Bestellnummer auf diese E-Mail.\n\nAKRIA · Meyer & Tiffert GbR\n${CONTACT}`,
  };
}

type Environment = (name: string) => string | undefined;
export function createHandler(env: Environment, fetcher: typeof fetch = fetch) {
  return async (request: Request): Promise<Response> => {
    const site = (env('SITE_URL') || '').replace(/\/$/, '');
    const origin = request.headers.get('origin');
    const allowedOrigins = [site, ...(env('ALLOWED_ORIGINS') || '').split(',').map(v => v.trim())].filter(Boolean);
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' });
    if (origin && allowedOrigins.includes(origin)) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', 'content-type, authorization, apikey, x-worker-secret');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !allowedOrigins.includes(origin)) return respond({ error: 'origin_not_allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const base = env('SUPABASE_URL');
    const key = env('SUPABASE_SERVICE_ROLE_KEY');
    if (!site || !base || !key) return respond({ error: 'service_unavailable' }, 503);
    const rpc = async <T>(name: string, args: Json = {}): Promise<T> => {
      const result = await fetcher(`${base}/rest/v1/rpc/${name}`, {
        method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args), signal: AbortSignal.timeout(15000),
      });
      if (!result.ok) throw new Error(`database_${name}_${result.status}`);
      // PostgreSQL void RPC may return an empty body.
      const text = await result.text();
      return (text ? JSON.parse(text) : null) as T;
    };
    try {
      const action = new URL(request.url).pathname.split('/').filter(Boolean).at(-1);
      if (request.method === 'GET' && action === 'config') return respond(await rpc('checkout_config'));
      if (request.method !== 'POST') return respond({ error: 'method_not_allowed' }, 405);
      if (action === 'worker') {
        const secret = env('ORDER_WORKER_SECRET');
        if (!secret || secret.length < 32 || await sha256(request.headers.get('x-worker-secret') || '') !== await sha256(secret)) return respond({ error: 'unauthorized' }, 401);
        const resendKey = env('RESEND_API_KEY');
        const from = env('ORDER_FROM_EMAIL');
        if (!resendKey || !from) return respond({ error: 'mail_not_configured' }, 503);
        const mails = await rpc<Mail[]>('claim_order_mails');
        const results = await Promise.all(mails.map(async mail => {
          let providerId: string | null = null;
          let error: string | null = null;
          try {
            const content = mailContent(mail);
            const result = await fetcher('https://api.resend.com/emails', {
              method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `akria-mail-${mail.id}` },
              body: JSON.stringify({ from, to: [content.to], reply_to: CONTACT, subject: content.subject, text: content.text }),
              signal: AbortSignal.timeout(20000),
            });
            if (!result.ok) error = `resend_http_${result.status}`;
            else {
              const data = await result.json();
              if (typeof data.id !== 'string') error = 'resend_missing_message_id';
              else providerId = data.id;
            }
          } catch { error = 'mail_network_error'; }
          await rpc('finish_order_mail', { p_id: mail.id, p_lease: mail.lease_id, p_provider_id: providerId, p_error: error });
          return error ? 'retry' : 'sent';
        }));
        return respond({ processed: results.length, sent: results.filter(v => v === 'sent').length });
      }
      if (!['order', 'newsletter', 'legacy-newsletter'].includes(action || '')) return respond({ error: 'not_found' }, 404);
      // Limit streamed bodies too, not just a caller-supplied Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return respond({ error: 'invalid_input' }, 400);
      let raw = ''; let size = 0; const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16384) { await reader.cancel(); return respond({ error: 'payload_too_large' }, 413); }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
      let body: Json;
      try { body = JSON.parse(raw); } catch { return respond({ error: 'invalid_input' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return respond({ error: 'invalid_input' }, 400);
      const salt = env('ORDER_RATE_LIMIT_SALT');
      if (!salt) return respond({ error: 'service_unavailable' }, 503);
      const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      if (!await rpc<boolean>('checkout_rate_limit', { p_key: await sha256(`${salt}:ip:${ip}`), p_limit: 60 })) return respond({ error: 'rate_limited' }, 429);
      if (action === 'newsletter') {
        if (typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token) || !['confirm', 'unsubscribe'].includes(String(body.action))) return respond({ error: 'invalid_link' }, 400);
        const ok = await rpc<boolean>('newsletter_action', { p_hash: await sha256(body.token), p_action: body.action });
        return respond(ok ? { ok: true } : { error: 'invalid_link' }, ok ? 200 : 400);
      }
      if (action === 'legacy-newsletter') {
        const bearer = request.headers.get('authorization');
        if (!bearer?.startsWith('Bearer ')) return respond({ error: 'invalid_link' }, 401);
        const auth = await fetcher(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: bearer }, signal: AbortSignal.timeout(10000) });
        if (!auth.ok) return respond({ error: 'invalid_link' }, 401);
        const user = await auth.json();
        if (!user.email || !user.email_confirmed_at || user.user_metadata?.marketing_consent !== true || body.consent !== true) return respond({ error: 'invalid_link' }, 400);
        const ok = await rpc('legacy_newsletter', { p_email: user.email, p_firstname: user.user_metadata.firstname || '', p_lastname: user.user_metadata.lastname || '' });
        return respond(ok ? { ok: true } : { error: 'invalid_link' }, ok ? 200 : 400);
      }
      if (body.website) return respond({ error: 'invalid_input' }, 400); // Honeypot
      if (typeof body.request_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.request_id)) return respond({ error: 'invalid_input' }, 400);
      const input = validateOrder(body);
      if (!await rpc<boolean>('checkout_rate_limit', { p_key: await sha256(`${salt}:email:${input.email}`), p_limit: 12 })) return respond({ error: 'rate_limited' }, 429);
      const confirmation = token(); const unsubscribe = token();
      const result = await rpc<Json>('place_preorder', {
        p_input: input, p_request_id: body.request_id, p_fingerprint: await sha256(JSON.stringify(input)),
        p_confirmation_hash: await sha256(confirmation), p_unsubscribe_hash: await sha256(unsubscribe),
        p_links: { confirm_url: `${site}/newsletter#action=confirm&token=${confirmation}`, unsubscribe_url: `${site}/newsletter#action=unsubscribe&token=${unsubscribe}` },
      });
      if (result.error) return respond(result, ['price_changed', 'request_conflict'].includes(String(result.error)) ? 409 : 400);
      return respond(result, 201);
    } catch (error) {
      if (error instanceof InputError) return respond({ error: 'invalid_input', message: error.message }, 400);
      // Keine Bestellinhalte, Tokens oder Providerantworten loggen.
      console.error('orders-api request failed', error instanceof Error ? (error.message.startsWith('database_') ? error.message : error.name) : 'unknown');
      return respond({ error: 'temporarily_unavailable' }, 503);
    }
  };
}

if (import.meta.main) Deno.serve(createHandler(name => Deno.env.get(name)));
