import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Security,
  Person,
  Business,
  Restaurant,
  Settings,
  TableRestaurant,
  ShoppingCart,
  MenuBook,
  People,
  Visibility,
  CheckCircle,
  Cancel,
  Search,
  Download,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import PermissionService from '../../services/auth';
import { PERMISSIONS, ROLES } from '../../types/auth';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { userService } from '../../services/auth/userService';
import { apiService } from '../../utils/api';

const UserPermissionsDashboard: React.FC = () => {
  const { user, getUserWithRole, hasPermission, isSuperAdmin } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInactive, setShowInactive] = useState(false);

  // Users data will be loaded from API
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersByRole: {} as Record<string, number>,
    recentLogins: 0,
  });
  
  // Cache for roles with permissions - single API call
  const [rolesCache, setRolesCache] = useState<Map<string, any>>(new Map());

  // Function to refresh users data
  const refreshUsers = async () => {
    if (!userData?.venue?.id) {
      setError('No venue selected. Please select a venue to view users.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // OPTIMIZATION: Fetch all roles with permissions once (single API call)
      const { roleService } = await import('../../services/auth/roleService');
      const rolesWithPermissions = await roleService.getRolesWithPermissions();
      
      // Build roles cache map for quick lookup
      const rolesMap = new Map();
      rolesWithPermissions.forEach(role => {
        rolesMap.set(role.id, role);
        rolesMap.set(role.name, role); // Also map by name for flexibility
      });
      setRolesCache(rolesMap);
      
      // Get users for the current venue
      const response = await userService.getUsersByVenueId(userData.venue.id);
      
      if (response.success && response.data) {
        // Map users with permissions from roles cache (no additional API calls needed)
        const mappedUsers = response.data.map((user: any) => {
          let userPermissions: any[] = [];
          
          // Get permissions from roles cache using role_id or role name
          const roleData = rolesMap.get(user.role_id) || rolesMap.get(user.role);
          if (roleData && roleData.permissions) {
            userPermissions = roleData.permissions;
          }
          
          return {
            ...user,
            firstName: user.firstName,
            lastName: user.lastName,
            lastLogin: user.last_login,
            isActive: user.isActive,
            permissions: userPermissions,
          };
        });
        setUsers(mappedUsers);
      } else {
        setUsers([]);
      }
      
      // Get updated user statistics
      const stats = await PermissionService.getUserStatistics(userData.venue.id);
      setUserStats(stats);

    } catch (error: any) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      if (!userData?.venue?.id) {
        setLoading(false);
        setError('No venue selected. Please select a venue to view users.');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // OPTIMIZATION: Fetch all roles with permissions once (single API call)
        const { roleService } = await import('../../services/auth/roleService');
        const rolesWithPermissions = await roleService.getRolesWithPermissions();
        
        // Build roles cache map for quick lookup
        const rolesMap = new Map();
        rolesWithPermissions.forEach(role => {
          rolesMap.set(role.id, role);
          rolesMap.set(role.name, role); // Also map by name for flexibility
        });
        setRolesCache(rolesMap);
        
        // Get users for the current venue
        const response = await userService.getUsersByVenueId(userData.venue.id);
        
        if (response.success && response.data) {
          // Map users with permissions from roles cache (no additional API calls needed)
          const mappedUsers = response.data.map((user: any) => {
            let userPermissions: any[] = [];
            
            // Get permissions from roles cache using role_id or role name
            const roleData = rolesMap.get(user.role_id) || rolesMap.get(user.role);
            if (roleData && roleData.permissions) {
              userPermissions = roleData.permissions;
            }
            
            return {
              ...user,
              firstName: user.firstName,
              lastName: user.lastName,
              lastLogin: user.last_login,
              isActive: user.isActive,
              permissions: userPermissions,
            };
          });
          setUsers(mappedUsers);
        } else {
          setUsers([]);
        }
        
        // Get user statistics
        const stats = await PermissionService.getUserStatistics(userData.venue.id);
        setUserStats(stats);

      } catch (error: any) {
        setError('Network error. Please check your connection.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    // Only load users if we have venue data or if user is superadmin
    if (userData?.venue?.id || isSuperAdmin()) {
      loadUsers();
    } else {
      setLoading(false);
      setError('No venue selected. Please select a venue to view users.');
    }
  }, [userData?.venue?.id, isSuperAdmin]);

  const permissionCategories = [
    {
      name: 'Dashboard',
      icon: <Business />,
      color: '#1976d2',
      permissions: [PERMISSIONS.DASHBOARD_VIEW]
    },
    {
      name: 'Orders',
      icon: <ShoppingCart />,
      color: '#388e3c',
      permissions: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_UPDATE, PERMISSIONS.ORDERS_DELETE]
    },
    {
      name: 'Menu',
      icon: <MenuBook />,
      color: '#f57c00',
      permissions: [PERMISSIONS.MENU_VIEW, PERMISSIONS.MENU_CREATE, PERMISSIONS.MENU_UPDATE, PERMISSIONS.MENU_DELETE]
    },
    {
      name: 'Tables',
      icon: <TableRestaurant />,
      color: '#7b1fa2',
      permissions: [PERMISSIONS.TABLES_VIEW, PERMISSIONS.TABLES_CREATE, PERMISSIONS.TABLES_UPDATE, PERMISSIONS.TABLES_DELETE]
    },
    {
      name: 'Settings',
      icon: <Settings />,
      color: '#d32f2f',
      permissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_UPDATE]
    },
    {
      name: 'Users',
      icon: <People />,
      color: '#0288d1',
      permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE, PERMISSIONS.USERS_DELETE]
    },
    {
      name: 'Workspace',
      icon: <Business />,
      color: '#5d4037',
      permissions: [PERMISSIONS.WORKSPACE_VIEW, PERMISSIONS.WORKSPACE_CREATE, PERMISSIONS.WORKSPACE_UPDATE, PERMISSIONS.WORKSPACE_DELETE, PERMISSIONS.WORKSPACE_SWITCH]
    },
    {
      name: 'Cafe Management',
      icon: <Restaurant />,
      color: '#00796b',
      permissions: [PERMISSIONS.VENUE_ACTIVATE, PERMISSIONS.VENUE_DEACTIVATE, PERMISSIONS.VENUE_VIEW_ALL, PERMISSIONS.VENUE_SWITCH]
    }
  ];

  const getRoleColor = (roleName: string): string => {
    switch (roleName) {
      case 'superadmin':
        return '#0D47A1'; // Dark blue
      case 'admin':
        return '#1976D2'; // Medium blue
      case 'operator':
        return '#64B5F6'; // Light blue
      default:
        return '#1565C0'; // Default blue
    }
  };

  const getRoleDisplayName = (role: string | any) => {
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
      // Use PermissionService method for consistency
      return PermissionService.getRoleDisplayName(role);
    }
    
    return 'Unknown Role';
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    return userService.formatLastLogin(dateString);
  };

  // Sort users by role hierarchy: superadmin -> admin -> operator
  const sortUsersByRole = (users: any[]) => {
    const roleOrder: { [key: string]: number } = {
      'superadmin': 1,
      'admin': 2,
      'operator': 3
    };

    return [...users].sort((a, b) => {
      const roleA = typeof a.role === 'string' ? a.role.toLowerCase() : 'operator';
      const roleB = typeof b.role === 'string' ? b.role.toLowerCase() : 'operator';
      
      const orderA = roleOrder[roleA] || 999;
      const orderB = roleOrder[roleB] || 999;
      
      return orderA - orderB;
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Visibility fontSize="small" />;
      case 'create':
        return <CheckCircle fontSize="small" />;
      case 'update':
        return <CheckCircle fontSize="small" />;
      case 'delete':
        return <Cancel fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'info';
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'error';
      case 'activate':
      case 'deactivate':
        return 'warning';
      case 'switch':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPermissionDescription = (permissionName: string): string => {
    const descriptions: { [key: string]: string } = {
      // Dashboard
      'dashboard:view': 'View dashboard',
      
      // Orders
      'orders:view': 'View orders',
      'orders:create': 'Create orders',
      'orders:update': 'Update orders',
      'orders:delete': 'Delete orders',
      
      // Menu
      'menu:view': 'View menu',
      'menu:create': 'Create menu items',
      'menu:update': 'Update menu',
      'menu:delete': 'Delete menu items',
      
      // Tables
      'tables:view': 'View tables',
      'tables:create': 'Create tables',
      'tables:update': 'Update tables',
      'tables:delete': 'Delete tables',
      
      // Settings
      'settings:view': 'View settings',
      'settings:update': 'Update settings',
      
      // Users
      'users:view': 'View users',
      'users:create': 'Create users',
      'users:update': 'Update users',
      'users:delete': 'Delete users',
      
      // Workspace
      'workspace:view': 'View workspaces',
      'workspace:create': 'Create workspaces',
      'workspace:update': 'Update workspaces',
      'workspace:delete': 'Delete workspaces',
      'workspace:switch': 'Switch workspaces',
      
      // Cafe Management
      'venue:activate': 'Activate venues',
      'venue:deactivate': 'Deactivate venues',
      'venue:view_all': 'View all venues',
      'venue:switch': 'Switch venues',
    };
    
    return descriptions[permissionName] || permissionName.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredUsers = sortUsersByRole(users.filter(user => {
    if (!user) return false;
    
    const firstName = user.firstName || user.firstName || '';
    const lastName = user.lastName || user.lastName || '';
    const email = user.email || '';
    const name = user.name || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesActive = showInactive || (user.isActive !== undefined ? user.isActive : user.isActive);
    
    return matchesSearch && matchesRole && matchesActive;
  }));

  const handleViewPermissions = (user: any) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const exportPermissions = () => {
    if (filteredUsers.length === 0) {
      alert('No users available to export');
      return;
    }
    
    const data = filteredUsers.map(user => ({
      Name: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
      Email: user.email || 'No email',
      Role: getRoleDisplayName(user.role || 'unknown'),
      Status: user.isActive ? 'Active' : 'Inactive',
      Cafe: userData?.venue?.name || 'All Cafes',
      Permissions: user.permissions?.length || 0,
      LastLogin: user.lastLogin?.toLocaleDateString() || 'Never'
    }));
    
    // In real app, this would generate and download a CSV/Excel file
    };

  const currentUserAuth = getUserWithRole();
  const canViewAllUsers = isSuperAdmin || hasPermission(PERMISSIONS.USERS_VIEW);

  // Add error handling for currentUserAuth
  if (!currentUserAuth && !userDataLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Cancel sx={{ fontSize: 14, color: 'error.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
              Authentication Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Unable to load user authentication data. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
              }}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!canViewAllUsers) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Security sx={{ fontSize: 14, color: 'warning.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              You don't have permission to view user permissions. Please contact your administrator to request access.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.history.back()}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                },
              }}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Don't render if currentUserAuth is still loading or null
  if (!currentUserAuth) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                },
              }}
            >
              <Security sx={{ fontSize: 14, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
              Loading Permissions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Please wait while we load user permissions...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
        '& .MuiContainer-root': {
          padding: '0 !important',
          margin: '0 !important',
          maxWidth: 'none !important',
        },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
          padding: 0,
          margin: 0,
          width: '100%',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Security sx={{ fontSize: 26, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  User Permissions
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Monitor and manage user permissions across your organization
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Person sx={{ fontSize: 14, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {userData?.venue?.name || 'All Venues'}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'row', sm: 'row' },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={refreshUsers}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title="Refresh permissions"
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >
        {/* Content Area */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 }, pb: 4 }}>

          {/* Statistics Cards */}
          <Box sx={{ 
            px: { xs: 3, sm: 4 }, 
            py: { xs: 3, sm: 4 }, 
            backgroundColor: 'background.paper', 
            borderRadius: 3, 
            mb: 4,
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
              User Overview
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[
                {
                  label: 'Total Users',
                  value: userStats.totalUsers,
                  color: '#2196F3',
                  icon: <People />,
                  description: 'All registered users'
                },
                {
                  label: 'Active Users',
                  value: userStats.activeUsers,
                  color: '#4CAF50',
                  icon: <CheckCircle />,
                  description: 'Currently active'
                },
                {
                  label: 'Recent Logins',
                  value: userStats.recentLogins,
                  color: '#FF9800',
                  icon: <Security />,
                  description: 'Last 24 hours'
                },
                {
                  label: 'Role Types',
                  value: Object.keys(userStats.usersByRole).length,
                  color: '#9C27B0',
                  icon: <Business />,
                  description: 'Different roles'
                }
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 2,
                      backgroundColor: `${stat.color}08`,
                      border: `1px solid ${stat.color}33`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${stat.color}33`,
                        backgroundColor: `${stat.color}12`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Icon on the left */}
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                      </Box>
                      
                      {/* Text content on the right */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h4" 
                          fontWeight="700" 
                          color="text.primary" 
                          sx={{ 
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            lineHeight: 1.2,
                            mb: 0.5
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          fontWeight="600"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Filters and Search */}
          <Card 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'background.paper',
                          boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.875rem',
                        py: 1.5,
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Filter by Role"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'background.paper',
                          boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      },
                      '& .MuiSelect-select': {
                        fontSize: '0.875rem',
                        py: 1.5,
                      },
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value={ROLES.SUPERADMIN}>Super Admin</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.OPERATOR}>Operator</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'primary.main',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'primary.main',
                          },
                        }}
                      />
                    }
                    label="Show Inactive Users"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'text.primary',
                      },
                      ml: 0,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={async () => {
                        // Fetch current user's permissions
                        let currentUserPermissions: any[] = [];
                        try {
                          const permResponse = await PermissionService.fetchUserPermissions(true);
                          if (permResponse && permResponse.permissions) {
                            currentUserPermissions = permResponse.permissions;
                          }
                        } catch (error) {
                          currentUserPermissions = [];
                        }
                        
                        handleViewPermissions({
                          ...(currentUserAuth || {}),
                          firstName: user?.firstName || user?.firstName,
                          lastName: user?.lastName || user?.lastName,
                          email: user?.email,
                          isActive: true,
                          lastLogin: new Date(),
                          cafeId: userData?.venue?.id,
                          permissions: currentUserPermissions,
                        });
                      }}
                      sx={{ 
                        minWidth: 'auto',
                        whiteSpace: 'nowrap',
                        borderRadius: 2,
                        borderColor: 'divider',
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        px: 2.5,
                        py: 1.5,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(33, 150, 243, 0.04)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      My Permissions
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={refreshUsers}
                sx={{ mt: 1 }}
              >
                Retry
              </Button>
            </Alert>
          )}

          {/* Users Table */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography>Loading users...</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        py: 2
                      }}>
                        User
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        py: 2
                      }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        py: 2
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        py: 2
                      }}>
                        Last Login
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        py: 2
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow 
                          key={user.id || Math.random()}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell sx={{ py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  width: 44, 
                                  height: 44,
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  bgcolor: 'primary.main'
                                }}
                              >
                                {((user.firstName || user.firstName)?.[0] || '?')}{((user.lastName || user.lastName)?.[0] || '')}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight="600"
                                  sx={{ 
                                    fontSize: '0.9375rem',
                                    color: 'text.primary',
                                    mb: 0.5,
                                    lineHeight: 1.3
                                  }}
                                >
                                  {user.name || `${user.firstName || user.firstName || 'Unknown'} ${user.lastName || user.lastName || 'User'}`}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: '0.8125rem',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {user.email || 'No email'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: 'text.primary'
                              }}
                            >
                              {getRoleDisplayName(user.role || 'unknown')}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Chip
                              label={user.isActive ? 'Active' : 'Inactive'}
                              color={user.isActive ? 'success' : 'default'}
                              size="small"
                              icon={user.isActive ? <CheckCircle sx={{ fontSize: '1rem' }} /> : <Cancel sx={{ fontSize: '1rem' }} />}
                              sx={{ 
                                fontSize: '0.8125rem',
                                height: 28,
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.8125rem',
                                color: 'text.secondary'
                              }}
                            >
                              {formatLastLogin(user.lastLogin || user.updatedAt || user.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 2.5 }}>
                            <IconButton
                              onClick={() => handleViewPermissions(user)}
                              size="small"
                              sx={{ 
                                p: 1,
                                '&:hover': {
                                  backgroundColor: 'action.hover'
                                }
                              }}
                            >
                              <Visibility sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Box sx={{ py: 8, px: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                            <Security sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                              No Users Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, fontSize: '0.875rem' }}>
                              No users found for this venue. Users will appear here once they are assigned to this venue.
                            </Typography>
                            {error && (
                              <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={refreshUsers}
                                startIcon={<Refresh />}
                              >
                                Retry
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Permissions Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: getRoleColor(selectedUser?.role || '') + '.main',
                mr: 2,
              }}
            >
              <Security />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email} • {String(getRoleDisplayName(
                  typeof selectedUser?.role === 'string' 
                    ? selectedUser.role 
                    : (selectedUser?.role?.displayName || selectedUser?.role?.name || 'Unknown')
                ))}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 3, sm: 4 },
          minHeight: '500px'
        }}>
          <Grid container spacing={3}>
            {permissionCategories.map((category) => {
              const userPermissions = selectedUser?.permissions || [];
              const categoryPermissions = userPermissions.filter((p: any) => 
                (category.permissions as string[]).includes(p.name)
              );
              
              // Show all categories, even if user doesn't have permissions for them
              const allCategoryPermissions = category.permissions.map(permName => {
                const userPerm = categoryPermissions.find((p: any) => p.name === permName);
                const action = permName.split(':')[1] || permName.split('_')[1] || 'view';
                return {
                  name: permName,
                  action: action,
                  description: getPermissionDescription(permName),
                  hasPermission: !!userPerm
                };
              });

              return (
                <Grid item xs={12} sm={6} md={4} key={category.name}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      {/* Category Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: category.color,
                            width: 36,
                            height: 36,
                            mr: 1.5,
                          }}
                        >
                          {React.cloneElement(category.icon, { fontSize: 'small' })}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1rem' }}>
                            {String(category.name)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {allCategoryPermissions.filter(p => p.hasPermission).length} of {allCategoryPermissions.length} permissions
                          </Typography>
                        </Box>
                      </Box>

                      {/* Permissions List */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {allCategoryPermissions.map((permission, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: permission.hasPermission ? 'success.50' : 'grey.50',
                              border: '1px solid',
                              borderColor: permission.hasPermission ? 'success.200' : 'grey.200',
                              opacity: permission.hasPermission ? 1 : 0.6,
                            }}
                          >
                            <Box sx={{ mr: 1 }}>
                              {permission.hasPermission ? (
                                <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                              ) : (
                                <Cancel sx={{ fontSize: 14, color: 'grey.400' }} />
                              )}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={permission.hasPermission ? 500 : 400}
                                sx={{ 
                                  fontSize: '0.875rem',
                                  color: permission.hasPermission ? 'text.primary' : 'text.secondary'
                                }}
                              >
                                {permission.description}
                              </Typography>
                            </Box>
                            <Chip
                              label={permission.action}
                              size="small"
                              color={permission.hasPermission ? getActionColor(permission.action) as any : 'default'}
                              variant={permission.hasPermission ? 'filled' : 'outlined'}
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 20,
                                opacity: permission.hasPermission ? 1 : 0.5
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 6, mb: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ mb: 2 }}>
              Permission Summary:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Permissions: {selectedUser?.permissions?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {String(getRoleDisplayName(selectedUser?.role || ''))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {selectedUser?.isActive ? 'Active' : 'Inactive'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Login: {formatLastLogin(selectedUser?.lastLogin || selectedUser?.updatedAt || selectedUser?.createdAt)}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserPermissionsDashboard;