import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, alpha,
  CircularProgress, Alert,
} from '@mui/material';
import {
  Business, PersonAdd, Login, Logout as LogoutIcon, Settings,
  CardGiftcard, WorkspacesOutlined, GroupOutlined, AttachMoneyOutlined,
  QrCodeOutlined, CalendarToday, AccessTime,

} from '@mui/icons-material';
import ReactECharts from 'echarts-for-react';
import { useAuth } from '../../contexts/common/Auth';
import { PERMISSIONS } from '../../types/auth/permissions';
import { systemDashboardService, SystemDashboardData } from '../../services/system/dashboard';

// ─── Brand / design tokens ────────────────────────────────────────────────────
const B = {
  primary:  '#1976D2',
  emerald:  '#10b981',
  amber:    '#f59e0b',
  rose:     '#f43f5e',
  sky:      '#0ea5e9',
  violet:   '#8b5cf6',
  dark0:    '#0f172a',
  dark1:    '#1e293b',
  slate:    '#64748b',
  muted:    '#94a3b8',
  border:   '#e2e8f0',
  surface:  '#ffffff',
  bg:       '#f1f5f9',
};

const PALETTE = [B.primary, B.emerald, B.amber, B.violet, B.rose, B.sky];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

// ─── Animated counter ─────────────────────────────────────────────────────────
const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

