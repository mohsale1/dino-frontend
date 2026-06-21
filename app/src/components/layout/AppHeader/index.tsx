import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Popover,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  KeyboardArrowDown,
  PowerSettingsNew,
  Store,
  CheckCircle,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { APP_CONFIG } from '../../../constants/app';
import { useUserData } from '../../../contexts/application/UserData';
import DinoLogo from '../../ui/DinoLogo';
import AppMobileMenu from '../AppMobileMenu';
import { ConfirmationDialog } from '../../dialogs';
import { NotificationCenter } from '../../common';
import { getUserFirstName, getUserInitials } from '../../../utils/data/userUtils';
import { personaService, Persona } from '../../../services/application/persona.service';

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAV_BG    = '#0f172a';
const BLUE      = '#60a5fa';
const BORDER    = 'rgba(255,255,255,0.10)';
const ICON_CLR  = '#94a3b8';   // icons, muted labels
const NAV_CLR   = '#e2e8f0';   // nav link inactive
const NAV_ACT   = '#ffffff';   // nav link active / logo
const HOVER_BG  = 'rgba(255,255,255,0.07)';

const ACTIVE_PERSONA_KEY = 'active_persona_id';

// ── Admin nav definition ──────────────────────────────────────────────────────
interface AdminNavItem {
  label: string;
  path: string;
  resource: string;
  action: string;
  orderTypeRestriction?: number;
}

const ALL_ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', resource: 'dashboard', action: 'view'                          },
  { label: 'Orders',    path: '/admin/orders',    resource: 'orders',    action: 'view'                          },
  { label: 'POS',       path: '/admin/pos',       resource: 'pos',       action: 'view', orderTypeRestriction: 1 },
  { label: 'Catalog',   path: '/admin/catalog',   resource: 'catalog',   action: 'view'                          },
  { label: 'Tables',    path: '/admin/locations', resource: 'locations', action: 'view', orderTypeRestriction: 0 },
  { label: 'Users',     path: '/admin/users',     resource: 'users',     action: 'view'                          },
  { label: 'Settings',  path: '/admin/settings',  resource: 'settings',  action: 'view'                          },
];

