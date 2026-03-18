import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, Order, OrderStatus } from '../services/business';
import { queryKeys } from '../config/queryClient';

/**
 * Custom hook for fetching venue orders with caching
 * 
 * Features:
 * - Automatic caching (5 min stale time)
 * - Request deduplication
 * - Background refetching
 * - Optimistic updates
 */
export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const useOrders = (venueId: string, filters?: OrderFilters) => {
  return useQuery({
    queryKey: queryKeys.orders.list(venueId, filters),
    queryFn: () => orderService.getVenueOrders(venueId, filters),
    enabled: !!venueId, // Only fetch if venueId exists
    staleTime: 30 * 1000, // 30 seconds for orders (more real-time)
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

/**
 * Hook for fetching single order
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });
};

/**
 * Hook for updating order status with optimistic updates
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(orderId, status),
    
    // Optimistic update - update UI immediately
    onMutate: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });
      
      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(queryKeys.orders.all);
      
      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.all },
        (old: any) => {
          if (!old) return old;
          
          // Update order status in cached data
          if (Array.isArray(old)) {
            return old.map((order: Order) =>
              order.id === orderId ? { ...order, status } : order
            );
          }
          
          return old;
        }
      );
      
      return { previousOrders };
    },
    
    // Rollback on error
    onError: (err: any, variables: { orderId: string; status: OrderStatus }, context: any) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.all, context.previousOrders);
      }
    },
    
    // Refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

/**
 * Hook for creating new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: () => {
      // Invalidate orders cache to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

/**
 * Hook for prefetching orders (useful for hover states)
 */
export const usePrefetchOrders = () => {
  const queryClient = useQueryClient();
  
  return (venueId: string, filters?: OrderFilters) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.orders.list(venueId, filters),
      queryFn: () => orderService.getVenueOrders(venueId, filters),
    });
  };
};
