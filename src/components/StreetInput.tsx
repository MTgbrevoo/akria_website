import { useEffect, useId, useRef, useState } from 'react';
import { addressFromComponents, loadPlaces, placesEnabled, withPlacesTimeout, type Address, type Prediction } from '../lib/places';

type Props = { value: string; disabled: boolean; country: string; className: string; onChange(value: string): void; onSelect(address: Address): void };
export default function StreetInput({ value, disabled, country, className, onChange, onSelect }: Props) {
  const id = useId();
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const generation = useRef(0);
  const token = useRef<object | null>(null);
  const selecting = useRef(false);
  const latest = useRef({ disabled, value, country });
  latest.current = { disabled, value, country };

  useEffect(() => {
    const version = ++generation.current;
    setSuggestions([]); setActive(-1);
    if (!placesEnabled || disabled || !focused || query.trim().length < 3 || query !== value || selecting.current) return;
    const timeout = window.setTimeout(async () => {
      setStatus('Adressen werden gesucht …');
      try {
        const places = await loadPlaces();
        if (version !== generation.current) return;
        token.current ??= new places.AutocompleteSessionToken();
        const result = await withPlacesTimeout(places.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: query, sessionToken: token.current,
          includedRegionCodes: ['de', 'ch'], includedPrimaryTypes: ['street_address', 'route', 'premise', 'subpremise'], language: 'de' }));
        if (version !== generation.current) return;
        const items = result.suggestions.flatMap(item => item.placePrediction ? [item.placePrediction] : []);
        setSuggestions(items);
        setStatus(items.length ? '' : 'Keine passende Adresse gefunden. Bitte manuell ergänzen.');
      } catch {
        if (version === generation.current) setStatus('Adressvorschläge sind gerade nicht verfügbar. Bitte manuell eingeben.');
      }
    }, 300);
    return () => { window.clearTimeout(timeout); ++generation.current; };
  }, [query, value, focused, disabled, country]);

  async function select(prediction: Prediction) {
    const version = ++generation.current;
    const original = { ...latest.current };
    selecting.current = true;
    token.current = null;
    setSuggestions([]); setActive(-1); setStatus('Adresse wird übernommen …');
    try {
      const place = prediction.toPlace();
      await withPlacesTimeout(place.fetchFields({ fields: ['addressComponents'] }));
      if (version !== generation.current || latest.current.disabled || latest.current.value !== original.value || latest.current.country !== original.country) return;
      const address = addressFromComponents(place.addressComponents || []);
      if (!address) { setStatus('Bitte diese Adresse manuell ergänzen.'); return; }
      setQuery('');
      onSelect(address);
      setStatus(address.house_number && address.zip && address.city ? 'Adresse übernommen. Bitte prüfe deine Angaben.' : 'Adresse übernommen. Bitte ergänze die fehlenden Angaben.');
    } catch {
      if (version === generation.current) setStatus('Adresse konnte nicht geladen werden. Bitte manuell ergänzen.');
    } finally { selecting.current = false; }
  }

  return <div className="relative">
    <label htmlFor={id} className="text-sm text-white/80">Straße</label>
    <input id={id} className={className} name="street" required maxLength={254} value={value} disabled={disabled}
      autoComplete={placesEnabled ? 'off' : 'address-line1'}
      role={placesEnabled ? 'combobox' : undefined} aria-autocomplete={placesEnabled ? 'list' : undefined}
      aria-expanded={placesEnabled ? suggestions.length > 0 : undefined} aria-controls={suggestions.length ? `${id}-options` : undefined}
      aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined} aria-describedby={placesEnabled ? `${id}-help` : undefined}
      onFocus={() => setFocused(true)} onBlur={() => { if (!selecting.current) setFocused(false); }}
      onChange={event => { ++generation.current; selecting.current = false; setSuggestions([]); setActive(-1); setStatus(''); setQuery(event.target.value); onChange(event.target.value); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { ++generation.current; setSuggestions([]); setActive(-1); setStatus(''); }
        if (suggestions.length && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault(); setActive(current => event.key === 'ArrowDown' ? (current + 1) % suggestions.length : (current <= 0 ? suggestions.length - 1 : current - 1));
        }
        if (event.key === 'Enter' && suggestions.length) { event.preventDefault(); if (active >= 0) void select(suggestions[active]); }
      }} />
    {suggestions.length > 0 && <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/20 bg-primary shadow-xl">
      <ul id={`${id}-options`} role="listbox" aria-label="Adressvorschläge">
        {suggestions.map((prediction, index) => <li key={index} id={`${id}-option-${index}`} role="option" aria-selected={index === active}
          className={`cursor-pointer px-4 py-3 text-sm hover:bg-white/10 ${index === active ? 'bg-white/10' : ''}`}
          onMouseDown={event => event.preventDefault()} onClick={() => void select(prediction)}>{prediction.text.toString()}</li>)}
      </ul>
      <a href="/datenschutz#google-places" className="block px-4 text-xs text-white/70 underline">Über diese Ergebnisse</a>
      <div translate="no" className="whitespace-nowrap px-4 py-2 text-right font-sans text-xs font-normal not-italic tracking-normal text-white">Google Maps</div>
    </div>}
    {placesEnabled && <p id={`${id}-help`} role="status" className="mt-2 text-xs text-white/60">{status || <>Adressvorschläge von Google Maps. Du kannst auch manuell eingeben. <a href="/datenschutz#google-places" className="underline">Datenschutz</a></>}</p>}
  </div>;
}
