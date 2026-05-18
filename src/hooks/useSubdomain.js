import { SUBDOMAIN_TYPES, ROOT_DOMAIN, ADMIN_SUBDOMAIN, CORPORATE_SUBDOMAIN } from '../lib/constants';

export function useSubdomain() {
  const hostname =
    typeof window !== 'undefined'
      ? window.location.hostname.replace('.vercel.app', `.${ROOT_DOMAIN}`)
      : ROOT_DOMAIN;

  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    const searchParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const simulated = searchParams.get('app');
    if (simulated === 'admin') return SUBDOMAIN_TYPES.ADMIN;
    if (simulated === 'corporate') return SUBDOMAIN_TYPES.CORPORATE;
    return SUBDOMAIN_TYPES.RESTAURANT;
  }

  const parts = hostname.split('.');

  if (hostname === ROOT_DOMAIN || (parts.length === 2 && parts[0] === CORPORATE_SUBDOMAIN)) {
    return SUBDOMAIN_TYPES.CORPORATE;
  }

  if (parts[0] === ADMIN_SUBDOMAIN) {
    return SUBDOMAIN_TYPES.ADMIN;
  }

  return SUBDOMAIN_TYPES.RESTAURANT;
}

export function useRestaurantSlug() {
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : ROOT_DOMAIN;
  const parts = hostname.split('.');

  if (parts.length >= 3) return parts[0];
  return null;
}
