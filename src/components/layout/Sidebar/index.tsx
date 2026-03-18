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
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Assignment,
  Restaurant,
  TableRestaurant,
  People,
  Security,
  Settings,
  Business,
  CheckCircle,
  Cancel,
  LocalOffer,
  Palette,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from '../../../contexts/UserDataContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import { venueService } from '../../../services/business';
import PermissionService from '../../../services/auth';
import { PermissionRegistry } from '../../../services/auth/permissionRegistry';
import { usePermissions } from '../../../hooks/usePermissions';

import { getUserFirstName } from '../../../utils/userUtils';
import { useSidebarFlags } from '../../../flags/FlagContext';
import { FlagGate } from '../../../flags/FlagComponent';
import './Sidebar.css';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions: string[];
  requiredRoles?: string[];
  badge?: string | number;
  flagKey?: string;
}

interface SidebarProps {
  isTablet?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isTablet = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const { isCollapsed, toggleCollapsed, getSidebarWidth } = useSidebar();
  const sidebarFlags = useSidebarFlags();
  const { getAccessibleModules, userRole } = usePermissions();
  
  const [statusLoading, setStatusLoading] = useState(false);

  // Determine if sidebar should show expanded content
  const showExpanded = !isCollapsed;
  
  // Icon mapping for modules
  const iconMap: Record<string, React.ReactNode> = {
    'dashboard': <Dashboard />,
    'orders': <Assignment />,
    'menu': <Restaurant />,
    'tables': <TableRestaurant />,
    'coupons': <LocalOffer />,
    'menu-template': <Palette />,
    'users': <People />,
    'permissions': <Security />,
    'settings': <Settings />,
    'workspace': <Business />,
  };

  // Flag key mapping for modules
  const flagKeyMap: Record<string, string> = {
    'dashboard': 'showDashboardNav',
    'orders': 'showOrdersNav',
    'menu': 'showMenuNav',
    'tables': 'showTablesNav',
    'coupons': 'showCouponsNav',
    'menu-template': 'showMenuNav',
    'users': 'showUsersNav',
    'permissions': 'showPermissionsNav',
    'settings': 'showSettingsNav',
    'workspace': 'showWorkspaceNav',
    'code': 'showCodeNav',
  };

  // Get accessible modules from registry (dynamic based on stored permissions)
  // includeChildren=false ensures only top-level modules are returned
  const accessibleModules = getAccessibleModules();
  
  // Debug logging for sidebar modules
  React.useEffect(() => {
    if (accessibleModules.length > 0) {
      console.log('[Sidebar] Accessible modules (top-level only):', accessibleModules.map(m => ({
        id: m.id,
        label: m.label,
        path: m.path,
        requiredPermissions: m.requiredPermissions,
        requiredRoles: m.requiredRoles,
        hasChildren: !!m.children
      })));
      console.log('[Sidebar] User role:', userRole);
      console.log('[Sidebar] Sidebar flags:', sidebarFlags);
    }
  }, [accessibleModules.length, userRole]);
  
