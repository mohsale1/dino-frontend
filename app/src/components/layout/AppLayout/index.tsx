import React from 'react';
import {
  Box,
  IconButton,
  Fade,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { useSidebar } from '../../../contexts/common/Sidebar';
import AppHeader from '../AppHeader';
import AppSidebar from '../AppSidebar';
import { getUserFirstName } from '../../../utils/data';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const isAdminRouteCheck = location.pathname.startsWith('/admin');
  React.useEffect(() => {
    if (isAdminRouteCheck) {
      document.body.classList.add('admin-layout');
    } else {
      document.body.classList.remove('admin-layout');
    }
    return () => {
      document.body.classList.remove('admin-layout');
    };
  }, [isAdminRouteCheck]);

  const { user } = useAuth();
  const { toggleCollapsed } = useSidebar();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicMenuRoute = location.pathname.endsWith('/menu');
  const isCheckoutRoute = location.pathname.includes('/checkout/');
  const isOrderTrackingRoute = location.pathname.includes('/order-tracking/') || location.pathname.includes('/order/');
  const isLoginRoute = location.pathname === '/login' || location.pathname === '/register';
  const isCustomerFacingRoute = isPublicMenuRoute || isCheckoutRoute || isOrderTrackingRoute;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: isAdminRoute ? '100vh' : 'auto', minHeight: isAdminRoute ? 'unset' : '100vh', overflow: isAdminRoute ? 'hidden' : 'visible', margin: 0, padding: 0, width: '100%', maxWidth: '100%' }}>
      {/* AppHeader — hidden for customer-facing pages, admin routes, and auth pages */}
      {!isCustomerFacingRoute && !isAdminRoute && !isLoginRoute && (
        <AppHeader />
      )}

      {/* Admin Layout */}
      {isAdminRoute && user ? (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
          {/* Drawer-based sidebar — handles its own positioning */}
          <AppSidebar isTablet={isTablet} />

          {/* Mobile top navbar — xs/sm only */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              bgcolor: '#0f172a',
              zIndex: 1300,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <IconButton onClick={toggleCollapsed} sx={{ color: '#ffffff' }}>
              <MenuIcon />
            </IconButton>

            <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700 }}>
              Dino
            </Typography>

            <Avatar
              onClick={() => navigate('/admin/settings')}
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Avatar>
          </Box>

          {/* Main content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: '#f8fafc',
              height: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              pt: { xs: '56px', md: 0 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      ) : (
        /* Non-admin routes — public pages scroll naturally via the document */
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            width: '100%',
            maxWidth: '100%',
            /* No overflow set here — let the document handle scrolling */
          }}
        >
          <Fade in timeout={300}>
            <Box sx={{ width: '100%', maxWidth: '100%' }}>
              <Outlet />
            </Box>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default AppLayout;