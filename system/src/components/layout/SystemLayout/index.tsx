import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Button,
  Chip,
  Typography,
  Tooltip,
  Divider,
  alpha,
  useScrollTrigger,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings,
  People,
  Business,
  Payment,
  Settings,
  Palette,
  Menu as MenuIcon,
  QrCode2,
  HourglassEmpty,
  KeyboardArrowDown,
  PowerSettingsNew,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DinoLogo from '../../ui/DinoLogo';
import { useAuth } from '../../../contexts/common/Auth';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';
import { ModuleTransitionLoader, usePageTransition } from '../../ui/PageTransitionLoader';

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAV_BG       = '#0b1120';
const BLUE         = '#1976D2';
const BLUE_LT      = '#42A5F5';
const WHITE        = '#ffffff';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';
const MUTED        = 'rgba(255,255,255,0.45)';
const TEXT_DIM     = 'rgba(255,255,255,0.7)';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  resource: string;
  path: string;
}

interface NavSection {
  label: string;
  items: MenuItem[];
}

// ── SystemLayout ──────────────────────────────────────────────────────────────

const SystemLayout: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const isLg      = useMediaQuery(theme.breakpoints.up('lg'));

  const { user, logout, userPermissions } = useAuth();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);

  const { transitioning } = usePageTransition();

  const scrollTrigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  // ── Role name ───────────────────────────────────────────────────────────────

  const roleName = useMemo(() => {
    const name =
      userPermissions?.role?.name ||
      (user as any)?.role?.name  ||
      (user as any)?.role        ||
      '';
    return typeof name === 'string' ? name : '';
  }, [userPermissions, user]);

  // ── Viewable resources ──────────────────────────────────────────────────────

  const viewableResources = useMemo<Set<string>>(() => {
    const perms: any[] = userPermissions?.permissions ?? [];
    console.log('[SystemLayout] userPermissions:', userPermissions);
    console.log('[SystemLayout] all perms:', perms);
    const viewable = new Set(
      perms
        .filter((p: any) => p?.action === 'view' && p?.resource)
        .map((p: any) => p.resource as string),
    );
    console.log('[SystemLayout] viewableResources:', [...viewable]);
    return viewable;
  }, [userPermissions]);

  // ── Nav catalogue ───────────────────────────────────────────────────────────

  const allMenuItems = useMemo<MenuItem[]>(() => [
    { title: 'Dashboard',           icon: <DashboardIcon />,      resource: 'dashboard',  path: '/system/dashboard'         },
    { title: 'Workspaces',          icon: <Business />,           resource: 'workspaces', path: '/system/workspaces'        },
    { title: 'Approvals',           icon: <HourglassEmpty />,     resource: 'approvals',  path: '/system/approvals'         },
    { title: 'Users',               icon: <People />,             resource: 'users',      path: '/system/users'             },
    { title: 'Billing',             icon: <Payment />,            resource: 'billing',    path: '/system/billing'           },
    { title: 'Referrals',           icon: <QrCode2 />,            resource: 'referrals',  path: '/system/referrals'         },
    { title: 'Roles & Permissions', icon: <AdminPanelSettings />, resource: 'roles',      path: '/system/roles-permissions' },
    { title: 'Appearance',          icon: <Palette />,            resource: 'appearance', path: '/system/appearance'        },
    { title: 'Settings',            icon: <Settings />,           resource: 'settings',   path: '/system/settings'          },
  ], []);

  const availableItems = useMemo(
    () => allMenuItems.filter(item => viewableResources.has(item.resource)),
    [allMenuItems, viewableResources],
  );

  const hasNoModuleAccess = availableItems.length === 0;

  // ── Sections (used for mobile drawer grouping) ──────────────────────────────

  const sections = useMemo<NavSection[]>(() => {
    const find = (title: string) => availableItems.find(i => i.title === title);

    const main       = ['Dashboard'].map(find).filter(Boolean) as MenuItem[];
    const management = ['Workspaces', 'Approvals', 'Users', 'Billing', 'Referrals'].map(find).filter(Boolean) as MenuItem[];
    const config     = ['Roles & Permissions', 'Appearance', 'Settings'].map(find).filter(Boolean) as MenuItem[];

    const result: NavSection[] = [];
    if (main.length)       result.push({ label: 'Main',          items: main });
    if (management.length) result.push({ label: 'Management',    items: management });
    if (config.length)     result.push({ label: 'Configuration', items: config });
    return result;
  }, [availableItems]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleNav = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'S';
  const userName    = user?.email?.split('@')[0] ?? '';

  // ── Desktop nav items ───────────────────────────────────────────────────────

  const renderDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: 64 }}>
      {availableItems.map((item) => {
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
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
            {item.title}
          </Box>
        );
      })}
    </Box>
  );

  // ── Mobile drawer ───────────────────────────────────────────────────────────

  const DRAWER_BORDER = 'rgba(255,255,255,0.07)';
  const DRAWER_DIM    = 'rgba(255,255,255,0.25)';

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: '320px' },
          height: '100vh',
          maxHeight: '100vh',
          top: 0,
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: NAV_BG,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          borderLeft: `1px solid ${DRAWER_BORDER}`,
          boxSizing: 'border-box',
          willChange: 'transform',
        },
      }}
      sx={{
        zIndex: 1300,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        },
      }}
    >
      {/* Soft blue glow */}
      <Box sx={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: 240, height: 240, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, ${alpha(BLUE, 0.12)} 0%, transparent 70%)`,
      }} />

      {/* ── Drawer header ── */}
      <Box
        sx={{
          px: 2.5,
          pt: 'max(18px, env(safe-area-inset-top))',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: `1px solid ${DRAWER_BORDER}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DinoLogo size={30} animated={false} />
          <Box>
            <Typography sx={{ color: WHITE, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              System Admin
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: '0.65rem', lineHeight: 1, display: 'block' }}>
              Administration Portal
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={() => setMobileOpen(false)}
          size="small"
          sx={{
            color: MUTED,
            border: `1px solid ${DRAWER_BORDER}`,
            borderRadius: '8px',
            width: 34, height: 34,
            '&:hover': { color: WHITE, backgroundColor: alpha(WHITE, 0.08), borderColor: alpha(WHITE, 0.15) },
            transition: 'all 0.15s ease',
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Drawer scrollable content ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
          pt: 1.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
        }}
      >
        {/* User card */}
        {user && (
          <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
            <Box
              sx={{
                backgroundColor: alpha(BLUE, 0.08),
                borderRadius: '12px',
                p: 1.75,
                border: `1px solid ${alpha(BLUE, 0.18)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40, height: 40,
                    background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LT} 100%)`,
                    fontSize: '0.9375rem', fontWeight: 700,
                    color: WHITE, flexShrink: 0,
                  }}
                >
                  {userInitial}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 600, color: WHITE, fontSize: '0.875rem',
                      lineHeight: 1.3, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {userName || user?.email}
                  </Typography>
                  <Chip
                    label={roleName || 'System User'}
                    size="small"
                    sx={{
                      mt: 0.4, height: 18, fontSize: '0.62rem', fontWeight: 600,
                      backgroundColor: alpha(BLUE, 0.2), color: BLUE_LT,
                      border: 'none', '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* No access notice */}
        {hasNoModuleAccess && (
          <Box sx={{ mx: 2, mb: 1.5, px: 1.5, py: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: MUTED, fontSize: '0.72rem', lineHeight: 1.5, display: 'block' }}>
              No modules are assigned to your role. Contact a system administrator to request access.
            </Typography>
          </Box>
        )}

        {/* Nav sections */}
        {sections.map((section) => (
          <Box key={section.label} sx={{ px: 2, flexShrink: 0 }}>
            <Divider sx={{ my: 1, borderColor: DRAWER_BORDER }} />
            <Typography
              sx={{
                color: DRAWER_DIM, fontWeight: 700, fontSize: '0.6rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                mb: 0.5, display: 'block', px: 0.5,
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    sx={{
                      borderRadius: '8px',
                      minHeight: 40,
                      px: 1.5,
                      mb: 0.25,
                      position: 'relative',
                      backgroundColor: active ? alpha(BLUE, 0.12) : 'transparent',
                      '&:hover': {
                        backgroundColor: active ? alpha(BLUE, 0.16) : alpha(WHITE, 0.05),
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0, top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: active ? '60%' : '0%',
                        backgroundColor: BLUE_LT,
                        borderRadius: '0 3px 3px 0',
                        transition: 'height 0.2s ease',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: active ? BLUE_LT : MUTED, minWidth: 34, transition: 'color 0.15s', '& svg': { fontSize: 20 } }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: active ? 600 : 400,
                        color: active ? BLUE_LT : '#cbd5e1',
                        fontSize: '0.875rem',
                        sx: { transition: 'color 0.15s' },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Logout button pinned at bottom */}
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: 'max(20px, env(safe-area-inset-bottom))',
            borderTop: `1px solid ${DRAWER_BORDER}`,
            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PowerSettingsNew sx={{ fontSize: 16 }} />}
            onClick={() => { setMobileOpen(false); setShowLogout(true); }}
            sx={{
              textTransform: 'none', fontWeight: 600,
              fontSize: '0.875rem', borderRadius: '8px', height: 42,
              borderColor: alpha('#f87171', 0.4), color: '#f87171',
              '&:hover': { borderColor: '#f87171', backgroundColor: alpha('#f87171', 0.08) },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

        {/* ── AppBar ── */}
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
              onClick={() => navigate('/system/dashboard')}
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
                System Admin
              </Typography>
            </Box>

            {/* ── Desktop nav items ── */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderDesktopNav()}
              </Box>
            )}

            {/* ── Spacer ── */}
            <Box sx={{ flex: 1 }} />

            {/* ── Right actions (desktop) ── */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>

                {/* Avatar + name */}
                {user && (
                  <Box
                    onClick={() => navigate('/system/profile')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.875,
                      cursor: 'pointer',
                      px: 1,
                      py: 0.5,
                      borderRadius: '8px',
                      border: '1px solid transparent',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        bgcolor: alpha(WHITE, 0.07),
                        borderColor: BORDER_COLOR,
                      },
                    }}
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
                      {userInitial}
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
                          {userName}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.6875rem',
                            color: MUTED,
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          System
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
                    onClick={() => setShowLogout(true)}
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
                onClick={() => setMobileOpen(true)}
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

        {/* ── Mobile drawer ── */}
        {renderMobileDrawer()}

        {/* ── Main content ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: '64px',
            bgcolor: '#f8fafc',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: '100dvh',
            position: 'relative',
          }}
        >
          <Outlet />
          <ModuleTransitionLoader visible={transitioning} />
        </Box>
      </Box>

      {/* ── Logout confirmation ── */}
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