  // Convert to NavigationItem format and add icons
  // Note: accessibleModules already excludes child modules, no need to filter again
  const adminNavItems: NavigationItem[] = accessibleModules
    .map(module => ({
      label: module.label,
      path: module.path,
      icon: iconMap[module.id] || <Dashboard />,
      requiredPermissions: module.requiredPermissions,
      requiredRoles: module.requiredRoles,
      flagKey: flagKeyMap[module.id],
    }))
    .filter(item => {
      // Check feature flag
      if (item.flagKey && !sidebarFlags[item.flagKey as keyof typeof sidebarFlags]) {
        console.log(`[Sidebar] Filtering out ${item.label} due to feature flag: ${item.flagKey}`);
        return false;
      }
      return true;
    });

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
      const response = await venueService.updateVenue(userData.venue.id, { 
        is_open: newStatus 
      });
      // Refresh user data to get updated venue status
      await refreshUserData();    } catch (error) {      // Show error message to user
      alert('Failed to update venue status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
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
            top: 64,
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
          top: 64,
          left: 0,
          bottom: 0,
          width: sidebarWidth,
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(24px)',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: !isCollapsed 
            ? `0 8px 32px ${alpha(theme.palette.common.black, 0.24)}`
            : `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 50%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 1,
          height: '100%',
          background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 100%)`,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 1.25,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: showExpanded ? 'space-between' : 'center',
        }}
      >
        {showExpanded && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              Dino Admin
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                fontWeight: 500,
                display: 'block',
                lineHeight: 1,
              }}
            >
              Control Panel
            </Typography>
          </Box>
        )}
        
        {/* Expand/Collapse Button */}
        <FlagGate flag="sidebar.enableSidebarCollapse">
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
                color: 'text.primary',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  color: 'black',
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
        </FlagGate>
      </Box>

      {/* User Info Section */}
      {user && sidebarFlags.showUserProfile && (
        <Box
          sx={{
            p: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: showExpanded ? 1.25 : 0.75,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              minHeight: showExpanded ? 'auto' : 48,
              height: showExpanded ? 'auto' : 48,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: showExpanded ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                gap: showExpanded ? 0.75 : 0,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'primary.main',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {getUserFirstName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Avatar>
              
              <Collapse in={showExpanded} orientation="horizontal">
                <Box sx={{ minWidth: 0, textAlign: 'center' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.8125rem',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getUserFirstName(user) || user.email}
                  </Typography>
                  <Chip
                    label={(() => {
                      const backendRole = PermissionService.getBackendRole();
                      if (backendRole?.name) {
                        const roleDefinition = PermissionService.getRoleDefinition(backendRole.name);
                        return roleDefinition?.displayName || backendRole.name;
                      }
                      return user?.role || 'User';
                    })()}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.625rem',
                      fontWeight: 500,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      border: 'none',
                      mt: 0.375,
                    }}
                  />
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Box>
      )}

      {/* Venue Status */}
      {venueStatus && showExpanded && sidebarFlags.showVenueStatus && (
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
      {venueStatus && !showExpanded && sidebarFlags.showVenueStatus && (
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
          p: 1.5,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.secondary, 0.2),
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.3),
            },
          },
        }}
        data-tour="sidebar-navigation"
      >
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.7rem',
            mb: 1.5,
            display: showExpanded ? 'block' : 'none',
            px: 1,
          }}
        >
          Navigation
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip
                key={item.label}
                title={isCollapsed ? item.label : ''}
                placement="right"
                disableHoverListener={showExpanded}
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
                    minHeight: 42,
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isActive 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'transparent',
                    border: isActive 
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                      borderColor: isActive 
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.primary.main, 0.2),
                      color: 'black',
                      transform: 'translateX(4px)',
                      '& .MuiButton-startIcon': {
                        color: 'black',
                      },
                    },
                    '&:active': {
                      transform: 'translateX(2px)',
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: 'primary.main',
                      borderRadius: '0 2px 2px 0',
                    } : {},
                    '& .MuiButton-startIcon': {
                      mr: showExpanded ? 1 : 0,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontSize: '1.125rem',
                      transition: 'color 0.2s ease',
                    },
                  }}
                  startIcon={item.icon}
                >
                  <Collapse in={showExpanded} orientation="horizontal">
                    <Typography
                      variant="inherit"
                      sx={{
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Collapse>
                </Button>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Dino Victory Image at Bottom Center */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: showExpanded ? 1 : 0.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mt: 'auto',
          gap: 0.5,
        }}
      >
        <Box
          component="img"
          src="/img/dino_victory.png"
          alt="Dino Victory"
          sx={{
            width: showExpanded ? (isTablet ? 50 : 60) : 36,
            height: showExpanded ? (isTablet ? 50 : 60) : 36,
            objectFit: 'contain',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
            '&:hover': {
              transform: 'scale(1.1) rotate(5deg)',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2)) brightness(1.1)',
            },
          }}
        />
        <Collapse in={showExpanded} orientation="vertical">
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.65rem',
              fontWeight: 500,
              textAlign: 'center',
              mt: 0.5,
            }}
          >
            v1.0.0
          </Typography>
        </Collapse>
      </Box>

      </Box>
    </>
  );
};

export default Sidebar;