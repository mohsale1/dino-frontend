import { apiService } from '../../utils/api';

export interface SystemStats {
  total_workspaces: number;
  active_workspaces: number;
  total_system_users: number;
  active_system_users: number;
  total_app_users: number;
  total_organizations: number;
  workspace_growth: string;
  user_growth: string;
  workspaces_last_30_days: number;
  users_last_30_days: number;
}

export interface WorkspaceGrowthData {
  date: string;
  period: string;
  count: number;
}

export interface UserDistribution {
  role: string;
  count: number;
}

export interface TopOnboarder {
  name: string;
  email: string;
  users_onboarded: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
  timestamp?: string;
}

export interface SubscriptionStats {
  active_subscriptions: number;
  total_revenue: number;
  monthly_recurring_revenue: number;
  past_due: number;
  trial_subscriptions: number;
}

export interface RegistrationCodeStats {
  total_codes: number;
  active_codes: number;
  used_codes: number;
  total_uses: number;
}

export interface SystemDashboardData {
  stats: SystemStats;
  workspace_growth: WorkspaceGrowthData[];
  user_distribution: UserDistribution[];
  top_onboarders: TopOnboarder[];
  recent_activity: RecentActivity[];
  subscription_stats: SubscriptionStats;
  registration_code_stats: RegistrationCodeStats;
}

class SystemDashboardService {
  /**
   * Get comprehensive system dashboard data
   */
  async getDashboardData(): Promise<SystemDashboardData> {
    try {
      const response = await apiService.get<SystemDashboardData>('/system/dashboard');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch dashboard data');
    } catch (error: any) {
      console.error('Error fetching system dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get system statistics only
   */
  async getStats(): Promise<SystemStats> {
    try {
      const response = await apiService.get<SystemStats>('/system/dashboard/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch system stats');
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  /**
   * Get workspace growth trend
   */
  async getWorkspaceGrowth(days: number = 30): Promise<WorkspaceGrowthData[]> {
    try {
      const response = await apiService.get<WorkspaceGrowthData[]>(
        `/system/dashboard/workspace-growth?days=${days}`
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch workspace growth');
    } catch (error: any) {
      console.error('Error fetching workspace growth:', error);
      throw error;
    }
  }

  /**
   * Get user distribution by role
   */
  async getUserDistribution(): Promise<UserDistribution[]> {
    try {
      const response = await apiService.get<UserDistribution[]>(
        '/system/dashboard/user-distribution'
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch user distribution');
    } catch (error: any) {
      console.error('Error fetching user distribution:', error);
      throw error;
    }
  }

  /**
   * Get top user onboarders
   */
  async getTopOnboarders(limit: number = 5): Promise<TopOnboarder[]> {
    try {
      const response = await apiService.get<TopOnboarder[]>(
        `/system/dashboard/top-onboarders?limit=${limit}`
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch top onboarders');
    } catch (error: any) {
      console.error('Error fetching top onboarders:', error);
      throw error;
    }
  }

  /**
   * Get recent system activity
   */
  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    try {
      const response = await apiService.get<RecentActivity[]>(
        `/system/dashboard/recent-activity?limit=${limit}`
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch recent activity');
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
}

export const systemDashboardService = new SystemDashboardService();