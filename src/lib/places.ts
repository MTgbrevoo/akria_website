export type Address = { street: string; house_number: string; zip: string; city: string; country: string };
type Component = { longText: string; shortText?: string; types: string[] };
export type Prediction = { text: { toString(): string }; toPlace(): { addressComponents?: Component[]; fetchFields(options: { fields: string[] }): Promise<unknown> } };
export type PlacesLibrary = {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: { fetchAutocompleteSuggestions(options: { input: string; sessionToken: object; includedRegionCodes: string[]; includedPrimaryTypes: string[]; language: string }): Promise<{ suggestions: { placePrediction?: Prediction }[] }> };
};
type MapsWindow = Window & { google?: { maps: { importLibrary(name: string): Promise<unknown> } }; akriaPlacesReady?: () => void };
let loading: Promise<PlacesLibrary> | undefined;
export const placesEnabled = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

export function loadPlaces(): Promise<PlacesLibrary> {
  if (loading) return loading;
  loading = new Promise<PlacesLibrary>((resolve, reject) => {
    const scope = window as MapsWindow;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => fail(), 10000);
    const fail = () => { window.clearTimeout(timer); script.remove(); reject(new Error('Places unavailable')); };
    scope.akriaPlacesReady = () => {
      if (!scope.google) { fail(); return; }
      scope.google.maps.importLibrary('places').then(value => { window.clearTimeout(timer); resolve(value as PlacesLibrary); }, fail);
    };
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, loading: 'async', callback: 'akriaPlacesReady', v: 'weekly', language: 'de' })}`;
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}

export function addressFromComponents(components: Component[]): Address | null {
  const get = (type: string) => components.find(component => component.types.includes(type));
  const country = get('country')?.shortText || '';
  const street = get('route')?.longText || '';
  if (!street || !['DE', 'CH'].includes(country)) return null;
  return { street, country, house_number: get('street_number')?.longText || '', zip: get('postal_code')?.longText || '',
    city: get('locality')?.longText || get('postal_town')?.longText || get('administrative_area_level_3')?.longText || '' };
}

export function withPlacesTimeout<T>(request: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Places timeout')), 8000);
    request.then(value => { window.clearTimeout(timer); resolve(value); }, error => { window.clearTimeout(timer); reject(error); });
  });
}
