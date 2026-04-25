import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useLocation, Outlet } from 'react-router-dom';
import AppHeader from '../AppHeader';
import AppFooter from '../AppFooter';

const AppLayout: React.FC = () => {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const isCustomerFacing =
    location.pathname.endsWith('/menu') ||
    location.pathname.includes('/checkout/') ||
    location.pathname.includes('/order-tracking/');
  const isLoginRoute =
    location.pathname === '/login' || location.pathname === '/register';
  const isHomePage =
    location.pathname === '/' || location.pathname === '/home';

  const isPosRoute = location.pathname === '/admin/pos';

  useEffect(() => {
    if (isAdmin) document.body.classList.add('admin-layout');
    else document.body.classList.remove('admin-layout');
    return () => document.body.classList.remove('admin-layout');
  }, [isAdmin]);

  if (isAdmin) {
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
            bgcolor: '#f8fafc',
            width: '100%',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(15,23,42,0.15)', borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(15,23,42,0.25)' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    );
  }

  if (isCustomerFacing) {
    return <Box sx={{ minHeight: '100vh' }}><Outlet /></Box>;
  }

  if (isLoginRoute) {
    return <Outlet />;
  }

  // Home / public layout — header + optional footer
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1, pt: { xs: '64px', md: '70px' } }}>
        <Outlet />
      </Box>
      {isHomePage && <AppFooter />}
    </Box>
  );
};


export default AppLayout;