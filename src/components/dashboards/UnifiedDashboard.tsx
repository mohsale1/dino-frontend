import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS, UserRole } from '../../types/auth';
import { dashboardService } from '../../services/business';
import { AdminDashboardResponse, SuperAdminDashboardResponse, OperatorDashboardResponse } from '../../types/dashboard';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import DashboardTour from '../tour/DashboardTour';
import { usePermissions } from '../auth';
import PermissionService from '../../services/auth';
import { useDashboardFlags } from '../../flags/FlagContext';

// Import modular components
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import DashboardTabs from './components/DashboardTabs';
import TabPanel from './components/TabPanel';
import OverviewTab from './components/tabs/OverviewTab';
import SalesAnalyticsTab from './components/tabs/SalesAnalyticsTab';
import MenuPerformanceTab from './components/tabs/MenuPerformanceTab';
import TablesOrdersTab from './components/tabs/TablesOrdersTab';
import PaymentsTab from './components/tabs/PaymentsTab';

interface UnifiedDashboardProps {
  className?: string;
}

interface VenueDashboardStats {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
  total_tables: number;
  total_menu_items: number;
  todays_revenue: number;
  todays_orders: number;
  avg_order_value: number;
  table_occupancy_rate: number;
  popular_items_count: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  occupied_tables: number;
  active_menu_items: number;
}

