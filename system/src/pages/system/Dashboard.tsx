import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, alpha,
  Alert,
} from '@mui/material';
import {
  Business, PersonAdd, Login, Logout as LogoutIcon, Settings,
  CardGiftcard, WorkspacesOutlined, GroupOutlined, AttachMoneyOutlined,
  QrCodeOutlined, CalendarToday, AccessTime,
} from '@mui/icons-material';
import ReactECharts from 'echarts-for-react';
import { useAuth } from '../../contexts/common/Auth';
import { systemDashboardService, SystemDashboardData } from '../../services/system/dashboard';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   '#00A6CA',
  textPri:   '#1C1C1E',
  textSec:   '#666666',
  textMuted: '#999999',
  border:    '#e0e0e0',
  borderLt:  '#f2f2f2',
  surface:   '#ffffff',
  bg:        '#f8fafc',
  success:   '#008A00',
  error:     '#EB0000',
  warning:   '#FF871F',
  // chart palette
  emerald:   '#10b981',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  sky:       '#0ea5e9',
  violet:    '#8b5cf6',
  dark1:     '#1e293b',
  slate:     '#64748b',
  muted:     '#94a3b8',
};

const PALETTE = [T.primary, T.emerald, T.amber, T.violet, T.rose, T.sky];

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

// ─── Stat card (Vanguard style) ───────────────────────────────────────────────
interface HeroStatProps {
  label: string;
  value: number;
  icon: React.ReactElement;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<HeroStatProps> = ({ label, value, icon, change, trend }) => {
  const animated = useCountUp(value);
  const trendColor =
    trend === 'up'   ? T.success :
    trend === 'down' ? T.error   : T.textMuted;

  return (
    <Box sx={{
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '12px',
      p: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
    }}>
      {/* Icon box */}
      <Box sx={{
        width: 40, height: 40, borderRadius: '8px', flexShrink: 0,
        bgcolor: 'rgba(0,166,202,0.08)',
        border: '1px solid rgba(0,166,202,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.primary,
        '& svg': { fontSize: 20 },
      }}>
        {icon}
      </Box>

      {/* Text */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 24, color: T.textPri, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {animated}
          </Typography>
          {change && (
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', color: trendColor }}>
              {change}
            </Typography>
          )}
        </Box>
        <Typography sx={{ fontSize: 12, color: T.textSec, mt: 0.25, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Chart card wrapper ───────────────────────────────────────────────────────
const ChartCard: React.FC<{ title: string; subtitle?: string; badge?: string; children: React.ReactNode; minH?: number }> =
  ({ title, subtitle, badge, children, minH = 300 }) => (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: '12px', border: `1px solid ${T.border}`, bgcolor: T.surface, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: T.textPri, fontSize: 15 }}>
            {title}
          </Typography>
          {subtitle && <Typography variant="caption" sx={{ color: T.textMuted }}>{subtitle}</Typography>}
        </Box>
        {badge && (
          <Chip label={badge} size="small" sx={{ bgcolor: '#f4f4f4', color: T.textSec, fontWeight: 600, fontSize: '0.7rem' }} />
        )}
      </Box>
      <Box sx={{ minHeight: minH }}>{children}</Box>
    </Paper>
  );

const SystemDashboard: React.FC = () => {
  const { user, userPermissions } = useAuth();
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

  const hasPerm = useCallback((resource: string, action: string): boolean => {
    const perms: any[] = (userPermissions as any)?.permissions ?? [];
    return perms.some((p: any) => p?.resource === resource && p?.action === action);
  }, [userPermissions]);

  // ── Hero stats ───────────────────────────────────────────────────────────────
  const heroStats = useMemo(() => {
    if (!dashboardData) return [];
    const s  = dashboardData.stats                  ?? {};
    const ss = dashboardData.subscription_stats     ?? {};
    const rs = dashboardData.registration_code_stats ?? {};
    const cards: HeroStatProps[] = [];
    if (hasPerm('workspaces', 'view'))    cards.push({ label: 'Total Workspaces', value: s.total_workspaces,       icon: <WorkspacesOutlined />, change: s.workspace_growth,                                                    trend: s.workspace_growth?.startsWith('+') ? 'up' : 'down' });
    if (hasPerm('users', 'view'))         cards.push({ label: 'System Users',     value: s.total_system_users,      icon: <GroupOutlined />,      change: s.user_growth,                                                         trend: s.user_growth?.startsWith('+') ? 'up' : 'down' });
    if (hasPerm('billing', 'view'))       cards.push({ label: 'Active Subs',      value: ss.active_subscriptions,   icon: <AttachMoneyOutlined />, change: ss.monthly_recurring_revenue > 0 ? `$${fmt(ss.monthly_recurring_revenue)} MRR` : '', trend: 'neutral' });
    if (hasPerm('referrals', 'view'))  cards.push({ label: 'Active Codes',     value: rs.active_codes,           icon: <QrCodeOutlined />,     change: `${rs.total_uses ?? 0} uses`,                                          trend: 'neutral' });
    return cards;
  }, [dashboardData, hasPerm]);

  // ── ECharts options ───────────────────────────────────────────────────────────

  // Workspace growth — smooth area line
  const workspaceGrowthOption = useMemo(() => {
    const pts = dashboardData?.workspace_growth ?? [];
    return {
      grid: { top: 10, right: 16, bottom: 30, left: 40, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: T.dark1,
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
        axisLabel: { color: T.muted, fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: T.muted, fontSize: 11 },
        splitLine: { lineStyle: { color: T.border, type: 'dashed' } },
        minInterval: 1,
      },
      series: [{
        type: 'line',
        data: pts.map(d => d.count),
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: T.primary, width: 2.5 },
        itemStyle: { color: T.primary, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: alpha(T.primary, 0.3) },
              { offset: 1, color: alpha(T.primary, 0.02) },
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
        backgroundColor: T.dark1,
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
        textStyle: { color: T.slate, fontSize: 11 },
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
        backgroundColor: T.dark1,
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: any) => `${params[0].name}<br/><b>${params[0].value} users onboarded</b>`,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: T.muted, fontSize: 11 },
        splitLine: { lineStyle: { color: T.border, type: 'dashed' } },
        minInterval: 1,
      },
      yAxis: {
        type: 'category',
        data: pts.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: T.slate, fontSize: 12, fontWeight: 500 },
      },
      series: [{
        type: 'bar',
        data: pts.map((d, i) => ({
          value: d.users_onboarded,
          itemStyle: { color: alpha(T.emerald, 0.85 - i * 0.08), borderRadius: [0, 6, 6, 0] },
        })),
        barMaxWidth: 28,
        label: { show: true, position: 'right', color: T.slate, fontSize: 11, fontWeight: 600 },
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
        backgroundColor: T.dark1,
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f1f5f9', fontSize: 12 },
      },
      legend: {
        bottom: 0, left: 'center',
        itemWidth: 10, itemHeight: 10,
        textStyle: { color: T.slate, fontSize: 11 },
        icon: 'circle',
      },
      xAxis: { type: 'category', data: ['Subscriptions'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
      yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: T.muted, fontSize: 11 }, splitLine: { lineStyle: { color: T.border, type: 'dashed' } }, minInterval: 1 },
      series: [
        { name: 'Active',   type: 'bar', stack: 'total', data: [ss.active_subscriptions], itemStyle: { color: T.emerald }, barMaxWidth: 60 },
        { name: 'Trial',    type: 'bar', stack: 'total', data: [ss.trial_subscriptions],  itemStyle: { color: T.amber } },
        { name: 'Past Due', type: 'bar', stack: 'total', data: [ss.past_due],             itemStyle: { color: T.rose, borderRadius: [4, 4, 0, 0] } },
      ],
    };
  }, [dashboardData]);

  // ── Activity feed ─────────────────────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    if (!dashboardData?.recent_activity) return [];
    return dashboardData.recent_activity.map(a => {
      let icon: React.ReactElement = <Settings />;
      let color = T.slate;
      switch (a.type) {
        case 'user_created':      icon = <PersonAdd />;    color = T.emerald;  break;
        case 'login':             icon = <Login />;        color = T.sky;      break;
        case 'logout':            icon = <LogoutIcon />;   color = T.rose;     break;
        case 'workspace_created': icon = <Business />;     color = T.amber;    break;
        case 'settings_updated':  icon = <Settings />;     color = T.slate;    break;
        case 'code_generated':    icon = <CardGiftcard />; color = T.violet;   break;
      }
      return { ...a, icon, color };
    });
  }, [dashboardData]);

