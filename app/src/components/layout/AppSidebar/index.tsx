import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  MenuBook,
  Dashboard,
  LocationOn,
  ShoppingCart,
  Category,
  LocalOffer,
  People,
  Settings,
  CheckCircle,
  Cancel,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { useUserData } from '../../../contexts/application/UserData';
import { useSidebar } from '../../../contexts/common/Sidebar';
import { venueService } from '../../../services/application/venue.service';
import PermissionService from '../../../services/auth/permission';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';
import { getUserFirstName } from '../../../utils/data/userUtils';
import DinoLogo from '../../ui/DinoLogo';
import './AppSidebar.css';

export const DRAWER_WIDTH = 260;
export const COLLAPSED_WIDTH = 68;

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions: string[];
  category?: string;
  description?: string;
}

interface MenuCategory {
  name: string;
  label: string;
  order: number;
}

interface AppSidebarProps {
  isTablet?: boolean;
}

const SIDEBAR_BG = '#0f172a';

const allMenuItems: NavigationItem[] = [
  {
    label: 'Menu',
    path: '/admin/pos',
    icon: <MenuBook />,
    requiredPermissions: ['application.orders.create'],
    category: 'main',
    description: 'Manual order entry',
  },
  {
    label: 'Dashboard',
    path: '/admin',
    icon: <Dashboard />,
    requiredPermissions: ['application.dashboard.read'],
    category: 'main',
  },
  {
    label: 'Order',
    path: '/admin/orders',
    icon: <ShoppingCart />,
    requiredPermissions: ['application.orders.read'],
    category: 'main',
  },
  {
    label: 'Catalog',
    path: '/admin/catalog',
    icon: <Category />,
    requiredPermissions: ['application.items.read', 'application.categories.read'],
    category: 'management',
  },
  {
    label: 'Location',
    path: '/admin/locations',
    icon: <LocationOn />,
    requiredPermissions: ['application.areas.read', 'application.tables.read'],
    category: 'management',
  },
  {
    label: 'Coupon',
    path: '/admin/coupons',
    icon: <LocalOffer />,
    requiredPermissions: ['application.coupons.read'],
    category: 'management',
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: <People />,
    requiredPermissions: ['application.users.read'],
    category: 'management',
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: <Settings />,
    requiredPermissions: ['application.workspace.read'],
    category: 'settings',
  },
];

