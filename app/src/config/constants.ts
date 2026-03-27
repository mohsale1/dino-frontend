/**
 * Application Constants
 * Fallback data for home page sections when API fails
 */

import { Business, ShoppingCart, ThumbUp, CloudDone } from '@mui/icons-material';

/**
 * Default stats configuration - shown when API fails or returns empty data
 * All values are set to 0 to avoid showing fake data
 */
export const DEFAULT_STATS = [
  {
    number: 0,
    suffix: '+',
    label: 'Active Businesses',
    icon: Business,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    decimals: 0
  },
  {
    number: 0,
    suffix: '+',
    label: 'Orders Processed',
    icon: ShoppingCart,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    decimals: 0
  },
  {
    number: 0,
    suffix: '%',
    label: 'Customer Satisfaction',
    icon: ThumbUp,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    decimals: 0
  },
  {
    number: 0,
    suffix: '%',
    label: 'Uptime',
    icon: CloudDone,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    decimals: 1
  },
];

/**
 * Default testimonials are now stored in the backend (homepage_info collection)
 * and fetched via API. No frontend fallback needed.
 */