import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Badge,
  Fade,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Restaurant,
  AccountCircle,
  Menu as MenuIcon,
  Dashboard,
  TableRestaurant,
  Settings,
  Assignment,
  People,
  Business,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import NotificationCenter from '../../common/NotificationCenter';
import { useSidebar } from '../../../contexts/common/Sidebar';
import AppHeader from '../AppHeader';
import AppSidebar from '../AppSidebar';
import { getUserFirstName } from '../../../utils/data';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  const { user, logout, hasBackendPermission } = useAuth();

  // Sidebar state
  const { toggleCollapsed: toggleSidebar } = useSidebar();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicMenuRoute = location.pathname.includes('/menu/');
  const isCheckoutRoute = location.pathname.includes('/checkout/');
  const isOrderTrackingRoute = location.pathname.includes('/order-tracking/') || location.pathname.includes('/order/');
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isCustomerFacingRoute = isPublicMenuRoute || isCheckoutRoute || isOrderTrackingRoute;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMobileDrawerToggle = () => {
    toggleSidebar();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderNavigation = () => {
    if (isPublicMenuRoute) {
      // Extract venueId and tableId from current path for proper routing
      const pathParts = location.pathname.split('/');
      const venueId = pathParts[2];
      const tableId = pathParts[3];

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <IconButton
            color="primary"
            onClick={() => navigate(`/checkout/${venueId}/${tableId}`)}
            disabled={false}
            sx={{
              backgroundColor: 'transparent',
              minWidth: { xs: 44, sm: 48 },
              minHeight: { xs: 44, sm: 48 },
              '&:hover': {
                backgroundColor: 'primary.100',
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            <Badge
              badgeContent={0}
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 16, sm: 20 },
                  height: { xs: 16, sm: 20 },
                },
              }}
            >
              <ShoppingCart sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </Badge>
          </IconButton>
        </Box>
      );
    }

    if (isAdminRoute && user) {
      const adminNavItems = [
        {
          label: 'Dashboard',
          path: '/admin/dashboard',
          icon: <Dashboard />,
          permission: 'application.dashboard.read',
        },
        {
          label: 'Orders',
          path: '/admin/orders',
          icon: <Assignment />,
          permission: 'application.orders.read',
        },
        {
          label: 'Menu',
          path: '/admin/menu',
          icon: <Restaurant />,
          permission: 'application.items.read',
        },
        {
          label: 'Tables',
          path: '/admin/tables',
          icon: <TableRestaurant />,
          permission: 'application.tables.read',
        },
        {
          label: 'Users',
          path: '/admin/users',
          icon: <People />,
          permission: 'application.users.read',
        },
        {
          label: 'Permissions',
          path: '/admin/permissions',
          icon: <Security />,
          permission: 'application.users.read',
        },
        {
          label: 'Settings',
          path: '/admin/settings',
          icon: <Settings />,
          permission: 'application.workspace.read',
        },
        {
          label: 'Workspace',
          path: '/admin/workspace',
          icon: <Business />,
          permission: 'application.workspace.manage',
        },
      ].filter(item => hasBackendPermission(item.permission));

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }} data-tour="sidebar-navigation">
          {adminNavItems.map((item) => (
            <Button
              key={item.label}
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              fullWidth
              data-tour={`${item.label.toLowerCase()}-nav`}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.25,
                px: 2,
                borderRadius: 2,
                minHeight: 44,
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? 600 : 500,
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
                border: location.pathname === item.path ? '1px solid' : '1px solid transparent',
                borderColor: location.pathname === item.path ? 'primary.200' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'primary.100' : 'action.hover',
                  borderColor: location.pathname === item.path ? 'primary.300' : 'divider',
                  transform: 'translateX(2px)',
                },
                '&:active': {
                  transform: 'translateX(0px)',
                },
                '& .MuiButton-startIcon': {
                  mr: 1.5,
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  fontSize: '1.125rem',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      );
    }

    if (isHomePage) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user ? (
            <>
              <NotificationCenter />
              <Button
                color="inherit"
                onClick={() => navigate('/admin/dashboard')}
                startIcon={<AccountCircle />}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {getUserFirstName(user) || user.email}
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'error.50',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{
                  mr: 1,
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Create Account
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      );
    }

    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPageTitle = () => {
    if (isPublicMenuRoute) return 'Dino';
    if (isCheckoutRoute) return 'Checkout';
    if (isAdminRoute) return 'Admin Panel';
    return 'Dino';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: isAdminRoute ? '100vh' : 'auto', minHeight: isAdminRoute ? 'unset' : '100vh', overflow: 'visible', margin: 0, padding: 0, width: '100%', maxWidth: '100%' }}>
      {/* Enhanced AppHeader - Hidden for customer facing pages and admin routes */}
      {!isCustomerFacingRoute && !isAdminRoute && (
        <AppHeader />
      )}

      {/* Admin Layout with Responsive Sidebar */}
      {isAdminRoute && user ? (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'visible', position: 'relative', margin: 0, padding: 0, width: '100%', maxWidth: '100%' }}>
          {/* Sidebar â€” always rendered; collapsed by default on mobile */}
          <AppSidebar isTablet={isTablet} />

          {/* Main Content */}
          <Box
            component="main"
            className={isMobile ? 'admin-main-content' : ''}
            sx={{
              flex: 1,
              backgroundColor: 'background.default',
              minHeight: '100vh',
              height: '100vh',
              marginLeft: 0,
              marginTop: 0,
              marginRight: 0,
              paddingRight: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              maxWidth: '100%',
              transition: 'none',
            }}
          >
            {/* Mobile Header for Admin */}
            {isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  flexShrink: 0,
                  minHeight: '64px',
                  maxHeight: '64px',
                }}
              >
                {/* Title only */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Admin Panel
                  </Typography>
                </Box>

                {/* Hamburger menu on the right */}
                <IconButton
                  onClick={handleMobileDrawerToggle}
                  sx={{
                    color: 'text.primary',
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&:active': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <MenuIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Box>
            )}

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Fade in timeout={300}>
                <Box
                  sx={{
                    flex: 1,
                    p: 0,
                  }}
                >
                  <Outlet />
                </Box>
              </Fade>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Non-admin routes */
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            pt: isCustomerFacingRoute ? 0 : 0,
            transition: 'padding-top 0.3s ease-in-out',
            scrollBehavior: 'smooth',
            width: '100%',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Fade in timeout={300}>
            <Box
              sx={{
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Outlet />
            </Box>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default AppLayout;