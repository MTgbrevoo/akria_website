import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { CONTACT_EMAIL, formatCutoff, formatMoney, orderApi, OrderApiError, type CheckoutConfig, type OrderInput, type Receipt } from '../lib/orders';

const ATTEMPT = 'akria-order-attempt-v1';
const RECEIPT = 'akria-order-receipt-v1';
function readStored<T>(key: string): T | null {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null') as T | null; } catch { return null; }
}
function store(key: string, value: unknown) {
  try { if (value === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* in-memory flow remains usable */ }
}
const empty = { firstname: '', lastname: '', email: '', street: '', house_number: '', zip: '', city: '', country: 'DE', quantity: 1, newsletter: false, website: '' };
const fields = [
  ['firstname', 'Vorname', 'given-name'], ['lastname', 'Nachname', 'family-name'],
  ['email', 'E-Mail-Adresse', 'email'], ['street', 'Straße', 'address-line1'],
  ['house_number', 'Hausnummer', 'address-line2'], ['zip', 'PLZ', 'postal-code'], ['city', 'Ort', 'address-level2'],
] as const;
const inputClass = 'mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60';

export default function Order() {
  const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('vorschau') === '1';
  const attempt = useRef<OrderInput | null>(preview ? null : readStored<OrderInput>(ATTEMPT));
  const [form, setForm] = useState(() => ({ ...empty, ...attempt.current }));
  const [receipt, setReceipt] = useState<Receipt | null>(() => preview ? null : readStored<Receipt>(RECEIPT));
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [uncertain, setUncertain] = useState(!!attempt.current);
  const [error, setError] = useState('');
  const [priceChanged, setPriceChanged] = useState(false);
  const [acceptedPrice, setAcceptedPrice] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const loadConfig = async () => {
    if (preview) {
      setConfig({ campaign: '2026/27', preorder_until: '2026-12-15T23:00:00Z', preorder_price_cents: 8500, regular_price_cents: 9500, unit_price_cents: 8500, currency: 'EUR', ordering_open: false });
      setError('');
      return;
    }
    try { setConfig(await orderApi<CheckoutConfig>('config')); setError(''); }
    catch { setError('Der aktuelle Preis konnte nicht geladen werden. Bitte versuche es erneut.'); }
  };
  useEffect(() => { void loadConfig(); }, []);
  useEffect(() => { if (receipt) heading.current?.focus(); }, [receipt]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (preview || submitting.current || (!attempt.current && (!config?.ordering_open || (priceChanged && !acceptedPrice)))) return;
    submitting.current = true; setBusy(true); setError('');
    if (!attempt.current && config) {
      let source = 'website';
      try { source = sessionStorage.getItem('acquisition_source_code') || source; } catch { /* optional attribution */ }
      attempt.current = { ...form, quantity: Number(form.quantity), request_id: crypto.randomUUID(), expected_price_cents: config.unit_price_cents, source };
      store(ATTEMPT, attempt.current);
    }
    try {
      const data = await orderApi<{ receipt: Receipt }>('order', attempt.current);
      if (!data.receipt?.id) throw new Error('Missing receipt');
      store(RECEIPT, data.receipt); store(ATTEMPT, null); attempt.current = null;
      setReceipt(data.receipt); setUncertain(false);
    } catch (err) {
      if (err instanceof OrderApiError && err.code === 'price_changed') {
        setConfig(current => current ? { ...current, unit_price_cents: Number(err.details.unit_price_cents) } : current);
        attempt.current = null; store(ATTEMPT, null); setUncertain(false);
        setPriceChanged(true); setAcceptedPrice(false);
        setError('Der Preis hat sich geändert. Es wurde noch keine Bestellung gespeichert. Bitte bestätige den neuen Preis.');
      } else if (err instanceof OrderApiError && ['invalid_input', 'ordering_closed'].includes(err.code)) {
        attempt.current = null; store(ATTEMPT, null); setUncertain(false);
        setError(err.code === 'ordering_closed' ? 'Aktuell nehmen wir keine Bestellungen an.' : err.details.message ? err.message : 'Bitte prüfe deine Angaben.');
      } else {
        // Keep the exact request and lock editing: the server might already have committed it.
        setUncertain(true);
        setError(err instanceof OrderApiError && err.code === 'rate_limited'
          ? 'Zu viele Versuche. Bitte warte eine Stunde und prüfe dann denselben Vorgang erneut. Bei Fragen kontaktiere uns.'
          : 'Wir konnten den Bestellstatus nicht sicher abrufen. Prüfe denselben Vorgang erneut – dadurch entsteht keine zusätzliche Bestellung.');
      }
    } finally { submitting.current = false; setBusy(false); }
  };

  return <main className="min-h-screen bg-primary px-5 py-12 text-white sm:py-20">
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-white/70 hover:text-white"><ArrowLeft size={16} /> Zur Startseite</Link>
      <div className="glass-card rounded-[2rem] border border-white/10 p-6 sm:p-10">
        {preview && <p className="mb-6 rounded-xl border border-white/25 bg-white/10 p-4 text-sm" role="status">Lokale Vorschau mit Beispielpreis: Es werden keine Bestellungen gespeichert und keine E-Mails versendet.</p>}
        {receipt ? <>
          <CheckCircle2 className="mb-5 text-accent" size={48} />
          <h1 ref={heading} tabIndex={-1} className="font-serif text-3xl font-bold italic focus:outline-none">Deine Bestellung ist eingegangen.</h1>
          <p className="mt-4 text-white/75">Vielen Dank! Wir prüfen deine Bestellung und bestätigen dir die Lieferung separat. Deine Eingangsbestätigung wird per E-Mail versendet.</p>
          <dl className="my-7 space-y-3 rounded-xl bg-white/5 p-5">
            <div><dt className="text-sm text-white/60">Bestellnummer</dt><dd className="break-all font-mono text-sm">{receipt.id}</dd></div>
            <div><dt className="text-sm text-white/60">Ernte {receipt.campaign}</dt><dd>{receipt.quantity} × 5-Liter-Bag-in-Box</dd></div>
            <div><dt className="text-sm text-white/60">Stückpreis / Warenbetrag</dt><dd>{formatMoney(receipt.unit_price_cents)} / <strong>{formatMoney(receipt.total_cents)}</strong></dd></div>
            <div><dt className="text-sm text-white/60">Deine Angaben</dt><dd>{receipt.firstname} {receipt.lastname}<br />{receipt.street} {receipt.house_number}<br />{receipt.zip} {receipt.city}<br />{receipt.country === 'CH' ? 'Schweiz' : 'Deutschland'}<br />{receipt.email}</dd></div>
          </dl>
          <p className="text-sm leading-relaxed text-white/75">Lieferung im Frühjahr 2027. Im Dezember/Januar melden wir uns zur Auswahl zwischen kostenlosem Abhol-Event und Versand auf deine Kosten. Versandkosten sind noch nicht enthalten. Bezahlt wird bei Erhalt.</p>
          <p className="mt-4 text-sm text-white/75">Änderungen oder Fragen? Schreib uns mit deiner Bestellnummer an <a className="break-all text-accent underline" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Bestellung ${receipt.id}`)}`}>{CONTACT_EMAIL}</a>.</p>
          <button className="mt-8 rounded-lg border border-white/30 px-4 py-3" onClick={() => { store(RECEIPT, null); setReceipt(null); setForm({ ...empty }); setPriceChanged(false); setAcceptedPrice(false); void loadConfig(); }}>Weitere Bestellung aufgeben</button>
        </> : <>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Ernte {config?.campaign || '2026/27'}</p>
          <h1 className="font-serif text-4xl font-bold italic">Bestelle dein Olivenöl</h1>
          <p className="mt-4 text-white/70">5 Liter in der Bag-in-Box. Bezahlt wird erst bei Erhalt. Ob Abholung oder Versand klären wir kurz vor der Auslieferung mit dir.</p>
          {!config && !uncertain && <button type="button" className="mt-5 underline" onClick={loadConfig}>Preis neu laden</button>}
          <form className="mt-8 space-y-6" onSubmit={submit}>
            <fieldset disabled={busy || uncertain} className="grid gap-5 sm:grid-cols-2">
              <legend className="sr-only">Deine Bestellangaben</legend>
              {fields.map(([name, label, autoComplete]) => <label key={name} className={name === 'email' ? 'sm:col-span-2' : ''}>
                <span className="text-sm text-white/80">{label}</span>
                <input className={inputClass} name={name} autoComplete={autoComplete} type={name === 'email' ? 'email' : 'text'} required maxLength={254}
                  inputMode={name === 'zip' ? 'numeric' : undefined} pattern={name === 'zip' ? (form.country === 'CH' ? '[0-9]{4}' : '[0-9]{5}') : undefined}
                  value={form[name]} onChange={e => setForm(current => ({ ...current, [name]: e.target.value }))} />
              </label>)}
              <label><span className="text-sm text-white/80">Land</span><select className={inputClass} name="country" autoComplete="country" value={form.country} onChange={e => setForm(current => ({ ...current, country: e.target.value }))}>
                <option className="bg-primary" value="DE">Deutschland</option><option className="bg-primary" value="CH">Schweiz</option>
              </select></label>
              <label className="sm:col-span-2"><span className="text-sm text-white/80">Anzahl 5l-Kartons</span>
                <input className={inputClass} name="quantity" type="number" min="1" step="1" required value={form.quantity || ''} onChange={e => setForm(current => ({ ...current, quantity: Number(e.target.value) }))} />
              </label>
              <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm(current => ({ ...current, website: e.target.value }))} /></label></div>
              <label className="flex items-start gap-3 rounded-xl border border-white/15 p-4 sm:col-span-2">
                <input className="mt-1 h-5 w-5 shrink-0 accent-accent" type="checkbox" checked={form.newsletter} onChange={e => setForm(current => ({ ...current, newsletter: e.target.checked }))} />
                <span><strong className="font-medium">Möchtest Du über die nächste Ernte von uns informiert werden?</strong><span className="mt-1 block text-sm text-white/60">Wir nehmen dich automatisch in unsere Liste für die nächsten Ernten mit auf. Du kannst dich jederzeit davon abmelden. Hierfür bekommst Du einen separaten Bestätigungslink.</span></span>
              </label>
            </fieldset>
            {config && <div className="rounded-xl bg-white/5 p-5" aria-live="polite">
              <p>{form.quantity || 0} × {formatMoney(attempt.current?.expected_price_cents || config.unit_price_cents)}</p>
              <p className="mt-1 text-2xl font-bold">{formatMoney((form.quantity || 0) * (attempt.current?.expected_price_cents || config.unit_price_cents))}</p>
              <p className="mt-2 text-sm text-white/65">zzgl. Versand.</p>
              <p className="mt-2 text-xs text-white/55">{formatMoney(config.preorder_price_cents)} je Stück bis einschließlich {formatCutoff(config.preorder_until)}, danach {formatMoney(config.regular_price_cents)}.</p>
            </div>}
            {priceChanged && <label className="flex gap-3 text-sm"><input type="checkbox" required checked={acceptedPrice} onChange={e => setAcceptedPrice(e.target.checked)} />Ich bestätige den neuen Stückpreis von {formatMoney(config?.unit_price_cents || 0)}.</label>}
            <p className="text-sm leading-relaxed text-white/65">Hierbei handelt es sich um eine verbindliche Vorbestellung. Lieferung erfolgt nach der Ernte im Frühjahr 2027, Zahlung erfolgt erst bei Erhalt der Ware. Du erhältst eine Bestätigung per Mail.</p>
            {uncertain && !error && <p role="status" className="rounded-xl bg-white/10 p-4">Ein vorheriger Bestellvorgang ist noch offen. Bitte prüfe seinen Status, bevor du eine weitere Bestellung aufgibst.</p>}
            {error && <p role="alert" className="rounded-xl border border-accent/50 bg-accent/10 p-4">{error}</p>}
            <button disabled={busy || (!uncertain && (!config?.ordering_open || (priceChanged && !acceptedPrice)))} className="btn-magnetic btn-accent w-full px-5 py-4 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
              {preview ? 'Vorschau – keine Bestellung' : busy ? <><Loader2 className="mr-2 animate-spin" size={20} /> Wird geprüft …</> : uncertain ? 'Bestellstatus erneut prüfen' : 'Bestellung bestätigen'}
            </button>
            {!preview && config && !config.ordering_open && <p role="status">Aktuell nehmen wir keine neuen Bestellungen an.</p>}
          </form>
        </>}
      </div>
    </div>
  </main>;
}
