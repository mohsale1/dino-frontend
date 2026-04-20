/**
 * UnifiedDashboard
 * Top-level dashboard container: KPI cards + TabbedDashboard
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Refresh,
  TrendingUp,
  ShoppingCart,
  TableRestaurant,
  AttachMoney,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { useUserData } from '../../contexts/application/UserData';
import { dashboardService } from '../../services/application/dashboard.service';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import TabbedDashboard from './components/TabbedDashboard';
import type { DashboardData } from '../../types/dashboard/responses';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatINR = (value: number): string =>
  `₹${value.toLocaleString('en-IN')}`;

const formatOccupancy = (value: number): string =>
  `${value.toFixed(1)}%`;

const formatLastUpdated = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── KPI card config ───────────────────────────────────────────────────────────

interface KpiConfig {
  label: string;
  value: string;
  icon: React.ReactElement;
  borderColor: string;
  iconBg: string;
}

const buildKpis = (stats: DashboardData['stats']): KpiConfig[] => [
  {
    label: "Today's Revenue",
    value: formatINR(stats.todaysRevenue ?? 0),
    icon: <AttachMoney />,
    borderColor: '#1976d2',
    iconBg: alpha('#1976d2', 0.1),
  },
  {
    label: "Today's Orders",
    value: String(stats.todaysOrders ?? 0),
    icon: <ShoppingCart />,
    borderColor: '#0288d1',
    iconBg: alpha('#0288d1', 0.1),
  },
  {
    label: 'Avg Order Value',
    value: formatINR(stats.avgOrderValue ?? 0),
    icon: <TrendingUp />,
    borderColor: '#388e3c',
    iconBg: alpha('#388e3c', 0.1),
  },
  {
    label: 'Table Occupancy',
    value: formatOccupancy(stats.tableOccupancyRate ?? 0),
    icon: <TableRestaurant />,
    borderColor: '#f57c00',
    iconBg: alpha('#f57c00', 0.1),
  },
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

const KpiCard: React.FC<KpiConfig> = ({ label, value, icon, borderColor, iconBg }) => (
  <Box
    sx={{
      bgcolor: '#ffffff',
      borderRadius: 2,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${borderColor}`,
      px: 2.5,
      py: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      height: '100%',
    }}
  >
    <Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: '#64748b', fontWeight: 500, mt: 0.5, fontSize: '0.8rem' }}
      >
        {label}
      </Typography>
    </Box>
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        bgcolor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: borderColor,
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 22 } })}
    </Box>
  </Box>
);

// ── Skeleton placeholders ─────────────────────────────────────────────────────

const KpiSkeleton: React.FC = () => (
  <Box
    sx={{
      bgcolor: '#e2e8f0',
      borderRadius: 2,
      height: 88,
    }}
  />
);

const ContentSkeleton: React.FC = () => (
  <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 3, pb: 4 }}>
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Box sx={{ bgcolor: '#e2e8f0', borderRadius: 2, flex: '2 1 400px', height: 340 }} />
      <Box sx={{ bgcolor: '#e2e8f0', borderRadius: 2, flex: '1 1 260px', height: 340 }} />
    </Box>
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ bgcolor: '#e2e8f0', borderRadius: 2, flex: '1 1 300px', height: 300 }} />
      <Box sx={{ bgcolor: '#e2e8f0', borderRadius: 2, flex: '1 1 300px', height: 300 }} />
    </Box>
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

const UnifiedDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const { user } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  // Venue / workspace identifiers
  const workspaceId: string =
    userData?.workspace?.id ||
    (user as any)?.workspaceId ||
    (user as any)?.workspace_id ||
    '';
  const organizationId: string = userData?.venue?.id || '';
  const venueName: string = userData?.venue?.name || 'Dashboard';

  // State
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
        // res is response.data from apiService — shape: { success, data: DashboardData }
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

  // ── Error state (no data at all) ────────────────────────────────────────────
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
        <Alert severity="error" sx={{ maxWidth: 480, width: '100%', borderRadius: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => fetchData(true)}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const stats = rawData?.stats;
  const kpis = stats ? buildKpis(stats) : null;

  return (
    <VenueAssignmentCheck showFullPage={false}>
      <Box className={className} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            px: { xs: 2, sm: 3, md: 4 },
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}
            >
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={venueName}
                size="small"
                sx={{
                  bgcolor: alpha('#1976d2', 0.08),
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 22,
                }}
              />
              {lastUpdated && (
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Updated {formatLastUpdated(lastUpdated)}
                </Typography>
              )}
            </Box>
          </Box>

          <IconButton
            onClick={() => fetchData(false)}
            size="small"
            title="Refresh dashboard"
            sx={{
              bgcolor: alpha('#1976d2', 0.08),
              color: '#1976d2',
              borderRadius: 1.5,
              '&:hover': { bgcolor: alpha('#1976d2', 0.16) },
            }}
          >
            <Refresh sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* ── KPI cards ────────────────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 3, pb: 1 }}>
          <Grid container spacing={2}>
            {loading || !kpis
              ? [0, 1, 2, 3].map((i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <KpiSkeleton />
                  </Grid>
                ))
              : kpis.map((kpi) => (
                  <Grid item xs={6} md={3} key={kpi.label}>
                    <KpiCard {...kpi} />
                  </Grid>
                ))}
          </Grid>
        </Box>

        {/* ── Non-fatal error banner ────────────────────────────────────────── */}
        {error && rawData && (
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2 }}>
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
        {loading && !rawData ? (
          <ContentSkeleton />
        ) : (
          <TabbedDashboard
            dashboardData={rawData as any}
            loading={loading}
            lastUpdated={lastUpdated}
          />
        )}

      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;