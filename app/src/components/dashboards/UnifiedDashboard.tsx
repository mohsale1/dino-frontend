/**
 * UnifiedDashboard
 * Top-level dashboard container: page header + stat cards + TabbedDashboard
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Alert,
  Button,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  ShoppingCart,
  TableRestaurant,
  AttachMoney,
  LockOutlined,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { PERMISSIONS } from '../../types/auth/permissions';
import { useUserData } from '../../contexts/application/UserData';
import { dashboardService } from '../../services/application/dashboard.service';
import { getUserFirstName } from '../../utils/data/userUtils';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import TabbedDashboard from './components/TabbedDashboard';
import type { DashboardData } from '../../types/dashboard/responses';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatINR = (value: number): string =>
  `₹${value.toLocaleString('en-IN')}`;

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

// ── useCountUp ────────────────────────────────────────────────────────────────

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

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  rawValue: number;
  displayValue?: string;
  icon: React.ReactElement;
  animate?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  rawValue,
  displayValue,
  icon,
  animate = false,
}) => {
  const animated = useCountUp(animate ? rawValue : 0);
  const shown = displayValue ?? String(animate ? animated : rawValue);

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        p: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          flexShrink: 0,
          bgcolor: 'rgba(25,118,210,0.08)',
          border: '1px solid rgba(25,118,210,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1976D2',
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 24,
            color: '#1C1C1E',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {shown}
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            color: '#666666',
            mt: 0.25,
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const UnifiedDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const { user, hasBackendPermission } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  const personaId: number | undefined =
    userData?.venue?.personaId || (userData?.venue?.id ? Number(userData.venue.id) : undefined);
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
      if (!personaId) return;
      if (isInitial) setLoading(true);
      setError(null);
      try {
        const res = await dashboardService.getDashboard({
          personaId: String(personaId),
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
    [personaId],
  );

  useEffect(() => {
    if (userDataLoading || !personaId) return;
    isMountedRef.current = true;
    fetchData(true);
    intervalRef.current = setInterval(() => fetchData(false), 60_000);
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, userDataLoading, personaId]);

  // ── Permission gate ───────────────────────────────────────────────────────

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
          bgcolor: '#f8fafc',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(25,118,210,0.08)',
            border: '1px solid rgba(25,118,210,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <LockOutlined sx={{ fontSize: 32, color: '#1976D2' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E' }}>
          Access Denied
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666', maxWidth: 360 }}>
          You do not have permission to view the dashboard. Contact your administrator to request access.
        </Typography>
      </Box>
    );
  }

  // ── Error state (no data at all) ──────────────────────────────────────────

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
          bgcolor: '#f8fafc',
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: 480,
            width: '100%',
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchData(true)}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#1976D2',
            color: '#1976D2',
            '&:hover': {
              bgcolor: 'rgba(25,118,210,0.06)',
              borderColor: '#1565C0',
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const stats = rawData?.stats;
  const todaysRevenue  = stats?.todaysRevenue     ?? 0;
  const todaysOrders   = stats?.todaysOrders       ?? 0;
  const avgOrderValue  = stats?.avgOrderValue      ?? 0;
  const tableOccupancy = stats?.tableOccupancyRate ?? 0;

  return (
    <VenueAssignmentCheck showFullPage={false}>
      <Box className={className} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            px: { xs: 2, sm: '32px' },
            pt: '24px',
            pb: '20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: '#1C1C1E',
                fontSize: 20,
                lineHeight: 1.3,
              }}
            >
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              {getGreeting()} {firstName} — {venueName}
            </Typography>
          </Box>

          {/* Right: date chip + refresh */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                bgcolor: '#f4f4f4',
                borderRadius: '8px',
                px: 1.5,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <CalendarToday sx={{ fontSize: 14, color: '#666666' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#666666', fontWeight: 500 }}>
                {formatDate()}
              </Typography>
            </Box>
            <IconButton
              onClick={() => fetchData(false)}
              size="small"
              title="Refresh dashboard"
              sx={{
                color: '#666666',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: '#f7f9fa',
                  borderColor: '#bdbdbd',
                },
              }}
            >
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 0 }}>
          <Grid container spacing={2}>
            {loading && !rawData ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <Grid item xs={12} sm={6} lg={3} key={i}>
                    <Skeleton
                      variant="rounded"
                      height={88}
                      sx={{ borderRadius: '12px' }}
                    />
                  </Grid>
                ))}
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    label="Today's Revenue"
                    rawValue={todaysRevenue}
                    displayValue={formatINR(todaysRevenue)}
                    icon={<AttachMoney />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    label="Today's Orders"
                    rawValue={todaysOrders}
                    icon={<ShoppingCart />}
                    animate
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    label="Avg Order Value"
                    rawValue={avgOrderValue}
                    displayValue={formatINR(avgOrderValue)}
                    icon={<TrendingUp />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    label="Table Occupancy"
                    rawValue={Math.round(tableOccupancy)}
                    displayValue={`${Math.round(tableOccupancy)}%`}
                    icon={<TableRestaurant />}
                    animate
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {/* ── Non-fatal error banner ────────────────────────────────────────── */}
        {error && rawData && (
          <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 2 }}>
            <Alert
              severity="warning"
              onClose={() => setError(null)}
              sx={{ borderRadius: 2, fontSize: '0.875rem' }}
            >
              {error} — Showing last known data.
            </Alert>
          </Box>
        )}

        {/* ── Tabbed content ────────────────────────────────────────────────── */}
        <TabbedDashboard
          dashboardData={rawData as any}
          loading={loading && !rawData}
          lastUpdated={lastUpdated}
        />

      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;
