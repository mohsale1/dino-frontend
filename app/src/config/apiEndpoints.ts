/**
 * API Endpoints Configuration
 * All endpoints are relative to API_CONFIG.BASE_URL (/api/v1)
 * Backend dino-application prefix: /application
 * Backend dino-system prefix: /system
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
    ROLES: {
      BASE: '/system/roles',
      BY_ID: (id: string | number) => `/system/roles/${id}`,
      PERMISSIONS: (id: string | number) => `/system/roles/${id}/permissions`,
      USERS: (id: string | number) => `/system/roles/${id}/users`,
    },
    PERMISSIONS: {
      BASE: '/system/permissions',
      BY_ID: (id: string | number) => `/system/permissions/${id}`,
    },
    USERS: {
      BASE: '/system/users',
      BY_ID: (id: string | number) => `/system/users/${id}`,
    },
    WORKSPACES: {
      BASE: '/system/workspaces',
      BY_ID: (id: string | number) => `/system/workspaces/${id}`,
    },
    WORKSPACE_REQUESTS: {
      BASE: '/system/workspace-requests',
      BY_ID: (id: string | number) => `/system/workspace-requests/${id}`,
      APPROVE: (id: string | number) => `/system/workspace-requests/${id}/approve`,
      REJECT: (id: string | number) => `/system/workspace-requests/${id}/reject`,
    },
    BILLING: {
      WORKSPACES: '/system/billing/workspaces',
      BY_WORKSPACE: (id: string | number) => `/system/billing/workspaces/${id}`,
      STATS: '/system/billing/stats',
      TRANSACTIONS: '/system/billing/transactions',
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
    PERSONAS: {
      BASE: '/system/personas',
      BY_ID: (id: string | number) => `/system/personas/${id}`,
      STATUS: (id: string | number) => `/system/personas/${id}/status`,
    },
    REGISTRATION: {
      CODES: '/system/registration/codes',
      BY_CODE: (code: string) => `/system/registration/codes/${code}`,
      VALIDATE: '/system/registration/codes/validate',
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
      RESTORE: (id: string | number) => `/application/users/${id}/restore`,
      UPDATE_ROLE: (id: string | number) => `/application/users/${id}/role`,
      BY_ROLE: (roleId: string | number) => `/application/users/role/${roleId}`,
    },
    ROLES: {
      BASE: '/application/roles',
      BY_ID: (id: string | number) => `/application/roles/${id}`,
    },
    PERMISSIONS: {
      BASE: '/application/permissions',
    },
    PERSONAS: {
      BASE: '/application/personas',
      BY_ID: (id: string | number) => `/application/personas/${id}`,
      STATUS: (id: string | number) => `/application/personas/${id}/status`,
      RESTORE: (id: string | number) => `/application/personas/${id}/restore`,
    },
    WORKSPACES: {
      ME: '/application/workspaces/me',
      BY_ID: (id: string | number) => `/application/workspaces/${id}`,
      APPROVAL_STATUS: (id: string | number) => `/application/workspaces/${id}/approval-status`,
      BILLING: (id: string | number) => `/application/workspaces/${id}/billing`,
      BILLING_DETAIL: (id: string | number) => `/application/workspaces/${id}/billing-detail`,
      BILLING_TRANSACTIONS: (id: string | number) => `/application/workspaces/${id}/billing-transactions`,
    },
    CATEGORIES: {
      BASE: '/application/categories',
      BY_ID: (id: string | number) => `/application/categories/${id}`,
      RESTORE: (id: string | number) => `/application/categories/${id}/restore`,
      AVAILABILITY: (id: string | number) => `/application/categories/${id}/availability`,
    },
    ITEMS: {
      BASE: '/application/items',
      BY_ID: (id: string | number) => `/application/items/${id}`,
      RESTORE: (id: string | number) => `/application/items/${id}/restore`,
      AVAILABILITY: (id: string | number) => `/application/items/${id}/availability`,
      BULK_AVAILABILITY: '/application/items/bulk-update-availability',
    },
    AREAS: {
      BASE: '/application/areas',
      BY_ID: (id: string | number) => `/application/areas/${id}`,
      RESTORE: (id: string | number) => `/application/areas/${id}/restore`,
    },
    TABLES: {
      BASE: '/application/tables',
      BY_ID: (id: string | number) => `/application/tables/${id}`,
      SUMMARY: '/application/tables/summary',
      STATUS: (id: string | number) => `/application/tables/${id}/status`,
      RESTORE: (id: string | number) => `/application/tables/${id}/restore`,
      QR_CODE: (id: string | number) => `/application/tables/${id}/qr-code`,
    },
    ORDERS: {
      BASE: '/application/orders',
      BY_ID: (id: string | number) => `/application/orders/${id}`,
      STATUS: (id: string | number) => `/application/orders/${id}/status`,
      CANCEL: (id: string | number) => `/application/orders/${id}/cancel`,
      ITEMS: (id: string | number) => `/application/orders/${id}/items`,
      TRANSACTION: (id: string | number) => `/application/orders/${id}/transaction`,
      STATISTICS: '/application/orders/statistics',
      TRANSACTIONS: '/application/orders/transactions',
    },
    COUPONS: {
      BASE: '/application/coupons',
      BY_ID: (id: string | number) => `/application/coupons/${id}`,
      VALIDATE: '/application/coupons/validate',
      APPLY: '/application/coupons/apply',
      BY_VENUE: (venueId: string | number) => `/application/coupons/venue/${venueId}`,
      ACTIVE_BY_VENUE: (venueId: string | number) => `/application/coupons/venue/${venueId}/active`,
    },
    DASHBOARD: {
      BASE: '/application/dashboard',
      STATS: '/application/dashboard/stats',
      REVENUE_TREND: '/application/dashboard/revenue-trend',
      ORDERS_BY_STATUS: '/application/dashboard/orders-by-status',
      ORDERS_BY_TYPE: '/application/dashboard/orders-by-type',
      TOP_ITEMS: '/application/dashboard/top-items',
      PAYMENT_SUMMARY: '/application/dashboard/payment-summary',
      HOURLY_ORDERS: '/application/dashboard/hourly-orders',
    },
    REVIEWS: {
      BASE: '/application/reviews',
      BY_ID: (id: string | number) => `/application/reviews/${id}`,
      APPROVED: '/application/reviews/approved',
      SUMMARY: '/application/reviews/summary',
    },
    CUSTOMERS: {
      BASE: '/application/customers',
      BY_ID: (id: string | number) => `/application/customers/${id}`,
      ORDERS: (id: string | number) => `/application/customers/${id}/orders`,
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
