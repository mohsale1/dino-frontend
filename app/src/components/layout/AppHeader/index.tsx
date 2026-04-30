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
  ExpandMore,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
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
const NAV_BG       = '#ffffff';
const BLUE         = '#1976D2';
const BLUE_LT      = '#42A5F5';
const BORDER_COLOR = '#e0e0e0';
const MUTED        = '#999999';
const TEXT_DIM     = '#666666';

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
  { label: 'Dashboard', path: '/admin/dashboard', resource: 'dashboard', action: 'view'      },
  { label: 'POS',       path: '/admin/pos',       resource: 'pos',       action: 'view', orderTypeRestriction: 1 },
  { label: 'Orders',    path: '/admin/orders',    resource: 'orders',    action: 'view'      },
  { label: 'Catalog',   path: '/admin/catalog',   resource: 'catalog',   action: 'view'      },
  { label: 'Locations', path: '/admin/locations', resource: 'locations', action: 'view', orderTypeRestriction: 0 },
  { label: 'Coupons',   path: '/admin/coupons',   resource: 'coupons',   action: 'view'      },
  { label: 'Users',     path: '/admin/users',     resource: 'users',     action: 'view'      },
  { label: 'Settings',  path: '/admin/settings',  resource: 'settings',  action: 'view'      },
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

  // ── Persona state ────────────────────────────────────────────────────────────
  const [personas,        setPersonas]        = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<number | null>(null);
  const [statusLoading,   setStatusLoading]   = useState(false);
  const [switchLoading,   setSwitchLoading]   = useState(false);
  const [anchorEl,        setAnchorEl]        = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(anchorEl);

  const scrollTrigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  // ── Permissions ──────────────────────────────────────────────────────────────
  const canToggle = hasPerm('settings', 'view') || hasPerm('status', 'update');

  // ── Derived venue order type (for nav filtering) ─────────────────────────────
  const venueOrderType = userData?.venue?.orderType;

  // ── Filtered admin nav items ─────────────────────────────────────────────────
  const navItems = useMemo<AdminNavItem[]>(() => {
    return ALL_ADMIN_NAV.filter((item) => {
      if (!hasPerm(item.resource, item.action)) return false;
      if (item.orderTypeRestriction !== undefined && venueOrderType !== undefined) {
        return venueOrderType === item.orderTypeRestriction;
      }
      return true;
    });
  }, [hasPerm, venueOrderType]);

  // ── Load personas ────────────────────────────────────────────────────────────
  const loadPersonas = useCallback(async () => {
    try {
      const res = await personaService.getPersonas();
      const data = res.data;
      setPersonas(data);

      const stored = localStorage.getItem(ACTIVE_PERSONA_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && data.some(p => p.id === parsed)) {
          setActivePersonaId(parsed);
          return;
        }
      }
      if (data.length > 0) {
        setActivePersonaId(data[0].id);
        localStorage.setItem(ACTIVE_PERSONA_KEY, String(data[0].id));
      }
    } catch {
      // silent — header should not break on persona load failure
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  // ── Derived active persona ───────────────────────────────────────────────────
  const activePersona = useMemo(
    () => personas.find(p => p.id === activePersonaId) ?? null,
    [personas, activePersonaId],
  );

  // ── Toggle open/closed status ────────────────────────────────────────────────
  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePersona || statusLoading) return;
    setStatusLoading(true);
    try {
      await personaService.setPersonaOpenStatus(activePersona.id, !activePersona.is_open);
      // Optimistic update
      setPersonas(prev =>
        prev.map(p => p.id === activePersona.id ? { ...p, is_open: !p.is_open } : p)
      );
      await refreshUserData();
    } catch {
      // revert on failure
      await loadPersonas();
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Switch active persona ────────────────────────────────────────────────────
  const handleSwitchPersona = async (persona: Persona) => {
    setAnchorEl(null);
    if (persona.id === activePersonaId) return;
    setSwitchLoading(true);
    try {
      // Optimistic local update
      setActivePersonaId(persona.id);
      setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p } : p));
      // Delegate to context — sets localStorage, updates userData.venue instantly, then refreshes
      await switchPersona(persona.id);
    } catch {
      // silent
    } finally {
      setSwitchLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout  = () => setLogoutModalOpen(true);
  const confirmLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
    setLogoutModalOpen(false);
  };

  // ── User display values ──────────────────────────────────────────────────────
  const userInitials  = user ? getUserInitials(user) : '';
  const userFirstName = user ? (getUserFirstName(user) || user.email || 'Account') : '';

  // ============================================================================
  // RENDERERS
  // ============================================================================

  /** Nav items */
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

  /** Persona toggle — active persona name + open/closed switch + dropdown to switch */
  const renderPersonaToggle = () => {
    if (!canToggle || personas.length === 0) return null;

    const isOpen    = activePersona?.is_open ?? false;
    const name      = activePersona?.name ?? 'Persona';
    const hasMany   = personas.length > 1;

    return (
      <>
        <Tooltip
          title={hasMany ? 'Click to switch persona' : (isOpen ? 'Click to close' : 'Click to open')}
          placement="bottom"
          arrow
        >
          <Box
            onClick={hasMany ? (e) => setAnchorEl(e.currentTarget) : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.625,
              borderRadius: '8px',
              bgcolor: alpha('#000', 0.04),
              border: `1px solid ${BORDER_COLOR}`,
              cursor: hasMany ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'background 0.2s ease',
              '&:hover': hasMany ? { bgcolor: alpha('#000', 0.07) } : {},
              userSelect: 'none',
            }}
          >
            {/* Store icon */}
            <Store sx={{ fontSize: 14, color: MUTED, flexShrink: 0 }} />

            {/* Persona name — only on lg+ */}
            <Box sx={{ display: { md: 'none', lg: 'flex' }, flexDirection: 'column', minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  color: MUTED,
                  lineHeight: 1,
                  mb: 0.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 100,
                }}
              >
                {name}
              </Typography>
            </Box>

            {/* Open/Closed label */}
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isOpen ? '#16a34a' : MUTED,
                lineHeight: 1,
                transition: 'color 0.2s ease',
                minWidth: 38,
              }}
            >
              {isOpen ? 'Open' : 'Closed'}
            </Typography>

            {/* Status switch */}
            {statusLoading ? (
              <CircularProgress size={14} sx={{ color: MUTED, mx: 0.25 }} />
            ) : (
              <Switch
                checked={isOpen}
                size="small"
                onClick={handleToggleStatus}
                onChange={(e) => { e.stopPropagation(); }}
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

            {/* Dropdown chevron when multiple personas */}
            {hasMany && (
              switchLoading
                ? <CircularProgress size={12} sx={{ color: MUTED, ml: 0.25 }} />
                : <ExpandMore sx={{ fontSize: 15, color: MUTED, ml: -0.25, transition: 'transform 0.2s', transform: popoverOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            )}
          </Box>
        </Tooltip>

        {/* Persona switcher popover */}
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
                mt: 0.75,
                minWidth: 200,
                maxWidth: 260,
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              },
            },
          }}
        >
          {/* Popover header */}
          <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${BORDER_COLOR}`, bgcolor: '#F7F9FA' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                    px: 2,
                    py: 1,
                    mx: 0.5,
                    my: 0.25,
                    borderRadius: '8px',
                    '&.Mui-selected': {
                      bgcolor: alpha(BLUE, 0.08),
                      '&:hover': { bgcolor: alpha(BLUE, 0.12) },
                    },
                    '&:hover': { bgcolor: alpha('#000', 0.04) },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? BLUE : '#1C1C1E',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {persona.name}
                        </Typography>
                        {isActive && (
                          <CheckCircle sx={{ fontSize: 15, color: BLUE, flexShrink: 0 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <Box
                          sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            bgcolor: persona.is_open ? '#22c55e' : '#cbd5e1',
                            flexShrink: 0,
                          }}
                        />
                        <Typography sx={{ fontSize: '0.7rem', color: persona.is_open ? '#16a34a' : MUTED }}>
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
      </>
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
          boxShadow: scrollTrigger ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
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
              {APP_CONFIG.NAME}
            </Typography>
          </Box>

          {/* ── Desktop: nav items ── */}
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

              {/* Persona toggle */}
              {renderPersonaToggle()}

              {/* Divider after persona toggle */}
              {canToggle && personas.length > 0 && (
                <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER_COLOR, mx: 0.5, my: 1.5 }} />
              )}

              {/* Notification center */}
              <Box
                sx={{
                  '& .MuiIconButton-root': {
                    color: TEXT_DIM,
                    '&:hover': { color: '#1C1C1E', bgcolor: alpha('#000', 0.06) },
                  },
                  '& .MuiBadge-badge': { bgcolor: '#EF5350' },
                }}
              >
                <NotificationCenter />
              </Box>

              {/* Divider */}
              <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER_COLOR, mx: 0.5, my: 1.5 }} />

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
                    '&:hover': { bgcolor: alpha('#000', 0.04), borderColor: BORDER_COLOR },
                  }}
                  onClick={() => navigate('/admin/settings')}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: BLUE,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.1 }}>
                        <Store sx={{ fontSize: 10, color: MUTED, flexShrink: 0 }} />
                        <Typography
                          sx={{
                            fontSize: '0.6875rem',
                            color: MUTED,
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 100,
                          }}
                        >
                          {activePersona?.name ?? 'No persona'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {isLg && <KeyboardArrowDown sx={{ fontSize: 16, color: MUTED, flexShrink: 0 }} />}
                </Box>
              )}

              {/* Divider */}
              <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER_COLOR, mx: 0.5, my: 1.5 }} />

              {/* Logout */}
              <Tooltip title="Sign out" placement="bottom" arrow>
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    color: '#ef4444',
                    border: `1px solid ${alpha('#ef4444', 0.35)}`,
                    bgcolor: alpha('#ef4444', 0.05),
                    flexShrink: 0,
                    '&:hover': {
                      color: '#dc2626',
                      borderColor: alpha('#ef4444', 0.6),
                      bgcolor: alpha('#ef4444', 0.12),
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