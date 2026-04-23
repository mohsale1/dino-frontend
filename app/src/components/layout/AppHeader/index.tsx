import React, { useState, useEffect, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
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
  Logout as LogoutIcon,
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

// ── Design tokens — matches homepage hero ─────────────────────────────────────
const NAV_BG       = '#0b1120';          // hero background
const BLUE         = '#1976D2';          // hero primary blue
const BLUE_LT      = '#42A5F5';          // hero light blue
const WHITE        = '#ffffff';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';
const MUTED        = 'rgba(255,255,255,0.45)';
const TEXT_DIM     = 'rgba(255,255,255,0.7)';

// ── Public page section anchors ───────────────────────────────────────────────

const PUBLIC_NAV_ITEMS = [
  { label: 'Features',     id: 'features'    },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Use Cases',    id: 'use-cases'    },
  { label: 'Reviews',      id: 'testimonials' },
  { label: 'FAQ',          id: 'faq'          },
];

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
  { label: 'Settings',  path: '/admin/settings',  permission: PERMISSIONS.APPLICATION_SETTINGS_VIEW  },
];

// ── Component props ───────────────────────────────────────────────────────────

interface AppHeaderProps {
  onSectionScroll?: (sectionId: string) => void;
}

// ── AppHeader ─────────────────────────────────────────────────────────────────