// ── AppHeader ─────────────────────────────────────────────────────────────────
const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLg     = useMediaQuery(theme.breakpoints.up('lg'));

  const { user, logout, hasPerm } = useAuth();
  const { userData, refreshUserData, switchPersona } = useUserData();

  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const [personas,        setPersonas]        = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<number | null>(null);
  const [statusLoading,   setStatusLoading]   = useState(false);
  const [switchLoading,   setSwitchLoading]   = useState(false);
  const [anchorEl,        setAnchorEl]        = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(anchorEl);

  const scrollTrigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const canToggle    = hasPerm('settings', 'view') || hasPerm('status', 'update');
  const venueOrderType = userData?.venue?.orderType;

  const navItems = useMemo<AdminNavItem[]>(() => {
    return ALL_ADMIN_NAV.filter((item) => {
      if (!hasPerm(item.resource, item.action)) return false;
      if (item.orderTypeRestriction !== undefined && venueOrderType !== undefined) {
        return venueOrderType === item.orderTypeRestriction;
      }
      return true;
    });
  }, [hasPerm, venueOrderType]);

  const loadPersonas = useCallback(async () => {
    try {
      const res  = await personaService.getPersonas();
      const data = res.data;
      setPersonas(data);
      const stored = localStorage.getItem(ACTIVE_PERSONA_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && data.some(p => p.id === parsed)) { setActivePersonaId(parsed); return; }
      }
      if (data.length > 0) {
        setActivePersonaId(data[0].id);
        localStorage.setItem(ACTIVE_PERSONA_KEY, String(data[0].id));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadPersonas(); }, [loadPersonas]);

  const activePersona = useMemo(
    () => personas.find(p => p.id === activePersonaId) ?? null,
    [personas, activePersonaId],
  );

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePersona || statusLoading) return;
    setStatusLoading(true);
    try {
      await personaService.setPersonaOpenStatus(activePersona.id, !activePersona.is_open);
      setPersonas(prev => prev.map(p => p.id === activePersona.id ? { ...p, is_open: !p.is_open } : p));
      await refreshUserData();
    } catch { await loadPersonas(); }
    finally { setStatusLoading(false); }
  };

  const handleSwitchPersona = async (persona: Persona) => {
    setAnchorEl(null);
    if (persona.id === activePersonaId) return;
    setSwitchLoading(true);
    try {
      setActivePersonaId(persona.id);
      setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p } : p));
      await switchPersona(persona.id);
    } catch { /* silent */ }
    finally { setSwitchLoading(false); }
  };

  const handleLogout  = () => setLogoutModalOpen(true);
  const confirmLogout = () => {
    logout(); navigate('/login');
    setMobileMenuOpen(false); setLogoutModalOpen(false);
  };

  const userInitials  = user ? getUserInitials(user) : '';
  const userFirstName = user ? (getUserFirstName(user) || user.email || 'Account') : '';
  const isOpen        = activePersona?.is_open ?? false;
  const hasMany       = personas.length > 1;
  const showToggle    = canToggle && personas.length > 0;

  // ── Shared icon-button sx ─────────────────────────────────────────────────
  const iconBtnSx = {
    width: 34, height: 34,
    borderRadius: '6px',
    color: ICON_CLR,
    '&:hover': { color: NAV_ACT, bgcolor: HOVER_BG },
    transition: 'all 0.15s ease',
  } as const;

  // ============================================================================
  // RENDERERS
  // ============================================================================

  const renderDesktopNav = () => (
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
              // Fixed padding — never changes
              px: { md: 1.25, lg: 1.5 },
              cursor: 'pointer',
              userSelect: 'none',
              // Active underline
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
            {/*
              Layout-shift fix: the outer Box is sized by a hidden bold copy.
              The visible label sits on top via absolute, colour + weight change freely.
            */}
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.01em',
                visibility: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Box>
            <Box
              component="span"
              sx={{
                position: 'absolute',
                left: { md: '10px', lg: '12px' },
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
                letterSpacing: '0.01em',
                color: active ? NAV_ACT : NAV_CLR,
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
                '&:hover': { color: NAV_ACT },
              }}
            >
              {item.label}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  const renderPersonaPopover = () => (
    <Popover
      open={popoverOpen}
      anchorEl={anchorEl}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: 0.75, minWidth: 200, maxWidth: 260,
            border: '1px solid #e2e8f0',
            borderRadius: '8px', overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Switch Persona
        </Typography>
      </Box>
      <List disablePadding sx={{ py: 0.5 }}>
        {personas.map((persona) => {
          const isActive = persona.id === activePersonaId;
          return (
            <ListItemButton
              key={persona.id}
              onClick={() => handleSwitchPersona(persona)}
              selected={isActive}
              sx={{
                px: 2, py: 1, mx: 0.5, my: 0.25, borderRadius: '6px',
                '&.Mui-selected': { bgcolor: alpha(BLUE, 0.08), '&:hover': { bgcolor: alpha(BLUE, 0.12) } },
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400, color: isActive ? BLUE : '#0f172a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {persona.name}
                    </Typography>
                    {isActive && <CheckCircle sx={{ fontSize: 14, color: BLUE, flexShrink: 0 }} />}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: persona.is_open ? '#22c55e' : '#cbd5e1', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.6875rem', color: persona.is_open ? '#16a34a' : '#94a3b8' }}>
                      {persona.is_open ? 'Open' : 'Closed'}
                    </Typography>
                  </Box>
                }
                disableTypography
              />
            </ListItemButton>
          );
        })}
      </List>
    </Popover>
  );

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
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: scrollTrigger ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
          transition: 'box-shadow 0.2s ease',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', height: 64, px: { xs: 2, sm: 2.5, md: 3 } }}>

          {/* ── Logo ── */}
          <Box
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              cursor: 'pointer', flexShrink: 0,
              mr: { md: 2, lg: 3 },
              opacity: 1, transition: 'opacity 0.15s ease',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <DinoLogo size={28} animated={false} />
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: NAV_ACT, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {APP_CONFIG.NAME}
            </Typography>
          </Box>

          {/* ── Separator ── */}
          {!isMobile && (
            <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, my: 2, mr: { md: 1.5, lg: 2 } }} />
          )}

          {/* ── Desktop nav ── */}
          {!isMobile && renderDesktopNav()}

          <Box sx={{ flex: 1 }} />

          {/* ── Right side — desktop ── */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>

              {/* Notifications */}
              <Box sx={{ '& .MuiIconButton-root': { ...iconBtnSx }, '& .MuiBadge-badge': { bgcolor: '#ef4444' } }}>
                <NotificationCenter />
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, mx: 0.5, my: 1.75 }} />

              {/* User */}
              {user && (
                <Box
                  onClick={() => navigate('/admin/settings')}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.875,
                    cursor: 'pointer', px: 1, py: 0.5, borderRadius: '6px',
                    transition: 'background 0.15s ease',
                    '&:hover': { bgcolor: HOVER_BG },
                  }}
                >
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', fontWeight: 600, bgcolor: BLUE, color: '#fff', flexShrink: 0 }}>
                    {userInitials}
                  </Avatar>
                  {isLg && (
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem', color: NAV_ACT, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                        {userFirstName}
                      </Typography>
                      {activePersona && (
                        <Typography sx={{ fontSize: '0.6875rem', color: ICON_CLR, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                          {activePersona.name}
                        </Typography>
                      )}
                    </Box>
                  )}
                  {isLg && <KeyboardArrowDown sx={{ fontSize: 16, color: ICON_CLR, flexShrink: 0 }} />}
                </Box>
              )}

              <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, mx: 0.5, my: 1.75 }} />

              {/* Open / Closed toggle */}
              {showToggle && (
                <>
                  <Tooltip
                    title={hasMany
                      ? `${activePersona?.name ?? 'Persona'} — click to switch`
                      : isOpen ? 'Venue is open — click to close' : 'Venue is closed — click to open'}
                    placement="bottom"
                    arrow
                  >
                    <span>
                      {statusLoading || switchLoading ? (
                        <Box sx={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CircularProgress size={16} sx={{ color: ICON_CLR }} />
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={hasMany ? (e) => setAnchorEl(e.currentTarget) : handleToggleStatus}
                          sx={{
                            ...iconBtnSx,
                            color: isOpen ? '#4ade80' : ICON_CLR,
                            '&:hover': { color: isOpen ? '#86efac' : NAV_ACT, bgcolor: HOVER_BG },
                          }}
                        >
                          <Store sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>
                  {renderPersonaPopover()}
                  <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, mx: 0.5, my: 1.75 }} />
                </>
              )}

              {/* Sign out */}
              <Tooltip title="Sign out" placement="bottom" arrow>
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  sx={{ ...iconBtnSx, '&:hover': { color: '#f87171', bgcolor: alpha('#ef4444', 0.12) } }}
                >
                  <PowerSettingsNew sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* ── Mobile right side ── */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ '& .MuiIconButton-root': { ...iconBtnSx }, '& .MuiBadge-badge': { bgcolor: '#ef4444' } }}>
                <NotificationCenter />
              </Box>
              <IconButton
                size="small"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ ...iconBtnSx, width: 36, height: 36, border: `1px solid ${BORDER}` }}
                aria-label="Open navigation menu"
              >
                <MenuIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}

        </Toolbar>
      </AppBar>

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
