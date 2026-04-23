/**
 * UnifiedDashboard
 * Top-level dashboard container: hero section with KPI tiles + TabbedDashboard
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Alert,
  Button,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  ShoppingCart,
  TableRestaurant,
  AttachMoney,
  LockOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { PERMISSIONS } from '../../types/auth/permissions';
import { useUserData } from '../../contexts/application/UserData';
import { dashboardService } from '../../services/application/dashboard.service';
import { getUserFirstName } from '../../utils/data/userUtils';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import TabbedDashboard from './components/TabbedDashboard';
import type { DashboardData } from '../../types/dashboard/responses';

// â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COLORS = {
  pageBg:      '#0f172a',
  cardBg:      '#1e293b',
  cardBorder:  'rgba(255,255,255,0.08)',
  textPrimary: '#f1f5f9',
  textSecond:  '#94a3b8',
  textMuted:   '#64748b',
  blue:        '#1976D2',
  lightBlue:   '#42A5F5',
  emerald:     '#10b981',
  amber:       '#f59e0b',
  rose:        '#f43f5e',
  violet:      '#8b5cf6',
} as const;

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const formatINR = (value: number): string =>
  `â‚¹${value.toLocaleString('en-IN')}`;

const formatDate = (): string =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning,';
  if (hour >= 12 && hour < 18) return 'Good afternoon,';
  return 'Good evening,';
};

// â”€â”€ useCountUp â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const useCountUp = (target: number, duration = 900): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// â”€â”€ KPI Tile definition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface KpiTileDef {
  label: string;
  rawValue: number;
  displayValue?: string;
  icon: React.ReactElement;
  color: string;
  animate?: boolean;
}

// â”€â”€ Hero KPI Tile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface HeroKpiTileProps extends KpiTileDef {}

const HeroKpiTile: React.FC<HeroKpiTileProps> = ({
  label,
  rawValue,
  displayValue,
  icon,
  color,
  animate = false,
}) => {
  const animated = useCountUp(animate ? rawValue : 0);
  const shown = displayValue ?? String(animate ? animated : rawValue);

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        transition: 'background 0.2s, border-color 0.2s',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.09)',
          borderColor: 'rgba(255,255,255,0.16)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: `${color}1a`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 20 } })}
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          color: '#ffffff',
          fontSize: { xs: '1.5rem', md: '1.875rem' },
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {shown}
      </Typography>
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.75rem',
          fontWeight: 500,
          mt: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// â”€â”€ Hero KPI Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const HeroKpiSkeleton: React.FC = () => (
  <Box
    sx={{
      bgcolor: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      height: { xs: 130, md: 148 },
      '@keyframes shimmer': {
        '0%':   { opacity: 0.5 },
        '50%':  { opacity: 0.8 },
        '100%': { opacity: 0.5 },
      },
      animation: 'shimmer 1.6s ease-in-out infinite',
    }}
  />
);

// â”€â”€ Content Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ContentSkeleton: React.FC = () => (
  <Box sx={{ px: { xs: 2.5, sm: 4, md: 5 }, pt: 3, pb: 4 }}>
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '2 1 400px', height: 340 }} />
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '1 1 260px', height: 340 }} />
    </Box>
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '1 1 300px', height: 300 }} />
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '1 1 300px', height: 300 }} />
    </Box>
  </Box>
);

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const UnifiedDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const { user, hasBackendPermission } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  const workspaceId: string =
    userData?.workspace?.id ||
    (user as any)?.workspaceId ||
    (user as any)?.workspace_id ||
    '';
  const organizationId: string = userData?.venue?.id || '';
  const venueName: string = userData?.venue?.name || 'Your Venue';
  const firstName: string = getUserFirstName(user as any) || 'there';

  const [rawData, setRawData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (!workspaceId) return;
      if (isInitial) setLoading(true);
      setError(null);
      try {
        const res = await dashboardService.getDashboard({
          workspaceId,
          organizationId: organizationId || undefined,
        });
        if (!isMountedRef.current) return;
        const payload = (res as any)?.data ?? res;
        setRawData(payload as DashboardData);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        if (isMountedRef.current && isInitial) setLoading(false);
      }
    },
    [workspaceId, organizationId],
  );

  useEffect(() => {
    if (userDataLoading || !workspaceId) return;
    isMountedRef.current = true;
    fetchData(true);
    intervalRef.current = setInterval(() => fetchData(false), 60_000);
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, userDataLoading, workspaceId]);

  // â”€â”€ Permission gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!hasBackendPermission(PERMISSIONS.DASHBOARD_READ)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          px: 3,
          textAlign: 'center',
          bgcolor: COLORS.pageBg,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(244,63,94,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <LockOutlined sx={{ fontSize: 32, color: COLORS.rose }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Access Denied
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecond, maxWidth: 360 }}>
          You do not have permission to view the dashboard. Contact your administrator to request access.
        </Typography>
      </Box>
    );
  }

  // â”€â”€ Error state (no data at all) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!loading && error && !rawData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          px: 3,
          bgcolor: COLORS.pageBg,
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: 480,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            color: COLORS.textPrimary,
            '& .MuiAlert-icon': { color: COLORS.rose },
          }}
        >
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchData(true)}
          sx={{
            borderColor: COLORS.lightBlue,
            color: COLORS.lightBlue,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(66,165,245,0.08)',
              borderColor: COLORS.lightBlue,
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const stats = rawData?.stats;
  const todaysRevenue  = stats?.todaysRevenue      ?? 0;
  const todaysOrders   = stats?.todaysOrders        ?? 0;
  const avgOrderValue  = stats?.avgOrderValue       ?? 0;
  const tableOccupancy = stats?.tableOccupancyRate  ?? 0;

  const kpiTiles: KpiTileDef[] = [
    { label: "Today's Revenue", rawValue: todaysRevenue,  displayValue: formatINR(todaysRevenue),  icon: <AttachMoney />, color: COLORS.lightBlue },
    { label: "Today's Orders",  rawValue: todaysOrders,                                            icon: <ShoppingCart />, color: COLORS.emerald, animate: true },
    { label: 'Avg Order Value', rawValue: avgOrderValue,  displayValue: formatINR(avgOrderValue),  icon: <TrendingUp />,   color: COLORS.amber },
    { label: 'Table Occupancy', rawValue: Math.round(tableOccupancy), displayValue: `${Math.round(tableOccupancy)}%`, icon: <TableRestaurant />, color: COLORS.violet, animate: true },
  ];

  return (
    <VenueAssignmentCheck showFullPage={false}>
      <Box className={className} sx={{ bgcolor: COLORS.pageBg, minHeight: '100vh' }}>

        {/* â”€â”€ Hero Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0b1120 0%, #0d1f3c 50%, #0a3060 100%)',
            px: { xs: 2.5, sm: 4, md: 5 },
            pt: { xs: 3, md: 4 },
            pb: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.28) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,165,245,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', gap: { xs: 2, sm: 1 }, mb: { xs: 2.5, md: 3 } }}>
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1, mb: 0.5 }}>{getGreeting()}</Typography>
                <Typography sx={{ fontWeight: 800, color: '#ffffff', fontSize: { xs: '1.75rem', md: '2.25rem' }, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{firstName}</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', mt: 1.25, px: 1.25, py: 0.4, borderRadius: '20px', border: '1px solid rgba(66,165,245,0.3)', bgcolor: 'rgba(66,165,245,0.1)' }}>
                  <Typography sx={{ color: COLORS.lightBlue, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.02em' }}>{venueName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, pt: { sm: 0.5 } }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 400, display: { xs: 'none', sm: 'block' } }}>{formatDate()}</Typography>
                <IconButton onClick={() => fetchData(false)} size="small" title="Refresh dashboard" sx={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', width: 36, height: 36, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' } }}>
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {loading && !rawData ? (
                <><HeroKpiSkeleton /><HeroKpiSkeleton /><HeroKpiSkeleton /><HeroKpiSkeleton /></>
              ) : (
                kpiTiles.map((tile) => <HeroKpiTile key={tile.label} {...tile} />)
              )}
            </Box>
          </Box>
        </Box>

        {error && rawData && (
          <Box sx={{ px: { xs: 2.5, sm: 4, md: 5 }, pt: 2 }}>
            <Alert severity="warning" onClose={() => setError(null)} sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: COLORS.textPrimary, '& .MuiAlert-icon': { color: COLORS.amber } }}>
              {error} â€” Showing last known data.
            </Alert>
          </Box>
        )}

        <Box sx={{ bgcolor: COLORS.pageBg }}>
          {loading && !rawData ? (
            <ContentSkeleton />
          ) : (
            <TabbedDashboard dashboardData={rawData as any} loading={loading} lastUpdated={lastUpdated} />
          )}
        </Box>

      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;