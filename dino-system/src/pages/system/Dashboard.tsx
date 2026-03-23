import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  alpha,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Business,
  PersonAdd,
  Login,
  Logout as LogoutIcon,
  Settings,
  CardGiftcard,
  WorkspacesOutlined,
  GroupOutlined,
  AttachMoneyOutlined,
  QrCodeOutlined,
  Refresh,
  CalendarToday,
  AccessTime,
  TrendingUp,
  CheckCircleOutline,
  PeopleOutline,
  ReceiptLong,
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

// â”€â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLORS = {
  indigo:  '#6366f1',
  emerald: '#10b981',
  amber:   '#f59e0b',
  violet:  '#8b5cf6',
  rose:    '#f43f5e',
  sky:     '#0ea5e9',
  dark0:   '#0f172a',
  dark1:   '#1e293b',
  dark2:   '#334155',
  slate:   '#64748b',
  muted:   '#94a3b8',
  border:  '#e2e8f0',
  surface: '#ffffff',
  bg:      '#f1f5f9',
};

const CHART_COLORS = [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.violet, COLORS.rose, COLORS.sky];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Animated counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

// â”€â”€â”€ Hero stat tile (inside the dark hero) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface HeroStatProps {
  label: string;
  value: number;
  icon: React.ReactElement;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const HeroStat: React.FC<HeroStatProps> = ({ label, value, icon, change, trend }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{
      flex: '1 1 150px',
      px: 2.5, py: 2,
      borderRadius: 2.5,
      bgcolor: alpha('#ffffff', 0.07),
      border: `1px solid ${alpha('#ffffff', 0.12)}`,
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', gap: 2,
      transition: 'background-color 0.2s',
      '&:hover': { bgcolor: alpha('#ffffff', 0.11) },
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
        bgcolor: alpha('#ffffff', 0.1),
        border: `1px solid ${alpha('#ffffff', 0.15)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: alpha('#c7d2fe', 0.9),
        '& svg': { fontSize: 18 },
      }}>
        {icon}
      </Box>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{
            fontWeight: 700, color: '#ffffff',
            fontSize: { xs: '1.35rem', md: '1.6rem' },
            lineHeight: 1, letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {animated}
          </Typography>
          {change && trend === 'up' && (
            <Typography variant="caption" sx={{ color: '#86efac', fontWeight: 600, fontSize: '0.7rem' }}>
              {change}
            </Typography>
          )}
          {change && trend === 'down' && (
            <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.7rem' }}>
              {change}
            </Typography>
          )}
          {change && trend === 'neutral' && (
            <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.6), fontWeight: 500, fontSize: '0.7rem' }}>
              {change}
            </Typography>
          )}
        </Box>
        <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.65), fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};




interface SecondaryStatProps {
  label: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
}

const SecondaryStat: React.FC<SecondaryStatProps> = ({ label, value, icon, color }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      py: 1.25,
      px: 1.5,
      borderRadius: 2,
      bgcolor: '#f8fafc',
      border: `1px solid ${COLORS.border}`,
    }}
  >
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.5,
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: alpha(color, 0.7),
        flexShrink: 0,
        '& svg': { fontSize: 14 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.dark1, fontSize: '0.8125rem', lineHeight: 1.2 }}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </Typography>
      <Typography variant="caption" sx={{ color: COLORS.muted, fontSize: '0.68rem' }}>
        {label}
      </Typography>
    </Box>
  </Box>
);


// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SystemDashboard: React.FC = () => {
  const { user, getPermissionsList } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<SystemDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const userRoleName = useMemo(() => {
    const role = (user as any)?.role;
    return typeof role === 'string' ? role : role?.name || 'User';
  }, [user]);

  const isPrivilegedRole = useMemo(() => {
    const role = (user as any)?.role;
    const roleName = (typeof role === 'string' ? role : role?.name || '').toLowerCase();
    return ['admin', 'owner', 'manager'].includes(roleName);
  }, [user]);

  const hasPermission = useCallback((resource: string): boolean => {
    if (isPrivilegedRole) return true;
    const list = getPermissionsList();
    return list.some(p => p === '*' || p.startsWith(resource));
  }, [isPrivilegedRole, getPermissionsList]);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await systemDashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // â”€â”€ Hero stat tiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const stats = useMemo(() => {
    if (!dashboardData) return [];
    const { stats: s, subscription_stats: ss, registration_code_stats: rs } = dashboardData;
    const cards: { label: string; value: number; icon: React.ReactElement; change: string; trend: 'up' | 'down' | 'neutral' }[] = [];

    if (hasPermission('system.workspaces')) {
      cards.push({
        label: 'Total Workspaces',
        value: s.total_workspaces,
        icon: <WorkspacesOutlined />,
        change: s.workspace_growth,
        trend: s.workspace_growth.startsWith('+') ? 'up' : 'down',
      });
    }
    if (hasPermission('system.users')) {
      cards.push({
        label: 'System Users',
        value: s.total_system_users,
        icon: <GroupOutlined />,
        change: s.user_growth,
        trend: s.user_growth.startsWith('+') ? 'up' : 'down',
      });
    }
    if (hasPermission('system.billing')) {
      cards.push({
        label: 'Active Subscriptions',
        value: ss.active_subscriptions,
        icon: <AttachMoneyOutlined />,
        change: ss.monthly_recurring_revenue > 0 ? `$${formatNumber(ss.monthly_recurring_revenue)} MRR` : '',
        trend: 'neutral',
      });
    }
    if (hasPermission('system.registration')) {
      cards.push({
        label: 'Active Codes',
        value: rs.active_codes,
        icon: <QrCodeOutlined />,
        change: `${rs.total_uses} uses`,
        trend: 'neutral',
      });
    }

    return cards;
  }, [dashboardData, hasPermission]);

  // â”€â”€ Secondary stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const secondaryStats = useMemo(() => {
    if (!dashboardData) return [];
    const { stats: s, subscription_stats: ss } = dashboardData;
    const items = [];

    if (hasPermission('system.workspaces')) {
      items.push({ label: 'Active Workspaces', value: s.active_workspaces, icon: <CheckCircleOutline />, color: COLORS.emerald });
      items.push({ label: 'New (30d)', value: s.workspaces_last_30_days, icon: <TrendingUp />, color: COLORS.indigo });
    }
    if (hasPermission('system.users')) {
      items.push({ label: 'App Users', value: s.total_app_users, icon: <PeopleOutline />, color: COLORS.violet });
      items.push({ label: 'New Users (30d)', value: s.users_last_30_days, icon: <PersonAdd />, color: COLORS.sky });
    }
    if (hasPermission('system.billing')) {
      items.push({ label: 'Past Due', value: ss.past_due, icon: <ReceiptLong />, color: COLORS.rose });
      items.push({ label: 'Trials', value: ss.trial_subscriptions, icon: <AttachMoneyOutlined />, color: COLORS.amber });
    }

    return items;
  }, [dashboardData, hasPermission]);

  // â”€â”€ Chart data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const workspaceGrowthData = useMemo(() => {
    const pts = dashboardData?.workspace_growth ?? [];
    return {
      labels: pts.map(d => d.period),
      datasets: [{
        label: 'Workspaces',
        data: pts.map(d => d.count),
        borderColor: COLORS.indigo,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return alpha(COLORS.indigo, 0.15);
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, alpha(COLORS.indigo, 0.35));
          gradient.addColorStop(0.6, alpha(COLORS.indigo, 0.08));
          gradient.addColorStop(1, alpha(COLORS.indigo, 0));
          return gradient;
        },
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: COLORS.indigo,
        pointBorderColor: COLORS.surface,
        pointBorderWidth: 2,
        borderWidth: 2.5,
      }],
    };
  }, [dashboardData]);

  const userDistributionData = useMemo(() => {
    const pts = dashboardData?.user_distribution ?? [];
    return {
      labels: pts.map(d => d.role),
      datasets: [{
        data: pts.map(d => d.count),
        backgroundColor: CHART_COLORS.slice(0, pts.length),
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  }, [dashboardData]);

  const topOnboardersData = useMemo(() => {
    const pts = dashboardData?.top_onboarders ?? [];
    return {
      labels: pts.map(d => d.name),
      datasets: [{
        label: 'Users Onboarded',
        data: pts.map(d => d.users_onboarded),
        backgroundColor: pts.map((_, i) => alpha(COLORS.emerald, 0.75 - i * 0.1)),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [dashboardData]);

  // â”€â”€ Chart options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tooltipDefaults = {
    backgroundColor: COLORS.dark1,
    titleColor: '#f1f5f9',
    bodyColor: COLORS.muted,
    borderColor: COLORS.dark2,
    borderWidth: 1,
    padding: 12,
    cornerRadius: 8,
    displayColors: false,
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          title: (items) => items[0]?.label ?? '',
          label: (item) => ` ${item.formattedValue} workspaces`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: COLORS.muted, font: { size: 11 }, maxRotation: 0 },
      },
      y: {
        grid: { color: alpha(COLORS.border, 0.8), lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: { color: COLORS.muted, font: { size: 11 }, padding: 8 },
        beginAtZero: true,
      },
    },
  };

  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
          color: COLORS.slate,
          font: { size: 12 },
        },
      },
      tooltip: {
        ...tooltipDefaults,
        displayColors: true,
        callbacks: {
          label: (item) => ` ${item.label}: ${item.formattedValue}`,
        },
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
        ...tooltipDefaults,
        callbacks: {
          label: (item) => ` ${item.formattedValue} users onboarded`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: alpha(COLORS.border, 0.8) },
        border: { display: false },
        ticks: { color: COLORS.muted, font: { size: 11 } },
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: COLORS.slate, font: { size: 12, weight: 500 } },
      },
    },
  };

  // â”€â”€ Activity feed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const recentActivity = useMemo(() => {
    if (!dashboardData?.recent_activity) return [];
    return dashboardData.recent_activity.map(activity => {
      let icon: React.ReactElement = <Settings />;
      let color = COLORS.slate;

      switch (activity.type) {
        case 'user_created':    icon = <PersonAdd />;    color = COLORS.emerald; break;
        case 'login':           icon = <Login />;        color = COLORS.sky;     break;
        case 'logout':          icon = <LogoutIcon />;   color = COLORS.rose;    break;
        case 'workspace_created': icon = <Business />;   color = COLORS.amber;   break;
        case 'settings_updated':  icon = <Settings />;   color = COLORS.slate;   break;
        case 'code_generated':    icon = <CardGiftcard />; color = COLORS.violet; break;
      }

      return { ...activity, icon, color };
    });
  }, [dashboardData]);

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: COLORS.bg }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: COLORS.indigo }} />
          <Typography variant="body2" sx={{ mt: 2, color: COLORS.muted }}>Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: COLORS.bg }}>

      {/* â”€â”€ Hero Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.dark0} 0%, #1e1b4b 45%, #312e81 100%)`,
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100, right: -60,
            width: 360, height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.indigo, 0.22)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80, left: '25%',
            width: 280, height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.violet, 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${alpha('#ffffff', 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#ffffff', 0.03)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative' }}>
          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="overline" sx={{ color: alpha('#c7d2fe', 0.75), fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
                SYSTEM CONTROL CENTER
              </Typography>
              <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                Welcome back,&nbsp;
                <Box component="span" sx={{ color: '#a5b4fc' }}>
                  {user?.firstName || userRoleName}
                </Box>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha('#c7d2fe', 0.6) }} />
                <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.6), fontWeight: 500, fontSize: '0.75rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>

            <MuiTooltip title="Refresh dashboard">
              <IconButton
                onClick={() => loadData(true)}
                disabled={refreshing}
                sx={{
                  mt: 1,
                  color: alpha('#c7d2fe', 0.8),
                  bgcolor: alpha('#ffffff', 0.1),
                  border: `1px solid ${alpha('#ffffff', 0.15)}`,
                  '&:hover': { bgcolor: alpha('#ffffff', 0.18) },
                  '&:disabled': { color: alpha('#c7d2fe', 0.3) },
                }}
              >
                {refreshing
                  ? <CircularProgress size={18} sx={{ color: 'inherit' }} />
                  : <Refresh />
                }
              </IconButton>
            </MuiTooltip>
          </Box>

          {/* Hero stat tiles */}
          {stats.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {stats.map((stat, i) => (
                <HeroStat
                  key={i}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  change={stat.change}
                  trend={stat.trend}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* â”€â”€ Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: 4, pb: 6 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* â”€â”€ Secondary Stats Strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {secondaryStats.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.surface,
              mb: 2.5,
            }}
          >
            <Grid container spacing={1.5}>
              {secondaryStats.map((s, i) => (
                <Grid item xs={6} sm={4} md={2} key={i}>
                  <SecondaryStat label={s.label} value={s.value} icon={s.icon} color={s.color} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* â”€â”€ Charts Row 1: Line + Doughnut â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          {hasPermission('system.workspaces') && (
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.surface,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.dark0, fontSize: '0.9375rem' }}>
                      Workspace Growth
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.muted }}>
                      New workspaces registered over time
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.indigo }} />
                    <Typography variant="caption" sx={{ color: COLORS.slate, fontWeight: 600 }}>Workspaces</Typography>
                    <Chip
                      label="Last 30 days"
                      size="small"
                      sx={{ bgcolor: '#f1f5f9', color: COLORS.slate, fontWeight: 600, fontSize: '0.7rem', ml: 1 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ height: 260 }}>
                  <Line data={workspaceGrowthData} options={lineChartOptions} />
                </Box>
              </Paper>
            </Grid>
          )}

          {hasPermission('system.users') && (
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.surface,
                  height: '100%',
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.dark0, fontSize: '0.9375rem' }}>
                    User Distribution
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.muted }}>
                    Breakdown by role type
                  </Typography>
                </Box>
                <Box sx={{ height: 260 }}>
                  <Doughnut data={userDistributionData} options={doughnutChartOptions} />
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* â”€â”€ Charts Row 2: Bar + Activity Feed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Grid container spacing={2.5}>
          {hasPermission('system.users') && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.surface,
                  height: '100%',
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.dark0, fontSize: '0.9375rem' }}>
                    Top Onboarders
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.muted }}>
                    Users onboarded per agent
                  </Typography>
                </Box>
                <Box sx={{ height: 280 }}>
                  <Bar data={topOnboardersData} options={barChartOptions} />
                </Box>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                bgcolor: COLORS.surface,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.dark0, fontSize: '0.9375rem' }}>
                    Recent Activity
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.muted }}>
                    Last 24 hours
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: alpha(COLORS.emerald, 0.08),
                    border: `1px solid ${alpha(COLORS.emerald, 0.2)}`,
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.emerald }} />
                  <Typography variant="caption" sx={{ color: COLORS.emerald, fontWeight: 600, fontSize: '0.7rem' }}>
                    Live
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  maxHeight: 320,
                  overflowY: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: COLORS.border, borderRadius: 2 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                }}
              >
                {recentActivity.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <AccessTime sx={{ fontSize: 32, color: COLORS.border, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: COLORS.muted }}>
                      No recent activity
                    </Typography>
                  </Box>
                ) : (
                  recentActivity.map((activity, idx) => (
                    <Box key={activity.id} sx={{ display: 'flex', gap: 0, position: 'relative' }}>
                      {/* Timeline connector */}
                      {idx < recentActivity.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 17,
                            top: 44,
                            bottom: 0,
                            width: 2,
                            bgcolor: COLORS.border,
                            zIndex: 0,
                          }}
                        />
                      )}

                      <Box sx={{ display: 'flex', gap: 2, py: 1.25, width: '100%', position: 'relative', zIndex: 1 }}>
                        {/* Icon */}
                        <Box sx={{ flexShrink: 0 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: alpha(activity.color, 0.12),
                              border: `2px solid ${alpha(activity.color, 0.25)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: activity.color,
                              '& svg': { fontSize: 16 },
                            }}
                          >
                            {activity.icon}
                          </Box>
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.dark0, fontSize: '0.8125rem' }}>
                              {activity.user}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.slate, fontSize: '0.8125rem' }}>
                              {activity.action}
                            </Typography>
                            {activity.target && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: COLORS.indigo,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  bgcolor: alpha(COLORS.indigo, 0.08),
                                  px: 0.75,
                                  py: 0.125,
                                  borderRadius: 1,
                                }}
                              >
                                {activity.target}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: COLORS.muted, fontSize: '0.7rem' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

      </Box>
    </Box>
  );
};

export default SystemDashboard;