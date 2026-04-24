import React, { useState, useMemo } from 'react';
import {
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
  QrCode2,
  HourglassEmpty,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DinoLogo from '../../ui/DinoLogo';
import { useAuth } from '../../../contexts/common/Auth';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';
import { ModuleTransitionLoader, usePageTransition } from '../../ui/PageTransitionLoader';

const DRAWER_WIDTH    = 240;
const COLLAPSED_WIDTH = 64;

// Vanguard palette constants
const SIDEBAR_BG        = '#1e1e1e';
const ACCENT            = '#00A6CA';
const ACCENT_BLUE       = 'rgba(55,148,255,0.20)';
const ACCENT_BLUE_HOVER = 'rgba(55,148,255,0.12)';
const NAV_TEXT_DEFAULT  = 'rgba(255,255,255,0.85)';
const SECTION_LABEL_CLR = 'rgba(255,255,255,0.5)';

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

const SystemLayout: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, userPermissions } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const { transitioning } = usePageTransition();

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const roleName = useMemo(() => {
    const name =
      userPermissions?.role?.name ||
      (user as any)?.role?.name ||
      (user as any)?.role ||
      '';
    return typeof name === 'string' ? name : '';
  }, [userPermissions, user]);

  // Build a Set of resources the user can view, derived purely from the
  // backend permission objects: { resource, action: 'view' }.
  const viewableResources = useMemo<Set<string>>(() => {
    const perms: any[] = userPermissions?.permissions ?? [];
    console.log('[Sidebar] userPermissions:', userPermissions);
    console.log('[Sidebar] all perms:', perms);
    const viewable = new Set(
      perms
        .filter((p: any) => p?.action === 'view' && p?.resource)
        .map((p: any) => p.resource as string)
    );
    console.log('[Sidebar] viewableResources:', [...viewable]);
    return viewable;
  }, [userPermissions]);

  // Static nav catalogue — only UI concerns (title, icon, path, resource).
  // `resource` must match the backend permission resource name exactly.
  const allMenuItems = useMemo<MenuItem[]>(() => [
    { title: 'Dashboard',           icon: <DashboardIcon />,      resource: 'dashboard',   path: '/system/dashboard' },
    { title: 'Workspaces',          icon: <Business />,           resource: 'workspaces',  path: '/system/workspaces' },
    { title: 'Approvals',           icon: <HourglassEmpty />,     resource: 'approvals',   path: '/system/approvals' },
    { title: 'Users',               icon: <People />,             resource: 'users',       path: '/system/users' },
    { title: 'Billing',             icon: <Payment />,            resource: 'billing',     path: '/system/billing' },
    { title: 'Referrals',           icon: <QrCode2 />,            resource: 'referrals',   path: '/system/referrals' },
    { title: 'Roles & Permissions', icon: <AdminPanelSettings />, resource: 'roles',       path: '/system/roles-permissions' },
    { title: 'Appearance',          icon: <Palette />,            resource: 'appearance',  path: '/system/appearance' },
    { title: 'Settings',            icon: <Settings />,           resource: 'settings',    path: '/system/settings' },
  ], []);

  // Show an item only when the backend granted resource:view for it.
  const availableItems = useMemo(
    () => allMenuItems.filter(item => viewableResources.has(item.resource)),
    [allMenuItems, viewableResources],
  );

  const hasNoModuleAccess = availableItems.length === 0;

  // Group into sections — sections collapse automatically when empty.
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

  const handleNav = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  // ── Nav item button ──────────────────────────────────────────────────────────
  const NavItem: React.FC<{ item: MenuItem; isCollapsedMode: boolean }> = ({ item, isCollapsedMode }) => {
    const isActive = location.pathname === item.path;

    const btn = (
      <ListItemButton
        selected={isActive}
        onClick={() => handleNav(item.path)}
        sx={{
          position: 'relative',
          height: 40,
          borderRadius: '8px',
          mx: '8px',
          my: '2px',
          px: isCollapsedMode ? 0 : '12px',
          gap: isCollapsedMode ? 0 : '12px',
          justifyContent: isCollapsedMode ? 'center' : 'flex-start',
          bgcolor: isActive ? ACCENT_BLUE : 'transparent',
          '&.Mui-selected': {
            bgcolor: ACCENT_BLUE,
            '&:hover': { bgcolor: ACCENT_BLUE },
          },
          '&:hover': {
            bgcolor: isActive ? ACCENT_BLUE : ACCENT_BLUE_HOVER,
          },
          '&.Mui-selected::before': { display: 'none' },
        }}
      >
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: '8px',
              bottom: '8px',
              width: '3px',
              borderRadius: '0 6px 6px 0',
              bgcolor: ACCENT,
            }}
          />
        )}

        <ListItemIcon
          sx={{
            minWidth: 'auto',
            color: isActive ? ACCENT : NAV_TEXT_DEFAULT,
            '& svg': { fontSize: 20 },
          }}
        >
          {item.icon}
        </ListItemIcon>

        {!isCollapsedMode && (
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              sx: {
                color: isActive ? '#ffffff' : NAV_TEXT_DEFAULT,
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1,
              },
            }}
          />
        )}
      </ListItemButton>
    );

    return isCollapsedMode ? (
      <Tooltip title={item.title} placement="right" arrow>
        <span>{btn}</span>
      </Tooltip>
    ) : btn;
  };

  // ── Section label ────────────────────────────────────────────────────────────
  const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
    <Typography
      sx={{
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: SECTION_LABEL_CLR,
        px: '16px',
        pt: '12px',
        pb: '8px',
        display: 'block',
      }}
    >
      {label}
    </Typography>
  );

  // ── Nav list (sections) ──────────────────────────────────────────────────────
  const navList = (isCollapsedMode: boolean) => (
    <List
      disablePadding
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        py: 1,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
      }}
    >
      {hasNoModuleAccess && !isCollapsedMode && (
        <Box sx={{ mx: '16px', my: 1, px: 1.5, py: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', lineHeight: 1.5, display: 'block' }}>
            No modules are assigned to your role. Contact a system administrator to request access.
          </Typography>
        </Box>
      )}

      {sections.map((section) => (
        <Box key={section.label}>
          {!isCollapsedMode && <SectionLabel label={section.label} />}
          {isCollapsedMode && (
            <Box sx={{ mx: '8px', my: '6px', height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />
          )}
          {section.items.map((item) => (
            <NavItem key={item.path} item={item} isCollapsedMode={isCollapsedMode} />
          ))}
        </Box>
      ))}
    </List>
  );

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const sidebarContent = (isCollapsedMode: boolean, isMobile = false) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, rgba(55,148,255,0.10) 0%, rgba(55,148,255,0.03) 100%), ${SIDEBAR_BG}`,
        borderRight: '1px solid rgba(212,212,212,0.12)',
      }}
    >
      {/* ── Brand header ── */}
      <Box
        sx={{
          px: isCollapsedMode ? 1 : 2,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsedMode ? 'center' : 'space-between',
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        {!isCollapsedMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <DinoLogo size={28} animated={false} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                System Admin
              </Typography>
              <Chip
                label={roleName || 'System User'}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  height: 18,
                  textTransform: 'capitalize',
                }}
              />
            </Box>
          </Box>
        )}

        {isCollapsedMode && <DinoLogo size={28} animated={false} />}

        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            size="small"
            sx={{ color: alpha('#ffffff', 0.6), flexShrink: 0, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}

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

      {isCollapsedMode && (
        <Box sx={{ px: '8px', pt: 1, flexShrink: 0 }}>
          <Tooltip title="Expand sidebar" placement="right" arrow>
            <IconButton
              onClick={() => setCollapsed(false)}
              sx={{
                width: '100%',
                borderRadius: '8px',
                color: alpha('#ffffff', 0.6),
                '&:hover': { bgcolor: ACCENT_BLUE_HOVER, color: '#ffffff' },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {navList(isCollapsedMode)}

      {/* ── Footer ── */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          p: isCollapsedMode ? '8px' : '12px 16px',
          flexShrink: 0,
        }}
      >
        {!isCollapsedMode ? (
          <>
            <Box
              onClick={() => handleNav('/system/profile')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1,
                px: 1,
                py: 0.75,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: ACCENT_BLUE_HOVER },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(ACCENT, 0.35),
                  fontSize: '0.875rem',
                  flexShrink: 0,
                  color: '#ffffff',
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
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
                  sx={{
                    color: alpha('#ffffff', 0.5),
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
              onClick={() => setShowLogout(true)}
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: NAV_TEXT_DEFAULT,
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.8125rem',
                py: 0.75,
                borderRadius: '8px',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: ACCENT_BLUE_HOVER, color: '#ffffff' },
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title="My Profile" placement="right" arrow>
              <Avatar
                onClick={() => handleNav('/system/profile')}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: alpha(ACCENT, 0.35),
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'background-color 0.15s',
                  '&:hover': { bgcolor: alpha(ACCENT, 0.55) },
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Tooltip title="Logout" placement="right" arrow>
              <IconButton
                onClick={() => setShowLogout(true)}
                sx={{ color: alpha('#ffffff', 0.6), borderRadius: '8px', width: '100%', '&:hover': { bgcolor: ACCENT_BLUE_HOVER, color: '#ffffff' } }}
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
      <Box sx={{ display: 'flex', minHeight: '100dvh', width: '100%' }}>

        {/* ── Mobile drawer ── */}
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

        {/* ── Desktop drawer ── */}
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

        {/* ── Main content column ── */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            marginLeft: { xs: 0, md: `${drawerWidth}px` },
            transition: 'margin-left 0.25s ease, width 0.25s ease',
          }}
        >
          {/* ── Mobile top navbar ── */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              bgcolor: SIDEBAR_BG,
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              zIndex: 1200,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#ffffff', p: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem' }}>
              System Admin
            </Typography>
            <Avatar
              onClick={() => navigate('/system/profile')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(ACCENT, 0.35),
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#ffffff',
                border: `1.5px solid ${alpha(ACCENT, 0.5)}`,
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: alpha(ACCENT, 0.55) },
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </Avatar>
          </Box>

          {/* ── Page content ── */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: '#f8fafc',
              overflowY: 'auto',
              overflowX: 'hidden',
              pt: { xs: '56px', md: 0 },
              minHeight: { xs: '100dvh', md: '100vh' },
              position: 'relative',
            }}
          >
            <Outlet />
            <ModuleTransitionLoader visible={transitioning} />
          </Box>
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
