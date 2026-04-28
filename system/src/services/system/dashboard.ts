/**
 * System Dashboard Service
 *
 * NOTE: The backend has no /system/dashboard/* routes.
 * All methods return empty stub data so consumers degrade gracefully
 * rather than throwing network errors.
 *
 * When backend dashboard endpoints are implemented, replace the stub
 * bodies with real apiService calls.
 */

// ---------------------------------------------------------------------------
// Types — kept intact so Dashboard.tsx compiles without changes
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stub helpers
// ---------------------------------------------------------------------------

const EMPTY_STATS: SystemStats = {
  total_workspaces: 0,
  active_workspaces: 0,
  total_system_users: 0,
  active_system_users: 0,
  total_app_users: 0,
  total_organizations: 0,
  workspace_growth: '',
  user_growth: '',
  workspaces_last_30_days: 0,
  users_last_30_days: 0,
};

const EMPTY_SUBSCRIPTION_STATS: SubscriptionStats = {
  active_subscriptions: 0,
  total_revenue: 0,
  monthly_recurring_revenue: 0,
  past_due: 0,
  trial_subscriptions: 0,
};

const EMPTY_REGISTRATION_CODE_STATS: RegistrationCodeStats = {
  total_codes: 0,
  active_codes: 0,
  used_codes: 0,
  total_uses: 0,
};

const EMPTY_DASHBOARD_DATA: SystemDashboardData = {
  stats: EMPTY_STATS,
  workspace_growth: [],
  user_distribution: [],
  top_onboarders: [],
  recent_activity: [],
  subscription_stats: EMPTY_SUBSCRIPTION_STATS,
  registration_code_stats: EMPTY_REGISTRATION_CODE_STATS,
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class SystemDashboardService {
  /**
   * Returns empty dashboard data.
   * Replace with a real API call once the backend implements this endpoint.
   */
  async getDashboardData(): Promise<SystemDashboardData> {
    return { ...EMPTY_DASHBOARD_DATA };
  }

}

export const systemDashboardService = new SystemDashboardService();
export default systemDashboardService;