const AppHeader: React.FC<AppHeaderProps> = ({ onSectionScroll }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLg     = useMediaQuery(theme.breakpoints.up('lg'));

  const { user, logout, hasBackendPermission } = useAuth();
  const { userData, refreshUserData }          = useUserData();

  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [activeSection,   setActiveSection]   = useState('hero');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [statusLoading,   setStatusLoading]   = useState(false);

  const scrollTrigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage   = location.pathname === '/' || location.pathname === '/home';

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

  // ── Public home nav ─────────────────────────────────────────────────────────

  const homeNavItems = useMemo(() => [
    { id: 'hero', label: 'Home' },
    ...PUBLIC_NAV_ITEMS,
  ], []);

  // ── Scroll-to-section ──────────────────────────────────────────────────────

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
    const doScroll = () => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const navbarHeight = window.innerWidth >= 900 ? 70 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      if (onSectionScroll) onSectionScroll(sectionId);
    };
    if (!isHomePage) { navigate('/'); setTimeout(doScroll, 100); }
    else doScroll();
  };

  // ── Active section tracking ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => {
      const navbarHeight = window.innerWidth >= 900 ? 70 : 64;
      const scrollPosition = window.scrollY + navbarHeight + 10;
      let current = homeNavItems[0].id;
      for (const { id } of homeNavItems) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout  = () => setLogoutModalOpen(true);
  const confirmLogout = () => {
    logout();
    navigate('/');
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
        userData.workspace?.id || '',
      );
      await refreshUserData();
    } catch {
      // silent
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Transparent flag (public hero) ──────────────────────────────────────────

  const isTransparent = isHomePage && !scrollTrigger;

  // ── User display values ─────────────────────────────────────────────────────

  const userInitials  = user ? getUserInitials(user) : '';
  const userFirstName = user ? (getUserFirstName(user) || user.email || 'Account') : '';

  // ============================================================================
  // PUBLIC MODE RENDERERS
  // ============================================================================

  const renderPublicDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 0, lg: 0.5 } }}>
      {PUBLIC_NAV_ITEMS.map(({ id, label }) => {
        const active = activeSection === id;
        return (
          <Button
            key={id}
            onClick={() => scrollToSection(id)}
            sx={{
              textTransform: 'none',
              fontWeight: active ? 700 : 500,
              px: { md: 1, lg: 2 },
              py: { md: 0.5, lg: 1 },
              borderRadius: 2,
              fontSize: { md: '0.8125rem', lg: '0.9375rem' },
              minHeight: { md: 34, lg: 40 },
              position: 'relative',
              backgroundColor: 'transparent',
              color: isTransparent
                ? (active ? WHITE : alpha(WHITE, 0.75))
                : (active ? BLUE : '#64748b'),
              '&::after': active && !isTransparent ? {
                content: '""',
                position: 'absolute',
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '18px',
                height: '2px',
                borderRadius: '1px',
                backgroundColor: BLUE,
              } : {},
              '&:hover': {
                backgroundColor: isTransparent ? alpha(WHITE, 0.1) : alpha(BLUE, 0.06),
                color: isTransparent ? WHITE : BLUE,
              },
              transition: 'all 0.2s ease',
            }}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );

  const renderPublicUserActions = () => {
    if (user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 0.75, lg: 1.5 } }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              textTransform: 'none', fontWeight: 500,
              px: { md: 1.25, lg: 2 }, py: { md: 0.5, lg: 0.75 },
              borderRadius: 1.5, fontSize: { md: '0.8125rem', lg: '0.875rem' },
              borderColor: '#e2e8f0', color: '#475569',
              minHeight: { md: 32, lg: 36 },
              '&:hover': { borderColor: '#cbd5e1', backgroundColor: alpha('#0f172a', 0.04) },
              transition: 'all 0.2s ease',
            }}
          >
            {userFirstName}
          </Button>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              textTransform: 'none', fontWeight: 500,
              px: { md: 1.25, lg: 2 }, py: { md: 0.5, lg: 0.75 },
              borderRadius: 1.5, fontSize: { md: '0.8125rem', lg: '0.875rem' },
              borderColor: '#e2e8f0', color: '#475569',
              minHeight: { md: 32, lg: 36 },
              '&:hover': { borderColor: BLUE, backgroundColor: alpha(BLUE, 0.04), color: BLUE },
              transition: 'all 0.2s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 0.75, lg: 1.5 } }}>
        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{
            textTransform: 'none', fontWeight: 500,
            px: { md: 1.5, lg: 2.5 }, py: { md: 0.5, lg: 1 },
            borderRadius: 1.5, fontSize: { md: '0.8125rem', lg: '0.9375rem' },
            minHeight: { md: 34, lg: 40 },
            color: isTransparent ? alpha(WHITE, 0.9) : '#475569',
            '&:hover': {
              backgroundColor: isTransparent ? alpha(WHITE, 0.1) : alpha('#0f172a', 0.06),
              color: isTransparent ? WHITE : '#0f172a',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Sign In
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/register')}
          sx={{
            fontWeight: 600, textTransform: 'none',
            px: { md: 2, lg: 3 }, py: { md: 0.5, lg: 1 },
            borderRadius: 1.5, fontSize: { md: '0.8125rem', lg: '0.9375rem' },
            minHeight: { md: 34, lg: 40 },
            backgroundColor: isTransparent ? WHITE : BLUE,
            color: isTransparent ? '#0f172a' : WHITE,
            boxShadow: 'none',
            '&:hover': { backgroundColor: isTransparent ? '#f8fafc' : '#1565C0', boxShadow: 'none' },
            transition: 'all 0.2s ease',
          }}
        >
          Get Started
        </Button>
      </Box>
    );
  };

  // ============================================================================
  // ADMIN MODE RENDERERS
  // ============================================================================

  /** Nav items — active = white text + 2px white underline at bottom of toolbar */
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
              color: active ? WHITE : TEXT_DIM,
              fontWeight: active ? 600 : 400,
              fontSize: '0.875rem',
              letterSpacing: '0.01em',
              userSelect: 'none',
              transition: 'color 0.18s ease',
              '&:hover': { color: WHITE },
              // White underline bar pinned to bottom of toolbar
              '&::after': active ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 12px)',
                height: '2px',
                borderRadius: '2px 2px 0 0',
                bgcolor: WHITE,
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
            bgcolor: alpha(WHITE, 0.06),
            border: `1px solid ${BORDER_COLOR}`,
            cursor: statusLoading ? 'default' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s ease',
            '&:hover': statusLoading ? {} : { bgcolor: alpha(WHITE, 0.1) },
            userSelect: 'none',
          }}
        >
          {/* Venue name */}
          <Box sx={{ display: { md: 'none', lg: 'block' } }}>
            <Typography sx={{ fontSize: '0.6875rem', color: MUTED, lineHeight: 1, mb: 0.2 }}>
              {venueName}
            </Typography>
          </Box>

          {/* Status label */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: venueIsOpen ? '#4ade80' : MUTED,
              lineHeight: 1,
              transition: 'color 0.2s ease',
              minWidth: 38,
            }}
          >
            {venueIsOpen ? 'Open' : 'Closed'}
          </Typography>

          {/* Toggle switch */}
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
                    color: WHITE,
                    '& + .MuiSwitch-track': { bgcolor: '#22c55e', opacity: 1 },
                  },
                },
                '& .MuiSwitch-thumb': { width: 14, height: 14, boxShadow: 'none' },
                '& .MuiSwitch-track': { borderRadius: 10, bgcolor: '#475569', opacity: 1 },
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  };

  // ============================================================================
  // RENDER — ADMIN MODE  (dark navy, matches homepage hero)
  // ============================================================================

  if (isAdminRoute) {
    return (
      <>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: NAV_BG,
            backgroundImage: `
              radial-gradient(ellipse 60% 80% at 80% -20%, ${alpha(BLUE, 0.18)} 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 10% 110%, ${alpha(BLUE, 0.1)} 0%, transparent 60%)
            `,
            borderBottom: `1px solid ${BORDER_COLOR}`,
            boxShadow: scrollTrigger
              ? `0 4px 24px ${alpha('#000', 0.4)}, 0 1px 0 ${BORDER_COLOR}`
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
                  color: WHITE,
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
                      color: MUTED,
                      '&:hover': { color: WHITE, bgcolor: alpha(WHITE, 0.08) },
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
                        bgcolor: alpha(WHITE, 0.07),
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
                        color: WHITE,
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
                            color: WHITE,
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
                            color: MUTED,
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
                      color: MUTED,
                      border: `1px solid ${BORDER_COLOR}`,
                      bgcolor: 'transparent',
                      flexShrink: 0,
                      '&:hover': {
                        color: '#f87171',
                        borderColor: alpha('#f87171', 0.4),
                        bgcolor: alpha('#f87171', 0.08),
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
                  '&:hover': { bgcolor: alpha(WHITE, 0.08), color: WHITE },
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
          homeNavItems={homeNavItems}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
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
  }

  // ============================================================================
  // RENDER — PUBLIC MODE
  // ============================================================================

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: isTransparent ? 'transparent' : 'rgba(255,255,255,0.98)',
          backdropFilter: isTransparent ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isTransparent ? 'none' : 'blur(20px)',
          borderBottom: `1px solid ${isTransparent ? 'transparent' : 'rgba(15,23,42,0.08)'}`,
          boxShadow: isTransparent ? 'none' : '0 2px 8px rgba(15,23,42,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 1200,
        }}
      >
        <Box sx={{ maxWidth: 'lg', mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 3 } }}>
          <Toolbar sx={{ px: 0, minHeight: { xs: 64, md: 70 } }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer', gap: 1.5 }}
              onClick={() => navigate(user ? '/admin/dashboard' : '/')}
            >
              <DinoLogo size={isMobile ? 32 : 36} animated />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    color: isTransparent ? WHITE : '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    transition: 'color 0.3s ease',
                  }}
                >
                  Dino
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: isTransparent ? alpha(WHITE, 0.7) : '#64748b',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      display: 'block',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Smart Ordering Solutions
                  </Typography>
                )}
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 1, lg: 2 } }}>
                {renderPublicDesktopNav()}
                {renderPublicUserActions()}
              </Box>
            )}

            {isMobile && (
              <Box
                component="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                sx={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  gap: '5px', width: 40, height: 40,
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0,
                  borderRadius: 1, flexShrink: 0,
                }}
              >
                <Box sx={{ width: 22, height: 2, borderRadius: 1, backgroundColor: isTransparent ? WHITE : '#475569', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', transformOrigin: 'center', transform: mobileMenuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
                <Box sx={{ width: 22, height: 2, borderRadius: 1, backgroundColor: isTransparent ? WHITE : '#475569', transition: 'opacity 0.2s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1)', opacity: mobileMenuOpen ? 0 : 1, transform: mobileMenuOpen ? 'scaleX(0)' : 'scaleX(1)' }} />
                <Box sx={{ width: 22, height: 2, borderRadius: 1, backgroundColor: isTransparent ? WHITE : '#475569', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', transformOrigin: 'center', transform: mobileMenuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
              </Box>
            )}
          </Toolbar>
        </Box>
      </AppBar>

      <AppMobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        homeNavItems={homeNavItems}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        user={user}
        onLogout={handleLogout}
        onNavigate={(path) => { navigate(path); setMobileMenuOpen(false); }}
        isHomePage={isHomePage}
        isAdminRoute={false}
      />

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
