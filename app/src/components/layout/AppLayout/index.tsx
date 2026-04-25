import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLocation, Outlet } from 'react-router-dom';
import AppHeader from '../AppHeader';
import HomeHeader from '../AppHeader/HomeHeader';
import { useWorkspaceApproval } from '../../../contexts/application/WorkspaceApproval';
import { useAuth } from '../../../contexts/common/Auth';
import WorkspaceApprovalPage from '../../../pages/application/WorkspaceApprovalPage';
import StorageManager from '../../../utils/storage';

const AppLayout: React.FC = () => {
  const location  = useLocation();
  const { isAuthenticated } = useAuth();
  const { isApproved, isChecked } = useWorkspaceApproval();

  const isAdmin          = location.pathname.startsWith('/admin');
  const isCustomerFacing =
    location.pathname.endsWith('/menu') ||
    location.pathname.includes('/checkout/') ||
    location.pathname.includes('/order-tracking/');
  const isLoginRoute =
    location.pathname === '/login' || location.pathname === '/register';
  const isPosRoute = location.pathname === '/admin/pos';

  // System users bypass the approval gate entirely
  const isSystemUser = StorageManager.getItem<string>('user_type') === 'system';

  useEffect(() => {
    if (isAdmin) document.body.classList.add('admin-layout');
    else document.body.classList.remove('admin-layout');
    return () => document.body.classList.remove('admin-layout');
  }, [isAdmin]);

  // ── Admin layout ─────────────────────────────────────────────────────────────
  if (isAdmin) {
    // While approval status is still being fetched show a minimal spinner
    if (isAuthenticated && !isSystemUser && !isChecked) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100dvh',
            bgcolor: '#f8fafc',
          }}
        >
          <CircularProgress size={36} sx={{ color: '#1976D2' }} />
        </Box>
      );
    }

    // Not approved — show the approval status page instead of the portal
    if (isAuthenticated && !isSystemUser && isChecked && !isApproved) {
      return <WorkspaceApprovalPage />;
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        <AppHeader />
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: '64px',
            height: '100dvh',
            overflowY: isPosRoute ? 'hidden' : 'auto',
            overflowX: 'hidden',
            bgcolor: '#FCFCFD',
            width: '100%',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    );
  }

  // ── Customer-facing (public menu) ─────────────────────────────────────────────
  if (isCustomerFacing) {
    return <Box sx={{ minHeight: '100vh' }}><Outlet /></Box>;
  }

  // ── Login / Register ──────────────────────────────────────────────────────────
  if (isLoginRoute) {
    return <Outlet />;
  }

  // ── Home / public layout ──────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