// ─── Hero stat tile ───────────────────────────────────────────────────────────
interface HeroStatProps {
  label: string; value: number; icon: React.ReactElement;
  change?: string; trend?: 'up' | 'down' | 'neutral';
}
const HeroStat: React.FC<HeroStatProps> = ({ label, value, icon, change, trend }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{
      flex: '1 1 150px',
      px: { xs: 2, sm: 2.5 }, py: 2,
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
        bgcolor: alpha('#ffffff', 0.1), border: `1px solid ${alpha('#ffffff', 0.15)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(144,202,249,0.9)', '& svg': { fontSize: 18 },
      }}>
        {icon}
      </Box>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1, letterSpacing: '-0.03em' }}>
            {animated}
          </Typography>
          {change && (
            <Typography variant="caption" sx={{
              fontWeight: 600, fontSize: '0.7rem',
              color: trend === 'up' ? '#86efac' : trend === 'down' ? '#fca5a5' : 'rgba(144,202,249,0.6)',
            }}>
              {change}
            </Typography>
          )}
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.65)', fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Metric card (secondary stats) ───────────────────────────────────────────

// ─── Chart card wrapper ───────────────────────────────────────────────────────
const ChartCard: React.FC<{ title: string; subtitle?: string; badge?: string; children: React.ReactNode; minH?: number }> =
  ({ title, subtitle, badge, children, minH = 300 }) => (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, border: `1px solid ${B.border}`, bgcolor: B.surface, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: B.dark0, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
            {title}
          </Typography>
          {subtitle && <Typography variant="caption" sx={{ color: B.muted }}>{subtitle}</Typography>}
        </Box>
        {badge && (
          <Chip label={badge} size="small" sx={{ bgcolor: '#f1f5f9', color: B.slate, fontWeight: 600, fontSize: '0.7rem' }} />
        )}
      </Box>
      <Box sx={{ minHeight: minH }}>{children}</Box>
    </Paper>
  );

const SystemDashboard: React.FC = () => {
  const { user, hasBackendPermission } = useAuth();
  const [loading,       setLoading]       = useState(true);
  const [dashboardData, setDashboardData] = useState<SystemDashboardData | null>(null);
  const [error,         setError]         = useState<string | null>(null);

  const userRoleName = useMemo(() => {
    const role = (user as any)?.role;
    return typeof role === 'string' ? role : role?.name || 'Admin';
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDashboardData(await systemDashboardService.getDashboardData());
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Hero stats ───────────────────────────────────────────────────────────────
  const heroStats = useMemo(() => {
    if (!dashboardData) return [];
    const { stats: s, subscription_stats: ss, registration_code_stats: rs } = dashboardData;
    const cards: HeroStatProps[] = [];
    if (hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_VIEW)) cards.push({ label: 'Total Workspaces', value: s.total_workspaces, icon: <WorkspacesOutlined />, change: s.workspace_growth, trend: s.workspace_growth?.startsWith('+') ? 'up' : 'down' });
    if (hasBackendPermission(PERMISSIONS.SYSTEM_USERS_VIEW))      cards.push({ label: 'System Users',     value: s.total_system_users, icon: <GroupOutlined />, change: s.user_growth, trend: s.user_growth?.startsWith('+') ? 'up' : 'down' });
    if (hasBackendPermission(PERMISSIONS.SYSTEM_BILLING_VIEW))    cards.push({ label: 'Active Subs',      value: ss.active_subscriptions, icon: <AttachMoneyOutlined />, change: ss.monthly_recurring_revenue > 0 ? `$${fmt(ss.monthly_recurring_revenue)} MRR` : '', trend: 'neutral' });
    if (hasBackendPermission(PERMISSIONS.SYSTEM_REGISTRATION_VIEW)) cards.push({ label: 'Active Codes',   value: rs.active_codes, icon: <QrCodeOutlined />, change: `${rs.total_uses} uses`, trend: 'neutral' });
    return cards;
  }, [dashboardData, hasBackendPermission]);

  // ── ECharts options ───────────────────────────────────────────────────────────

  // Workspace growth — smooth area line
  const workspaceGrowthOption = useMemo(() => {
    const pts = dashboardData?.workspace_growth ?? [];
    return {
      grid: { top: 10, right: 16, bottom: 30, left: 40, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: B.dark1,
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: any) => `${params[0].name}<br/><b>${params[0].value} workspaces</b>`,
      },
      xAxis: {
        type: 'category',
        data: pts.map(d => d.period),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: B.muted, fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: B.muted, fontSize: 11 },
        splitLine: { lineStyle: { color: B.border, type: 'dashed' } },
        minInterval: 1,
      },
      series: [{
        type: 'line',
        data: pts.map(d => d.count),
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: B.primary, width: 2.5 },
        itemStyle: { color: B.primary, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: alpha(B.primary, 0.3) },
              { offset: 1, color: alpha(B.primary, 0.02) },
            ],
          },
        },
      }],
    };
  }, [dashboardData]);

  // User distribution — donut
  const userDistributionOption = useMemo(() => {
    const pts = dashboardData?.user_distribution ?? [];
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: B.dark1,
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: '{b}: <b>{c}</b> ({d}%)',
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: B.slate, fontSize: 11 },
        icon: 'circle',
      },
      series: [{
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false }, itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' } },
        data: pts.map((d, i) => ({ value: d.count, name: d.role, itemStyle: { color: PALETTE[i % PALETTE.length] } })),
      }],
    };
  }, [dashboardData]);

  // Top onboarders — horizontal bar
  const topOnboardersOption = useMemo(() => {
    const pts = [...(dashboardData?.top_onboarders ?? [])].reverse();
    return {
      grid: { top: 8, right: 24, bottom: 8, left: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        backgroundColor: B.dark1,
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: any) => `${params[0].name}<br/><b>${params[0].value} users onboarded</b>`,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: B.muted, fontSize: 11 },
        splitLine: { lineStyle: { color: B.border, type: 'dashed' } },
        minInterval: 1,
      },
      yAxis: {
        type: 'category',
        data: pts.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: B.slate, fontSize: 12, fontWeight: 500 },
      },
      series: [{
        type: 'bar',
        data: pts.map((d, i) => ({
          value: d.users_onboarded,
          itemStyle: { color: alpha(B.emerald, 0.85 - i * 0.08), borderRadius: [0, 6, 6, 0] },
        })),
        barMaxWidth: 28,
        label: { show: true, position: 'right', color: B.slate, fontSize: 11, fontWeight: 600 },
      }],
    };
  }, [dashboardData]);

  // Subscription breakdown — stacked bar
  const subscriptionOption = useMemo(() => {
    const ss = dashboardData?.subscription_stats;
    if (!ss) return {};
    return {
      grid: { top: 16, right: 16, bottom: 40, left: 16, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: B.dark1,
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontSize: 12 },
      },
      legend: {
        bottom: 0, left: 'center',
        itemWidth: 10, itemHeight: 10,
        textStyle: { color: B.slate, fontSize: 11 },
        icon: 'circle',
      },
      xAxis: { type: 'category', data: ['Subscriptions'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
      yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: B.muted, fontSize: 11 }, splitLine: { lineStyle: { color: B.border, type: 'dashed' } }, minInterval: 1 },
      series: [
        { name: 'Active',   type: 'bar', stack: 'total', data: [ss.active_subscriptions], itemStyle: { color: B.emerald }, barMaxWidth: 60 },
        { name: 'Trial',    type: 'bar', stack: 'total', data: [ss.trial_subscriptions],  itemStyle: { color: B.amber } },
        { name: 'Past Due', type: 'bar', stack: 'total', data: [ss.past_due],             itemStyle: { color: B.rose, borderRadius: [4, 4, 0, 0] } },
      ],
    };
  }, [dashboardData]);

  // ── Activity feed ─────────────────────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    if (!dashboardData?.recent_activity) return [];
    return dashboardData.recent_activity.map(a => {
      let icon: React.ReactElement = <Settings />;
      let color = B.slate;
      switch (a.type) {
        case 'user_created':      icon = <PersonAdd />;    color = B.emerald; break;
        case 'login':             icon = <Login />;        color = B.sky;     break;
        case 'logout':            icon = <LogoutIcon />;   color = B.rose;    break;
        case 'workspace_created': icon = <Business />;     color = B.amber;   break;
        case 'settings_updated':  icon = <Settings />;     color = B.slate;   break;
        case 'code_generated':    icon = <CardGiftcard />; color = B.violet;  break;
      }
      return { ...a, icon, color };
    });
  }, [dashboardData]);

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: B.bg }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: B.primary }} />
          <Typography variant="body2" sx={{ mt: 2, color: B.muted }}>Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: B.bg }}>

      {/* ── Hero — original dark indigo/purple gradient ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${B.dark0} 0%, #1e1b4b 45%, #312e81 100%)`,
        px: { xs: 2.5, sm: 4, md: 6 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, md: 5 },
        position: 'relative', overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: -100, right: -60, width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#6366f1', 0.22)} 0%, transparent 70%)`, pointerEvents: 'none' },
        '&::after':  { content: '""', position: 'absolute', bottom: -80, left: '25%', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#8b5cf6', 0.15)} 0%, transparent 70%)`, pointerEvents: 'none' },
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${alpha('#fff', 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#fff', 0.03)} 1px, transparent 1px)`, backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative' }}>
          {/* Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: alpha('#c7d2fe', 0.75), fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
              SYSTEM CONTROL CENTER
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.4rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Welcome back,&nbsp;
              <Box component="span" sx={{ color: '#a5b4fc' }}>
                {(user as any)?.firstName || userRoleName}
              </Box>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <CalendarToday sx={{ fontSize: 13, color: alpha('#c7d2fe', 0.6) }} />
              <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.6), fontWeight: 500, fontSize: '0.75rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>

          {/* Hero stat tiles */}
          {heroStats.length > 0 && (
            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
              {heroStats.map((s, i) => <HeroStat key={i} {...s} />)}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 1.5, sm: 3, md: 5 }, pt: { xs: 2.5, sm: 3 }, pb: { xs: 4, sm: 6 } }}>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>
        )}

        {/* ── Row 1: Workspace growth (left 8) + right column (donut + activity stacked, 4) ── */}
        <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 2.5 } }}>

          {/* Workspace growth — takes 8 cols on lg, full width below */}
          {hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_VIEW) && (
            <Grid item xs={12} lg={8}>
              <ChartCard title="Workspace Growth" subtitle="New workspaces registered over time" badge="Last 30 days" minH={280}>
                {(dashboardData?.workspace_growth ?? []).length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                    <Typography variant="body2" color="text.secondary">No data available</Typography>
                  </Box>
                ) : (
                  <ReactECharts option={workspaceGrowthOption} style={{ height: 280, width: '100%' }} opts={{ renderer: 'svg' }} />
                )}
              </ChartCard>
            </Grid>
          )}

          {/* Right column — donut + activity stacked vertically */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 }, height: '100%' }}>

              {/* User distribution donut */}
              {hasBackendPermission(PERMISSIONS.SYSTEM_USERS_VIEW) && (
                <ChartCard title="User Distribution" subtitle="Breakdown by role type" minH={0}>
                  {(dashboardData?.user_distribution ?? []).length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                      <Typography variant="body2" color="text.secondary">No data available</Typography>
                    </Box>
                  ) : (
                    <ReactECharts option={userDistributionOption} style={{ height: 220, width: '100%' }} opts={{ renderer: 'svg' }} />
                  )}
                </ChartCard>
              )}

              {/* Activity feed */}
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: `1px solid ${B.border}`, bgcolor: B.surface, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: B.dark0, fontSize: '0.9375rem' }}>Recent Activity</Typography>
                    <Typography variant="caption" sx={{ color: B.muted }}>Last 24 hours</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: 2, bgcolor: alpha(B.emerald, 0.08), border: `1px solid ${alpha(B.emerald, 0.2)}` }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: B.emerald }} />
                    <Typography variant="caption" sx={{ color: B.emerald, fontWeight: 600, fontSize: '0.7rem' }}>Live</Typography>
                  </Box>
                </Box>
                <Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: B.border, borderRadius: 2 } }}>
                  {recentActivity.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AccessTime sx={{ fontSize: 28, color: B.border, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: B.muted }}>No recent activity</Typography>
                    </Box>
                  ) : (
                    recentActivity.map((a, idx) => (
                      <Box key={a.id} sx={{ display: 'flex', position: 'relative' }}>
                        {idx < recentActivity.length - 1 && (
                          <Box sx={{ position: 'absolute', left: 17, top: 44, bottom: 0, width: 2, bgcolor: B.border, zIndex: 0 }} />
                        )}
                        <Box sx={{ display: 'flex', gap: 1.5, py: 1.25, width: '100%', position: 'relative', zIndex: 1 }}>
                          <Box sx={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', bgcolor: alpha(a.color, 0.12), border: `2px solid ${alpha(a.color, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, '& svg': { fontSize: 15 } }}>
                            {a.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: B.dark0, fontSize: '0.8rem' }}>{a.user}</Typography>
                              <Typography variant="body2" sx={{ color: B.slate, fontSize: '0.8rem' }}>{a.action}</Typography>
                              {a.target && (
                                <Typography variant="caption" sx={{ color: B.primary, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(B.primary, 0.08), px: 0.75, py: 0.125, borderRadius: 1 }}>
                                  {a.target}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: B.muted, fontSize: '0.68rem' }}>{a.time}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>

            </Box>
          </Grid>
        </Grid>

        {/* ── Row 2: Top onboarders + Subscription breakdown side by side ── */}
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>

          {hasBackendPermission(PERMISSIONS.SYSTEM_USERS_VIEW) && (
            <Grid item xs={12} md={6}>
              <ChartCard title="Top Onboarders" subtitle="Users onboarded per agent" minH={0}>
                {(dashboardData?.top_onboarders ?? []).length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                    <Typography variant="body2" color="text.secondary">No data available</Typography>
                  </Box>
                ) : (
                  <ReactECharts
                    option={topOnboardersOption}
                    style={{ height: Math.max(220, (dashboardData?.top_onboarders?.length ?? 0) * 44 + 20), width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}
              </ChartCard>
            </Grid>
          )}

          {hasBackendPermission(PERMISSIONS.SYSTEM_BILLING_VIEW) && (
            <Grid item xs={12} md={6}>
              <ChartCard title="Subscription Breakdown" subtitle="Active vs trial vs past due" minH={0}>
                {!dashboardData?.subscription_stats ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                    <Typography variant="body2" color="text.secondary">No data available</Typography>
                  </Box>
                ) : (
                  <>
                    <ReactECharts option={subscriptionOption} style={{ height: 200, width: '100%' }} opts={{ renderer: 'svg' }} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {[
                        { label: 'Active',   value: dashboardData.subscription_stats.active_subscriptions, color: B.emerald },
                        { label: 'Trial',    value: dashboardData.subscription_stats.trial_subscriptions,  color: B.amber },
                        { label: 'Past Due', value: dashboardData.subscription_stats.past_due,             color: B.rose },
                      ].map(({ label, value, color }) => (
                        <Box key={label} sx={{ flex: 1, textAlign: 'center', px: 1, py: 0.75, borderRadius: 2, bgcolor: alpha(color, 0.07), border: `1px solid ${alpha(color, 0.2)}` }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color, fontSize: '1rem' }}>{value}</Typography>
                          <Typography variant="caption" sx={{ color: B.muted, fontSize: '0.68rem' }}>{label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </ChartCard>
            </Grid>
          )}

        </Grid>
      </Box>
    </Box>
  );
};


export default SystemDashboard;