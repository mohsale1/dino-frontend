/**
 * API configuration utilities
 */

/**
 * Get the base API URL
 */
export function getApiBaseUrl(): string {
  // Check for environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // In production, use current origin
  return window.location.origin;
}

/**
 * Create full API URL
 */
export function createApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
