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
  SpaceDashboard,
  Settings,
  Store,
  CheckCircle,
  Cancel,
  Home,
  MenuBook,
  ShoppingBag,
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
  PointOfSale,
  TableRestaurant,
  Group,
  Tune,
} from '@mui/icons-material';
import DinoLogo from '../../ui/DinoLogo';
import { getUserFirstName } from '../../../utils/data/userUtils';
import { useAuth } from '../../../contexts/common/Auth';
import PermissionService from '../../../services/auth/permission';
import { useUserData } from '../../../contexts/application/UserData';
import { personaService } from '../../../services/application/persona.service';
import { usePermissionCheck } from '../../common/PermissionWrapper';
import { APP_CONFIG } from '../../../constants/app';
import { useLocation } from 'react-router-dom';

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLUE     = '#1976D2';
const MUTED    = '#9aa0a6';
const TEXT_DIM = '#5f6368';
const TEXT_MAIN = '#202124';
const BORDER   = '#e8eaed';

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

// Order: Dashboard → Orders → POS (type=1) → Catalog → Tables (type=0) → Users → Settings
const ALL_ADMIN_MENU_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <SpaceDashboard />, resource: 'dashboard', action: 'view', orderTypeRestriction: undefined as number | undefined },
  { label: 'Orders',    path: '/admin/orders',    icon: <ShoppingBag />,    resource: 'orders',    action: 'view', orderTypeRestriction: undefined },
  { label: 'POS',       path: '/admin/pos',       icon: <PointOfSale />,    resource: 'pos',       action: 'view', orderTypeRestriction: 1 },
  { label: 'Catalog',   path: '/admin/catalog',   icon: <MenuBook />,       resource: 'catalog',   action: 'view', orderTypeRestriction: undefined },
  { label: 'Tables',    path: '/admin/locations', icon: <TableRestaurant />,resource: 'locations', action: 'view', orderTypeRestriction: 0 },
  { label: 'Users',     path: '/admin/users',     icon: <Group />,          resource: 'users',     action: 'view', orderTypeRestriction: undefined },
  { label: 'Settings',  path: '/admin/settings',  icon: <Tune />,           resource: 'settings',  action: 'view', orderTypeRestriction: undefined },
];

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
  const location                      = useLocation();
  const { userData, refreshUserData } = useUserData();
  const { hasPerm }                   = useAuth();
  usePermissionCheck();

  const [venueStatus, setVenueStatus] = useState<{
    isActive: boolean;
    isOpen: boolean;
    venueName: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const canManageVenue = hasPerm('workspace', 'update');
  const venueOrderType = userData?.venue?.orderType;

  useEffect(() => {
    if (!user || !canManageVenue) { setVenueStatus(null); return; }
    if (!userData?.venue) {
      setVenueStatus({ isActive: false, isOpen: false, venueName: 'No Venue Selected' });
      return;
    }
    setVenueStatus({
      isActive:  userData.venue.isActive || false,
      isOpen:    userData.venue.isOpen   || false,
      venueName: userData.venue.name     || 'Current Venue',
    });
  }, [user, userData?.venue, canManageVenue]);

  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;
    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;
      const personaId = (userData.venue as any).personaId || Number(userData.venue.id);
      await personaService.setPersonaOpenStatus(personaId, newStatus);
      await refreshUserData();
    } catch {
      // silent
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSectionClick = (sectionId: string) => { onSectionClick(sectionId); onClose(); };
  const handleNavigate     = (path: string)        => { onNavigate(path);          onClose(); };
  const handleLogout       = ()                    => { onLogout(); };

  // Filter by permission + orderType
  const adminMenuItems = ALL_ADMIN_MENU_ITEMS.filter((item) => {
    if (!hasPerm(item.resource, item.action)) return false;
    if (item.orderTypeRestriction !== undefined && venueOrderType !== undefined) {
      return venueOrderType === item.orderTypeRestriction;
    }
    return true;
  });

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
    if (label.includes('order'))                                     return <ShoppingBag />;
    if (label.includes('offer') || label.includes('promo'))          return <LocalOffer />;
    if (label.includes('about'))                                     return <Info />;
    if (label.includes('popular') || label.includes('featured'))     return <Star />;
    if (label.includes('dish') || label.includes('food'))            return <Fastfood />;
    return <Storefront />;
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
    if (firstName)   return firstName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  })();

  const hasAdminItems = user && adminMenuItems.length > 0;
  const hasHomeNav    = isHomePage && homeNavItems.length > 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
          backgroundColor: '#ffffff',
          borderLeft: `1px solid ${BORDER}`,
          boxSizing: 'border-box',
          willChange: 'transform',
        },
      }}
      sx={{
        zIndex: 1300,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          pt: 'max(16px, env(safe-area-inset-top))',
          pb: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DinoLogo size={26} animated={false} />
          <Typography
            sx={{
              color: TEXT_MAIN,
              fontWeight: 700,
              fontSize: '0.9375rem',
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {APP_CONFIG.NAME}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: MUTED,
            borderRadius: '6px',
            width: 32, height: 32,
            '&:hover': { color: TEXT_MAIN, bgcolor: '#f1f3f4' },
            transition: 'all 0.15s ease',
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Scrollable body ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: 1.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* ── User card ── */}
        {user && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Box
              sx={{
                bgcolor: '#f8f9fa',
                borderRadius: '8px',
                p: 1.5,
                border: `1px solid ${BORDER}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar
                  sx={{
                    width: 36, height: 36,
                    bgcolor: BLUE,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: TEXT_MAIN,
                      fontSize: '0.875rem',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {getUserFirstName(user) || user.email}
                  </Typography>
                  <Chip
                    label={resolvedRoleLabel}
                    size="small"
                    sx={{
                      mt: 0.35,
                      height: 17,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      bgcolor: alpha(BLUE, 0.08),
                      color: BLUE,
                      border: 'none',
                      '& .MuiChip-label': { px: 0.875 },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleNavigate('/admin/settings')}
                    title="Settings"
                    sx={{
                      color: MUTED, width: 28, height: 28, borderRadius: '6px',
                      '&:hover': { color: TEXT_MAIN, bgcolor: '#e8eaed' },
                    }}
                  >
                    <Settings sx={{ fontSize: 15 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleLogout}
                    title="Sign out"
                    sx={{
                      color: MUTED, width: 28, height: 28, borderRadius: '6px',
                      '&:hover': { color: '#d93025', bgcolor: alpha('#d93025', 0.06) },
                    }}
                  >
                    <ExitToApp sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Venue status card ── */}
        {user && canManageVenue && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Box
              sx={{
                borderRadius: '8px',
                border: `1px solid`,
                borderColor: venueStatus?.isOpen ? alpha('#1e7e34', 0.25) : BORDER,
                bgcolor: venueStatus?.isOpen ? alpha('#1e7e34', 0.04) : '#f8f9fa',
                p: 1.5,
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.875 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
                  <Store sx={{ fontSize: 13, color: MUTED }} />
                  <Typography sx={{ fontWeight: 600, color: MUTED, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Venue Status
                  </Typography>
                </Box>
                {venueStatus ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {venueStatus.isOpen
                      ? <CheckCircle sx={{ fontSize: 12, color: '#1e7e34' }} />
                      : <Cancel      sx={{ fontSize: 12, color: MUTED }} />
                    }
                    <Typography sx={{ fontWeight: 600, fontSize: '0.6rem', color: venueStatus.isOpen ? '#1e7e34' : MUTED, letterSpacing: '0.04em' }}>
                      {venueStatus.isOpen ? 'OPEN' : 'CLOSED'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: MUTED, fontSize: '0.6rem' }}>Loading...</Typography>
                )}
              </Box>
              {venueStatus ? (
                <>
                  <Typography sx={{ fontWeight: 500, color: TEXT_MAIN, fontSize: '0.8125rem', mb: 0.75 }}>
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
                          <Typography sx={{ fontWeight: 500, color: TEXT_MAIN, fontSize: '0.75rem', display: 'block' }}>
                            {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                          </Typography>
                          <Typography sx={{ color: MUTED, fontSize: '0.6875rem', display: 'block' }}>
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
                <Typography sx={{ fontWeight: 500, color: TEXT_MAIN, fontSize: '0.8125rem' }}>
                  {userData?.venue?.name || 'Current Venue'}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* ── Home navigation ── */}
        {hasHomeNav && (
          <Box sx={{ px: 2 }}>
            {user && <Divider sx={{ mb: 1.5, borderColor: BORDER }} />}
            <Typography
              sx={{
                color: MUTED, fontWeight: 600, fontSize: '0.6rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                mb: 0.5, display: 'block', px: 0.5,
              }}
            >
              Navigation
            </Typography>
            <List disablePadding>
              {homeNavItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.125 }}>
                    <ListItemButton
                      onClick={() => handleSectionClick(item.id)}
                      sx={{
                        borderRadius: '6px',
                        minHeight: 40,
                        px: 1.25,
                        bgcolor: isActive ? alpha(BLUE, 0.07) : 'transparent',
                        '&:hover': { bgcolor: isActive ? alpha(BLUE, 0.09) : '#f1f3f4' },
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? BLUE : MUTED, minWidth: 32, transition: 'color 0.15s' }}>
                        {getNavigationIcon(item)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? BLUE : TEXT_DIM,
                          fontSize: '0.875rem',
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
          <Box sx={{ px: 2 }}>
            {(hasHomeNav || user) && <Divider sx={{ my: 1.5, borderColor: BORDER }} />}
            <Typography
              sx={{
                color: MUTED, fontWeight: 600, fontSize: '0.6rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                mb: 0.5, display: 'block', px: 0.5,
              }}
            >
              Menu
            </Typography>
            <List disablePadding>
              {adminMenuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.125 }}>
                    <ListItemButton
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        borderRadius: '6px',
                        minHeight: 42,
                        px: 1.25,
                        bgcolor: isActive ? alpha(BLUE, 0.07) : 'transparent',
                        '&:hover': { bgcolor: isActive ? alpha(BLUE, 0.09) : '#f1f3f4' },
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? BLUE : MUTED,
                          minWidth: 34,
                          transition: 'color 0.15s',
                          '& .MuiSvgIcon-root': { fontSize: 18 },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? BLUE : TEXT_DIM,
                          fontSize: '0.875rem',
                        }}
                      />
                      {/* Active indicator */}
                      {isActive && (
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            bgcolor: BLUE,
                            flexShrink: 0,
                            ml: 1,
                            opacity: 0.8,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        <Box sx={{ pb: 2 }} />
      </Box>

      {/* ── Guest footer ── */}
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
            bgcolor: '#ffffff',
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Login />}
            onClick={() => handleNavigate('/login')}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              borderRadius: '6px',
              height: 40,
              borderColor: BORDER,
              color: TEXT_DIM,
              '&:hover': { borderColor: '#bdc1c6', bgcolor: '#f1f3f4', color: TEXT_MAIN },
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleNavigate('/register')}
            disableElevation
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '6px',
              height: 40,
              bgcolor: BLUE,
              color: '#fff',
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            Get Started
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default AppMobileMenu;
