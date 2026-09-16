import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { CONTACT_EMAIL, orderApi } from '../lib/orders';

// Kompatibilität für bereits verschickte Vormerkungs-/Auth-Links.
// Kein erneutes Schreiben in die archivierte sign_ups-Tabelle.
export default function Success() {
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) { setToken(data.session?.access_token || null); setLoaded(true); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) { setToken(session?.access_token || null); setLoaded(true); }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  async function confirm() {
    if (!token) return;
    setStatus('busy');
    try { await orderApi('legacy-newsletter', { consent: true }, token); setStatus('done'); }
    catch { setStatus('error'); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-primary p-6 text-white"><div className="glass-card max-w-xl rounded-3xl p-8">
    <h1 className="font-serif text-3xl font-bold italic">{status === 'done' ? 'Du bist dabei!' : 'Deine Anmeldung zu AKRIA'}</h1>
    <p className="mt-5 text-white/75">Dieser Link gehört zu deiner früheren Anmeldung für AKRIA-Neuigkeiten. Er gibt keine Bestellung auf.</p>
    {status === 'done' ? <p className="mt-5">Deine Anmeldung ist bestätigt. Abmeldung jederzeit per E-Mail möglich.</p> : token ? <><p className="mt-5">Erhalte E-Mails zu kommenden Ernten und neuen AKRIA-Produkten. Jederzeit abmeldbar.</p><button className="btn-accent mt-5 rounded-xl p-4 disabled:opacity-50" disabled={status === 'busy'} onClick={confirm}>Ja, ich möchte informiert werden</button></> : <p className="mt-5">{loaded ? 'Der Bestätigungslink ist nicht mehr gültig.' : 'Link wird geprüft …'}</p>}
    {status === 'error' && <p className="mt-5" role="alert">Der Link konnte nicht bestätigt werden. Bitte kontaktiere uns unter <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>}
    <Link className="mt-8 block text-accent underline" to="/bestellen">Zur Bestellung</Link>
  </div></main>;
}
