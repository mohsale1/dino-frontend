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

export const DRAWER_WIDTH = 240;
export const COLLAPSED_WIDTH = 60;

// Order type constants
// 0 = online (QR / self-service), 1 = POS (manual / counter)
export const ORDER_TYPE_ONLINE = 0;
export const ORDER_TYPE_POS = 1;

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions: string[];
  category?: string;
  description?: string;
  /** When set, item is only shown for the specified order type. Omit to show for all types. */
  orderTypeRestriction?: number;
}

interface MenuCategory {
  name: string;
  label: string;
  order: number;
}

interface AppSidebarProps {
  isTablet?: boolean;
}

const SIDEBAR_BG = '#ffffff';

const allMenuItems: NavigationItem[] = [
  {
    label: 'Menu',
    path: '/admin/pos',
    icon: <MenuBook />,
    requiredPermissions: ['application.pos.view'],
    category: 'main',
    description: 'Manual order entry',
    orderTypeRestriction: ORDER_TYPE_POS,
  },
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <Dashboard />,
    requiredPermissions: ['application.dashboard.view'],
    category: 'main',
  },
  {
    label: 'Order',
    path: '/admin/orders',
    icon: <ShoppingCart />,
    requiredPermissions: ['application.orders.view'],
    category: 'main',
  },
  {
    label: 'Catalog',
    path: '/admin/catalog',
    icon: <Category />,
    requiredPermissions: ['application.catalog.view'],
    category: 'management',
  },
  {
    label: 'Location',
    path: '/admin/locations',
    icon: <LocationOn />,
    requiredPermissions: ['application.locations.view'],
    category: 'management',
    orderTypeRestriction: ORDER_TYPE_ONLINE,
  },
  {
    label: 'Coupon',
    path: '/admin/coupons',
    icon: <LocalOffer />,
    requiredPermissions: ['application.coupons.view'],
    category: 'management',
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: <People />,
    requiredPermissions: ['application.users.view'],
    category: 'management',
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: <Settings />,
    requiredPermissions: ['application.settings.view'],
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

  // Resolve venue order type: 0 = online, 1 = POS. Undefined means not yet loaded.
  const venueOrderType: number | undefined = userData?.venue?.orderType;

  // Filter nav items by backend permissions and order type
  const adminNavItems = allMenuItems.filter((item) => {
    // Permission check: item must have at least one granted permission
    const hasAccess =
      item.requiredPermissions.length === 0 ||
      item.requiredPermissions.some((p) => hasBackendPermission(p));

    if (!hasAccess) return false;

    // Order type check: only apply when the venue order type is known
    if (item.orderTypeRestriction !== undefined && venueOrderType !== undefined) {
      return venueOrderType === item.orderTypeRestriction;
    }

    return true;
  });

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
    if (!userData?.venue?.id || !userData?.workspace?.id || statusLoading || !venueStatus) return;
    const newStatus = !venueStatus.isOpen;
    try {
      setStatusLoading(true);
      await venueService.setVenueOpenStatus(userData.venue.id, newStatus, userData.workspace.id);
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
      <>
        {/* ── Logo / title bar ── */}
        <Box
          sx={{
            px: collapsed ? 1 : 2,
            py: 1.5,
            borderBottom: '1px solid #e2e8f0',
            minHeight: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          {/* Expanded: logo + text */}
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DinoLogo size={32} />
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    lineHeight: 1.2,
                  }}
                >
                  Admin Panel
                </Typography>
                <Chip
                  label={roleDisplayName || 'User'}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: '#eef2ff',
                    color: '#6366f1',
                    fontWeight: 600,
                    fontSize: '0.68rem',
                    height: 18,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Collapsed: logo only, centered */}
          {collapsed && <DinoLogo size={28} />}

          {/* Expanded desktop: collapse button */}
          {!isMobileDrawer && !collapsed && (
            <Tooltip title="Collapse sidebar" placement="right">
              <IconButton
                onClick={toggleCollapsed}
                size="small"
                sx={{
                  color: '#94a3b8',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Mobile: close button */}
          {isMobileDrawer && (
            <IconButton
              onClick={toggleCollapsed}
              size="small"
              sx={{
                color: '#94a3b8',
                '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* ── Collapsed desktop: expand button row (below logo, above nav) ── */}
        {collapsed && !isMobileDrawer && (
          <Box
            sx={{
              px: 0.75,
              pt: 1,
              pb: 0.5,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Tooltip title="Expand sidebar" placement="right" arrow>
              <IconButton
                onClick={toggleCollapsed}
                sx={{
                  width: '100%',
                  borderRadius: 1.5,
                  color: '#94a3b8',
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </>
    );
  };


  const renderVenueStatus = (isMobileDrawer: boolean) => {
    if (!venueStatus) return null;
    if (!hasBackendPermission('application.status.update')) return null;
    const collapsed = !isMobileDrawer && isCollapsed;
    const isOpen = venueStatus.isOpen;

    if (collapsed) {
      return (
        <Box
          sx={{
            p: 1,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tooltip
            title={`${isOpen ? 'Accepting Orders' : 'Closed for Orders'} — Click to toggle`}
            placement="right"
          >
            <span>
              <IconButton
                onClick={handleToggleVenueOpen}
                disabled={statusLoading || !venueStatus.isActive}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: isOpen
                    ? alpha('#16a34a', 0.08)
                    : alpha('#dc2626', 0.08),
                  border: `1.5px solid ${isOpen ? alpha('#16a34a', 0.3) : alpha('#dc2626', 0.25)}`,
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: isOpen
                      ? alpha('#16a34a', 0.15)
                      : alpha('#dc2626', 0.15),
                  },
                  '&:disabled': { opacity: 0.45 },
                }}
              >
                {statusLoading ? (
                  <CircularProgress size={14} sx={{ color: '#64748b' }} />
                ) : isOpen ? (
                  <CheckCircle sx={{ fontSize: 18, color: '#16a34a' }} />
                ) : (
                  <Cancel sx={{ fontSize: 18, color: '#dc2626' }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    }

    return (
      <Box
        sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #e2e8f0' }}
        data-tour="venue-status"
      >
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${isOpen ? alpha('#16a34a', 0.2) : alpha('#dc2626', 0.18)}`,
            bgcolor: isOpen ? alpha('#16a34a', 0.04) : alpha('#dc2626', 0.04),
          }}
        >
          {/* Status header row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              pt: 1.25,
              pb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {/* Status dot */}
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: isOpen ? '#16a34a' : '#dc2626',
                  flexShrink: 0,
                  boxShadow: isOpen
                    ? `0 0 0 2px ${alpha('#16a34a', 0.2)}`
                    : `0 0 0 2px ${alpha('#dc2626', 0.2)}`,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: isOpen ? '#16a34a' : '#dc2626',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                {isOpen ? 'Open' : 'Closed'}
              </Typography>
            </Box>

            {/* Toggle switch */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {statusLoading && (
                <CircularProgress size={11} sx={{ color: '#94a3b8' }} />
              )}
              <Switch
                checked={isOpen}
                onChange={handleToggleVenueOpen}
                disabled={statusLoading || !venueStatus.isActive}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#16a34a',
                    '& + .MuiSwitch-track': { bgcolor: '#16a34a' },
                  },
                  '& .MuiSwitch-switchBase': {
                    color: '#dc2626',
                    '& + .MuiSwitch-track': { bgcolor: '#dc2626' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Subtitle */}
          <Box
            sx={{
              px: 1.5,
              pb: 1.25,
              borderTop: '1px solid #e2e8f0',
              pt: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.6875rem',
                color: '#64748b',
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {isOpen ? 'Customers can place orders' : 'Orders are paused'}
            </Typography>
          </Box>
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
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            '&:hover': { backgroundColor: '#cbd5e1' },
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
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.8px',
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
              <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />
            )}

            <List disablePadding sx={{ px: collapsed ? 0.75 : 1 }}>
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);

                const listItemButton = (
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.25,
                      minHeight: collapsed ? 36 : 34,
                      px: collapsed ? 0.75 : 1.25,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: isActive ? '#eef2ff' : 'transparent',
                      color: isActive ? '#6366f1' : '#475569',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: isActive ? '#eef2ff' : '#f8fafc',
                      },
                      '&::before': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: '#6366f1',
                            borderRadius: '0 2px 2px 0',
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 32,
                        color: 'inherit',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': { fontSize: '1rem' },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 500,
                          color: 'inherit',
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
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
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
                bgcolor: '#6366f1',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '2px solid #e2e8f0',
                '&:hover': { border: '2px solid #6366f1' },
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
                color: '#64748b',
                '&:hover': {
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
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
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          p: 2,
        }}
      >
        {/* User info row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#6366f1',
              fontSize: '1rem',
              fontWeight: 700,
              flexShrink: 0,
              border: '2px solid #e2e8f0',
            }}
          >
            {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
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
                color: '#64748b',
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
            borderColor: '#e2e8f0',
            color: '#64748b',
            fontSize: '0.8125rem',
            fontWeight: 500,
            borderRadius: 1.5,
            py: 0.75,
            '&:hover': {
              borderColor: '#fecaca',
              color: '#dc2626',
              bgcolor: '#fef2f2',
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
        maxHeight: '100%',
        bgcolor: SIDEBAR_BG,
        width: isMobileDrawer ? DRAWER_WIDTH : isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        overflow: 'hidden',
        position: 'relative',
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
            boxShadow: '1px 0 0 #e2e8f0',
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
            boxShadow: '1px 0 0 #e2e8f0',
            overflow: 'hidden',
            height: '100%',
            position: 'fixed',
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
