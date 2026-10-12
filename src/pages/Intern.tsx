import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Interne Bestellübersicht. Die Daten liefert die Datenbankfunktion intern_dashboard(),
// die nur für freigegebene E-Mail-Adressen (Tabelle intern_access) antwortet.

const ACCENT = '#fe4100';
const PRIMARY = '#0c5eaf';
const PANEL = 'rounded-2xl bg-[#083d73] ring-1 ring-white/10';
const REFRESH_MS = 5 * 60 * 1000;

type Daily = { day: string; orders: number; units: number; units_cum: number };
type Country = { country: string; orders: number; units: number };
type City = { city: string; country: string; orders: number; units: number };
type Dashboard = {
  generated_at: string;
  campaign: string | null;
  preorder_until: string | null;
  orders: number;
  units: number;
  revenue_eur: number;
  orders_7d: number;
  units_7d: number;
  last_order_at: string | null;
  daily: Daily[];
  countries: Country[];
  cities: City[];
};

const nf = new Intl.NumberFormat('de-CH');
const eur = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Zurich' });
const dateOnly = new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeZone: 'Europe/Zurich' });
const COUNTRY_NAMES: Record<string, string> = { DE: 'Deutschland', CH: 'Schweiz', AT: 'Österreich', FR: 'Frankreich', IT: 'Italien' };

function dayLabel(day: string) {
  const [, m, d] = day.split('-');
  return `${Number(d)}.${Number(m)}.`;
}

// Vorbestellfenster endet um Mitternacht; als letzter Tag wird der Vortag angezeigt.
function lastPreorderDay(iso: string | null) {
  if (!iso) return '–';
  return dateOnly.format(new Date(new Date(iso).getTime() - 60_000));
}

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const title = document.title;
    document.title = 'AKRIA intern';
    return () => { meta.remove(); document.title = title; };
  }, []);
}