interface MenuItemPerformance {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category: string;
  rating: number;
}

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  occupancy_time?: number;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ className }) => {
  const { user, hasPermission, hasBackendPermission, userPermissions } = useAuth();
  const { userData } = useUserData();
  const currentVenue = userData?.venue;
  const dashboardFlags = useDashboardFlags();
  
  // Permission hooks
  const {
    isSuperAdmin,
    isAdmin,
    isOperator,
    canViewDashboard,
    canManageUsers,
    canManageOrders,
    canManageMenu,
    canManageTables,
  } = usePermissions();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VenueDashboardStats | null>(null);
  const [menuPerformance, setMenuPerformance] = useState<MenuItemPerformance[]>([]);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | SuperAdminDashboardResponse | OperatorDashboardResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data based on user role
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get role using the same approach as control panel
      const backendRole = PermissionService.getBackendRole();
      const detectedRole = backendRole?.name || user?.role || 'unknown';
      
      let data;
      
      // Use backend role for dashboard selection
      if (detectedRole === 'superadmin' || detectedRole === 'super_admin') {
        data = await dashboardService.getSuperAdminDashboard();
      } else if (detectedRole === 'admin') {
        data = await dashboardService.getAdminDashboard();
      } else if (detectedRole === 'operator') {
        data = await dashboardService.getOperatorDashboard();
      } else {
        // Fallback based on permission hooks
        if (isSuperAdmin()) {
          data = await dashboardService.getSuperAdminDashboard();
        } else if (isAdmin()) {
          data = await dashboardService.getAdminDashboard();
        } else if (isOperator()) {
          data = await dashboardService.getOperatorDashboard();
        } else {
          data = await dashboardService.getAdminDashboard();
        }
      }      
      if (data) {
        // Process stats based on role and data format
        if ('system_stats' in data) {
          // SuperAdmin format
          const superAdminData = data as SuperAdminDashboardResponse;
          setDashboardData(data);
          setStats({
            total_orders: superAdminData.system_stats?.total_orders || 0,
            total_revenue: superAdminData.system_stats?.total_revenue || 0,
            active_orders: superAdminData.system_stats?.active_orders || 0,
            total_tables: superAdminData.system_stats?.total_tables || 0,
            total_menu_items: superAdminData.system_stats?.total_menu_items || 0,
            todays_revenue: superAdminData.system_stats?.total_revenue_today || 0,
            todays_orders: superAdminData.system_stats?.total_orders_today || 0,
            avg_order_value: superAdminData.system_stats?.avg_order_value || 0,
            table_occupancy_rate: superAdminData.system_stats?.table_occupancy_rate || 0,
            popular_items_count: superAdminData.top_menu_items?.length || 0,
            pending_orders: 0,
            preparing_orders: 0,
            ready_orders: 0,
            occupied_tables: superAdminData.system_stats?.occupied_tables || 0,
            active_menu_items: superAdminData.system_stats?.active_menu_items || 0,
          });
        } else if ('summary' in data && 'workspaces' in data && 'top_venues' in data) {
          // SuperAdmin system-wide summary (from get_superadmin_dashboard)
          const superAdminSummary = data as any;
          const summary = superAdminSummary.summary;          setDashboardData(data as any);
          setStats({
            total_orders: summary?.total_orders || summary?.totalOrders || 0,
            total_revenue: summary?.total_revenue || summary?.totalRevenue || 0,
            active_orders: 0,
            total_tables: 0,
            total_menu_items: 0,
            todays_revenue: summary?.today_revenue || summary?.todayRevenue || 0,
            todays_orders: summary?.today_orders || summary?.todayOrders || 0,
            avg_order_value: 0,
            table_occupancy_rate: 0,
            popular_items_count: 0,
            pending_orders: 0,
            preparing_orders: 0,
            ready_orders: 0,
            occupied_tables: 0,
            active_menu_items: 0,
          });
        } else if ('summary' in data && 'venue' in data) {
          // Venue dashboard format (from backend get_venue_dashboard)
          const venueData = data as any;
          const summary = venueData.summary || {};
          
          // Handle both snake_case and camelCase (API service converts to camelCase)
          const mappedStats: VenueDashboardStats = {
            total_orders: summary.total_orders || summary.totalOrders || 0,
            total_revenue: summary.total_revenue || summary.totalRevenue || 0,
            active_orders: summary.active_orders || summary.activeOrders || 0,
            total_tables: summary.total_tables || summary.totalTables || 0,
            total_menu_items: summary.total_menu_items || summary.totalMenuItems || 0,
            todays_revenue: summary.today_revenue || summary.todayRevenue || 0,
            todays_orders: summary.today_orders || summary.todayOrders || 0,
            avg_order_value: summary.average_order_value || summary.averageOrderValue || 0,
            table_occupancy_rate: summary.table_occupancy_rate || summary.tableOccupancyRate || 0,
            popular_items_count: 0,
            pending_orders: 0,
            preparing_orders: 0,
            ready_orders: 0,
            occupied_tables: summary.occupied_tables || summary.occupiedTables || 0,
            active_menu_items: summary.active_menu_items || summary.activeMenuItems || 0,
          };
          
          setStats(mappedStats);
          
          // Map recent_orders/recentOrders to recent_activity for compatibility with tabs
          const recentOrders = venueData.recent_orders || venueData.recentOrders || [];
          
          setDashboardData({
            ...data,
            recent_activity: recentOrders,
            recentActivity: recentOrders
          } as any);
        } else if ('stats' in data && 'venue_name' in data) {
          // Admin format
          const adminData = data as AdminDashboardResponse;
          const adminStats = adminData.stats;
          setDashboardData(data);
          
          const tablesOccupied = adminStats?.current?.tables_occupied || 0;
          const tablesTotal = adminStats?.current?.tables_total || 0;
          const occupancyRate = tablesTotal > 0 
            ? Math.round((tablesOccupied / tablesTotal) * 100) 
            : 0;
          
          setStats({
            total_orders: adminStats?.today?.orders_count || 0,
            total_revenue: adminStats?.today?.revenue || 0,
            active_orders: 0,
            total_tables: tablesTotal,
            total_menu_items: adminStats?.current?.menu_items_total || 0,
            todays_revenue: adminStats?.today?.revenue || 0,
            todays_orders: adminStats?.today?.orders_count || 0,
            avg_order_value: adminStats?.today?.average_order_value || 0,
            table_occupancy_rate: occupancyRate,
            popular_items_count: 0,
            pending_orders: 0,
            preparing_orders: 0,
            ready_orders: 0,
            occupied_tables: tablesOccupied,
            active_menu_items: adminStats?.current?.menu_items_active || 0,
          });
        } else {
          // Operator format
          const operatorData = data as OperatorDashboardResponse;
          setDashboardData(data);
          
          const tablesOccupied = operatorData.stats?.tables_occupied || 0;
          const tablesAvailable = operatorData.stats?.tables_available || 0;
          const totalTables = tablesOccupied + tablesAvailable;
          const occupancyRate = totalTables > 0 
            ? Math.round((tablesOccupied / totalTables) * 100) 
            : 0;
          
          setStats({
            total_orders: 0,
            total_revenue: 0,
            active_orders: operatorData.stats?.active_orders || 0,
            total_tables: totalTables,
            total_menu_items: 0,
            todays_revenue: 0,
            todays_orders: 0,
            avg_order_value: 0,
            table_occupancy_rate: occupancyRate,
            popular_items_count: 0,
            pending_orders: operatorData.stats?.pending_orders || 0,
            preparing_orders: operatorData.stats?.preparing_orders || 0,
            ready_orders: operatorData.stats?.ready_orders || 0,
            occupied_tables: tablesOccupied,
            active_menu_items: 0,
          });
        }
        
        // Set menu performance data from analytics or top_menu_items
        if ((data as any).analytics?.popular_items && (data as any).analytics.popular_items.length > 0) {
          const formattedMenuItems = (data as any).analytics.popular_items.map((item: any) => ({
            id: item.id || '',
            name: item.name || 'Unknown',
            orders: item.orders || 0,
            revenue: item.revenue || 0,
            category: item.category || 'Unknown',
            rating: item.rating || 4.0,
          }));
          setMenuPerformance(formattedMenuItems);
        } else if ('top_menu_items' in data && (data as any).top_menu_items && (data as any).top_menu_items.length > 0) {
          const formattedMenuItems = (data as any).top_menu_items.map((item: any) => ({
            id: item.id || '',
            name: item.name || 'Unknown',
            orders: item.orders || 0,
            revenue: item.revenue || 0,
            category: item.category || 'Unknown',
            rating: item.rating || 4.0,
          }));
          setMenuPerformance(formattedMenuItems);
        } else {
          setMenuPerformance([]);
        }
        
        // Store analytics data if available
        if ((data as any).analytics) {
          setAnalyticsData((data as any).analytics);
        }
        
        // Set table status data
        if ('venue_performance' in data && (data as any).venue_performance && (data as any).venue_performance.length > 0) {
          const formattedTables: TableStatus[] = [];
          (data as any).venue_performance.forEach((venue: any, index: number) => {
            const totalTables = venue.total_tables || 0;
            const occupiedTables = venue.occupied_tables || 0;
            const venueName = venue.name || 'VEN';
            
            for (let i = 1; i <= Math.min(totalTables, 5); i++) {
              formattedTables.push({
                id: `${venue.id || index}-table-${i}`,
                table_number: `${venueName.substring(0, 3).toUpperCase()}-${i}`,
                status: i <= occupiedTables ? 'occupied' : 'available',
                current_order_id: i <= occupiedTables ? `order-${venue.id || index}-${i}` : undefined,
                occupancy_time: i <= occupiedTables ? Math.floor(Math.random() * 120) + 15 : undefined,
              });
            }
          });
          setTableStatuses(formattedTables);
        } else {
          setTableStatuses([]);
        }
      } else {
        // No data available - set everything to zero
        setStats({
          total_orders: 0,
          total_revenue: 0,
          active_orders: 0,
          total_tables: 0,
          total_menu_items: 0,
          todays_revenue: 0,
          todays_orders: 0,
          avg_order_value: 0,
          table_occupancy_rate: 0,
          popular_items_count: 0,
          pending_orders: 0,
          preparing_orders: 0,
          ready_orders: 0,
          occupied_tables: 0,
          active_menu_items: 0,
        });
        setMenuPerformance([]);
        setTableStatuses([]);
      }
    } catch (err: any) {
      // API failed - show error alert but keep UI visible
      console.error('Dashboard data loading error:', err);
      setError(err?.message || 'Network error. Please check your connection.');
      setDashboardData(null);
      setAnalyticsData(null);
      
      // Set default empty stats on error
      setStats({
        total_orders: 0,
        total_revenue: 0,
        active_orders: 0,
        total_tables: 0,
        total_menu_items: 0,
        todays_revenue: 0,
        todays_orders: 0,
        avg_order_value: 0,
        table_occupancy_rate: 0,
        popular_items_count: 0,
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        occupied_tables: 0,
        active_menu_items: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, isAdmin, isOperator, user]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    // Only proceed if we have a user
    if (!user) {
      setLoading(true);
      return;
    }

    // Load dashboard data for authenticated users
    if (currentVenue?.id || isSuperAdmin()) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
    
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [currentVenue?.id, user, loadDashboardData, isSuperAdmin]);

  // Don't block UI with loading or error states
  // Show dashboard immediately with empty/default data
  
  if (false && error) { // Disabled blocking UI
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={refreshDashboard} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  // Check if user has permission to view dashboard
  if (!canViewDashboard()) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        You don't have permission to view the dashboard. Contact your administrator for access.
      </Alert>
    );
  }

  return (
    <VenueAssignmentCheck showFullPage={!isSuperAdmin()}>

      <Box
        className={className}
        sx={{
          minHeight: 'auto',
          height: 'auto',
          backgroundColor: '#f8f9fa',
          padding: 0,
          margin: 0,
          width: '100%',
          overflow: 'visible',
          '& .MuiContainer-root': {
            padding: '0 !important',
            margin: '0 !important',
            maxWidth: 'none !important',
          },
        }}
      >
        {/* Dashboard Header */}
        <DashboardHeader 
          loading={loading}
          refreshing={refreshing}
          onRefresh={refreshDashboard}
        />

        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 1 }}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Main Content */}
        <Box
          sx={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
        >
          {/* Dashboard Content Container */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2, pb: { xs: 6, sm: 8 } }}>
            
            {/* Dashboard Tour */}
            <DashboardTour />

            {/* Dashboard Statistics */}
            <DashboardStats stats={stats} />

            {/* Dashboard Tabs (only for SuperAdmin and Admin) */}
            <DashboardTabs 
              currentTab={currentTab}
              onTabChange={(e, newValue) => setCurrentTab(newValue)}
            />

            {/* Tab Content (only for SuperAdmin and Admin) */}
            {(() => {
              const backendRole = PermissionService.getBackendRole();
              const detectedRole = backendRole?.name || user?.role || 'unknown';
              return detectedRole === 'superadmin' || detectedRole === 'super_admin' || detectedRole === 'admin' || isSuperAdmin() || isAdmin();
            })() && (
              <>
                {/* Overview Tab */}
                <TabPanel value={currentTab} index={0}>
                  <OverviewTab 
                    dashboardData={dashboardData} 
                    stats={stats} 
                    analyticsData={analyticsData}
                  />
                </TabPanel>

                {/* Sales Analytics Tab */}
                <TabPanel value={currentTab} index={1}>
                  <SalesAnalyticsTab 
                    dashboardData={dashboardData} 
                    stats={stats} 
                    analyticsData={analyticsData}
                  />
                </TabPanel>

                {/* Menu Performance Tab */}
                <TabPanel value={currentTab} index={2}>
                  <MenuPerformanceTab 
                    menuPerformance={menuPerformance} 
                    analyticsData={analyticsData}
                  />
                </TabPanel>

                {/* Tables & Orders Tab */}
                <TabPanel value={currentTab} index={3}>
                  <TablesOrdersTab 
                    tableStatuses={tableStatuses} 
                    analyticsData={analyticsData}
                  />
                </TabPanel>

                {/* Payments Tab */}
                <TabPanel value={currentTab} index={4}>
                  <PaymentsTab 
                    stats={stats} 
                    analyticsData={analyticsData}
                  />
                </TabPanel>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;