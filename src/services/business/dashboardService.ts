import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';
import { dashboardCache, CacheKeys } from '../../utils/storage';
import { 
  ComprehensiveDashboardData, 
  AdminDashboardResponse, 
  OperatorDashboardResponse, 
  SuperAdminDashboardResponse 
} from '../../types/dashboard';

interface DashboardStats {
  [key: string]: number | string;
}

interface SuperAdminDashboard {
  summary: {
    total_workspaces: number;
    total_venues: number;
    total_users: number;
    total_orders: number;
    total_revenue: number;
    active_venues: number;
  };
  workspaces: Array<{
    id: string;
    name: string;
    venue_count: number;
    user_count: number;
    is_active: boolean;
    created_at: string;
  }>;
}

interface AdminDashboard {
  summary: {
    today_orders: number;
    today_revenue: number;
    total_tables: number;
    occupied_tables: number;
    total_menu_items: number;
    active_menu_items: number;
    total_staff: number;
  };
  recent_orders: Array<{
    id: string;
    order_number: string;
    table_number: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

interface OperatorDashboard {
  summary: {
    active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    occupied_tables: number;
    total_tables: number;
  };
  active_orders: Array<{
    id: string;
    order_number: string;
    table_number: number;
    total_amount: number;
    status: string;
    created_at: string;
    estimated_ready_time?: string;
    items_count: number;
  }>;
}

class DashboardService {

  async getSuperAdminDashboard(): Promise<SuperAdminDashboardResponse> {
    console.log('🔄 getSuperAdminDashboard called - bypassing cache for debugging');
    
    try {
      console.log('🔍 Step 1: Getting user data...');
      const userDataResponse = await apiService.get<any>('/users/me/data');
      console.log('✅ Step 1 complete - User data response:', userDataResponse);
      
      // Check different possible paths for venue ID
      const responseData = userDataResponse.data as any;
      const venueId = responseData?.venue?.id || 
                     responseData?.data?.venue?.id ||
                     (userDataResponse as any).venue?.id;
      
      if (!venueId) {
        console.error('❌ Step 1 failed: No venue ID found');
        throw new Error('No venue assigned to your account. Please contact your administrator.');
      }
      
      console.log('✅ Step 1 complete - Using venue ID:', venueId);
      
      console.log('🔍 Step 2: Making dashboard API call for venue...');
      const response = await apiService.get<any>(`/dashboard?venue_id=${venueId}`);
      console.log('✅ Step 2 complete - API response received:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      console.log('🔍 Step 3: Validating response...');
      
      // Strict validation - require both success and data
      if (response.success && response.data) {
        console.log('✅ Step 3 complete - Response validation passed');
        console.log('🎯 Returning dashboard data with keys:', Object.keys(response.data));
        console.log('🎯 Full dashboard data:', response.data);
        console.log('🎯 Summary data:', response.data.summary);
        console.log('🎯 Venue data:', response.data.venue);
        console.log('🎯 Recent orders count:', response.data.recent_orders?.length || response.data.recentOrders?.length || 0);
        return response.data;
      }
      
      console.error('❌ Step 3 failed: Response validation failed');
      console.error('Response details:', {
        success: response.success,
        hasData: !!response.data,
        data: response.data,
        responseType: typeof response,
        responseKeys: Object.keys(response)
      });
      throw new Error('No dashboard data received from API');
      
    } catch (error: any) {
      console.error('❌ getSuperAdminDashboard failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Re-throw the original error to preserve the message
      throw error;
    }
  }

  /**
   * Get comprehensive admin dashboard data from venue-specific endpoint
   * This endpoint returns all dashboard data based on real database records for the user's venue
   */
  async getAdminDashboard(): Promise<AdminDashboardResponse | SuperAdminDashboardResponse> {
    console.log('🔄 getAdminDashboard called');
    
    try {
      // Get user's venue ID from auth context
      const userDataResponse = await apiService.get<any>('/users/me/data');
      
      if (!userDataResponse.success || !userDataResponse.data?.venue?.id) {
        throw new Error('No venue assigned to your account. Please contact your administrator.');
      }
      
      const venueId = userDataResponse.data.venue.id;
      console.log('🏢 Using venue ID for dashboard:', venueId);
      
      // Use venue-specific endpoint that returns all dashboard data
      const response = await apiService.get<any>(`/dashboard?venue_id=${venueId}`);
      
      console.log('🔍 Full API Response:', response);
      console.log('🔍 Response.data:', response.data);
      console.log('🔍 Response.data type:', typeof response.data);
      console.log('🔍 Response.data keys:', response.data ? Object.keys(response.data) : 'NO DATA');
      console.log('🔍 Has venue?', response.data && 'venue' in response.data);
      console.log('🔍 Has summary?', response.data && 'summary' in response.data);
      console.log('🔍 Has recent_orders?', response.data && 'recent_orders' in response.data);
      console.log('🔍 Has recentOrders?', response.data && 'recentOrders' in response.data);
      
      if (response.success && response.data) {
        console.log('✅ Dashboard API response received:', {
          dataKeys: Object.keys(response.data),
          hasVenue: 'venue' in response.data,
          hasSummary: 'summary' in response.data,
          hasRecentOrders: 'recent_orders' in response.data,
          summaryData: response.data.summary
        });

        // Check if this is a SuperAdmin response format (from venue endpoint)
        if ('system_stats' in response.data && 'workspaces' in response.data && 'venue_performance' in response.data) {
          const superAdminData = response.data as SuperAdminDashboardResponse;
          console.log('✅ Admin dashboard data loaded (SuperAdmin format)');
          return superAdminData;
        }
        // Check for venue dashboard format (venue + summary + recent_orders)
        else if ('venue' in response.data && 'summary' in response.data) {
          console.log('✅ Admin dashboard data loaded (Venue format) - Returning data');
          // Return as-is, the UnifiedDashboard will handle this format
          return response.data;
        }
        // Check for standard Admin response format
        else if ('venue_name' in response.data && 'stats' in response.data) {
          const adminData = response.data as AdminDashboardResponse;
          console.log('✅ Admin dashboard data loaded (standard format)');
          return adminData;
        }
      }
      
      console.error('❌ Invalid dashboard response format. Response:', response);
      throw new Error('Invalid dashboard response format');
    } catch (error: any) {
      console.error('❌ Dashboard API failed:', error);
      
      // Check for specific error types
      if (error.response?.status === 404) {
        throw new Error('Dashboard endpoint not found. Please ensure the backend API is properly configured.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You may not have permission to view dashboard data.');
      } else if (error.response?.status === 400 && error.response?.data?.detail?.includes('venue')) {
        throw new Error('No venue assigned to your account. Please contact your administrator.');
      }
      
      throw new Error(error.message || 'Failed to load dashboard data. Please try again.');
    }
  }

  async getOperatorDashboard(): Promise<OperatorDashboardResponse> {
    return dashboardCache.getOrSet(
      CacheKeys.dashboardData('operator'),
      async () => {
        try {
          const response = await apiService.get<OperatorDashboardResponse>('/dashboard');
          
          console.log('🔍 Response analysis:', {
            responseExists: !!response,
            hasSuccess: 'success' in response,
            successValue: response?.success,
            hasData: 'data' in response,
            dataValue: response?.data,
            dataType: typeof response?.data,
            isDataNull: response?.data === null,
            isDataUndefined: response?.data === undefined,
            responseKeys: response ? Object.keys(response) : [],
            dataKeys: response?.data ? Object.keys(response.data) : []
          });
          
          if (response.success && response.data) {
            console.log('✅ Operator dashboard data loaded:', {
              venue: response.data.venue_name,
              activeOrders: response.data.stats.active_orders,
              pendingOrders: response.data.stats.pending_orders,
              occupiedTables: response.data.stats.tables_occupied
            });
            return response.data;
          }
          
          throw new Error('Invalid Operator dashboard response format');
        } catch (error: any) {
          console.error('❌ Operator dashboard API failed:', error);
          throw new Error(error.message || 'Failed to load Operator dashboard data');
        }
      },
      1 * 60 * 1000 // 1 minute TTL for operator dashboard (more real-time)
    );
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>('/dashboard');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }

  async getDashboardData(): Promise<any> {
    // Alias for getDashboardStats for compatibility
    return this.getDashboardStats();
  }

  async getVenueDashboard(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard?venue_id=${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return empty data if API fails - no mock data
      return null;
    } catch (error) {
      console.error('Venue dashboard API failed:', error);
      // Return null to indicate failure - no mock data
      return null;
    }
  }

  async getLiveOrderStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live?venue_id=${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return null if API fails - no mock data
      return null;
    } catch (error) {
      console.error('Live order status API failed:', error);
      return null;
    }
  }

  async getLiveTableStatus(venueId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(`/dashboard/live?venue_id=${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Return null if API fails - no mock data
      return null;
    } catch (error) {
      console.error('Live table status API failed:', error);
      return null;
    }
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }

}

export const dashboardService = new DashboardService();

