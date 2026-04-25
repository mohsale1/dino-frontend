/**
 * API Endpoints Configuration
 * Centralized list of all API endpoints for easy reference and maintenance
 * 
 * Note: All endpoints are relative to API_CONFIG.BASE_URL (/api/v1)
 * Do NOT include /api/v1 prefix in these paths
 */

export const API_ENDPOINTS = {
  // ==================== SYSTEM ENDPOINTS ====================
  SYSTEM: {
    // Authentication
    AUTH: {
      LOGIN: '/system/auth/login',
      ME: '/system/auth/me',
      REFRESH: '/system/auth/refresh',
      LOGOUT: '/system/auth/logout',
    },
    
    // Dashboard
    DASHBOARD: {
      BASE: '/system/dashboard',
      STATS: '/system/dashboard/stats',
      WORKSPACE_GROWTH: '/system/dashboard/workspace-growth',
      USER_DISTRIBUTION: '/system/dashboard/user-distribution',
      TOP_ONBOARDERS: '/system/dashboard/top-onboarders',
      RECENT_ACTIVITY: '/system/dashboard/recent-activity',
    },
    
    // Users
    USERS: {
      BASE: '/system/users',
      BY_ID: (id: string) => `/system/users/${id}`,
      ACTIVATE: (id: string) => `/system/users/${id}/activate`,
      DEACTIVATE: (id: string) => `/system/users/${id}/deactivate`,
      RESTORE: (id: string) => `/system/users/${id}/restore`,
      UPDATE_ROLE: (id: string) => `/system/users/${id}/role`,
      BY_ROLE: (roleId: string) => `/system/users/role/${roleId}`,
    },
    
    // Roles
    ROLES: {
      BASE: '/system/roles',
      BY_ID: (id: string) => `/system/roles/${id}`,
      SYSTEM: '/system/roles/system',
      APPLICATION: '/system/roles/application',
      RESTORE: (id: string) => `/system/roles/${id}/restore`,
      PERMISSIONS: (id: string) => `/system/roles/${id}/permissions`,
      USERS: (id: string) => `/system/roles/${id}/users`,
    },
    
    // Permissions
    PERMISSIONS: {
      BASE: '/system/permissions',
      BY_ID: (id: string) => `/system/permissions/${id}`,
      RESTORE: (id: string) => `/system/permissions/${id}/restore`,
      CATEGORIES: '/system/permissions/metadata/categories',
      RESOURCES: '/system/permissions/metadata/resources',
      ACTIONS: '/system/permissions/metadata/actions',
    },
    
    // Workspaces
    WORKSPACES: {
      BASE: '/system/workspaces',
      BY_ID: (id: string) => `/system/workspaces/${id}`,
      RESTORE: (id: string) => `/system/workspaces/${id}/restore`,
    },
    
    // Billing
    BILLING: {
      ALL: '/system/billing/workspaces',
      BY_WORKSPACE: (id: string) => `/system/billing/workspaces/${id}`,
      SUBSCRIPTION: (id: string) => `/system/billing/workspaces/${id}/subscription`,
      BILLING_INFO: (id: string) => `/system/billing/workspaces/${id}/billing-info`,
    },
    
    // Registration Codes
    REGISTRATION: {
      CODES: '/system/registration/codes',
      BY_CODE: (code: string) => `/system/registration/codes/${code}`,
      RESTORE: (id: string) => `/system/registration/codes/${id}/restore`,
      VALIDATE: '/application/auth/validate-referral',
    },
    
    // UI Config
    UI_CONFIG: {
      MENUS: '/system/ui/menus',
      COMPONENTS: '/system/ui/components',
    },
  },
  
  // ==================== APPLICATION ENDPOINTS ====================
  APPLICATION: {
    // Authentication
    AUTH: {
      LOGIN: '/application/auth/login',
      SIGNUP: '/application/auth/signup',
      ME: '/application/auth/me',
      REFRESH: '/application/auth/refresh',
      LOGOUT: '/application/auth/logout',
      VALIDATE_REFERRAL: '/application/auth/validate-referral',
      ME_DATA: '/application/auth/me/data',
    },
    
    // Users
    USERS: {
      BASE: '/application/users',
      BY_ID: (id: string) => `/application/users/${id}`,
      RESTORE: (id: string) => `/application/users/${id}/restore`,
      UPDATE_ROLE: (id: string) => `/application/users/${id}/role`,
      BY_ROLE: (roleId: string) => `/application/users/role/${roleId}`,
    },
    
    // Roles
    ROLES: {
      BASE: '/application/roles',
      BY_ID: (id: string) => `/application/roles/${id}`,
    },

    // Permissions
    PERMISSIONS: {
      MY_PERMISSIONS: '/application/auth/me',
    },
    
    // Dashboard
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

    // Personas (Business Locations / Venues)
    PERSONAS: {
      BASE: '/application/personas',
      BY_ID: (id: string | number) => `/application/personas/${id}`,
      STATUS: (id: string | number) => `/application/personas/${id}/status`,
      RESTORE: (id: string | number) => `/application/personas/${id}/restore`,
    },

    // Organizations — alias for PERSONAS (backward compatibility)
    ORGANIZATIONS: {
      BASE: '/application/personas',
      BY_ID: (id: string) => `/application/personas/${id}`,
      STATUS: (id: string) => `/application/personas/${id}/status`,
    },
    
    // Categories
    CATEGORIES: {
      BASE: '/application/categories',
      BY_ID: (id: string) => `/application/categories/${id}`,
      RESTORE: (id: string) => `/application/categories/${id}/restore`,
      AVAILABILITY: (id: string) => `/application/categories/${id}/availability`,
    },
    
    // Items (Menu Items)
    ITEMS: {
      BASE: '/application/items',
      BY_ID: (id: string) => `/application/items/${id}`,
      RESTORE: (id: string) => `/application/items/${id}/restore`,
      IMAGE: (id: string) => `/application/items/${id}/image`,
      AVAILABILITY: (id: string) => `/application/items/${id}/availability`,
      BULK_AVAILABILITY: '/application/items/bulk-update-availability',
      BULK_DELETE: '/application/items/bulk-delete',
    },
    
    // Areas
    AREAS: {
      BASE: '/application/areas',
      BY_ID: (id: string) => `/application/areas/${id}`,
      RESTORE: (id: string) => `/application/areas/${id}/restore`,
    },
    
    // Tables
    TABLES: {
      BASE: '/application/tables',
      BY_ID: (id: string) => `/application/tables/${id}`,
      RESTORE: (id: string) => `/application/tables/${id}/restore`,
      STATUS: (id: string) => `/application/tables/${id}/status`,
      QR_CODE: (id: string) => `/application/tables/${id}/qr-code`,
      QR_PRINT: (id: string) => `/application/tables/${id}/qr-code/print`,
      STATISTICS: '/application/tables/statistics',
      BULK_STATUS: '/application/tables/bulk-update-status',
    },
    
    // Orders
    ORDERS: {
      BASE: '/application/orders',
      BY_ID: (id: string) => `/application/orders/${id}`,
      RESTORE: (id: string) => `/application/orders/${id}/restore`,
      STATUS: (id: string) => `/application/orders/${id}/status`,
      CANCEL: (id: string) => `/application/orders/${id}/cancel`,
      STATISTICS: '/application/orders/statistics',
      BULK_STATUS: '/application/orders/bulk-update-status',
      // Public endpoints
      PUBLIC_CREATE: (orgId: string, tableId: string) => 
        `/application/orders/public/${orgId}/${tableId}/create`,
      PUBLIC_LIST: (orgId: string, tableId: string) => 
        `/application/orders/public/${orgId}/${tableId}/orders`,
    },
    
    // Coupons
    COUPONS: {
      BASE: '/application/coupons',
      BY_ID: (id: string) => `/application/coupons/${id}`,
      BY_CODE: (code: string) => `/application/coupons/code/${code}`,
      RESTORE: (id: string) => `/application/coupons/${id}/restore`,
      VALIDATE: '/application/coupons/validate',
      APPLY: (id: string) => `/application/coupons/${id}/apply`,
      STATS: '/system/billing/stats',
    },
    
    // Reviews
    REVIEWS: {
      BASE: '/application/reviews',
      BY_ID: (id: string) => `/application/reviews/${id}`,
    },

    // Workspace approval
    WORKSPACE_APPROVAL: {
      STATUS: (workspaceId: string | number) => `/application/workspaces/${workspaceId}/approval-status`,
    },
  },
  
  // ==================== PUBLIC ENDPOINTS ====================
  PUBLIC: {
    // Home Page
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

/**
 * Helper function to build URL with query parameters
 */
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Export endpoint categories for easy access
 */
export const {
  SYSTEM,
  APPLICATION,
  PUBLIC,
  COMMON,
} = API_ENDPOINTS;
