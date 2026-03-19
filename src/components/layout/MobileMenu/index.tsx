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
  Paper,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close,
  AccountCircle,
  ExitToApp,
  Login,
  PersonAdd,
  Dashboard,
  TableRestaurant,
  Restaurant,
  People,
  Settings,
  Assignment,
  Business,
  Security,
  Store,
  CheckCircle,
  Cancel,
  Code,
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
} from '@mui/icons-material';
import DinoLogo from '../../ui/DinoLogo';
import { getUserFirstName } from '../../../utils/data/userUtils';
import { useAuth } from '../../../contexts/common/Auth';
import { PermissionService } from '../../../services/auth';
import { useUserData } from '../../../contexts/application/UserData';
import { venueService } from '../../../services/application';
import { usePermissionCheck } from '../../common/PermissionWrapper';
import { PERMISSIONS } from '../../../types/auth';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  homeNavItems: Array<{
    label: string;
    id: string;
  }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  isHomePage: boolean;
  isAdminRoute?: boolean;
}

const dinoAvatar = null; // TODO: Add user avatar support

const MobileMenu: React.FC<MobileMenuProps> = ({
  open,
  onClose,
  homeNavItems,
  activeSection,
  onSectionClick,
  user,
  onLogout,
  onNavigate,
  isHomePage,
  isAdminRoute = false,
}) => {
  const { userData } = useUserData();
  const { isOwner, isManager } = useAuth();
  const { checkPermission } = usePermissionCheck();
  const [venueStatus, setVenueStatus] = useState<{
    isActive: boolean;
    isOpen: boolean;
    venueName: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load venue status from UserDataContext
  useEffect(() => {
    const userIsAdmin = isOwner() || isManager();

    if (!user || !userIsAdmin) {
      setVenueStatus(null);
      return;
    }

    if (!userData?.venue) {
      setVenueStatus({
        isActive: false,
        isOpen: false,
        venueName: 'No Venue Selected'
      });
      return;
    }

    // Use venue data from UserDataContext
    const statusData = {
      isActive: userData.venue.isActive || false,
      isOpen: userData.venue.isOpen || false,
      venueName: userData.venue.name || 'Current Venue'
    };
    setVenueStatus(statusData);
  }, [user, userData?.venue, isOwner, isManager]);

  // Handle venue status toggle
  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;

    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;
      
      await venueService.updateVenue(userData.venue.id, { 
        status: newStatus ? 'active' : 'closed' 
      });

      setVenueStatus(prev => prev ? { ...prev, isOpen: newStatus } : null);
    } catch (error) {
      // Handle error silently or show user notification
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    onClose();
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Admin menu items
  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: <Dashboard /> },
    { label: 'Menu', path: '/admin/menu', icon: <MenuBook /> },
    { label: 'Location', path: '/admin/locations', icon: <Store /> },
    { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart /> },
    { label: 'Catalog', path: '/admin/catalog', icon: <Star /> },
    { label: 'Coupons', path: '/admin/coupons', icon: <LocalOffer /> },
    { label: 'Users', path: '/admin/users', icon: <People /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings /> },
  ];

  // Get icon for navigation item based on label or id
  const getNavigationIcon = (item: { label: string; id: string }) => {
    const label = item.label.toLowerCase();
    const id = item.id.toLowerCase();
    
    // Match by specific IDs first (more accurate)
    if (id === 'hero' || id === 'home') return <Home />;
    if (id === 'features') return <AutoAwesome />;
    if (id === 'testimonials' || id === 'reviews') return <RateReview />;
    if (id === 'faq') return <HelpOutline />;
    if (id === 'contact') return <ContactMail />;
    
    // Match by label keywords
    if (label.includes('home')) return <Home />;
    if (label.includes('feature')) return <AutoAwesome />;
    if (label.includes('review') || label.includes('testimonial')) return <RateReview />;
    if (label.includes('faq') || label.includes('question')) return <HelpOutline />;
    if (label.includes('contact')) return <ContactMail />;
    if (label.includes('menu')) return <MenuBook />;
    if (label.includes('order')) return <ShoppingCart />;
    if (label.includes('offer') || label.includes('promo')) return <LocalOffer />;
    if (label.includes('about')) return <Info />;
    if (label.includes('popular') || label.includes('featured')) return <Star />;
    if (label.includes('dish') || label.includes('food')) return <Fastfood />;
    
    // Default icon
    return <Restaurant />;
  };

  // Force drawer to take full height from top
  useEffect(() => {
    if (open) {
      const drawerPaper = document.querySelector('.MuiDrawer-paper');
      const modal = document.querySelector('.MuiModal-root');
      const backdrop = document.querySelector('.MuiBackdrop-root');
      
      if (drawerPaper) {
        (drawerPaper as HTMLElement).style.height = '100vh';
        (drawerPaper as HTMLElement).style.minHeight = '100vh';
        (drawerPaper as HTMLElement).style.maxHeight = '100vh';
        (drawerPaper as HTMLElement).style.top = '0';
        (drawerPaper as HTMLElement).style.bottom = '0';
        (drawerPaper as HTMLElement).style.margin = '0';
        (drawerPaper as HTMLElement).style.position = 'fixed';
      }
      
      if (modal) {
        (modal as HTMLElement).style.top = '0';
        (modal as HTMLElement).style.height = '100vh';
        (modal as HTMLElement).style.position = 'fixed';
      }
      
      if (backdrop) {
        (backdrop as HTMLElement).style.top = '0';
        (backdrop as HTMLElement).style.height = '100vh';
        (backdrop as HTMLElement).style.position = 'fixed';
      }
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1300,
        '& .MuiDrawer-paper': {
          width: { xs: '80vw', sm: 360, md: 320 },
          maxWidth: { xs: '80vw', sm: 360 },
          backgroundColor: 'background.paper',
          borderLeft: { xs: 'none', sm: '1px solid' },
          borderColor: 'divider',
          borderRadius: '0 !important',
          height: '100vh !important',
          minHeight: '100vh !important',
          maxHeight: '100vh !important',
          top: '0 !important',
          bottom: '0 !important',
          position: 'fixed !important',
          margin: '0 !important',
          transform: 'none !important',
          // Better mobile performance
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        },
        '& .MuiModal-root': {
          top: '0 !important',
          height: '100vh !important',
          position: 'fixed !important',
        },
        '& .MuiBackdrop-root': {
          top: '0 !important',
          height: '100vh !important',
          position: 'fixed !important',
          backgroundColor: { xs: 'rgba(0, 0, 0, 0.8)', sm: 'rgba(0, 0, 0, 0.5)' },
        },
      }}
    >
      <Box sx={{ 
        height: '100vh',
        display: 'flex', 
        flexDirection: 'column',
      }}>
        {/* Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: { xs: 60, sm: 64 },
            // Add safe area for mobile devices with notches
            paddingTop: { xs: 'max(16px, env(safe-area-inset-top))', sm: 2.5 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <DinoLogo size={isMobile ? 28 : 32} animated={false} />
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={600} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                Dino
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Digital Menu Revolution
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* User Section */}
        {user && (
          <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                backgroundColor: '#E3F2FD',
                border: 'none',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={undefined}
                  sx={{
                    backgroundColor: "primary.main",
                    width: 40,
                    height: 40,
                    border: "none",
                    borderColor: 'primary.main',
                  }}
                >
                  {<AccountCircle />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    {getUserFirstName(user) || user.email}
                  </Typography>
                  <Chip
                    label={(() => {
                      // Use the same logic as UserPermissionsDashboard
                      const getUserRoleDisplayName = (role: string | any) => {
                        // Handle role object (from getUserWithRole)
                        if (typeof role === 'object' && role !== null) {
                          if (role.displayName) return String(role.displayName);
                          if (role.name) return String(role.name);
                        }
                        
                        // Handle string role
                        if (!role || (typeof role !== 'string' && typeof role !== 'object')) {
                          return 'Unknown Role';
                        }
                        
                        if (typeof role === 'string') {
                          const roleDefinition = PermissionService.getRoleDefinition(role);
                          
                          // Ensure we always return a string
                          if (typeof roleDefinition === 'object' && roleDefinition?.displayName) {
                            return String(roleDefinition.displayName);
                          }
                          
                          return String(role);
                        }
                        
                        return 'Unknown Role';
                      };

                      // First try to get backend role
                      const backendRole = PermissionService.getBackendRole();
                      if (backendRole && backendRole.name) {
                        return getUserRoleDisplayName(backendRole.name);
                      }

                      // Fallback to user.role
                      return getUserRoleDisplayName(user?.role || '');
                    })()}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Settings sx={{ fontSize: 16 }} />}
                  onClick={() => handleNavigate('/admin/settings')}
                  sx={{ 
                    flex: 1, 
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  Settings
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ExitToApp sx={{ fontSize: 16 }} />}
                  onClick={handleLogout}
                  sx={{ 
                    flex: 1, 
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Venue Status Display - Only for Owner and Manager */}
        {user && (isOwner() || isManager()) && (
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: venueStatus?.isOpen ? 'success.50' : 'warning.50',
                border: '1px solid',
                borderColor: venueStatus?.isOpen ? 'success.200' : 'warning.200',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary"
                sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Store sx={{ fontSize: 16, color: venueStatus?.isOpen ? 'success.main' : 'error.main' }} />
                Venue Status
              </Typography>
              
              {venueStatus ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {venueStatus.venueName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {venueStatus.isOpen ? (
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                      )}
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        color={venueStatus.isOpen ? 'success.main' : 'error.main'}
                      >
                        {venueStatus.isOpen ? 'OPEN' : 'CLOSED'}
                      </Typography>
                    </Box>
                  </Box>
                  
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {statusLoading && <CircularProgress size={12} />}
                        <Box>
                          <Typography variant="caption" fontWeight={500}>
                            {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                            {venueStatus.isActive 
                              ? (venueStatus.isOpen ? 'Customers can place orders' : 'Orders are disabled')
                              : 'Venue is inactive'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {userData?.venue?.name || 'Current Venue'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Cancel sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        color="warning.main"
                      >
                        LOADING...
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Loading venue status...
                  </Typography>
                </>
              )}
            </Paper>
          </Box>
        )}

        {/* Navigation Items - Scrollable */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {/* Home Navigation */}
          {isHomePage && homeNavItems.length > 0 && (
            <Box sx={{ p: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block',
                }}
              >
                Navigation
              </Typography>
              <List sx={{ p: 0 }}>
                {homeNavItems.map((item) => (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleSectionClick(item.id)}
                      sx={{
                        borderRadius: 1,
                        minHeight: 44,
                        backgroundColor: activeSection === item.id ? 'primary.100' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'primary.50',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: activeSection === item.id ? 'primary.main' : 'text.secondary', minWidth: 36 }}>
                        {getNavigationIcon(item)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: activeSection === item.id ? 600 : 400,
                          color: activeSection === item.id ? 'primary.main' : 'text.primary',
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Quick Actions */}
          <Box sx={{ p: 2 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.75rem',
                mb: 1,
                display: 'block',
              }}
            >
              Quick Actions
            </Typography>
            <List sx={{ p: 0 }}>
              {user && adminMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: 1,
                      minHeight: 44,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Login/Register for non-authenticated users */}
              {!user && (
                <>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigate('/login')}
                      sx={{
                        borderRadius: 1,
                        minHeight: 44,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>
                        <Login />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sign In"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color: 'text.primary',
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigate('/register')}
                      sx={{
                        borderRadius: 1,
                        minHeight: 44,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>
                        <PersonAdd />
                      </ListItemIcon>
                      <ListItemText
                        primary="Create Account"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color: 'text.primary',
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Box>

      </Box>
    </Drawer>
  );
};

export default MobileMenu;