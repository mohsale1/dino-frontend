import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  alpha,
  useScrollTrigger,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  KeyboardArrowDown,
  PowerSettingsNew,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { useUserData } from '../../../contexts/application/UserData';
import DinoLogo from '../../ui/DinoLogo';
import AppMobileMenu from '../AppMobileMenu';
import { ConfirmationDialog } from '../../dialogs';
import { NotificationCenter } from '../../common';
import { getUserFirstName, getUserInitials } from '../../../utils/data/userUtils';
import { venueService } from '../../../services/application/venue.service';
import { PERMISSIONS } from '../../../types/auth/permissions';

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAV_BG       = '#ffffff';
const BLUE         = '#1976D2';
const BLUE_LT      = '#42A5F5';
const BORDER_COLOR = '#e0e0e0';
const MUTED        = '#999999';
const TEXT_DIM     = '#666666';

// ── Admin nav definition ──────────────────────────────────────────────────────

interface AdminNavItem {
  label: string;
  path: string;
  permission: string;
  orderTypeRestriction?: number;
}

const ALL_ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', permission: PERMISSIONS.APPLICATION_DASHBOARD_VIEW },
  { label: 'POS',       path: '/admin/pos',       permission: PERMISSIONS.APPLICATION_POS_VIEW,      orderTypeRestriction: 1 },
  { label: 'Orders',    path: '/admin/orders',    permission: PERMISSIONS.APPLICATION_ORDERS_VIEW    },
  { label: 'Catalog',   path: '/admin/catalog',   permission: PERMISSIONS.APPLICATION_CATALOG_VIEW   },
  { label: 'Locations', path: '/admin/locations', permission: PERMISSIONS.APPLICATION_LOCATIONS_VIEW, orderTypeRestriction: 0 },
  { label: 'Coupons',   path: '/admin/coupons',   permission: PERMISSIONS.APPLICATION_COUPONS_VIEW   },
  { label: 'Users',     path: '/admin/users',     permission: PERMISSIONS.APPLICATION_USERS_VIEW     },
  { label: 'Personas',  path: '/admin/personas',  permission: PERMISSIONS.APPLICATION_PERSONAS_VIEW  },
  { label: 'Settings',  path: '/admin/settings',  permission: PERMISSIONS.APPLICATION_SETTINGS_VIEW  },
];

