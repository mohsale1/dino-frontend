import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Skeleton,
  Button,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../../contexts/common/Auth';
import { useUserData } from '../../contexts/application/UserData';
import { dashboardService } from '../../services/application/dashboard.service';
import { ROLE_COLORS } from '../../constants/app';
import DashboardHeader from './components/DashboardHeader';
import TabbedDashboard from './components/TabbedDashboard';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UnifiedDashboardProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getLast30DaysRange = (): DateRange => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 29);
  return { startDate: formatDate(start), endDate: formatDate(today) };
};

// ---------------------------------------------------------------------------
// Full-page loading skeleton — uses Owner gradient (role unknown at load time)
// ---------------------------------------------------------------------------

const SKELETON_GRADIENT = ROLE_COLORS.Owner.gradient;

const DashboardSkeleton: React.FC = () => (
  <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
    {/* Header skeleton */}
    <Box
      sx={{
        background: SKELETON_GRADIENT,
        px: { xs: 2.5, sm: 4 },
        pt: 3.5,
        pb: 3,
      }}
    >
      <Skeleton
        variant="text"
        width={220}
        height={40}
        sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, mb: 0.5 }}
      />
      <Skeleton
        variant="text"
        width={140}
        height={18}
        sx={{ bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[120, 100, 90, 110].map((w, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={w}
            height={32}
            sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
          />
        ))}
      </Box>
    </Box>

    {/* Tabs skeleton */}
    <Box sx={{ px: 4, pt: 2, pb: 1, borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[80, 90, 100].map((w, i) => (
          <Skeleton key={i} variant="text" width={w} height={36} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Box>

    {/* Stat cards skeleton */}
    <Box sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      px: 3,
    }}
  >
    <Alert
      severity="error"
      sx={{ maxWidth: 480, width: '100%', borderRadius: 2 }}
    >
      {message}
    </Alert>
    <Button
      variant="contained"
      startIcon={<RefreshIcon />}
      onClick={onRetry}
      sx={{
        backgroundColor: '#312e81',
        '&:hover': { backgroundColor: '#1e1b4b' },
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
      }}
    >
      Retry
    </Button>
  </Box>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ className }) => {
  const { user, userPermissions } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  // -------------------------------------------------------------------------
  // Role resolution
  // -------------------------------------------------------------------------

  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name ||
    (user as any)?.role ||
    ''
  ).toLowerCase();

  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super')
      ? 'Owner'
      : rawRole.includes('manager') || rawRole.includes('admin')
      ? 'Manager'
      : 'User';

  const rc = ROLE_COLORS[roleKey];

  // -------------------------------------------------------------------------
  // User display fields
  // -------------------------------------------------------------------------

  const firstName: string =
    (user as any)?.firstName ||
    (user as any)?.first_name ||
    (user as any)?.name?.split(' ')[0] ||
    '';

  const displayRole: string =
    userPermissions?.role?.displayName ||
    userPermissions?.role?.name ||
    roleKey;

  // -------------------------------------------------------------------------
  // Workspace / venue
  // -------------------------------------------------------------------------

  const workspaceId: string | undefined =
    userData?.workspace?.id ||
    userData?.venue?.workspaceId ||
    (user as any)?.workspaceId ||
    (user as any)?.workspace_id ||
    (user as any)?.workspace?.id ||
    undefined;

  const venueName: string =
    userData?.venue?.name ||
    (user as any)?.venue_name ||
    'Dashboard';

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const [dateRange] = useState<DateRange>(getLast30DaysRange());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------

  const fetchData = useCallback(
    async (isInitial = false) => {
      // Wait until userData has loaded and workspaceId is available
      if (!workspaceId) return;

      if (isInitial) setLoading(true);
      setError(null);

      try {
        const data = await dashboardService.getAdminDashboard(
          { startDate: dateRange.startDate, endDate: dateRange.endDate },
          workspaceId,
        );

        if (!isMountedRef.current) return;

        setDashboardData(data);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (!isMountedRef.current) return;
        console.error('[UnifiedDashboard] fetch error:', err);
        setError(err?.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        if (isMountedRef.current && isInitial) setLoading(false);
      }
    },
    [dateRange, workspaceId],
  );

  // -------------------------------------------------------------------------
  // Initial load + polling — only start once workspaceId is resolved
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Still waiting for userData to load
    if (userDataLoading || !workspaceId) return;

    isMountedRef.current = true;

    fetchData(true);

    intervalRef.current = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, userDataLoading, workspaceId]);

  // -------------------------------------------------------------------------
  // Manual refresh
  // -------------------------------------------------------------------------


  // -------------------------------------------------------------------------
  // Derived props for children
  // -------------------------------------------------------------------------

  const stats = dashboardData?.stats ?? null;
  const analyticsData = dashboardData?.analytics ?? null;
  const recentActivity = dashboardData?.recent_activity ?? [];
  const tableStatuses = dashboardData?.table_statuses ?? [];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboardData) {
    return <ErrorState message={error} onRetry={() => fetchData(true)} />;
  }

  return (
    <VenueAssignmentCheck showFullPage={false}>
      <Box
        className={className}
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          width: '100%',
        }}
      >
        {/* Compact hero header */}
        <DashboardHeader
          venueName={venueName}
          firstName={firstName}
          displayRole={displayRole}
          lastUpdated={lastUpdated}
          stats={stats}
          rc={rc}
        />

        {/* Non-fatal error banner (data already loaded once) */}
        {error && dashboardData && (
          <Box sx={{ px: { xs: 2, sm: 4 }, pt: 2 }}>
            <Alert
              severity="warning"
              onClose={() => setError(null)}
              sx={{ borderRadius: 2, fontSize: '0.875rem' }}
            >
              {error} — Showing last known data.
            </Alert>
          </Box>
        )}

        {/* Main tabbed content */}
        <TabbedDashboard
          dashboardData={{
            ...dashboardData,
            analytics: analyticsData,
            recent_activity: recentActivity,
            table_statuses: tableStatuses,
          }}
          loading={loading}
          lastUpdated={lastUpdated}
        />
      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;