/**
 * API Endpoints Configuration
 * All endpoints are relative to API_CONFIG.BASE_URL (/api/v1)
 * Backend dino-system prefix: /system
 * Backend dino-application prefix: /application
 */

export const API_ENDPOINTS = {
  // ==================== SYSTEM ENDPOINTS ====================
  SYSTEM: {
    AUTH: {
      LOGIN: '/system/auth/login',
      ME: '/system/auth/me',
      REFRESH: '/system/auth/refresh',
      LOGOUT: '/system/auth/logout',
      CHANGE_PASSWORD: '/system/auth/change-password',
    },
    DASHBOARD: {
      BASE: '/system/dashboard',
      STATS: '/system/dashboard/stats',
      WORKSPACE_GROWTH: '/system/dashboard/workspace-growth',
      USER_DISTRIBUTION: '/system/dashboard/user-distribution',
      BILLING_OVERVIEW: '/system/dashboard/billing-overview',
      RECENT_ACTIVITY: '/system/dashboard/recent-activity',
      REFERRALS: '/system/dashboard/referrals',
      TOP_WORKSPACES: '/system/dashboard/top-workspaces',
    },
    USERS: {
      BASE: '/system/users',
      BY_ID: (id: string | number) => `/system/users/${id}`,
      RESTORE: (id: string | number) => `/system/users/${id}/restore`,
      UPDATE_ROLE: (id: string | number) => `/system/users/${id}/role`,
      BY_ROLE: (roleId: string | number) => `/system/users/role/${roleId}`,
    },
    ROLES: {
      BASE: '/system/roles',
      BY_ID: (id: string | number) => `/system/roles/${id}`,
      RESTORE: (id: string | number) => `/system/roles/${id}/restore`,
      PERMISSIONS: (id: string | number) => `/system/roles/${id}/permissions`,
      USERS: (id: string | number) => `/system/roles/${id}/users`,
    },
    PERMISSIONS: {
      BASE: '/system/permissions',
      BY_ID: (id: string | number) => `/system/permissions/${id}`,
      BULK: '/system/permissions/bulk',
      META_CATEGORIES: '/system/permissions/meta/categories',
      META_RESOURCES: '/system/permissions/meta/resources',
    },
    WORKSPACES: {
      BASE: '/system/workspaces',
      BY_ID: (id: string | number) => `/system/workspaces/${id}`,
      RESTORE: (id: string | number) => `/system/workspaces/${id}/restore`,
      BILLING: (id: string | number) => `/system/workspaces/${id}/billing`,
    },
    BILLING: {
      WORKSPACES: '/system/billing/workspaces',
      BY_WORKSPACE: (id: string | number) => `/system/billing/workspaces/${id}`,
      STATS: '/system/billing/stats',
      TRANSACTIONS: '/system/billing/transactions',
      TRANSACTION_BY_ID: (id: string | number) => `/system/billing/transactions/${id}`,
    },
    PERSONAS: {
      BASE: '/system/personas',
      BY_ID: (id: string | number) => `/system/personas/${id}`,
      STATUS: (id: string | number) => `/system/personas/${id}/status`,
      RESTORE: (id: string | number) => `/system/personas/${id}/restore`,
      DEACTIVATE: (id: string | number) => `/system/personas/${id}/deactivate`,
      REACTIVATE: (id: string | number) => `/system/personas/${id}/reactivate`,
    },
    WORKSPACE_REQUESTS: {
      BASE: '/system/workspace-requests',
      BY_ID: (id: string | number) => `/system/workspace-requests/${id}`,
      APPROVE: (id: string | number) => `/system/workspace-requests/${id}/approve`,
      REJECT: (id: string | number) => `/system/workspace-requests/${id}/reject`,
    },
  },

  // ==================== APPLICATION ENDPOINTS ====================
  APPLICATION: {
    AUTH: {
      LOGIN: '/application/auth/login',
      SIGNUP: '/application/auth/signup',
      ME: '/application/auth/me',
      REFRESH: '/application/auth/refresh',
      LOGOUT: '/application/auth/logout',
      VALIDATE_REFERRAL: '/application/auth/validate-referral',
      CHANGE_PASSWORD: '/application/auth/change-password',
    },
    USERS: {
      BASE: '/application/users',
      BY_ID: (id: string | number) => `/application/users/${id}`,
      ME: '/application/users/me',
      ME_DATA: '/application/users/me/data',
    },
    PERMISSIONS: {
      BASE: '/application/permissions',
    },
  },

  // ==================== PUBLIC ENDPOINTS ====================
  PUBLIC: {
    HOME: {
      ALL: '/application/home/all',
      STATS: '/application/home/stats',
      TESTIMONIALS: '/application/home/testimonials',
      CONTACT: '/application/home/contact',
      COMPANY: '/application/home/company',
    },
  },

  // ==================== COMMON ENDPOINTS ====================
  COMMON: {
    HEALTH: '/health',
    ROOT: '/',
  },
} as const;

export function buildUrl(endpoint: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return endpoint;
  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

export const { SYSTEM, APPLICATION, PUBLIC, COMMON } = API_ENDPOINTS;
