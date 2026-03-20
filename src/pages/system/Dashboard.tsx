import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  alpha,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business,
  People,
  Payment,
  CardGiftcard,
  PersonAdd,
  Login,
  Logout as LogoutIcon,
  Settings,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { systemDashboardService, SystemDashboardData } from '../../services/system/dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SystemDashboard: React.FC = () => {
  const { user, getPermissionsList, hasBackendPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<SystemDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get user role name for display
  const userRoleName = useMemo(() => {
    const role = (user as any)?.role;
    return typeof role === 'string' ? role : role?.name || 'User';
  }, [user]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await systemDashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Check if user has any permission matching the given resource prefix.
  // Uses resolved dot-notation names from Auth context (e.g. "system.workspaces.read").
  // Privileged roles (admin, owner, manager) bypass the permission check entirely.
  const isPrivilegedRole = useMemo(() => {
    const role = (user as any)?.role;
    const roleName = (typeof role === 'string' ? role : role?.name || '').toLowerCase();
    return ['admin', 'owner', 'manager'].includes(roleName);
  }, [user]);

  const hasPermission = (resource: string): boolean => {
    if (isPrivilegedRole) return true;
    const list = getPermissionsList();
    return list.some(p => p === '*' || p.startsWith(resource));
  };

  const stats = useMemo(() => {
    if (!dashboardData) return [];

    const baseStats = [];
    const { stats: apiStats, subscription_stats, registration_code_stats } = dashboardData;

    if (hasPermission('system.workspaces')) {
      baseStats.push({
        label: 'Total Workspaces',
        value: apiStats.total_workspaces.toString(),
        icon: <Business />,
        change: apiStats.workspace_growth,
        trend: apiStats.workspace_growth.startsWith('+') ? 'up' : 'down',
      });
    }
    if (hasPermission('system.users')) {
      baseStats.push({
        label: 'System Users',
        value: apiStats.total_system_users.toString(),
        icon: <People />,
        change: apiStats.user_growth,
        trend: apiStats.user_growth.startsWith('+') ? 'up' : 'down',
      });
    }
    if (hasPermission('system.billing')) {
      baseStats.push({
        label: 'Active Subscriptions',
        value: subscription_stats.active_subscriptions.toString(),
        icon: <Payment />,
        change: '+5%',
        trend: 'up',
      });
    }
    if (hasPermission('system.registration')) {
      baseStats.push({
        label: 'Active Codes',
        value: registration_code_stats.active_codes.toString(),
        icon: <CardGiftcard />,
        change: `${registration_code_stats.total_uses} uses`,
        trend: 'up',
      });
    }

    return baseStats;
  }, [dashboardData, getPermissionsList]);

  // Chart data from API
  const workspaceGrowthData = useMemo(() => {
    if (!dashboardData?.workspace_growth) {
      return {
        labels: [],
        datasets: [{
          label: 'Workspaces',
          data: [],
          borderColor: '#0f172a',
          backgroundColor: alpha('#0f172a', 0.1),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0f172a',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }],
      };
    }

    return {
      labels: dashboardData.workspace_growth.map(d => d.period),
      datasets: [{
        label: 'Workspaces',
        data: dashboardData.workspace_growth.map(d => d.count),
        borderColor: '#0f172a',
        backgroundColor: alpha('#0f172a', 0.1),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0f172a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }],
    };
  }, [dashboardData]);

  const userDistributionData = useMemo(() => {
    if (!dashboardData?.user_distribution) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }],
      };
    }

    const colors = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    
    return {
      labels: dashboardData.user_distribution.map(d => d.role),
      datasets: [{
        data: dashboardData.user_distribution.map(d => d.count),
        backgroundColor: colors.slice(0, dashboardData.user_distribution.length),
        borderWidth: 0,
      }],
    };
  }, [dashboardData]);

  const topOnboardersData = useMemo(() => {
    if (!dashboardData?.top_onboarders) {
      return {
        labels: [],
        datasets: [{
          label: 'Users Onboarded',
          data: [],
          backgroundColor: '#0f172a',
          borderRadius: 4,
        }],
      };
    }

    return {
      labels: dashboardData.top_onboarders.map(d => d.name),
      datasets: [{
        label: 'Users Onboarded',
        data: dashboardData.top_onboarders.map(d => d.users_onboarded),
        backgroundColor: '#0f172a',
        borderRadius: 4,
      }],
    };
  }, [dashboardData]);

  // Chart options
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: alpha('#ffffff', 0.95),
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: alpha('#e2e8f0', 0.5) },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: alpha('#ffffff', 0.95),
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: alpha('#ffffff', 0.95),
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: alpha('#e2e8f0', 0.5) },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  // Recent activity from API with icons
  const recentActivity = useMemo(() => {
    if (!dashboardData?.recent_activity) return [];

    return dashboardData.recent_activity.map(activity => {
      let icon = <Settings />;
      let color = '#64748b';

      switch (activity.type) {
        case 'user_created':
          icon = <PersonAdd />;
          color = '#10b981';
          break;
        case 'login':
          icon = <Login />;
          color = '#3b82f6';
          break;
        case 'logout':
          icon = <LogoutIcon />;
          color = '#ef4444';
          break;
        case 'workspace_created':
          icon = <Business />;
          color = '#f59e0b';
          break;
        case 'settings_updated':
          icon = <Settings />;
          color = '#64748b';
          break;
        case 'code_generated':
          icon = <CardGiftcard />;
          color = '#8b5cf6';
          break;
      }

      return {
        ...activity,
        icon,
        color,
      };
    });
  }, [dashboardData]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            System Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Welcome back, {userRoleName}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ color: '#0f172a' }}>{stat.icon}</Box>
                    <Chip
                      icon={
                        stat.trend === 'up' ? (
                          <TrendingUp sx={{ fontSize: 14 }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 14 }} />
                        )
                      }
                      label={stat.change}
                      size="small"
                      sx={{
                        bgcolor: alpha(stat.trend === 'up' ? '#10b981' : '#ef4444', 0.1),
                        color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#0f172a' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Workspace Growth Chart */}
          {hasPermission('system.workspaces') && (
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                    Workspace Growth
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={workspaceGrowthData} options={lineChartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* User Distribution Chart */}
          {hasPermission('system.users') && (
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                    User Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={userDistributionData} options={doughnutChartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Top Onboarders Chart */}
          {hasPermission('system.users') && (
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                    Top User Onboarders
                  </Typography>
                  <Box sx={{ height: 300, flexGrow: 0 }}>
                    <Bar data={topOnboardersData} options={barChartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Last 24 Hours Activity */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                  Last 24 Hours Activity
                </Typography>
                <List sx={{ height: 300, overflowY: 'auto', flexGrow: 0 }}>
                  {recentActivity.map((activity) => (
                    <ListItem
                      key={activity.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: '1px solid #f1f5f9',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(activity.color, 0.1),
                            color: activity.color,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {activity.user}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.action}
                            </Typography>
                            {activity.target && (
                              <Chip
                                label={activity.target}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: alpha('#0f172a', 0.05),
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SystemDashboard;
