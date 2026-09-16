import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_EMAIL, orderApi } from '../lib/orders';

export default function Newsletter() {
  const [link] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const action = link.get('action');
  const token = link.get('token');
  const valid = ['confirm', 'unsubscribe'].includes(action || '') && /^[a-f0-9]{64}$/.test(token || '');
  useEffect(() => { window.history.replaceState(null, '', window.location.pathname); }, []);
  async function act() {
    setBusy(true); setError('');
    try { await orderApi('newsletter', { token, action }); setDone(true); }
    catch { setError('Der Link ist ungültig, abgelaufen oder der Dienst ist gerade nicht erreichbar. Bitte versuche es erneut oder kontaktiere uns.'); }
    finally { setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-primary p-6 text-white"><div className="glass-card w-full max-w-xl rounded-3xl p-8 sm:p-12">
    <h1 className="font-serif text-3xl font-bold italic">{done ? action === 'confirm' ? 'Du bist dabei!' : 'Du bist abgemeldet.' : action === 'unsubscribe' ? 'AKRIA-Neuigkeiten abbestellen' : 'AKRIA-Neuigkeiten bestätigen'}</h1>
    <p className="mt-5 text-white/75">{done ? 'Deine Newsletter-Auswahl wurde gespeichert. Deine Bestellungen bleiben davon unberührt.' : 'Hier geht es ausschließlich um E-Mails zu kommenden Ernten und neuen AKRIA-Produkten. Deine Bestellung ist davon unabhängig.'}</p>
    {!done && valid && <button disabled={busy} onClick={act} className="btn-accent mt-8 w-full rounded-xl px-5 py-4 disabled:opacity-50">{busy ? 'Wird gespeichert …' : action === 'unsubscribe' ? 'Newsletter abbestellen' : 'Ja, ich möchte informiert werden'}</button>}
    {(!valid || error) && <p role="alert" className="mt-5">{error || 'Der Link ist ungültig.'} <a className="break-all text-accent underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>}
    <Link className="mt-8 inline-block text-white/70 underline" to="/">Zur Startseite</Link>
  </div></main>;
}
