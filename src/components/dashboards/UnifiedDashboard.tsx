import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { useAuth } from '../../contexts/common/Auth';
import { useUserData } from '../../contexts/application/UserData';
import { PERMISSIONS, ROLES } from '../../types/auth';
import type { UserRole } from '../../types';
import { dashboardService } from '../../services/application';
import { AdminDashboardResponse, SuperAdminDashboardResponse, OperatorDashboardResponse } from '../../types/dashboard';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import { usePermissions } from '../auth';
import DateRangePicker, { DateRange } from '../common/DateRangePicker';

// Import modular components
import DashboardHeader from './components/DashboardHeader';
import TabbedDashboard from './components/TabbedDashboard';

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
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  current_order_id?: string;
  occupancy_time?: number;
  capacity?: number;
  area_id?: string;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ className }) => {
  const { user, hasPermission, hasBackendPermission, userPermissions } = useAuth();
  const { userData } = useUserData();
  const currentVenue = userData?.venue;
  
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

  // Helper function to get 30-day date range (1 month default)
  const getLast30DaysRange = (): DateRange => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Last 30 days including today
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return { 
      startDate: formatDate(thirtyDaysAgo), 
      endDate: formatDate(today) 
    };
  };

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
  const [dateRange, setDateRange] = useState<DateRange>(getLast30DaysRange());
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Load dashboard data based on user role
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      
      {
        /* REMOVED MOCK DATA - NOW USING REAL API
        /* OLD MOCK DATA - REPLACED WITH COMPREHENSIVE DATA
        if (isAdmin) {
          data = {
            summary: {
              total_orders: 856,
              total_revenue: 85600,
              active_orders: 12,
              total_tables: 25,
              total_menu_items: 120,
              today_revenue: 4200,
              today_orders: 32,
              average_order_value: 131.25,
              table_occupancy_rate: 68,
              occupied_tables: 17,
              active_menu_items: 108,
              pending_orders: 5,
              preparing_orders: 8,
              ready_orders: 3,
            },
            venue: {
              id: 'venue-1',
              name: 'Main Restaurant',
            },
            analytics: {
              revenue_trend: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                period: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: Math.floor(2500 + Math.random() * 3000),
                orders: Math.floor(20 + Math.random() * 25),
              })),
              order_status_breakdown: {
                pending: 45,
                confirmed: 32,
                preparing: 78,
                ready: 23,
                served: 156,
                completed: 522,
                cancelled: 12,
              },
              popular_items: [
                { id: '1', name: 'Margherita Pizza', orders: 145, revenue: 2175, category: 'Pizza', rating: 4.8 },
                { id: '2', name: 'Caesar Salad', orders: 98, revenue: 1176, category: 'Salads', rating: 4.6 },
                { id: '3', name: 'Grilled Salmon', orders: 87, revenue: 2175, category: 'Seafood', rating: 4.9 },
                { id: '4', name: 'Pasta Carbonara', orders: 76, revenue: 1368, category: 'Pasta', rating: 4.7 },
                { id: '5', name: 'Tiramisu', orders: 65, revenue: 520, category: 'Desserts', rating: 4.8 },
                { id: '6', name: 'Chicken Alfredo', orders: 54, revenue: 972, category: 'Pasta', rating: 4.5 },
                { id: '7', name: 'Beef Burger', orders: 89, revenue: 1246, category: 'Burgers', rating: 4.7 },
                { id: '8', name: 'Greek Salad', orders: 43, revenue: 516, category: 'Salads', rating: 4.4 },
                { id: '9', name: 'Chocolate Cake', orders: 67, revenue: 536, category: 'Desserts', rating: 4.9 },
                { id: '10', name: 'Fish & Chips', orders: 72, revenue: 1080, category: 'Seafood', rating: 4.6 },
              ],
            },
            recent_orders: [
              { id: '1', order_number: 'ORD-001', table_number: 'T-05', customer_name: 'John Doe', subtotal: 115.00, tax_amount: 10.50, discount_amount: 0, status: 'served' as const, items_count: 4, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
              { id: '2', order_number: 'ORD-002', table_number: 'T-12', customer_name: 'Jane Smith', subtotal: 82.50, tax_amount: 7.49, discount_amount: 0, status: 'preparing' as const, items_count: 3, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
              { id: '3', order_number: 'ORD-003', table_number: 'T-08', customer_name: 'Bob Johnson', subtotal: 143.50, tax_amount: 13.25, discount_amount: 0, status: 'pending' as const, items_count: 5, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
            ],
            tables: [
              { id: '1', table_number: 'T-01', status: 'occupied', capacity: 4, area_id: 'Main Dining', current_order_id: 'ord-1', occupancy_time: 45 },
              { id: '2', table_number: 'T-02', status: 'available', capacity: 2, area_id: 'Main Dining' },
              { id: '3', table_number: 'T-03', status: 'occupied', capacity: 6, area_id: 'Main Dining', current_order_id: 'ord-2', occupancy_time: 30 },
              { id: '4', table_number: 'T-04', status: 'reserved', capacity: 4, area_id: 'Main Dining' },
              { id: '5', table_number: 'T-05', status: 'available', capacity: 2, area_id: 'Main Dining' },
              { id: '6', table_number: 'T-06', status: 'occupied', capacity: 4, area_id: 'Patio', current_order_id: 'ord-3', occupancy_time: 25 },
              { id: '7', table_number: 'T-07', status: 'available', capacity: 2, area_id: 'Patio' },
              { id: '8', table_number: 'T-08', status: 'occupied', capacity: 4, area_id: 'Patio', current_order_id: 'ord-4', occupancy_time: 55 },
              { id: '9', table_number: 'T-09', status: 'available', capacity: 6, area_id: 'Patio' },
              { id: '10', table_number: 'T-10', status: 'maintenance', capacity: 4, area_id: 'Patio' },
              { id: '11', table_number: 'T-11', status: 'occupied', capacity: 2, area_id: 'Bar Area', current_order_id: 'ord-5', occupancy_time: 15 },
              { id: '12', table_number: 'T-12', status: 'occupied', capacity: 2, area_id: 'Bar Area', current_order_id: 'ord-6', occupancy_time: 40 },
              { id: '13', table_number: 'T-13', status: 'available', capacity: 2, area_id: 'Bar Area' },
              { id: '14', table_number: 'T-14', status: 'reserved', capacity: 4, area_id: 'Private Room' },
              { id: '15', table_number: 'T-15', status: 'available', capacity: 8, area_id: 'Private Room' },
            ],
          };
        } else if (isOperator) {
          // Operator mock data
          data = {
            venueId: 'venue-1',
            venue_name: 'Main Restaurant',
            stats: {
              active_orders: 8,
              pending_orders: 3,
              preparing_orders: 4,
              ready_orders: 1,
              tables_occupied: 12,
              tables_available: 8,
            },
            active_orders: [
              { id: '1', order_number: 'ORD-001', table_number: 'T-05', status: 'pending' as const, items_count: 3, subtotal: 45.50, tax_amount: 4.55, discount_amount: 0, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
              { id: '2', order_number: 'ORD-002', table_number: 'T-12', status: 'preparing' as const, items_count: 5, subtotal: 78.99, tax_amount: 7.90, discount_amount: 0, createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
            ],
            table_status_breakdown: [
              { status: 'occupied' as const, count: 12, percentage: 60, color: '#4caf50' },
              { status: 'available' as const, count: 8, percentage: 40, color: '#2196f3' },
            ],
            alerts: [],
            last_updated: new Date().toISOString(),
          } as OperatorDashboardResponse;
        } else {
          // Default admin data
          data = {
            summary: {
              total_orders: 856,
              total_revenue: 85600,
              active_orders: 12,
              total_tables: 25,
              total_menu_items: 120,
              today_revenue: 4200,
              today_orders: 32,
              average_order_value: 131.25,
              table_occupancy_rate: 68,
              occupied_tables: 17,
              active_menu_items: 108,
            },
            venue: {
              id: 'venue-1',
              name: 'Main Restaurant',
            },
          };
        }
        */
      }
      
      // Real API call
      const dateParams = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      // Use permission hooks to determine which dashboard to load
      if (isSuperAdmin) {
        data = await dashboardService.getSuperAdminDashboard(dateParams);
      } else if (isAdmin) {
        data = await dashboardService.getAdminDashboard(dateParams);
      } else if (isOperator) {
        data = await dashboardService.getOperatorDashboard();
      } else {
        // Default to admin dashboard
        data = await dashboardService.getAdminDashboard(dateParams);
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
          const summary = superAdminSummary.summary;
          setDashboardData(data as any);
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
            pending_orders: summary.pending_orders || summary.pendingOrders || 0,
            preparing_orders: summary.preparing_orders || summary.preparingOrders || 0,
            ready_orders: summary.ready_orders || summary.readyOrders || 0,
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
        
        // Generate analytics data from stats if not provided by backend
        let analyticsToSet = (data as any).analytics;
        
        if (!analyticsToSet || !analyticsToSet.revenue_trend || analyticsToSet.revenue_trend.length === 0) {
          
          // Generate revenue trend data for the date range
          const generateRevenueTrend = () => {
            const trend = [];
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);
            const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            
            // Generate data points (max 30 points for readability)
            const points = Math.min(daysDiff + 1, 30);
            const interval = Math.max(1, Math.floor(daysDiff / points));
            
            for (let i = 0; i <= daysDiff; i += interval) {
              const date = new Date(start);
              date.setDate(date.getDate() + i);
              
              // Use actual stats if available, otherwise use sample data
              const dailyRevenue = stats?.todays_revenue ? Math.floor(stats.todays_revenue * (0.7 + Math.random() * 0.6)) : 0;
              const dailyOrders = stats?.todays_orders ? Math.floor(stats.todays_orders * (0.7 + Math.random() * 0.6)) : 0;
              
              trend.push({
                date: date.toISOString().split('T')[0],
                period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dailyRevenue,
                orders: dailyOrders
              });
            }
            
            return trend;
          };
          
          // Generate order status breakdown from stats
          const generateOrderStatusBreakdown = () => {
            const breakdown: any = {};
            
            if (stats?.pending_orders) breakdown.pending = stats.pending_orders;
            if (stats?.preparing_orders) breakdown.preparing = stats.preparing_orders;
            if (stats?.ready_orders) breakdown.ready = stats.ready_orders;
            if (stats?.active_orders) breakdown.confirmed = stats.active_orders;
            
            // Add completed orders if we have total orders
            if (stats?.total_orders) {
              const completedOrders = stats.total_orders - (stats.pending_orders + stats.preparing_orders + stats.ready_orders + stats.active_orders);
              if (completedOrders > 0) {
                breakdown.completed = completedOrders;
              }
            }
            
            return breakdown;
          };
          
          analyticsToSet = {
            revenue_trend: generateRevenueTrend(),
            order_status_breakdown: generateOrderStatusBreakdown(),
            popular_items: menuPerformance || [],
            revenue_by_venue: {}
          };
        }
        
        setAnalyticsData(analyticsToSet);
        
        // Update dashboardData with analytics
        setDashboardData({
          ...data,
          analytics: analyticsToSet
        } as any);
        
        // Set table status data - use real table data from backend
        if ('tables' in data && (data as any).tables && (data as any).tables.length > 0) {
          // Real table data from backend
          const realTables = (data as any).tables.map((table: any) => ({
            id: table.id,
            table_number: table.table_number,
            status: table.status,
            current_order_id: table.current_order_id,
            occupancy_time: table.occupancy_time,
            capacity: table.capacity,
            area_id: table.area_id,
          }));
          setTableStatuses(realTables);
        } else {
          // No table data available
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
  }, [isSuperAdmin, isAdmin, isOperator, user, dateRange]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setLastUpdated(new Date().toISOString());
    setRefreshing(false);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  useEffect(() => {
    // Only proceed if we have a user
    if (!user) {
      setLoading(true);
      return;
    }

    // Load dashboard data for authenticated users
    if (currentVenue?.id || isSuperAdmin) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
    
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [currentVenue?.id, user, loadDashboardData, isSuperAdmin]);

  // Live data polling - refresh every 30 seconds
  useEffect(() => {
    if (!user || !(currentVenue?.id || isSuperAdmin)) {
      return;
    }

    const interval = setInterval(() => {
      loadDashboardData();
      setLastUpdated(new Date().toISOString());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, currentVenue?.id, isSuperAdmin, loadDashboardData]);

  // Don't block UI with loading or error states
  // Show dashboard immediately with empty/default data
  // Error handling moved to inline alert within the dashboard

  // PERMISSION CHECK DISABLED - Allow all users to view dashboard
  // if (!canViewDashboard) {
  //   return (
  //     <Alert severity="error" sx={{ m: 3 }}>
  //       You don't have permission to view the dashboard. Contact your administrator for access.
  //     </Alert>
  //   );
  // }

  return (
    <VenueAssignmentCheck showFullPage={!isSuperAdmin}>
      <Box
        className={className}
        sx={{
          minHeight: '100vh',
          height: 'auto',
          backgroundColor: '#f8fafc',
          padding: 0,
          margin: 0,
          width: '100%',
          overflow: 'visible',
        }}
      >
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: 1 }}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ fontSize: '0.875rem' }}
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
          <Box>
            {/* Tabbed Dashboard */}
            <TabbedDashboard
              stats={stats}
              dashboardData={dashboardData}
              analyticsData={analyticsData}
              menuPerformance={menuPerformance}
              tableStatuses={tableStatuses}
            />
          </Box>
        </Box>
      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;
