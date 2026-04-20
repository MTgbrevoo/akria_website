import Cookies from 'js-cookie';

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 90, // 90 days
  path: '/',
  sameSite: 'lax',
  secure: import.meta.env.PROD,
};

// If you have a specific domain to share cookies across subdomains, you can uncomment and adjust this:
// if (process.env.NODE_ENV === 'production') {
//   COOKIE_OPTIONS.domain = '.yourdomain.com';
// }

export const setTrackingSource = (source: string) => {
  Cookies.set('acquisition_source', source, COOKIE_OPTIONS);
};

export const getTrackingSource = (): string | undefined => {
  return Cookies.get('acquisition_source');
};

export const clearTrackingSource = () => {
  Cookies.remove('acquisition_source', { path: '/' });
};