export default function Intern() {
  useNoIndex();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setReady(true); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setReady(true); }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  return (
    <main className="min-h-screen font-sans text-white" style={{ background: PRIMARY }}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {!ready ? <p className="text-white/70">Wird geladen …</p> : session ? <Overview /> : <Login />}
      </div>
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState('busy');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/intern`, shouldCreateUser: false },
    });
    // Unbekannte Adressen werden bewusst nicht verraten.
    setState(error && error.status !== 400 && error.status !== 422 ? 'error' : 'sent');
  }

  return (
    <div className={`mx-auto mt-10 max-w-md p-8 ${PANEL}`}>
      <p className="font-display text-sm font-semibold uppercase tracking-wider text-white/70">AKRIA intern</p>
      <h1 className="mt-2 font-serif text-3xl font-bold italic">Bestellübersicht</h1>
      {state === 'sent' ? (
        <p className="mt-6 text-white/85">Falls diese Adresse freigeschaltet ist, kommt gleich eine E-Mail mit einem Anmeldelink. Der Link öffnet diese Seite.</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-sm text-white/70">E-Mail-Adresse</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-[#fe4100] focus:ring-2 focus:ring-[#fe4100]/30"
              type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
            />
          </label>
          <button className="btn-accent w-full rounded-xl p-4 font-semibold disabled:opacity-50" disabled={state === 'busy'} type="submit">
            {state === 'busy' ? 'Wird gesendet …' : 'Anmeldelink senden'}
          </button>
          {state === 'error' && <p className="text-sm text-white" role="alert">Das hat nicht geklappt. Bitte später nochmals versuchen.</p>}
        </form>
      )}
    </div>
  );
}

function Overview() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'denied' | 'error'>('loading');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const { data: result, error } = await supabase.rpc('intern_dashboard');
    setBusy(false);
    if (error) { setState(error.code === '42501' ? 'denied' : 'error'); return; }
    setData(result as Dashboard);
    setState('ok');
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  const logout = () => { void supabase.auth.signOut(); };

  if (state === 'denied') {
    return (
      <div className={`mx-auto mt-10 max-w-md p-8 ${PANEL}`}>
        <h1 className="font-serif text-2xl font-bold italic">Kein Zugriff</h1>
        <p className="mt-4 text-white/85">Diese Adresse ist für die interne Übersicht nicht freigeschaltet.</p>
        <button className="mt-6 text-white underline" onClick={logout}>Abmelden</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-white/70">AKRIA intern</p>
          <h1 className="mt-1 font-serif text-3xl font-bold italic sm:text-4xl">
            Bestellungen {data?.campaign ?? ''}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {data ? <>Stand {dateTime.format(new Date(data.generated_at))} · Vorbestellfenster bis {lastPreorderDay(data.preorder_until)}</> : state === 'error' ? 'Die Daten konnten nicht geladen werden.' : 'Daten werden geladen …'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-white/60 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50" onClick={() => void load()} disabled={busy}>
            {busy ? 'Lädt …' : 'Aktualisieren'}
          </button>
          <button className="rounded-xl px-4 py-2 text-sm text-white/70 hover:text-white" onClick={logout}>Abmelden</button>
        </div>
      </header>

      {data && <Content data={data} />}
    </div>
  );
}

function Content({ data }: { data: Dashboard }) {
  const avg = data.orders ? data.units / data.orders : 0;
  return (
    <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Kennzahlen">
        <Tile label="Bestellte Bag-in-Box" value={nf.format(data.units)} note="à 5 Liter, ganzes Vorbestellfenster" />
        <Tile label="Vorbestellungen" value={nf.format(data.orders)} note={`Ø ${avg.toLocaleString('de-CH', { maximumFractionDigits: 2 })} Bag-in-Box pro Bestellung`} />
        <Tile label="Letzte 7 Tage" value={nf.format(data.units_7d)} note={`Bag-in-Box aus ${nf.format(data.orders_7d)} Bestellungen`} />
        <Tile label="Bestellwert" value={eur.format(Number(data.revenue_eur))} note="Summe der Bestellungen, nicht Zahlungseingang" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Verlauf">
        <Card title="Bag-in-Box kumuliert" note={data.last_order_at ? `Letzte Bestellung: ${dateTime.format(new Date(data.last_order_at))}` : 'Noch keine Bestellungen'}>
          <CumulativeChart daily={data.daily} />
        </Card>
        <Card title="Bestellungen pro Tag" note="Eingang nach Datum (Zürcher Zeit)">
          <DailyChart daily={data.daily} />
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Herkunft">
        <Card title="Nach Land" note="Bag-in-Box nach Lieferland">
          <CountryBars countries={data.countries} total={data.units} />
        </Card>
        <Card title="Nach Ort" note="Lieferort, sortiert nach Bag-in-Box">
          <CityTable cities={data.cities} />
        </Card>
      </section>
    </>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className={`p-5 ${PANEL}`}>
      <p className="text-sm text-white/75">{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums sm:text-4xl" style={{ color: ACCENT }}>{value}</p>
      <p className="mt-1 text-xs text-white/60">{note}</p>
    </div>
  );
}

function Card({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className={`p-5 sm:p-6 ${PANEL}`}>
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      <p className="mb-4 text-xs text-white/60">{note}</p>
      {children}
    </div>
  );
}

const W = 600;
const H = 240;
const M = { top: 16, right: 44, bottom: 28, left: 36 };

function ticks(max: number) {
  if (max <= 0) return [0];
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, [1, 2, 5, 10].map(f => f * pow).find(v => v >= raw) ?? 10 * pow);
  const out: number[] = [];
  for (let v = 0; v <= max + step / 2; v += step) out.push(v);
  return out;
}

function labelIndexes(n: number, maxLabels: number) {
  const every = Math.max(1, Math.ceil(n / maxLabels));
  return new Set(Array.from({ length: n }, (_, i) => i).filter(i => (n - 1 - i) % every === 0));
}

function Axes({ yMax, y, labels }: { yMax: number; y: (v: number) => number; labels: { x: number; text: string }[] }) {
  return (
    <g fontSize="12" fill="rgba(255,255,255,0.65)">
      {ticks(yMax).map(t => (
        <g key={t}>
          <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.12)" />
          <text x={M.left - 8} y={y(t)} dy="0.35em" textAnchor="end">{nf.format(t)}</text>
        </g>
      ))}
      {labels.map(l => <text key={l.text + l.x} x={l.x} y={H - 8} textAnchor="middle">{l.text}</text>)}
    </g>
  );
}

function CumulativeChart({ daily }: { daily: Daily[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const geo = useMemo(() => {
    const max = Math.max(1, ...daily.map(d => d.units_cum));
    const yMax = Math.max(...ticks(max * 1.1), max);
    const x = (i: number) => M.left + (daily.length <= 1 ? 0 : (i / (daily.length - 1)) * (W - M.left - M.right));
    const y = (v: number) => H - M.bottom - (v / yMax) * (H - M.top - M.bottom);
    return { yMax, x, y };
  }, [daily]);
  if (!daily.length) return <Empty />;
  const { x, y, yMax } = geo;
  const line = daily.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.units_cum)}`).join(' ');
  const area = `${line} L${x(daily.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const shown = labelIndexes(daily.length, 6);
  const last = daily[daily.length - 1];
  const h = hover !== null ? daily[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`Kumuliert ${last.units_cum} Bag-in-Box`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - M.left) / (W - M.left - M.right)) * (daily.length - 1));
          setHover(Math.min(daily.length - 1, Math.max(0, i)));
        }}>
        <defs>
          <linearGradient id="akria-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={ACCENT} stopOpacity="0.35" />
            <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <Axes yMax={yMax} y={y} labels={daily.map((d, i) => ({ x: x(i), text: dayLabel(d.day) })).filter((_, i) => shown.has(i))} />
        <path d={area} fill="url(#akria-area)" />
        <path d={line} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <text x={x(daily.length - 1) + 6} y={y(last.units_cum)} dy="0.35em" fontSize="13" fontWeight="600" fill={ACCENT}>{nf.format(last.units_cum)}</text>
        {h && hover !== null && <circle cx={x(hover)} cy={y(h.units_cum)} r="5" fill={ACCENT} stroke="#083d73" strokeWidth="2" />}
      </svg>
      {h && <Tooltip title={dayLabel(h.day)} text={`${nf.format(h.units_cum)} gesamt · +${nf.format(h.units)} an diesem Tag`} />}
    </div>
  );
}

function DailyChart({ daily }: { daily: Daily[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!daily.length) return <Empty />;
  const max = Math.max(1, ...daily.map(d => d.orders));
  const yMax = Math.max(...ticks(max), max);
  const y = (v: number) => H - M.bottom - (v / yMax) * (H - M.top - M.bottom);
  const band = (W - M.left - M.right) / daily.length;
  const bw = Math.min(28, band * 0.7);
  const shown = labelIndexes(daily.length, 7);
  const h = hover !== null ? daily[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Bestellungen pro Tag" onMouseLeave={() => setHover(null)}>
        <Axes yMax={yMax} y={y} labels={daily.map((d, i) => ({ x: M.left + band * (i + 0.5), text: dayLabel(d.day) })).filter((_, i) => shown.has(i))} />
        {daily.map((d, i) => (
          <g key={d.day} onMouseEnter={() => setHover(i)}>
            <rect x={M.left + band * i} y={M.top} width={band} height={H - M.top - M.bottom} fill="transparent" />
            {d.orders > 0 && (
              <rect x={M.left + band * i + (band - bw) / 2} y={y(d.orders)} width={bw} height={y(0) - y(d.orders)} rx="4"
                fill={ACCENT} opacity={hover === null || hover === i ? 1 : 0.45} />
            )}
          </g>
        ))}
      </svg>
      {h && <Tooltip title={dayLabel(h.day)} text={`${nf.format(h.orders)} Bestellungen · ${nf.format(h.units)} Bag-in-Box`} />}
    </div>
  );
}

function Tooltip({ title, text }: { title: string; text: string }) {
  return (
    <div className="pointer-events-none absolute right-2 top-0 rounded-lg bg-[#083d73] px-3 py-2 text-xs text-white shadow-lg ring-1 ring-white/20">
      <p className="text-white/60">{title}</p>
      <p className="font-medium tabular-nums">{text}</p>
    </div>
  );
}

function CountryBars({ countries, total }: { countries: Country[]; total: number }) {
  if (!countries.length) return <Empty />;
  const max = Math.max(1, ...countries.map(c => c.units));
  return (
    <ul className="space-y-4">
      {countries.map(c => (
        <li key={c.country}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{COUNTRY_NAMES[c.country] ?? c.country}</span>
            <span className="tabular-nums" style={{ color: ACCENT }}>
              {nf.format(c.units)} Bag-in-Box · {nf.format(c.orders)} Best. · {total ? Math.round((100 * c.units) / total) : 0} %
            </span>
          </div>
          <div className="mt-1.5 h-3 rounded-full bg-white/10">
            <div className="h-3 rounded-full" style={{ width: `${(100 * c.units) / max}%`, background: ACCENT }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CityTable({ cities }: { cities: City[] }) {
  if (!cities.length) return <Empty />;
  const max = Math.max(1, ...cities.map(c => c.units));
  return (
    <div className="max-h-[22rem] overflow-auto">
      <table className="w-full text-sm tabular-nums">
        <thead className="sticky top-0 bg-[#083d73] text-left text-xs text-white/60">
          <tr>
            <th className="py-2 pr-3 font-medium">Ort</th>
            <th className="py-2 pr-3 font-medium">Land</th>
            <th className="py-2 pr-3 text-right font-medium">Best.</th>
            <th className="py-2 font-medium">Bag-in-Box</th>
          </tr>
        </thead>
        <tbody>
          {cities.map(c => (
            <tr key={`${c.city}-${c.country}`} className="border-t border-white/10">
              <td className="py-2 pr-3">{c.city}</td>
              <td className="py-2 pr-3 text-white/70">{c.country}</td>
              <td className="py-2 pr-3 text-right" style={{ color: ACCENT }}>{nf.format(c.orders)}</td>
              <td className="py-2" style={{ color: ACCENT }}>
                <span className="mr-2 inline-block h-2 rounded-full align-middle" style={{ width: `${Math.max(4, (64 * c.units) / max)}px`, background: ACCENT }} />
                {nf.format(c.units)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-white/60">Noch keine Bestellungen.</p>;
}
