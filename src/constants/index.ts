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

// ===================================================================
// USER-FACING CONTENT
// ===================================================================

export {
  // UI Messages
  PAGE_TITLES,
  APP_TITLES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  BUTTON_LABELS,
  PLACEHOLDERS,
  FORM_LABELS,
  ACCESS_MESSAGES,
  STATUS_LABELS,
  NOTIFICATION_MESSAGES,
  
  // Company & Content Information
  COMPANY_INFO,
  COMPANY_STATS,
  CORE_FEATURES,
  MANAGEMENT_FEATURES,
  ADVANCED_FEATURES,
  TESTIMONIALS,
  SUCCESS_STORIES,
  BENEFITS,
  INTEGRATIONS,
  CONTACT_DEPARTMENTS,
  CONTACT_INFO,
  FAQS,
  NAVIGATION,
  FOOTER_FEATURES,
  CONTENT,
  TESTIMONIAL_STATS,
} from '../data/info';

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
      pending: '#FF9800',
      confirmed: '#2196F3',
      preparing: '#FF5722',
      ready: '#4CAF50',
      served: '#4CAF50',
      completed: '#4CAF50',
      cancelled: '#F44336',
      refunded: '#9E9E9E',
    },
    payment: {
      pending: '#FF9800',
      processing: '#2196F3',
      completed: '#4CAF50',
      failed: '#F44336',
      cancelled: '#F44336',
      refunded: '#9E9E9E',
    },
    table: {
      available: '#4CAF50',
      occupied: '#F44336',
      reserved: '#FF9800',
      maintenance: '#9E9E9E',
      cleaning: '#2196F3',
    },
  };
  
  return (colorMaps[type] as Record<string, string>)?.[status] || '#9E9E9E';
};