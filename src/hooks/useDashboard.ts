import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/business';
import { queryKeys } from '../config/queryClient';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Hook for fetching admin dashboard data with caching
 * 
 * Features:
 * - 5 minute cache
 * - Automatic background refetching
 * - Request deduplication
 */
export const useAdminDashboard = (dateRange?: DateRangeParams) => {
  return useQuery({
    queryKey: queryKeys.dashboard.venue('current', dateRange),
    queryFn: () => dashboardService.getAdminDashboard(dateRange),
    staleTime: 60 * 1000, // 1 minute for dashboard
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
};

/**
 * Hook for fetching superadmin dashboard
 */
export const useSuperAdminDashboard = (dateRange?: DateRangeParams) => {
  return useQuery({
    queryKey: queryKeys.dashboard.superadmin(dateRange),
    queryFn: () => dashboardService.getSuperAdminDashboard(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for fetching venue dashboard
 */
export const useVenueDashboard = (venueId: string, dateRange?: DateRangeParams) => {
  return useQuery({
    queryKey: queryKeys.dashboard.venue(venueId, dateRange),
    queryFn: () => dashboardService.getVenueDashboard(venueId, dateRange),
    enabled: !!venueId,
    staleTime: 60 * 1000,
  });
};

/**
 * Hook for fetching live metrics (more frequent updates)
 */
export const useLiveMetrics = (venueId: string) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.all, 'live', venueId],
    queryFn: () => dashboardService.getLiveOrderStatus(venueId),
    enabled: !!venueId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

/**
 * Hook for manually refreshing dashboard
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
};