  // ── Loading ───────────────────────────────────────────────────────────────────

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: T.bg }}>

      {/* ── Page header ── */}
      <Box sx={{
        bgcolor: T.surface,
        px: { xs: 2, sm: '32px' },
        pt: '24px',
        pb: '20px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: 20, lineHeight: 1.3 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: T.textSec, mt: 0.5 }}>
            Welcome back, {(user as any)?.firstName || userRoleName}
          </Typography>
        </Box>

        {/* Date chip */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          bgcolor: '#f4f4f4', borderRadius: '8px',
          px: 1.5, py: 0.75,
        }}>
          <CalendarToday sx={{ fontSize: 14, color: T.textSec }} />
          <Typography sx={{ fontSize: 12, color: T.textSec, fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: { xs: 2, sm: 3 }, pb: { xs: 4, sm: 6 } }}>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>
        )}

        {/* ── Stat cards row ── */}
        {heroStats.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {heroStats.map((s, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <StatCard {...s} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* ── Row 1: Workspace growth (left 8) + right column (donut + activity stacked, 4) ── */}
        <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 2.5 } }}>

          {/* Workspace growth */}
          {hasPerm('workspaces', 'view') && (
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
              {hasPerm('users', 'view') && (
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
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '12px', border: `1px solid ${T.border}`, bgcolor: T.surface, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: T.textPri, fontSize: 15 }}>Recent Activity</Typography>
                    <Typography variant="caption" sx={{ color: T.textMuted }}>Last 24 hours</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: 2, bgcolor: alpha(T.success, 0.08), border: `1px solid ${alpha(T.success, 0.2)}` }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: T.success }} />
                    <Typography variant="caption" sx={{ color: T.success, fontWeight: 600, fontSize: '0.7rem' }}>Live</Typography>
                  </Box>
                </Box>
                <Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: T.border, borderRadius: 2 } }}>
                  {recentActivity.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AccessTime sx={{ fontSize: 28, color: T.border, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: T.textMuted }}>No recent activity</Typography>
                    </Box>
                  ) : (
                    recentActivity.map((a, idx) => (
                      <Box key={a.id} sx={{ display: 'flex', position: 'relative' }}>
                        {idx < recentActivity.length - 1 && (
                          <Box sx={{ position: 'absolute', left: 17, top: 44, bottom: 0, width: 2, bgcolor: T.border, zIndex: 0 }} />
                        )}
                        <Box sx={{ display: 'flex', gap: 1.5, py: 1.25, width: '100%', position: 'relative', zIndex: 1 }}>
                          <Box sx={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', bgcolor: alpha(a.color, 0.12), border: `2px solid ${alpha(a.color, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, '& svg': { fontSize: 15 } }}>
                            {a.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: T.textPri, fontSize: '0.8rem' }}>{a.user}</Typography>
                              <Typography variant="body2" sx={{ color: T.textSec, fontSize: '0.8rem' }}>{a.action}</Typography>
                              {a.target && (
                                <Typography variant="caption" sx={{ color: T.primary, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(T.primary, 0.08), px: 0.75, py: 0.125, borderRadius: 1 }}>
                                  {a.target}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: T.textMuted, fontSize: '0.68rem' }}>{a.time}</Typography>
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

          {hasPerm('users', 'view') && (
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

          {hasPerm('billing', 'view') && (
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
                        { label: 'Active',   value: dashboardData.subscription_stats.active_subscriptions, color: T.emerald },
                        { label: 'Trial',    value: dashboardData.subscription_stats.trial_subscriptions,  color: T.amber },
                        { label: 'Past Due', value: dashboardData.subscription_stats.past_due,             color: T.rose },
                      ].map(({ label, value, color }) => (
                        <Box key={label} sx={{ flex: 1, textAlign: 'center', px: 1, py: 0.75, borderRadius: 2, bgcolor: alpha(color, 0.07), border: `1px solid ${alpha(color, 0.2)}` }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color, fontSize: '1rem' }}>{value}</Typography>
                          <Typography variant="caption" sx={{ color: T.textMuted, fontSize: '0.68rem' }}>{label}</Typography>
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