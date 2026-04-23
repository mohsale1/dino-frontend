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
  Tooltip,
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
  ChevronRight,
  AccountCircle,
  QrCode2,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DinoLogo from '../../ui/DinoLogo';
import { useAuth } from '../../../contexts/common/Auth';
import { PERMISSIONS } from '../../../types/auth/permissions';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';

const DRAWER_WIDTH   = 260;
const COLLAPSED_WIDTH = 68;

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  permission?: string;
  path: string;
}

const SystemLayout: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, hasBackendPermission, userPermissions } = useAuth();

  // Mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop sidebar collapsed (icon-only mode) â€” does NOT affect mobile
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const roleName = useMemo(() => {
    const name =
      userPermissions?.role?.name ||
      (user as any)?.role?.name ||
      (user as any)?.role ||
      '';
    return typeof name === 'string' ? name : '';
  }, [userPermissions, user]);

  // menuItems is memoized with empty deps since icons and paths are all static constants
  const menuItems = useMemo<MenuItem[]>(() => [
    { title: 'Dashboard',           icon: <DashboardIcon fontSize="small" />,      permission: PERMISSIONS.SYSTEM_DASHBOARD_VIEW,    path: '/system/dashboard' },
    { title: 'Users',               icon: <People fontSize="small" />,             permission: PERMISSIONS.SYSTEM_USERS_VIEW,        path: '/system/users' },
    { title: 'Billing',             icon: <Payment fontSize="small" />,            permission: PERMISSIONS.SYSTEM_BILLING_VIEW,      path: '/system/billing' },
    { title: 'Workspaces',          icon: <Business fontSize="small" />,           permission: PERMISSIONS.SYSTEM_WORKSPACES_VIEW,   path: '/system/workspaces' },
    { title: 'Roles & Permissions', icon: <AdminPanelSettings fontSize="small" />, permission: PERMISSIONS.SYSTEM_ROLES_VIEW,        path: '/system/roles-permissions' },
    { title: 'Registration Codes',  icon: <QrCode2 fontSize="small" />,            permission: PERMISSIONS.SYSTEM_REGISTRATION_VIEW, path: '/system/registration-codes' },
    { title: 'Appearance',          icon: <Palette fontSize="small" />,            permission: PERMISSIONS.SYSTEM_SETTINGS_VIEW,     path: '/system/appearance' },
    { title: 'Profile',             icon: <AccountCircle fontSize="small" />,                                                        path: '/system/profile' },
    { title: 'Settings',            icon: <Settings fontSize="small" />,           permission: PERMISSIONS.SYSTEM_SETTINGS_VIEW,     path: '/system/settings' },
  ], []);

  const availableMenuItems = useMemo(
    () => menuItems.filter(item => !item.permission || hasBackendPermission(item.permission)),
    [menuItems, hasBackendPermission],
  );

  // Items that require a permission (used to detect "no access" state)
  const permissionedItems = useMemo(
    () => menuItems.filter(item => !!item.permission),
    [menuItems],
  );
  const hasNoModuleAccess = useMemo(
    () => permissionedItems.every(item => !hasBackendPermission(item.permission!)),
    [permissionedItems, hasBackendPermission],
  );

  const handleNav = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  // â”€â”€ Shared nav list (used in both mobile full drawer and desktop collapsed/expanded) â”€â”€
  const navList = (isCollapsedMode: boolean) => (
    <List sx={{
      flexGrow: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      py: 1.5,
      px: isCollapsedMode ? 0.75 : 1,
      '&::-webkit-scrollbar': { width: 4 },
      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
    }}>
      {/* No-access notice â€” shown when user has no module view permissions */}
      {hasNoModuleAccess && !isCollapsedMode && (
        <Box sx={{ px: 1.5, py: 2, mx: 0.5, mb: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', lineHeight: 1.5, display: 'block' }}>
            No modules are assigned to your role. Contact a system administrator to request access.
          </Typography>
        </Box>
      )}
      {availableMenuItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        const btn = (
          <ListItemButton
            key={index}
            selected={isActive}
            onClick={() => handleNav(item.path)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              justifyContent: isCollapsedMode ? 'center' : 'flex-start',
              px: isCollapsedMode ? 1 : 1.5,
              minHeight: 40,
              '&.Mui-selected': {
                bgcolor: alpha('#ffffff', 0.15),
                '&:hover': { bgcolor: alpha('#ffffff', 0.2) },
              },
              '&:hover': { bgcolor: alpha('#ffffff', 0.08) },
            }}
          >
            <ListItemIcon sx={{ color: '#ffffff', minWidth: isCollapsedMode ? 'auto' : 36, '& svg': { fontSize: 20 } }}>
              {item.icon}
            </ListItemIcon>
            {!isCollapsedMode && (
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  sx: { color: '#ffffff', fontWeight: isActive ? 600 : 400, fontSize: '0.875rem' },
                }}
              />
            )}
          </ListItemButton>
        );

        // Wrap in Tooltip when collapsed for accessibility
        return isCollapsedMode ? (
          <Tooltip key={index} title={item.title} placement="right" arrow>
            <span>{btn}</span>
          </Tooltip>
        ) : btn;
      })}
    </List>
  );

  // â”€â”€ Full sidebar content (mobile always full, desktop depends on collapsed) â”€â”€
  // isMobile: true when rendered inside the temporary mobile drawer
  const sidebarContent = (isCollapsedMode: boolean, isMobile = false) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>

      {/* â”€â”€ Logo header â”€â”€ */}
      <Box sx={{
        px: isCollapsedMode ? 1 : 2.5,
        py: 2,
        borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsedMode ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        {!isCollapsedMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <DinoLogo size={32} animated={false} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                System Admin
              </Typography>
              <Chip
                label={roleName || 'System User'}
                size="small"
                sx={{ mt: 0.5, bgcolor: alpha('#ffffff', 0.15), color: '#ffffff', fontWeight: 600, fontSize: '0.68rem', height: 18, textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        )}

        {isCollapsedMode && (
          <DinoLogo size={28} animated={false} />
        )}

        {/* Mobile: close (X) button â€” closes the drawer */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            size="small"
            sx={{ color: alpha('#ffffff', 0.6), flexShrink: 0, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}

        {/* Desktop expanded: collapse toggle */}
        {!isMobile && !isCollapsedMode && (
          <IconButton
            onClick={() => setCollapsed(true)}
            size="small"
            sx={{ color: alpha('#ffffff', 0.6), flexShrink: 0, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Expand button when collapsed */}
      {isCollapsedMode && (
        <Box sx={{ px: 0.75, pt: 1 }}>
          <Tooltip title="Expand sidebar" placement="right" arrow>
            <IconButton
              onClick={() => setCollapsed(false)}
              sx={{ width: '100%', borderRadius: 1.5, color: alpha('#ffffff', 0.6), '&:hover': { bgcolor: alpha('#ffffff', 0.08), color: '#ffffff' } }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* â”€â”€ Nav list â”€â”€ */}
      {navList(isCollapsedMode)}

      <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />

      {/* â”€â”€ User footer â”€â”€ */}
      <Box sx={{ p: isCollapsedMode ? 0.75 : 2 }}>
        {!isCollapsedMode ? (
          <>
            {/* Clickable profile row */}
            <Box
              onClick={() => handleNav('/system/profile')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: alpha('#ffffff', 0.08) },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#ffffff', 0.2), fontSize: '0.875rem', flexShrink: 0 }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email?.split('@')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.6), fontSize: '0.6875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Logout fontSize="small" />}
              onClick={() => setShowLogout(true)}
              sx={{
                borderColor: alpha('#ffffff', 0.3),
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.8125rem',
                py: 0.75,
                borderRadius: 1.5,
                '&:hover': { borderColor: '#ffffff', bgcolor: alpha('#ffffff', 0.1) },
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          /* Collapsed: avatar navigates to profile, logout icon below */
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title="My Profile" placement="right" arrow>
              <Avatar
                onClick={() => handleNav('/system/profile')}
                sx={{
                  width: 34, height: 34,
                  bgcolor: alpha('#ffffff', 0.2),
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  '&:hover': { bgcolor: alpha('#ffffff', 0.35) },
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Tooltip title="Logout" placement="right" arrow>
              <IconButton
                onClick={() => setShowLogout(true)}
                sx={{ color: alpha('#ffffff', 0.6), borderRadius: 1.5, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

        {/* â”€â”€ Mobile drawer â€” always full width, no collapse â”€â”€ */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent(false, true)}
        </Drawer>

        {/* â”€â”€ Desktop drawer â€” collapsible â”€â”€ */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 'none',
              boxSizing: 'border-box',
              transition: 'width 0.25s ease',
              overflowX: 'hidden',
              overflowY: 'hidden',
              position: 'fixed',
              height: '100vh',
              top: 0,
              left: 0,
            },
          }}
          open
        >
          {sidebarContent(collapsed)}
        </Drawer>

        {/* â”€â”€ Main content â”€â”€ */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            overflowY: 'auto',
            overflowX: 'hidden',
            // On desktop shift right by sidebar width; on mobile full width with top bar offset
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            marginLeft: { xs: 0, md: `${drawerWidth}px` },
            transition: 'margin-left 0.25s ease, width 0.25s ease',
            pt: { xs: '56px', md: 0 },
          }}
        >
          {/* â”€â”€ Mobile top navbar â”€â”€ */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: 56,
            bgcolor: '#0f172a',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            zIndex: 1200,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {/* Hamburger */}
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#ffffff', p: 1 }}>
              <MenuIcon />
            </IconButton>

            {/* Title */}
            <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem' }}>
              System Admin
            </Typography>

            {/* Avatar â€” clickable â†’ profile */}
            <Avatar
              onClick={() => navigate('/system/profile')}
              sx={{
                width: 32, height: 32,
                bgcolor: 'rgba(255,255,255,0.15)',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1.5px solid rgba(255,255,255,0.25)',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </Avatar>
          </Box>

          <Outlet />
        </Box>
      </Box>

      <ConfirmationDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => { setShowLogout(false); logout(); navigate('/login'); }}
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