const menuCategories: MenuCategory[] = [
  { name: 'main', label: 'Main', order: 1 },
  { name: 'management', label: 'Management', order: 2 },
  { name: 'settings', label: 'Settings', order: 3 },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ isTablet = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasBackendPermission, userPermissions } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const { isCollapsed, toggleCollapsed } = useSidebar();

  const [statusLoading, setStatusLoading] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // On desktop: isCollapsed drives collapse state.
  // On mobile: isCollapsed drives the temporary drawer open/close.
  const isMobileOpen = !isCollapsed; // mobile drawer open when NOT collapsed

  // Resolve role display name
  const detectedRole = (
    userPermissions?.role?.name ||
    PermissionService.getBackendRole()?.name ||
    (user as any)?.role ||
    ''
  ).toLowerCase();

  const roleDisplayName = (() => {
    if (!detectedRole) return 'User';
    const roleDefinition = PermissionService.getRoleDefinition(detectedRole);
    return roleDefinition?.displayName || detectedRole;
  })();

  // Filter nav items by backend permissions
  const adminNavItems = allMenuItems.filter(
    (item) =>
      item.requiredPermissions.length === 0 ||
      item.requiredPermissions.some((p) => hasBackendPermission(p))
  );

  // Group items by category
  const groupedNavItems = menuCategories
    .map((category) => ({
      ...category,
      items: adminNavItems.filter((item) => item.category === category.name),
    }))
    .filter((group) => group.items.length > 0);

  // Venue status
  const venueStatus = userData?.venue
    ? {
        isActive: userData.venue.isActive || false,
        isOpen: userData.venue.isOpen || false,
        venueName: userData.venue.name || 'Current Venue',
      }
    : null;

  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;
    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;
      await venueService.updateVenue(userData.venue.id, { is_open: newStatus });
      await refreshUserData();
    } catch {
      alert('Failed to update venue status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

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

  // ─── Shared drawer content ────────────────────────────────────────────────

  const renderHeader = (isMobileDrawer: boolean) => {
    const collapsed = !isMobileDrawer && isCollapsed;

    return (
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          backgroundColor: 'rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DinoLogo size={32} />
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#ffffff',
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                  mb: 0.25,
                }}
              >
                Dino
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Admin Panel
              </Typography>
            </Box>
          </Box>
        )}

        {collapsed && <DinoLogo size={28} />}

        {/* Desktop collapse/expand toggle */}
        {!isMobileDrawer && (
          <Tooltip
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            placement="right"
          >
            <IconButton
              onClick={toggleCollapsed}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}

        {/* Mobile close button */}
        {isMobileDrawer && (
          <IconButton
            onClick={toggleCollapsed}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
    );
  };

  const renderVenueStatus = (isMobileDrawer: boolean) => {
    if (!venueStatus) return null;
    const collapsed = !isMobileDrawer && isCollapsed;

    if (collapsed) {
      return (
        <Box
          sx={{
            p: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tooltip
            title={`${venueStatus.isOpen ? 'Accepting Orders' : 'Closed for Orders'} — Click to toggle`}
            placement="right"
          >
            <span>
              <IconButton
                onClick={handleToggleVenueOpen}
                disabled={statusLoading || !venueStatus.isActive}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: venueStatus.isOpen
                    ? alpha('#1976d2', 0.15)
                    : alpha('#ef4444', 0.15),
                  border: venueStatus.isOpen
                    ? '2px solid rgba(25,118,210,0.4)'
                    : '2px solid rgba(239,68,68,0.4)',
                  '&:hover': {
                    backgroundColor: venueStatus.isOpen
                      ? alpha('#1976d2', 0.25)
                      : alpha('#ef4444', 0.25),
                  },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {statusLoading ? (
                  <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                ) : venueStatus.isOpen ? (
                  <CheckCircle sx={{ fontSize: 20, color: '#42a5f5' }} />
                ) : (
                  <Cancel sx={{ fontSize: 20, color: '#f87171' }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    }

    return (
      <Box
        sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        data-tour="venue-status"
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              display: 'block',
              mb: 1,
            }}
          >
            Order Status
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600 }}
            >
              {venueStatus.isOpen ? 'Accepting Orders' : 'Closed for Orders'}
            </Typography>
            <Chip
              label={venueStatus.isOpen ? 'Open' : 'Closed'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 700,
                bgcolor: venueStatus.isOpen
                  ? alpha('#1976d2', 0.2)
                  : alpha('#ef4444', 0.15),
                color: venueStatus.isOpen ? '#42a5f5' : '#f87171',
                border: 'none',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={venueStatus.isOpen}
                onChange={handleToggleVenueOpen}
                disabled={statusLoading || !venueStatus.isActive}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {statusLoading && <CircularProgress size={12} sx={{ color: 'rgba(255,255,255,0.6)' }} />}
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}
                >
                  {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                </Typography>
              </Box>
            }
            sx={{ m: 0, alignItems: 'center' }}
          />
        </Box>
      </Box>
    );
  };

  const renderNavList = (isMobileDrawer: boolean) => {
    const collapsed = !isMobileDrawer && isCollapsed;

    return (
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1.5,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
          },
        }}
        data-tour="sidebar-navigation"
      >
        {groupedNavItems.map((group, groupIndex) => (
          <Box key={group.name}>
            {/* Category label (expanded) */}
            {!collapsed && (
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '1px',
                  display: 'block',
                  px: 2,
                  pt: groupIndex === 0 ? 0.5 : 1.5,
                  pb: 0.5,
                }}
              >
                {group.label}
              </Typography>
            )}

            {/* Divider between groups in collapsed state */}
            {collapsed && groupIndex > 0 && (
              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            )}

            <List disablePadding sx={{ px: collapsed ? 0.75 : 1 }}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;

                const listItemButton = (
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.25,
                      minHeight: 44,
                      px: collapsed ? 1 : 1.5,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: isActive ? alpha('#ffffff', 0.15) : 'transparent',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: isActive
                          ? alpha('#ffffff', 0.18)
                          : alpha('#ffffff', 0.08),
                      },
                      '&::before': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: '#ffffff',
                            borderRadius: '0 2px 2px 0',
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 36,
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.85)',
                          noWrap: true,
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                return collapsed ? (
                  <Tooltip key={item.label} title={item.label} placement="right" arrow>
                    {listItemButton}
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.label}>{listItemButton}</React.Fragment>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    );
  };

  const renderUserFooter = (isMobileDrawer: boolean) => {
    if (!user) return null;
    const collapsed = !isMobileDrawer && isCollapsed;

    if (collapsed) {
      return (
        <Box
          sx={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            py: 1.5,
            px: 1,
          }}
        >
          <Tooltip title="Settings" placement="right">
            <Avatar
              onClick={() => navigate('/admin/settings')}
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#1976d2',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.2)',
                '&:hover': { border: '2px solid rgba(255,255,255,0.4)' },
              }}
            >
              {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Avatar>
          </Tooltip>
          <Tooltip title="Logout" placement="right">
            <IconButton
              size="small"
              onClick={handleLogoutClick}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#f87171',
                  backgroundColor: alpha('#ef4444', 0.1),
                },
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(0,0,0,0.2)',
          p: 2,
        }}
      >
        {/* User info row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#1976d2',
              fontSize: '1rem',
              fontWeight: 700,
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontSize: '0.875rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.25,
              }}
            >
              {getUserFirstName(user) || user.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {roleDisplayName}
            </Typography>
          </Box>
        </Box>

        {/* Logout button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogoutClick}
          sx={{
            borderColor: alpha('#ffffff', 0.3),
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 500,
            borderRadius: 1.5,
            py: 0.75,
            '&:hover': {
              borderColor: '#ffffff',
              bgcolor: alpha('#ffffff', 0.1),
            },
          }}
        >
          Logout
        </Button>
      </Box>
    );
  };

  // ─── Drawer inner content ─────────────────────────────────────────────────

  const drawerContent = (isMobileDrawer: boolean) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: SIDEBAR_BG,
        width: isMobileDrawer ? DRAWER_WIDTH : isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        overflow: 'hidden',
      }}
    >
      {renderHeader(isMobileDrawer)}
      {renderVenueStatus(isMobileDrawer)}
      {renderNavList(isMobileDrawer)}
      {renderUserFooter(isMobileDrawer)}
    </Box>
  );

  return (
    <>
      {/* Desktop — permanent Drawer, collapsible */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: SIDEBAR_BG,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            boxShadow: '4px 0 12px rgba(0,0,0,0.3)',
          },
        }}
        open
      >
        {drawerContent(false)}
      </Drawer>

      {/* Mobile — temporary Drawer, full width */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={toggleCollapsed}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: SIDEBAR_BG,
            boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
          },
        }}
      >
        {drawerContent(true)}
      </Drawer>

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

export default AppSidebar;
