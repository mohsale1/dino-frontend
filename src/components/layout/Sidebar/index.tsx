import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  Tooltip,
  Collapse,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  MoreVert,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/common/Auth';
import { useUserData } from '../../../contexts/application/UserData';
import { useSidebar } from '../../../contexts/common/Sidebar';
// UIConfig removed - using simple role/permission based menu
import { venueService } from '../../../services/application';
import PermissionService from '../../../services/auth';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';

import { getUserFirstName } from '../../../utils/data/userUtils';
// Feature flags removed - using simple permission-based access
import './Sidebar.css';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions: string[];
  requiredRoles?: string[];
  badge?: string | number;
  flagKey?: string;
  category?: string;
  description?: string;
}

interface MenuCategory {
  name: string;
  label: string;
  order: number;
}

interface SidebarProps {
  isTablet?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isTablet = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout, hasBackendPermission } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const { isCollapsed, toggleCollapsed, getSidebarWidth } = useSidebar();
  
  const [statusLoading, setStatusLoading] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Determine if sidebar should show expanded content
  const showExpanded = !isCollapsed;

  // Simple static menu configuration
  const menuCategories: MenuCategory[] = [
    { name: 'main', label: 'Main', order: 1 },
    { name: 'management', label: 'Management', order: 2 },
    { name: 'settings', label: 'Settings', order: 3 },
  ];

  // Define all menu items with their permissions
  const allMenuItems: NavigationItem[] = [
    // Main
    { label: 'Menu', path: '/admin/pos', icon: <MenuBook />, requiredPermissions: ['application.orders.create'], requiredRoles: [], category: 'main', description: 'Manual order entry' },
    { label: 'Dashboard', path: '/admin', icon: <Dashboard />, requiredPermissions: ['application.dashboard.read'], requiredRoles: [], category: 'main' },
    { label: 'Order', path: '/admin/orders', icon: <ShoppingCart />, requiredPermissions: ['application.orders.read'], requiredRoles: [], category: 'main' },
    
    // Management
    { label: 'Catalog', path: '/admin/catalog', icon: <Category />, requiredPermissions: ['application.items.read'], requiredRoles: [], category: 'management' },
    { label: 'Location', path: '/admin/locations', icon: <LocationOn />, requiredPermissions: ['application.areas.read'], requiredRoles: [], category: 'management' },
    { label: 'Coupon', path: '/admin/coupons', icon: <LocalOffer />, requiredPermissions: ['application.coupons.read'], requiredRoles: [], category: 'management' },
    { label: 'Users', path: '/admin/users', icon: <People />, requiredPermissions: ['application.users.read'], requiredRoles: [], category: 'management' },
    
    // Settings
    { label: 'Settings', path: '/admin/settings', icon: <Settings />, requiredPermissions: ['application.workspace.read'], requiredRoles: [], category: 'settings' },
  ];

  const adminNavItems = allMenuItems.filter(item =>
    item.requiredPermissions.length === 0 ||
    item.requiredPermissions.some(p => hasBackendPermission(p))
  );

  // Group items by category
  const groupedNavItems = menuCategories.map(category => ({
    ...category,
    items: adminNavItems.filter(item => item.category === category.name),
  })).filter(group => group.items.length > 0);

  // Get venue status for display (using standardized camelCase)
  const venueStatus = userData?.venue ? {
    isActive: userData.venue.isActive || false,
    isOpen: userData.venue.isOpen || false,
    venueName: userData.venue.name || 'Current Venue'
  } : null;

  const sidebarWidth = getSidebarWidth(isTablet);

  // Handle venue status toggle
  const handleToggleVenueOpen = async () => {
    if (!userData?.venue?.id || statusLoading || !venueStatus) return;

    try {
      setStatusLoading(true);
      const newStatus = !venueStatus.isOpen;      
      // Update venue status directly using updateVenue - more efficient than openVenue/closeVenue
      // which try non-existent endpoints first before falling back to updateVenue
      await venueService.updateVenue(userData.venue.id, { 
        is_open: newStatus 
      });
      // Refresh user data to get updated venue status
      await refreshUserData();
    } catch (error) {
      // Show error message to user
      alert('Failed to update venue status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle profile menu
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
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

  const handleSettings = () => {
    handleProfileMenuClose();
    navigate('/admin/settings');
  };

  return (
    <>
      {/* Backdrop Overlay - Shows when sidebar is expanded */}
      {!isCollapsed && (
        <Box
          className="sidebar-backdrop"
          onClick={toggleCollapsed}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.common.black, 0.5),
            backdropFilter: 'blur(4px)',
            zIndex: 1199,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          }}
        />
      )}

      <Box
        className={`sidebar sidebar-glass ${isCollapsed ? 'sidebar-collapsed' : isTablet ? 'sidebar-tablet' : 'sidebar-expanded'}`}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: sidebarWidth,
          backgroundColor: '#0f172a',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
      {/* Header Section */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: showExpanded ? 'space-between' : 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {showExpanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                }}
              >
                D
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#ffffff',
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                  mb: 0.25,
                }}
              >
                Dino
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Admin Panel
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Expand/Collapse Button */}
          <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <Button
              onClick={toggleCollapsed}
              sx={{
                justifyContent: 'center',
                minWidth: showExpanded ? 40 : '100%',
                width: showExpanded ? 40 : '100%',
                height: 40,
                borderRadius: 2,
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  transform: 'translateX(2px)',
                },
                '&:active': {
                  transform: 'translateX(1px)',
                },
                '& .MuiButton-startIcon': {
                  mr: 0,
                  color: 'inherit',
                  fontSize: '1.125rem',
                },
              }}
              startIcon={isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            />
          </Tooltip>
      </Box>


      {/* Venue Status */}
      {venueStatus && showExpanded &&  (
        <Box
          sx={{
            p: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
          data-tour="venue-status"
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            {/* Order Status */}
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  mb: 0.75,
                }}
              >
                Order Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1 }}>
                {venueStatus.isOpen ? (
                  <CheckCircle sx={{ fontSize: 14, color: 'success.main', mt: 0.1 }} />
                ) : (
                  <Cancel sx={{ fontSize: 14, color: 'error.main', mt: 0.1 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                  }}
                >
                  {venueStatus.isOpen 
                    ? 'Accepting new orders'
                    : 'Not accepting orders'
                  }
                </Typography>
              </Box>

              {/* Toggle Switch */}
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
                    <Typography variant="caption" fontWeight={500}>
                      {venueStatus.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'center' }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Collapsed Venue Status Indicator */}
      {venueStatus && !showExpanded &&  (
        <Box
          sx={{
            p: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tooltip 
            title={`${venueStatus.isOpen ? 'Accepting Orders' : 'Closed for Orders'} - Click to toggle`} 
            placement="right"
          >
            <IconButton
              onClick={handleToggleVenueOpen}
              disabled={statusLoading || !venueStatus.isActive}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: alpha(venueStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.1),
                border: `2px solid ${alpha(venueStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.3)}`,
                '&:hover': {
                  backgroundColor: alpha(venueStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.2),
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {statusLoading ? (
                <CircularProgress size={16} />
              ) : venueStatus.isOpen ? (
                <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <Cancel sx={{ fontSize: 20, color: 'error.main' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Navigation Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 2,
          px: showExpanded ? 2 : 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
        data-tour="sidebar-navigation"
      >
        {/* Render grouped navigation */}
        {groupedNavItems.map((group, groupIndex) => (
          <Box key={group.name} sx={{ mb: groupIndex < groupedNavItems.length - 1 ? 3 : 0 }}>
            {/* Category Header */}
            {showExpanded && (
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  mb: 1.5,
                  display: 'block',
                  px: 1,
                  letterSpacing: '1px',
                }}
              >
                {group.label}
              </Typography>
            )}

            {/* Category Divider for Collapsed State */}
            {!showExpanded && groupIndex > 0 && (
              <Divider 
                sx={{ 
                  my: 1.5, 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }} 
              />
            )}

            {/* Menu Items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Tooltip
                    key={item.label}
                    title={isCollapsed ? item.label : ''}
                    placement="right"
                    disableHoverListener={showExpanded}
                    arrow
                  >
                    <Button
                      onClick={() => navigate(item.path)}
                      fullWidth
                      sx={{
                        justifyContent: showExpanded ? 'flex-start' : 'center',
                        textAlign: 'left',
                        py: 1.25,
                        px: showExpanded ? 1.5 : 1,
                        borderRadius: 2,
                        minHeight: 44,
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: isActive 
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'transparent',
                        border: '1px solid transparent',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          backgroundColor: isActive 
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          transform: 'none',
                          '& .MuiButton-startIcon': {
                            color: '#ffffff',
                          },
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                        '&::before': isActive ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3,
                          backgroundColor: '#ffffff',
                          borderRadius: '0 2px 2px 0',
                        } : {},
                        '& .MuiButton-startIcon': {
                          mr: showExpanded ? 1.5 : 0,
                          color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                          fontSize: '1.25rem',
                          transition: 'all 0.2s ease',
                        },
                      }}
                      startIcon={item.icon}
                    >
                      <Collapse in={showExpanded} orientation="horizontal">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0 }}>
                          <Typography
                            variant="inherit"
                            sx={{
                              fontWeight: 'inherit',
                              fontSize: 'inherit',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                            }}
                          >
                            {item.label}
                          </Typography>
                          {item.badge && (
                            <Chip
                              label={item.badge}
                              size="small"
                              sx={{
                                ml: 1,
                                height: 20,
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                border: `1px solid rgba(255, 255, 255, 0.2)`,
                                '& .MuiChip-label': {
                                  px: 1,
                                },
                              }}
                            />
                          )}
                        </Box>
                      </Collapse>
                    </Button>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* User Profile Section at Bottom */}
      {user && (
        <Box
          sx={{
            flexShrink: 0,
            mt: 'auto',
            borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Profile Info */}
          <Box
            onClick={showExpanded ? handleProfileMenuOpen : undefined}
            sx={{
              p: showExpanded ? 2 : 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: showExpanded ? 1.5 : 0,
              justifyContent: showExpanded ? 'space-between' : 'center',
              cursor: showExpanded ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': showExpanded ? {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              } : {},
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
              <Avatar
                sx={{
                  width: showExpanded ? 40 : 36,
                  height: showExpanded ? 40 : 36,
                  backgroundColor: '#3b82f6',
                  fontSize: '1rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Avatar>
              
              <Collapse in={showExpanded} orientation="horizontal">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: '#ffffff',
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
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {(() => {
                      const backendRole = PermissionService.getBackendRole();
                      if (backendRole?.name) {
                        const roleDefinition = PermissionService.getRoleDefinition(backendRole.name);
                        return roleDefinition?.displayName || backendRole.name;
                      }
                      return user?.role || 'User';
                    })()}
                  </Typography>
                </Box>
              </Collapse>
            </Box>

            {showExpanded && (
              <IconButton
                size="small"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': {
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Quick Actions - Collapsed State */}
          {!showExpanded && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                p: 1,
                borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <Tooltip title="Settings" placement="right">
                <IconButton
                  size="small"
                  onClick={handleSettings}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout" placement="right">
                <IconButton
                  size="small"
                  onClick={handleLogoutClick}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    },
                  }}
                >
                  <Logout fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Profile Menu - Expanded State */}
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: -1,
                ml: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem 
              onClick={handleLogoutClick}
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                },
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}

      </Box>

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

export default Sidebar;