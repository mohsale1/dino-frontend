import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider,
  alpha,
} from '@mui/material';
import {
  Close,
  ExitToApp,
  Login,
  PersonAdd,
  Dashboard,
  Restaurant,
  People,
  Settings,
  Store,
  CheckCircle,
  Cancel,
  Home,
  MenuBook,
  ShoppingCart,
  LocalOffer,
  Info,
  ContactMail,
  Star,
  Fastfood,
  AutoAwesome,
  RateReview,
  HelpOutline,
  PlayCircleOutline,
  Storefront,
} from '@mui/icons-material';
import DinoLogo from '../../ui/DinoLogo';
import { getUserFirstName } from '../../../utils/data/userUtils';
import { useAuth } from '../../../contexts/common/Auth';
import PermissionService from '../../../services/auth/permission';
import { useUserData } from '../../../contexts/application/UserData';
import { venueService } from '../../../services/application/venue.service';
import { usePermissionCheck } from '../../common/PermissionWrapper';
import { PERMISSIONS } from '../../../types/auth/permissions';

interface AppMobileMenuProps {
  open: boolean;
  onClose: () => void;
  homeNavItems: Array<{ label: string; id: string }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  isHomePage: boolean;
  isAdminRoute?: boolean;
}

const AppMobileMenu: React.FC<AppMobileMenuProps> = ({
  open,
  onClose,
  homeNavItems,
  activeSection,
  onSectionClick,
  user,
  onLogout,
  onNavigate,
  isHomePage,
}) => {
  const { userData } = useUserData();
  const { hasBackendPermission } = useAuth();
  usePermissionCheck();

  const [venueStatus, setVenueStatus] = useState<{
    isActive: boolean;
    isOpen: boolean;
    venueName: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);


  const canManageVenue = hasBackendPermission(PERMISSIONS.WORKSPACE_UPDATE);

  useEffect(() => {
    if (!user || !canManageVenue) { setVenueStatus(null); return; }
    if (!userData?.venue) {
      setVenueStatus({ isActive: false, isOpen: false, venueName: 'No Venue Selected' });
      return;
    }
    setVenueStatus({
      isActive: userData.venue.isActive || false,
      isOpen:   userData.venue.isOpen   || false,
      venueName: userData.venue.name    || 'Current Venue',
    });
  }, [user, userData?.venue, canManageVenue]);

  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;
    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;
      await venueService.updateVenue(userData.venue.id, {
        status: newStatus ? 'active' : 'closed',
      });
      setVenueStatus(prev => (prev ? { ...prev, isOpen: newStatus } : null));
    } catch (_) {
      // silent
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSectionClick = (sectionId: string) => { onSectionClick(sectionId); onClose(); };
  const handleNavigate    = (path: string)        => { onNavigate(path);          onClose(); };
  const handleLogout      = ()                    => { onLogout(); };

  const allAdminMenuItems = [
    { label: 'Dashboard', path: '/admin',           icon: <Dashboard />,    permission: PERMISSIONS.APPLICATION_DASHBOARD_VIEW },
    { label: 'Menu',      path: '/admin/menu',      icon: <MenuBook />,     permission: PERMISSIONS.APPLICATION_POS_VIEW },
    { label: 'Location',  path: '/admin/locations', icon: <Store />,        permission: PERMISSIONS.APPLICATION_LOCATIONS_VIEW },
    { label: 'Orders',    path: '/admin/orders',    icon: <ShoppingCart />, permission: PERMISSIONS.APPLICATION_ORDERS_VIEW },
    { label: 'Catalog',   path: '/admin/catalog',   icon: <Star />,         permission: PERMISSIONS.APPLICATION_CATALOG_VIEW },
    { label: 'Coupons',   path: '/admin/coupons',   icon: <LocalOffer />,   permission: PERMISSIONS.APPLICATION_COUPONS_VIEW },
    { label: 'Users',     path: '/admin/users',     icon: <People />,       permission: PERMISSIONS.APPLICATION_USERS_VIEW },
    { label: 'Settings',  path: '/admin/settings',  icon: <Settings />,     permission: PERMISSIONS.APPLICATION_SETTINGS_VIEW },
  ];

  const adminMenuItems = allAdminMenuItems.filter(item =>
    hasBackendPermission(item.permission)
  );

  const getNavigationIcon = (item: { label: string; id: string }) => {
    const id    = item.id.toLowerCase();
    const label = item.label.toLowerCase();
    if (id === 'hero' || id === 'home')                              return <Home />;
    if (id === 'features')                                           return <AutoAwesome />;
    if (id === 'how-it-works')                                       return <PlayCircleOutline />;
    if (id === 'use-cases')                                          return <Storefront />;
    if (id === 'stats')                                              return <Star />;
    if (id === 'testimonials' || id === 'reviews')                   return <RateReview />;
    if (id === 'faq')                                                return <HelpOutline />;
    if (id === 'contact')                                            return <ContactMail />;
    if (label.includes('home'))                                      return <Home />;
    if (label.includes('how it') || label.includes('works'))         return <PlayCircleOutline />;
    if (label.includes('use case') || label.includes('business'))    return <Storefront />;
    if (label.includes('feature'))                                   return <AutoAwesome />;
    if (label.includes('review') || label.includes('testimonial'))   return <RateReview />;
    if (label.includes('faq') || label.includes('question'))         return <HelpOutline />;
    if (label.includes('contact'))                                   return <ContactMail />;
    if (label.includes('menu'))                                      return <MenuBook />;
    if (label.includes('order'))                                     return <ShoppingCart />;
    if (label.includes('offer') || label.includes('promo'))          return <LocalOffer />;
    if (label.includes('about'))                                     return <Info />;
    if (label.includes('popular') || label.includes('featured'))     return <Star />;
    if (label.includes('dish') || label.includes('food'))            return <Fastfood />;
    return <Restaurant />;
  };

  const getUserRoleDisplayName = (role: string | any): string => {
    if (typeof role === 'object' && role !== null) {
      if (role.displayName) return String(role.displayName);
      if (role.name)        return String(role.name);
    }
    if (!role || (typeof role !== 'string' && typeof role !== 'object')) return 'Unknown Role';
    if (typeof role === 'string') {
      const def = PermissionService.getRoleDefinition(role);
      if (typeof def === 'object' && def?.displayName) return String(def.displayName);
      return String(role);
    }
    return 'Unknown Role';
  };

  const resolvedRoleLabel = (() => {
    const backendRole = PermissionService.getBackendRole();
    if (backendRole?.name) return getUserRoleDisplayName(backendRole.name);
    return getUserRoleDisplayName(user?.role || '');
  })();

  const userInitials = (() => {
    const firstName = getUserFirstName(user);
    if (firstName)    return firstName.charAt(0).toUpperCase();
    if (user?.email)  return user.email.charAt(0).toUpperCase();
    return 'U';
  })();

  const hasAdminItems = user && adminMenuItems.length > 0;
  const hasHomeNav    = isHomePage && homeNavItems.length > 0;

  // ── Shared colours ────────────────────────────────────────────────────────────
  const BG        = '#0b1120';
  const BORDER    = 'rgba(255,255,255,0.07)';
  const MUTED     = 'rgba(255,255,255,0.45)';
  const DIM       = 'rgba(255,255,255,0.25)';
  const BLUE      = '#1976D2';
  const BLUE_LITE = '#42A5F5';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          // ── Full-screen dark panel — zero internal scroll ──
          width: { xs: '100vw', sm: '360px' },
          height: '100vh',
          maxHeight: '100vh',
          top: 0,
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',          // hard lock — no scroll ever
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          borderLeft: `1px solid ${BORDER}`,
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
      {/* ── Soft blue glow — top right ── */}
      <Box sx={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: 240, height: 240, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, ${alpha(BLUE, 0.12)} 0%, transparent 70%)`,
      }} />

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          pt: 'max(18px, env(safe-area-inset-top))',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: `1px solid ${BORDER}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DinoLogo size={30} animated={false} />
          <Box>
            <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              Dino
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: '0.65rem', lineHeight: 1, display: 'block' }}>
              Smart Ordering Solutions
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: MUTED,
            border: `1px solid ${BORDER}`,
            borderRadius: '8px',
            width: 34, height: 34,
            '&:hover': { color: '#ffffff', backgroundColor: alpha('#ffffff', 0.08), borderColor: alpha('#ffffff', 0.15) },
            transition: 'all 0.15s ease',
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Content — flex column, fills remaining height, scrollable ─────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',           // scrollable on short screens
          position: 'relative',
          zIndex: 1,
          pt: 1.5,
        }}
      >
        {/* ── User card ── */}
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
                    backgroundColor: BLUE,
                    fontSize: '0.9375rem', fontWeight: 700,
                    color: '#ffffff', flexShrink: 0,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 600, color: '#ffffff', fontSize: '0.875rem',
                      lineHeight: 1.3, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {getUserFirstName(user) || user.email}
                  </Typography>
                  <Chip
                    label={resolvedRoleLabel}
                    size="small"
                    sx={{
                      mt: 0.4, height: 18, fontSize: '0.62rem', fontWeight: 600,
                      backgroundColor: alpha(BLUE, 0.2), color: BLUE_LITE,
                      border: 'none', '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleNavigate('/admin/settings')}
                    title="Settings"
                    sx={{
                      color: MUTED, width: 30, height: 30,
                      '&:hover': { color: BLUE_LITE, backgroundColor: alpha(BLUE, 0.12) },
                    }}
                  >
                    <Settings sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleLogout}
                    title="Logout"
                    sx={{
                      color: MUTED, width: 30, height: 30,
                      '&:hover': { color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)' },
                    }}
                  >
                    <ExitToApp sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Venue status card ── */}
        {user && canManageVenue && (
          <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
            <Box
              sx={{
                borderRadius: '12px',
                border: `1px solid`,
                borderColor: venueStatus?.isOpen ? 'rgba(34,197,94,0.2)' : BORDER,
                backgroundColor: venueStatus?.isOpen ? 'rgba(34,197,94,0.05)' : alpha('#ffffff', 0.03),
                p: 1.5,
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Store sx={{ fontSize: 13, color: MUTED }} />
                  <Typography sx={{ fontWeight: 700, color: MUTED, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Venue Status
                  </Typography>
                </Box>
                {venueStatus ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {venueStatus.isOpen
                      ? <CheckCircle sx={{ fontSize: 13, color: '#22c55e' }} />
                      : <Cancel      sx={{ fontSize: 13, color: '#475569' }} />
                    }
                    <Typography sx={{ fontWeight: 700, fontSize: '0.62rem', color: venueStatus.isOpen ? '#22c55e' : '#475569', letterSpacing: '0.04em' }}>
                      {venueStatus.isOpen ? 'OPEN' : 'CLOSED'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: '#475569', fontSize: '0.62rem' }}>Loading...</Typography>
                )}
              </Box>
              {venueStatus ? (
                <>
                  <Typography sx={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.78rem', mb: 0.75 }}>
                    {venueStatus.venueName}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={venueStatus.isOpen}
                        onChange={handleToggleVenueOpen}
                        disabled={statusLoading || !venueStatus.isActive}
                        color="success"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {statusLoading && <CircularProgress size={10} sx={{ color: MUTED }} />}
                        <Box>
                          <Typography sx={{ fontWeight: 500, color: '#cbd5e1', fontSize: '0.72rem', display: 'block' }}>
                            {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                          </Typography>
                          <Typography sx={{ color: MUTED, fontSize: '0.62rem', display: 'block' }}>
                            {venueStatus.isActive
                              ? venueStatus.isOpen ? 'Customers can place orders' : 'Orders are disabled'
                              : 'Venue is inactive'}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'center' }}
                  />
                </>
              ) : (
                <Typography sx={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.78rem' }}>
                  {userData?.venue?.name || 'Current Venue'}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* ── Home navigation ── */}
        {hasHomeNav && (
          <Box sx={{ px: 2, flexShrink: 0 }}>
            {user && <Divider sx={{ mb: 1.5, borderColor: BORDER }} />}
            <Typography
              sx={{
                color: DIM, fontWeight: 700, fontSize: '0.6rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                mb: 0.5, display: 'block', px: 0.5,
              }}
            >
              Navigation
            </Typography>
            <List disablePadding>
              {homeNavItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      onClick={() => handleSectionClick(item.id)}
                      sx={{
                        borderRadius: '8px',
                        minHeight: 40,
                        px: 1.5,
                        position: 'relative',
                        backgroundColor: isActive ? alpha(BLUE, 0.12) : 'transparent',
                        '&:hover': {
                          backgroundColor: isActive ? alpha(BLUE, 0.16) : alpha('#ffffff', 0.05),
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0, top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px',
                          height: isActive ? '60%' : '0%',
                          backgroundColor: BLUE_LITE,
                          borderRadius: '0 3px 3px 0',
                          transition: 'height 0.2s ease',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? BLUE_LITE : MUTED, minWidth: 34, transition: 'color 0.15s' }}>
                        {getNavigationIcon(item)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? BLUE_LITE : '#cbd5e1',
                          fontSize: '0.875rem',
                          sx: { transition: 'color 0.15s' },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* ── Admin menu ── */}
        {hasAdminItems && (
          <Box sx={{ px: 2, flexShrink: 0 }}>
            <Divider sx={{ my: 1.5, borderColor: BORDER }} />
            <Typography
              sx={{
                color: DIM, fontWeight: 700, fontSize: '0.6rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                mb: 0.5, display: 'block', px: 0.5,
              }}
            >
              Admin
            </Typography>
            <List disablePadding>
              {adminMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: '8px',
                      minHeight: 40,
                      px: 1.5,
                      '&:hover': { backgroundColor: alpha('#ffffff', 0.05) },
                    }}
                  >
                    <ListItemIcon sx={{ color: MUTED, minWidth: 34 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: 400,
                        color: '#cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* ── Flex spacer ── */}
        <Box sx={{ flex: 1 }} />

        {/* ── Guest actions — pinned at bottom inside the flex column ── */}
        {!user && (
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: 'max(20px, env(safe-area-inset-bottom))',
              borderTop: `1px solid ${BORDER}`,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Login />}
              onClick={() => handleNavigate('/login')}
              sx={{
                textTransform: 'none', fontWeight: 600,
                fontSize: '0.875rem', borderRadius: '8px', height: 42,
                borderColor: alpha(BLUE, 0.5), color: BLUE_LITE,
                '&:hover': { borderColor: BLUE_LITE, backgroundColor: alpha(BLUE, 0.1) },
              }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => handleNavigate('/register')}
              sx={{
                textTransform: 'none', fontWeight: 600,
                fontSize: '0.875rem', borderRadius: '8px', height: 42,
                backgroundColor: BLUE, color: '#ffffff', boxShadow: 'none',
                '&:hover': { backgroundColor: '#1565C0', boxShadow: 'none' },
              }}
            >
              Get Started
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default AppMobileMenu;
