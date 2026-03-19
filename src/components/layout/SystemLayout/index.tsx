import React, { useState, useMemo, ReactNode } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { DinoLogo } from '../../ui';
import { useAuth } from '../../../contexts/common/Auth';

const DRAWER_WIDTH = 280;

interface SystemLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  permission: string;
  path: string;
}

const SystemLayout: React.FC<SystemLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const drawerWidth = sidebarCollapsed ? 70 : DRAWER_WIDTH;

  // Get user role information
  const userRole = useMemo(() => {
    const role = (user as any)?.role;
    return {
      name: typeof role === 'string' ? role : role?.name || 'User',
      permissions: role?.permissions || [],
      roleType: role?.role_type,
    };
  }, [user]);

  // Check if user has permission
  const hasPermission = (permission: string) => {
    return userRole.permissions.some((p: string) =>
      p === permission || p === 'system:*' || p.startsWith(permission.split(':')[0] + ':*')
    );
  };

  // Define menu items with permission requirements
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon fontSize="small" />,
      permission: 'system:*',
      path: '/system/dashboard',
    },
    {
      title: 'Users',
      icon: <People fontSize="small" />,
      permission: 'system:users',
      path: '/system/users',
    },
    {
      title: 'Billing',
      icon: <Payment fontSize="small" />,
      permission: 'system:billing',
      path: '/system/billing',
    },
    {
      title: 'Workspaces',
      icon: <Business fontSize="small" />,
      permission: 'system:workspaces',
      path: '/system/workspaces',
    },
    {
      title: 'Roles & Permissions',
      icon: <AdminPanelSettings fontSize="small" />,
      permission: 'system:roles',
      path: '/system/roles',
    },
    {
      title: 'Appearance',
      icon: <Palette fontSize="small" />,
      permission: 'system:*',
      path: '/system/appearance',
    },
    {
      title: 'Profile',
      icon: <AccountCircle fontSize="small" />,
      permission: 'system:*',
      path: '/system/profile',
    },
    {
      title: 'Settings',
      icon: <Settings fontSize="small" />,
      permission: 'system:settings',
      path: '/system/settings',
    },
  ];

  // Filter menu items based on user permissions
  const availableMenuItems = useMemo(() => {
    return menuItems.filter((item) => hasPermission(item.permission));
  }, [userRole]);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              label={userRole.name}
              size="small"
              sx={{
                mt: 1,
                backgroundColor: alpha('#ffffff', 0.15),
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          </>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 1.5, px: sidebarCollapsed ? 0.5 : 1 }}>
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
              onClick={handleLogout}
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
            onClick={handleLogout}
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
            overflowY: 'auto',
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
        }}
      >
        {/* Mobile Menu Button */}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#0f172a',
            color: '#ffffff',
            width: 56,
            height: 56,
            boxShadow: 3,
            zIndex: 1000,
            '&:hover': {
              bgcolor: '#1e293b',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Content Area */}
        {children}
      </Box>
    </Box>
  );
};

export default SystemLayout;