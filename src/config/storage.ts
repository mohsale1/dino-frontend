/**
 * Storage Configuration
 * Centralized storage keys and configuration
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'dino_token',
  USER: 'dino_user',
  REFRESH_TOKEN: 'dino_refresh_token',
  CART: 'dino_cart',
  PREFERENCES: 'dino_preferences',
  PERMISSIONS: 'dino_permissions',
  THEME: 'app-theme-mode',
  PERFORMANCE_MONITORING: 'dino_performance_monitoring',
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
  PREFIX: 'dino_',
  VERSION: '1.0',
  EXPIRY_DAYS: 30,
  MAX_SIZE_MB: 5,
} as const;

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
