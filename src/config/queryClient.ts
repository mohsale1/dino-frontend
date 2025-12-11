import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Optimized for:
 * - Reduced API calls through caching
 * - Better user experience with background refetching
 * - Automatic request deduplication
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for consistency
 */
export const queryKeys = {
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (venueId: string, filters?: any) => 
      [...queryKeys.orders.lists(), venueId, filters] as const,
    detail: (orderId: string) => [...queryKeys.orders.all, 'detail', orderId] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    venue: (venueId: string, dateRange?: any) => 
      [...queryKeys.dashboard.all, 'venue', venueId, dateRange] as const,
    superadmin: (dateRange?: any) => 
      [...queryKeys.dashboard.all, 'superadmin', dateRange] as const,
    analytics: (venueId: string, dateRange?: any) => 
      [...queryKeys.dashboard.all, 'analytics', venueId, dateRange] as const,
  },
  
  // Menu
  menu: {
    all: ['menu'] as const,
    items: (venueId: string) => [...queryKeys.menu.all, 'items', venueId] as const,
    categories: (venueId: string) => [...queryKeys.menu.all, 'categories', venueId] as const,
    item: (itemId: string) => [...queryKeys.menu.all, 'item', itemId] as const,
  },
  
  // Tables
  tables: {
    all: ['tables'] as const,
    list: (venueId: string) => [...queryKeys.tables.all, 'list', venueId] as const,
    detail: (tableId: string) => [...queryKeys.tables.all, 'detail', tableId] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    list: (filters?: any) => [...queryKeys.users.all, 'list', filters] as const,
    detail: (userId: string) => [...queryKeys.users.all, 'detail', userId] as const,
  },
};

/**
 * Cache invalidation helpers
 */
export const invalidateQueries = {
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  menu: () => queryClient.invalidateQueries({ queryKey: queryKeys.menu.all }),
  tables: () => queryClient.invalidateQueries({ queryKey: queryKeys.tables.all }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
};