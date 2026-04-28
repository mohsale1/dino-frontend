/**
 * Centralized Constants Export
 * Single entry point for application constants
 * 
 * Note: For roles, import from 'types/auth'
 * Note: For storage keys, import from 'config/storage'
 */

// ===================================================================
// APPLICATION CONSTANTS
// ===================================================================

export * from './app';
import { STATUS_COLORS } from './app';

// ===================================================================
// USER-FACING CONTENT
// ===================================================================

// NOTE: Static content removed - should be fetched from backend API
// If you need these constants, fetch them from the backend or define them locally

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Get order status display name
 */
export const getOrderStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusNames[status] || status;
};

/**
 * Get payment status display name
 */
export const getPaymentStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusNames[status] || status;
};

/**
 * Get status color based on status type
 */
export const getStatusColor = (status: string, type: 'order' | 'payment' | 'table' = 'order'): string => {
  const colorMaps = {
    order: {
      pending: STATUS_COLORS.RESERVED,
      confirmed: STATUS_COLORS.ACTIVE,
      preparing: '#FF5722',
      ready: STATUS_COLORS.AVAILABLE,
      served: STATUS_COLORS.AVAILABLE,
      completed: STATUS_COLORS.AVAILABLE,
      cancelled: STATUS_COLORS.OCCUPIED,
      refunded: STATUS_COLORS.MAINTENANCE,
    },
    payment: {
      pending: STATUS_COLORS.RESERVED,
      processing: STATUS_COLORS.ACTIVE,
      completed: STATUS_COLORS.AVAILABLE,
      failed: STATUS_COLORS.OCCUPIED,
      cancelled: STATUS_COLORS.OCCUPIED,
      refunded: STATUS_COLORS.MAINTENANCE,
    },
    table: {
      available: STATUS_COLORS.AVAILABLE,
      occupied: STATUS_COLORS.OCCUPIED,
      reserved: STATUS_COLORS.RESERVED,
      maintenance: STATUS_COLORS.MAINTENANCE,
      cleaning: STATUS_COLORS.ACTIVE,
    },
  };

  return (colorMaps[type] as Record<string, string>)?.[status] || STATUS_COLORS.MAINTENANCE;
};
