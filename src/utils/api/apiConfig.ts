/**
 * API configuration utilities
 */

/**
 * Get the base API URL.
 * Priority: window.APP_CONFIG (runtime, injected by docker-entrypoint.sh) > fallback
 * Never reads build-time env vars — those are absolute URLs that bypass nginx.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.API_BASE_URL) {
    return (window as any).APP_CONFIG.API_BASE_URL;
  }
  return '/api/v1';
}

/**
 * Create full API URL
 */
export function createApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Default fetch options with common headers
 */
export function getDefaultFetchOptions(): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Fetch with authentication
 */
export function getAuthenticatedFetchOptions(token: string): RequestInit {
  return {
    ...getDefaultFetchOptions(),
    headers: {
      ...getDefaultFetchOptions().headers,
      'Authorization': `Bearer ${token}`,
    },
  };
}