// ── AppHeader ─────────────────────────────────────────────────────────────────

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLg     = useMediaQuery(theme.breakpoints.up('lg'));

  const { user, logout, hasBackendPermission } = useAuth();
  const { userData, refreshUserData }          = useUserData();

  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [statusLoading,   setStatusLoading]   = useState(false);

  const scrollTrigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  // ── Derived venue data ──────────────────────────────────────────────────────

  const venueOrderType = userData?.venue?.orderType;
  const venueIsOpen    = userData?.venue?.isOpen ?? false;
  const canToggleVenue =
    hasBackendPermission(PERMISSIONS.APPLICATION_SETTINGS_VIEW) ||
    hasBackendPermission('application.status.update');

  // ── Filtered admin nav items ────────────────────────────────────────────────

  const navItems = useMemo<AdminNavItem[]>(() => {
    return ALL_ADMIN_NAV.filter((item) => {
      if (!hasBackendPermission(item.permission)) return false;
      if (item.orderTypeRestriction !== undefined && venueOrderType !== undefined) {
        return venueOrderType === item.orderTypeRestriction;
      }
      return true;
    });
  }, [hasBackendPermission, venueOrderType]);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout  = () => setLogoutModalOpen(true);
  const confirmLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
    setLogoutModalOpen(false);
  };

  // ── Venue toggle ────────────────────────────────────────────────────────────

  const handleToggleVenue = async () => {
    if (!userData?.venue?.id || statusLoading) return;
    setStatusLoading(true);
    try {
      await venueService.setVenueOpenStatus(
        userData.venue.id,
        !venueIsOpen,
      );
      await refreshUserData();
    } catch {
      // silent
    } finally {
      setStatusLoading(false);
    }
  };

  // ── User display values ─────────────────────────────────────────────────────

  const userInitials  = user ? getUserInitials(user) : '';
  const userFirstName = user ? (getUserFirstName(user) || user.email || 'Account') : '';

  // ============================================================================
  // RENDERERS
  // ============================================================================

  /** Nav items — active = dark text + 2px blue underline at bottom of toolbar */
  const renderAdminDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: 64 }}>
      {navItems.map((item) => {
        const active = location.pathname.startsWith(item.path);
        return (
          <Box
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              cursor: 'pointer',
              color: active ? '#1C1C1E' : TEXT_DIM,
              fontWeight: active ? 600 : 400,
              fontSize: '0.875rem',
              letterSpacing: '0.01em',
              userSelect: 'none',
              transition: 'color 0.18s ease',
              '&:hover': { color: '#1C1C1E' },
              '&::after': active ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 12px)',
                height: '2px',
                borderRadius: '2px 2px 0 0',
                bgcolor: BLUE,
              } : {},
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );

  /** Venue toggle — Switch with Open/Closed label + venue name */
  const renderVenueToggle = () => {
    if (!canToggleVenue || !userData?.venue) return null;
    const venueName = userData.venue.name || 'Venue';

    return (
      <Tooltip
        title={venueIsOpen ? 'Click to close venue' : 'Click to open venue'}
        placement="bottom"
        arrow
      >
        <Box
          onClick={statusLoading ? undefined : handleToggleVenue}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.625,
            borderRadius: '10px',
            bgcolor: alpha('#000', 0.04),
            border: `1px solid ${BORDER_COLOR}`,
            cursor: statusLoading ? 'default' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s ease',
            '&:hover': statusLoading ? {} : { bgcolor: alpha('#000', 0.07) },
            userSelect: 'none',
          }}
        >
          <Box sx={{ display: { md: 'none', lg: 'block' } }}>
            <Typography sx={{ fontSize: '0.6875rem', color: MUTED, lineHeight: 1, mb: 0.2 }}>
              {venueName}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: venueIsOpen ? '#16a34a' : MUTED,
              lineHeight: 1,
              transition: 'color 0.2s ease',
              minWidth: 38,
            }}
          >
            {venueIsOpen ? 'Open' : 'Closed'}
          </Typography>

          {statusLoading ? (
            <CircularProgress size={14} sx={{ color: MUTED, mx: 0.25 }} />
          ) : (
            <Switch
              checked={venueIsOpen}
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={handleToggleVenue}
              disabled={statusLoading}
              sx={{
                width: 36, height: 20, p: 0,
                '& .MuiSwitch-switchBase': {
                  p: '3px',
                  '&.Mui-checked': {
                    transform: 'translateX(16px)',
                    color: '#ffffff',
                    '& + .MuiSwitch-track': { bgcolor: '#22c55e', opacity: 1 },
                  },
                },
                '& .MuiSwitch-thumb': { width: 14, height: 14, boxShadow: 'none' },
                '& .MuiSwitch-track': { borderRadius: 10, bgcolor: '#cbd5e1', opacity: 1 },
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: NAV_BG,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxShadow: scrollTrigger
            ? '0 1px 4px rgba(0,0,0,0.08)'
            : 'none',
          transition: 'box-shadow 0.25s ease',
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            minHeight: '64px !important',
            height: 64,
            px: { xs: 1.5, sm: 2, md: 3 },
          }}
        >
          {/* ── Logo ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flexShrink: 0,
              mr: { md: '20px' },
              opacity: 1,
              '&:hover': { opacity: 0.85 },
              transition: 'opacity 0.2s ease',
            }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <DinoLogo size={30} animated={false} />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.0625rem',
                color: '#1C1C1E',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Dino
            </Typography>
          </Box>

          {/* ── Desktop: nav items left-aligned after logo ── */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {renderAdminDesktopNav()}
            </Box>
          )}

          {/* ── Spacer ── */}
          <Box sx={{ flex: 1 }} />

          {/* ── Right actions (desktop) ── */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>

              {/* Venue toggle */}
              {renderVenueToggle()}

              {/* Divider */}
              {canToggleVenue && userData?.venue && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: BORDER_COLOR, mx: 0.5, my: 1.5 }}
                />
              )}

              {/* Notification center */}
              <Box
                sx={{
                  '& .MuiIconButton-root': {
                    color: TEXT_DIM,
                    '&:hover': { color: '#1C1C1E', bgcolor: alpha('#000', 0.06) },
                  },
                  '& .MuiBadge-badge': {
                    bgcolor: '#EF5350',
                  },
                }}
              >
                <NotificationCenter />
              </Box>

              {/* Divider */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: BORDER_COLOR, mx: 0.5, my: 1.5 }}
              />

              {/* Avatar + name */}
              {user && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.875,
                    cursor: 'pointer',
                    px: 1,
                    py: 0.5,
                    borderRadius: '8px',
                    border: `1px solid transparent`,
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      bgcolor: alpha('#000', 0.04),
                      borderColor: BORDER_COLOR,
                    },
                  }}
                  onClick={() => navigate('/admin/settings')}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LT} 100%)`,
                      color: '#ffffff',
                      flexShrink: 0,
                      boxShadow: `0 0 0 2px ${alpha(BLUE_LT, 0.25)}`,
                    }}
                  >
                    {userInitials}
                  </Avatar>
                  {isLg && (
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: '#1C1C1E',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 120,
                        }}
                      >
                        {userFirstName}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          color: TEXT_DIM,
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Admin
                      </Typography>
                    </Box>
                  )}
                  {isLg && (
                    <KeyboardArrowDown sx={{ fontSize: 16, color: MUTED, flexShrink: 0 }} />
                  )}
                </Box>
              )}

              {/* Divider */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: BORDER_COLOR, mx: 0.5, my: 1.5 }}
              />

              {/* Logout */}
              <Tooltip title="Sign out" placement="bottom" arrow>
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    color: TEXT_DIM,
                    border: `1px solid ${BORDER_COLOR}`,
                    bgcolor: 'transparent',
                    flexShrink: 0,
                    '&:hover': {
                      color: '#ef4444',
                      borderColor: alpha('#ef4444', 0.4),
                      bgcolor: alpha('#ef4444', 0.06),
                    },
                    transition: 'all 0.18s ease',
                  }}
                >
                  <PowerSettingsNew sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* ── Mobile: hamburger ── */}
          {isMobile && (
            <IconButton
              size="small"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                color: TEXT_DIM,
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: '8px',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: alpha('#000', 0.06), color: '#1C1C1E' },
              }}
              aria-label="Open navigation menu"
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Admin mobile menu */}
      <AppMobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        homeNavItems={[]}
        activeSection=""
        onSectionClick={() => {}}
        user={user}
        onLogout={handleLogout}
        onNavigate={(path) => { navigate(path); setMobileMenuOpen(false); }}
        isHomePage={false}
        isAdminRoute={true}
      />

      {/* Logout confirmation */}
      <ConfirmationDialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to logout${user ? `, ${getUserFirstName(user) || user.email}` : ''}?`}
        confirmText="Logout"
      />
    </>
  );
};

export default AppHeader;
