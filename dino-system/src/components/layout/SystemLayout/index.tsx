import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Button,
  Chip,
  Typography,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings,
  People,
  Business,
  Payment,
  Settings,
  Palette,
  Logout,
  Menu as MenuIcon,
  ChevronLeft,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DinoLogo from '../../ui/DinoLogo';
import { useAuth } from '../../../contexts/common/Auth';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';

const DRAWER_WIDTH = 280;

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  permission: string;
  path: string;
}

const SystemLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasBackendPermission, userPermissions } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const drawerWidth = sidebarCollapsed ? 70 : DRAWER_WIDTH;

  // Resolve role name from Auth context userPermissions (reactive) with fallbacks
  const roleName = useMemo(() => {
    const name =
      userPermissions?.role?.name ||
      (user as any)?.role?.name ||
      (user as any)?.role ||
      '';
    return typeof name === 'string' ? name : '';
  }, [userPermissions, user]);

  // Define menu items with their exact permission requirements per the reference
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon fontSize="small" />,
      permission: 'system.workspaces.read',
      path: '/system/dashboard',
    },
    {
      title: 'Users',
      icon: <People fontSize="small" />,
      permission: 'system.users.read',
      path: '/system/users',
    },
    {
      title: 'Billing',
      icon: <Payment fontSize="small" />,
      permission: 'system.billing.read',
      path: '/system/billing',
    },
    {
      title: 'Workspaces',
      icon: <Business fontSize="small" />,
      permission: 'system.workspaces.read',
      path: '/system/workspaces',
    },
    {
      title: 'Roles & Permissions',
      icon: <AdminPanelSettings fontSize="small" />,
      permission: 'system.roles.read',
      path: '/system/roles',
    },
    {
      title: 'Registration Codes',
      icon: <Settings fontSize="small" />,
      permission: 'system.registration.read',
      path: '/system/registration',
    },
    {
      title: 'Appearance',
      icon: <Palette fontSize="small" />,
      permission: 'system.workspaces.read',
      path: '/system/appearance',
    },
    {
      title: 'Profile',
      icon: <AccountCircle fontSize="small" />,
      permission: 'system.users.read',
      path: '/system/profile',
    },
    {
      title: 'Settings',
      icon: <Settings fontSize="small" />,
      permission: 'system.workspaces.read',
      path: '/system/settings',
    },
  ];

  // Filter menu items reactively based on userPermissions from Auth context.
  const availableMenuItems = useMemo(() => {
    return menuItems.filter(item => hasBackendPermission(item.permission));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPermissions]);

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirmation(false);
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  // Sidebar content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      {/* Logo & Header */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1.5 : 2.5,
          textAlign: 'center',
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {!sidebarCollapsed && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.1),
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}

        <DinoLogo size={sidebarCollapsed ? 32 : 40} animated={false} />

        {!sidebarCollapsed && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ color: '#ffffff', fontWeight: 700, mt: 1.5, fontSize: '0.95rem' }}
            >
              System Admin
            </Typography>
            <Chip
              label={roleName || 'System User'}
              size="small"
              sx={{
                mt: 1,
                backgroundColor: alpha('#ffffff', 0.15),
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                textTransform: 'capitalize',
              }}
            />
          </>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: sidebarCollapsed ? 0.5 : 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px' } }}>
        {sidebarCollapsed && (
          <ListItemButton
            onClick={toggleSidebar}
            sx={{
              justifyContent: 'center',
              mb: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ color: '#ffffff', minWidth: 'auto' }}>
              <MenuIcon fontSize="small" />
            </ListItemIcon>
          </ListItemButton>
        )}

        {availableMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={index}
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                px: sidebarCollapsed ? 1 : 2,
                '&.Mui-selected': {
                  backgroundColor: alpha('#ffffff', 0.15),
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.2),
                  },
                },
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff', minWidth: sidebarCollapsed ? 'auto' : 40 }}>
                {item.icon}
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    sx: {
                      color: '#ffffff',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.875rem',
                    },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />

      {/* User Info */}
      <Box sx={{ p: sidebarCollapsed ? 1 : 2 }}>
        {!sidebarCollapsed ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, px: 0.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha('#ffffff', 0.2),
                  mr: 1.5,
                  fontSize: '0.875rem',
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email?.split('@')[0]}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha('#ffffff', 0.7),
                    fontSize: '0.6875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Logout fontSize="small" />}
              onClick={handleLogoutClick}
              sx={{
                borderColor: alpha('#ffffff', 0.3),
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.8125rem',
                py: 0.75,
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: alpha('#ffffff', 0.1),
                },
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <IconButton
            onClick={handleLogoutClick}
            sx={{
              color: '#ffffff',
              width: '100%',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.1),
              },
            }}
          >
            <Logout fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: 'none',
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              overflowY: 'hidden',
              position: 'fixed',
              height: '100vh',
              top: 0,
              left: 0,
              margin: 0,
              padding: 0,
            },
          }}
          open
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            bgcolor: '#f8fafc',
            overflowY: 'auto',
            overflowX: 'hidden',
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            marginLeft: { xs: 0, md: `${drawerWidth}px` },
            transition: 'margin-left 0.3s ease',
            pt: { xs: '56px', md: 0 },
          }}
        >
          {/* Mobile Top Navbar */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              bgcolor: '#0f172a',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              zIndex: 1100,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <IconButton onClick={handleDrawerToggle} sx={{ color: '#ffffff', p: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem' }}>
              System Admin
            </Typography>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.875rem' }}>
                {user?.email?.charAt(0).toUpperCase() || 'S'}
              </Typography>
            </Box>
          </Box>

          {/* Child Routes via React Router Outlet */}
          <Outlet />
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={showLogoutConfirmation}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        severity="info"
      />
    </>
  );
};

export default SystemLayout;