import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  InputAdornment,
  AlertColor,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Snackbar,
  useTheme,
  useMediaQuery,
  Stack,
  keyframes,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Business,
  Block,
  CheckCircle,
  Cancel,
  Lock,
  People,
  Refresh,
  ArrowBack,
  CachedOutlined,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useUserData } from '../../contexts/UserDataContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useNavigate } from 'react-router-dom';
import { ROLES, PERMISSIONS, getRoleDisplayName } from '../../types/auth';
import { PasswordUpdateDialog } from '../../components/auth';
import { userService, User, UserCreate, UserUpdate } from '../../services/auth';
import { roleService, Role } from '../../services/auth/roleService';
import { VenueUser } from '../../types/api';
import { PageLoadingSkeleton, EmptyState } from '../../components/ui/LoadingStates';
import { DeleteConfirmationModal } from '../../components/modals';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useUserFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Simple password validation function
const validatePasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    score,
    checks,
    isValid: score === 5,
    strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
  };
};

// Animation for refresh icon
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const UserManagement: React.FC = () => {
  const { hasPermission, isSuperAdmin, isAdmin } = useAuth();
  const userFlags = useUserFlags();
  const { currentWorkspace, currentVenue, venues } = useWorkspace();
  const { 
    userData, 
    loading: userDataLoading,
    getVenue,
    getWorkspace,
    getVenueDisplayName
  } = useUserData();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState<VenueUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use ref to store roles immediately without waiting for state update
  const rolesRef = useRef<Role[]>([]);

  useEffect(() => {
    rolesRef.current = roles; // Keep ref in sync
  }, [roles]);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as AlertColor });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    userId: '',
    userName: '',
    loading: false
  });

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirm_password: '',
    role_id: '',
    role_name: ROLES.OPERATOR as string,
    workspaceId: '',
    venueId: '',
    isActive: true,
  });

  // Track if users have been loaded to prevent duplicate API calls
  const [usersLoaded, setUsersLoaded] = useState(false);

  const loadUsers = useCallback(async () => {
    // Get venue from userData first, then fallback to context
    const venue = getVenue() || currentVenue;
    
    if (!venue?.id) {
      setUsers([]);
      setLoading(false);
      // No venue - keep empty users, don't show error
      setUsersLoaded(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Use the new venue-specific API
      const response = await userService.getUsersByVenueId(venue.id);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      setUsers([]);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setUsersLoaded(true);
    }
  }, [getVenue, handleError, currentVenue]);

  useEffect(() => {
    // Reset loaded state when workspace/venue changes
    setUsersLoaded(false);
    
    // Only load if userData is available (navigation scenario)
    if (userData && !userDataLoading) {
      loadUsers();
    }
  }, [currentWorkspace, currentVenue, loadUsers, userData, userDataLoading]);

  // Load users when userData becomes available (page refresh scenario)
  useEffect(() => {
    // Only load if:
    // 1. We have userData (context is ready)
    // 2. Not currently loading userData
    // 3. Users haven't been loaded yet
    if (userData && !userDataLoading && !usersLoaded) {
      loadUsers();
    }
  }, [userData, userDataLoading, usersLoaded, loadUsers]);

  const loadRoles = async (): Promise<Role[]> => {
    setLoadingRoles(true);
    try {
      const response = await roleService.getRoles({ page: 1, page_size: 100 });
      
      if (response && response.data) {
        let rolesArray: Role[] = [];
        
        if (Array.isArray(response.data)) {
          rolesArray = response.data;
        } else if (Array.isArray(response)) {
          rolesArray = response;
        }
        
        rolesArray = rolesArray.filter(role => role.name.toLowerCase() !== 'superadmin');
        
        if (rolesArray.length > 0) {
          setRoles(rolesArray);
          rolesRef.current = rolesArray;
          return rolesArray;
        }
      }
      
      setRoles([]);
      rolesRef.current = [];
      return [];
    } catch (error) {
      setRoles([]);
      rolesRef.current = [];
      return [];
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleOpenDialog = async (user?: User) => {
    // Load roles when opening dialog
    const loadedRoles = await loadRoles();
    
    // IMPORTANT: Use loadedRoles (the returned value) instead of roles state
    // because state updates are async and won't be available immediately
    
    if (user) {
      setEditingUser(user);
      
      // Find role_id from role name if not available
      let userRoleId = '';
      if (loadedRoles && loadedRoles.length > 0) {
        const userRole = loadedRoles.find(r => r.name.toLowerCase() === (user.role as string).toLowerCase());
        userRoleId = userRole?.id || '';
      }
      
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        password: '', // Don't populate password for editing
        confirm_password: '', // Don't populate password for editing
        role_id: userRoleId,
        role_name: user.role as string,
        workspaceId: user.workspaceId,
        venueId: user.venueId || '',
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      // Find operator role ID from loaded roles
      const operatorRole = loadedRoles && loadedRoles.length > 0 
        ? loadedRoles.find(r => r.name.toLowerCase() === 'operator')
        : undefined;
      
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        confirm_password: '',
        role_id: operatorRole?.id || '',
        role_name: ROLES.OPERATOR as string,
        workspaceId: getWorkspace()?.id || currentWorkspace?.id || '',
        venueId: getVenue()?.id || currentVenue?.id || '',
        isActive: true,
      });
    }
    
    // Wait a tick for state to update before opening dialog
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.firstName.trim()) {
        setSnackbar({ 
          open: true, 
          message: 'First name is required', 
          severity: 'error' 
        });
        return;
      }
      
      if (!formData.lastName.trim()) {
        setSnackbar({ 
          open: true, 
          message: 'Last name is required', 
          severity: 'error' 
        });
        return;
      }
      
      if (!formData.email.trim()) {
        setSnackbar({ 
          open: true, 
          message: 'Email is required', 
          severity: 'error' 
        });
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setSnackbar({ 
          open: true, 
          message: 'Please enter a valid email address', 
          severity: 'error' 
        });
        return;
      }
      
      // Password validation for new users
      if (!editingUser) {
        if (!formData.password) {
          setSnackbar({ 
            open: true, 
            message: 'Password is required for new users', 
            severity: 'error' 
          });
          return;
        }
        
        // Validate password strength
        if (formData.password.length < 8) {
          setSnackbar({ 
            open: true, 
            message: 'Password must be at least 8 characters long', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*[a-z])/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one lowercase letter', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*[A-Z])/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one uppercase letter', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*\d)/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one number', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one special character (@$!%*?&)', 
            severity: 'error' 
          });
          return;
        }
        
        if (formData.password !== formData.confirm_password) {
          setSnackbar({ 
            open: true, 
            message: 'Passwords do not match', 
            severity: 'error' 
          });
          return;
        }
      }

      if (editingUser) {
        // Update user
        const updateData: UserUpdate = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          isActive: formData.isActive,
        };
        
        const response = await userService.updateUser(editingUser.id, updateData);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'User updated successfully', 
            severity: 'success' 
          });
        }
      } else {
        // Validate role_id is selected
        if (!formData.role_id) {
          setSnackbar({ 
            open: true, 
            message: 'Please select a role', 
            severity: 'error' 
          });
          return;
        }
        
        // Create new user - send plain password to backend with role_id
        const createData: UserCreate = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role_id: formData.role_id,
          workspaceId: formData.workspaceId,
          venue_ids: formData.venueId ? [formData.venueId] : [], // Pass venue_id as array
        };
        
        const response = await userService.createUser(createData);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'User created successfully', 
            severity: 'success' 
          });
        }
      }
      
      // Reload users after successful operation
      setUsersLoaded(false);
      await loadUsers();
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save user', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setDeleteModal({
      open: true,
      userId: userId,
      userName: user.name || `${user.firstName} ${user.lastName}`,
      loading: false
    });
  };

  const confirmDeleteUser = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const response = await userService.deleteUser(deleteModal.userId);
      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: 'User deleted successfully', 
          severity: 'success' 
        });
        setUsersLoaded(false);
        await loadUsers(); // Reload users after deletion
        setDeleteModal({ open: false, userId: '', userName: '', loading: false });
      }
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete user', 
        severity: 'error' 
      });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await userService.toggleUserStatus(userId, !currentStatus);
      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 
          severity: 'success' 
        });
        setUsersLoaded(false);
        await loadUsers(); // Reload users after status change
      }
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update user status', 
        severity: 'error' 
      });
    }
  };

  const handlePasswordUpdate = async (userId: string, newPassword: string) => {
    // Send plain password to backend - backend handles hashing
    // Don't catch errors here - let them bubble up to PasswordUpdateDialog
    const response = await userService.updateUserPassword(userId, newPassword);
    
    if (!response.success) {
      // Throw error to be caught and displayed by PasswordUpdateDialog
      throw new Error(response.message || 'Failed to update password');
    }
    
    // Only show success message in snackbar after dialog closes
    setSnackbar({ 
      open: true, 
      message: 'Password updated successfully', 
      severity: 'success' 
    });
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshUsers = async () => {
    const venue = getVenue() || currentVenue;
    
    if (!venue?.id) {
      setSnackbar({
        open: true,
        message: 'No venue available to refresh users',
        severity: 'error'
      });
      return;
    }

    setRefreshing(true);
    setError(null);
    
    try {
      const response = await userService.getUsersByVenueId(venue.id);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setSnackbar({
          open: true,
          message: response.error || 'No users found for this venue.',
          severity: 'warning'
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh users. Please try again.',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: VenueUser | User) => {
    setAnchorEl(event.currentTarget);
    // Convert VenueUser to User format if needed
    const userForSelection: User = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      workspaceId: user.workspaceId,
      venueId: user.venueId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    setSelectedUser(userForSelection);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (roleName: string): string => {
    switch (roleName) {
      case ROLES.SUPERADMIN:
        return '#0D47A1'; // Dark blue
      case ROLES.ADMIN:
        return '#1976D2'; // Medium blue
      case ROLES.OPERATOR:
        return '#64B5F6'; // Light blue
      default:
        return '#1565C0'; // Default blue
    }
  };

  // Use the centralized role display name function
  const getDisplayName = (role: User['role']) => {
    return getRoleDisplayName(role);
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    return userService.formatLastLogin(dateString);
  };

  // Sort users by role hierarchy: superadmin -> admin -> operator
  const sortUsersByRole = (users: VenueUser[]) => {
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

  // Filter users based on search and filters
  const filteredUsers = sortUsersByRole(users.filter(user => {
    if (!user) return false;
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const email = user.email || '';
    const name = user.name || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesActive = showInactive || user.isActive;
    
    return matchesSearch && matchesRole && matchesActive;
  }));

  // Role-based restrictions
  const canCreateUsers = isSuperAdmin || hasPermission(PERMISSIONS.USERS_CREATE);
  const canEditUsers = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUsers = hasPermission(PERMISSIONS.USERS_DELETE);
  const canUpdatePasswords = isAdmin() || isSuperAdmin();

  // Don't block UI with loading or error states
  // Show page immediately with empty users if API fails
  
  if (false && error) { // Disabled blocking UI
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 2.5, width: '100%' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and their permissions
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)',
            },
          }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <People sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="600" gutterBottom color="error.main">
                Unable to Load Users
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                {error}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  startIcon={<Refresh />}
                  onClick={() => {
                    setUsersLoaded(false);
                    setError(null);
                    loadUsers();
                  }}
                  size="large"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/admin')}
                  size="large"
                >
                  Back to Dashboard
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // No workspace selected state (check userData first)
  const venue = getVenue();
  
  if (!venue && !currentWorkspace?.id) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 2.5, width: '100%' }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and their permissions
            </Typography>
          </Box>

          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 2.5,
              transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Business
              sx={{
                fontSize: 80,
                color: 'text.secondary',
                mb: 2,
              }}
            />
            <Typography variant="h5" fontWeight="600" gutterBottom color="text.secondary">
              No Workspace Found
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
              You need to select a workspace first to manage users. Please select or create a workspace to continue.
            </Typography>
          </Card>
        </Container>
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
          py: { xs: 2.5, sm: 3 },
          px: { xs: 2, sm: 3 },
          margin: 0,
          width: '100%',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pl: { xs: 3, sm: 4, md: 5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <People sx={{ fontSize: 24, mr: 1.25, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.375rem', sm: '1.625rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  User Management
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 400,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Manage users and their permissions across your venue
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', md: 'flex-end' },
              }}
            >
              {/* Venue Name Badge */}
              {venue && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1.25,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Business sx={{ fontSize: 14, mr: 0.5, color: 'primary.main', opacity: 0.9 }} />
                  <Typography variant="body2" fontWeight="500" color="text.primary" sx={{ fontSize: '0.8125rem' }}>
                    {venue.name}
                  </Typography>
                </Box>
              )}

              {/* Buttons Row */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {canCreateUsers() && (
                  <FlagGate flag="users.showAddUser">
                    <Button
                      variant="contained"
                      startIcon={<Add sx={{ fontSize: 16 }} />}
                      onClick={() => handleOpenDialog()}
                      size="small"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        px: 2,
                        py: 0.75,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontSize: '0.8125rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Add User
                    </Button>
                  </FlagGate>
                )}

                <IconButton
                  onClick={handleRefreshUsers}
                  disabled={refreshing}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    color: 'text.secondary',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      color: 'primary.main',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      opacity: 0.5,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  title={refreshing ? 'Refreshing...' : 'Refresh users'}
                >
                  {refreshing ? (
                    <CachedOutlined sx={{ animation: `${spin} 1s linear infinite`, fontSize: 16 }} />
                  ) : (
                    <Refresh sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Box>
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
        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 1 }}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Content Area */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 4 }}>

          {/* Statistics Cards */}
          <FlagGate flag="users.showUserStats">
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {[
              {
                label: 'Total Users',
                value: users.length,
                color: '#2196F3',
                icon: <People />,
                description: 'All registered users'
              },
              {
                label: 'Active Users',
                value: users.filter(user => user.isActive).length,
                color: '#4CAF50',
                icon: <CheckCircle />,
                description: 'Currently active'
              },
              {
                label: 'Recent Logins',
                value: users.filter(user => {
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  const lastLogin = user.last_login ? new Date(user.last_login) : null;
                  return lastLogin && lastLogin > sevenDaysAgo;
                }).length,
                color: '#2196F3',
                icon: <Business />,
                description: 'Last 7 days'
              },
              {
                label: 'Role Types',
                value: [...new Set(users.map(user => user.role))].length,
                color: '#FF9800',
                icon: <Business />,
                description: 'Different roles'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 1.5,
                    backgroundColor: `${stat.color}08`,
                    border: `1px solid ${stat.color}33`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${stat.color}33`,
                      backgroundColor: `${stat.color}12`,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {/* Icon on the left */}
                    <Box
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: 1.5,
                        backgroundColor: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        fontSize: 'medium'
                      })}
                    </Box>
                    
                    {/* Text content on the right */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant={isMobile ? "h6" : "h4"} 
                        fontWeight="700" 
                        color="text.primary"
                        sx={{ 
                          fontSize: { xs: '1.25rem', sm: '2rem' },
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
                  </Stack>
                </Card>
              </Grid>
            ))}
            </Grid>
          </FlagGate>

          {/* Filters and Search */}
          <FlagGate flag="users.showUserFilters">
            <Card 
              sx={{ 
                mb: 2.5, 
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Grid container spacing={1.5} alignItems="center">
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
                        py: 1.25,
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl
                    fullWidth
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
                    <InputLabel>Filter by Role</InputLabel>
                    <Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      label="Filter by Role"
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value={ROLES.SUPERADMIN}>Super Admin</MenuItem>
                      <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                      <MenuItem value={ROLES.OPERATOR}>Operator</MenuItem>
                    </Select>
                  </FormControl>
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
              </Grid>
            </CardContent>
          </Card>
          </FlagGate>

          {/* Users Table */}
          <Card 
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: { xs: 'none', md: 'translateY(-2px)' },
              },
            }}
          >
            {filteredUsers.length === 0 ? (
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: { xs: 4, sm: 6 },
                  textAlign: 'center'
                }}>
                  <People sx={{ 
                    fontSize: { xs: 48, sm: 64 }, 
                    color: 'text.secondary', 
                    mb: 2,
                    opacity: 0.5 
                  }} />
                  <Typography variant="h6" fontWeight="600" gutterBottom color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    No Users Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                    No users found for this venue. Users will appear here once they are assigned to this venue.
                  </Typography>
                </Box>
              </CardContent>
            ) : (
              <CardContent sx={{ p: { xs: 0, sm: 0 } }}>
                <Box sx={{ 
                  overflowX: 'auto',
                  width: '100%',
                  // Custom scrollbar for better mobile experience
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 4,
                  },
                }}>
                  <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          color: 'text.primary',
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 2 },
                          position: { xs: 'sticky', sm: 'static' },
                          left: 0,
                          backgroundColor: 'background.paper',
                          zIndex: 1,
                          minWidth: { xs: 200, sm: 'auto' }
                        }}>
                          User
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          color: 'text.primary',
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 2 },
                          minWidth: 100
                        }}>
                          Role
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          color: 'text.primary',
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 2 },
                          minWidth: 100
                        }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          color: 'text.primary',
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 2 },
                          display: { xs: 'none', md: 'table-cell' },
                          minWidth: 120
                        }}>
                          Last Login
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          color: 'text.primary',
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 2 },
                          minWidth: 80
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell sx={{ 
                          py: { xs: 2, sm: 2.5 },
                          px: { xs: 2, sm: 2 },
                          position: { xs: 'sticky', sm: 'static' },
                          left: 0,
                          backgroundColor: 'background.paper',
                          zIndex: 1,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                            <Avatar 
                              sx={{ 
                                width: { xs: 36, sm: 44 }, 
                                height: { xs: 36, sm: 44 }, 
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 600,
                                bgcolor: 'primary.main'
                              }}
                            >
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="600"
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                  color: 'text.primary',
                                  mb: 0.5,
                                  lineHeight: 1.3
                                }}
                              >
                                {user.name || `${user.firstName} ${user.lastName}`}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                  lineHeight: 1.4,
                                  mb: user.phone ? 0.25 : 0,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.email}
                              </Typography>
                              {user.phone && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                    lineHeight: 1.4,
                                    display: { xs: 'none', lg: 'block' }
                                  }}
                                >
                                  {user.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2 } }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              fontWeight: 600,
                              color: 'text.primary',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {user.role_display_name || getDisplayName(user.role)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2 } }}>
                          <Chip
                            label={user.status || (user.isActive ? 'Active' : 'Inactive')}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                            icon={user.isActive ? <CheckCircle sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} /> : <Cancel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              height: { xs: 24, sm: 28 },
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: { xs: 1, sm: 1.5 }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2 }, display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.8125rem',
                              color: 'text.secondary',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {formatLastLogin(user.last_login || user.updatedAt || user.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2 } }}>
                          <IconButton
                            onClick={(e) => handleMenuClick(e, user)}
                            size="small"
                            sx={{ 
                              p: { xs: 0.75, sm: 1 },
                              minWidth: 44,
                              minHeight: 44,
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <MoreVert sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              </CardContent>
            )}
          </Card>
        </Box>
      </Box>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEditUsers && (
          <FlagGate flag="users.showEditUser">
            <MenuItem onClick={() => {
              handleOpenDialog(selectedUser!);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit User</ListItemText>
            </MenuItem>
          </FlagGate>
        )}
        {canUpdatePasswords && selectedUser && (
          <FlagGate flag="users.showUserPasswordUpdate">
            <MenuItem onClick={() => {
              setPasswordDialogOpen(true);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Lock fontSize="small" />
              </ListItemIcon>
              <ListItemText>Update Password</ListItemText>
            </MenuItem>
          </FlagGate>
        )}
        {selectedUser && (
          <FlagGate flag="users.showUserStatusToggle">
            <MenuItem onClick={() => {
              handleToggleUserStatus(selectedUser.id, selectedUser.isActive);
              handleMenuClose();
            }}>
              <ListItemIcon>
                {selectedUser.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {selectedUser.isActive ? 'Deactivate' : 'Activate'}
              </ListItemText>
            </MenuItem>
          </FlagGate>
        )}
        {canDeleteUsers && selectedUser && (
          <FlagGate flag="users.showDeleteUser">
            <MenuItem onClick={() => {
              handleDeleteUser(selectedUser.id);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
          </FlagGate>
        )}
      </Menu>

      {/* User Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '95vh' : 'calc(100vh - 100px)',
            minHeight: isMobile ? 'auto' : '600px',
            height: isMobile ? 'auto' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: { xs: 2, sm: 2 }, 
          px: { xs: 3, sm: 3 },
          pt: { xs: 2.5, sm: 3 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600">
            {editingUser ? 'Edit User' : 'Create New User'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          px: { xs: 2, sm: 3 },
          pt: { xs: 4, sm: 5 },
          pb: { xs: 3, sm: 4 },
          flex: 1,
          overflow: 'auto'
        }}>
          <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: { xs: 2, sm: 2.5 } }}>
            {/* Name Fields */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                size={isMobile ? "medium" : "medium"}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                size={isMobile ? "medium" : "medium"}
              />
            </Stack>

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
              required
              size={isMobile ? "medium" : "medium"}
            />

            {/* Password Fields - Only show for new users */}
            {editingUser && (
              <Alert severity="info" sx={{ my: { xs: 3, sm: 2 } }}>
                To update the password for this user, use the "Update Password" option from the user actions menu.
              </Alert>
            )}
            {!editingUser && (
              <>
                <Box>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    size={isMobile ? "medium" : "medium"}
                    helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                  />
                  {formData.password && (
                    <Box sx={{ mt: { xs: 1, sm: 1 } }}>
                      {(() => {
                        const validation = validatePasswordStrength(formData.password);
                        const color = validation.strength === 'weak' ? 'error' : 
                                     validation.strength === 'medium' ? 'warning' : 'success';
                        return (
                          <Box>
                            <Typography variant="caption" color={`${color}.main`} sx={{ fontWeight: 500 }}>
                              Password strength: {validation.strength.toUpperCase()}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <Box
                                  key={level}
                                  sx={{
                                    height: 4,
                                    flex: 1,
                                    backgroundColor: level <= validation.score 
                                      ? `${color}.main` 
                                      : 'grey.300',
                                    borderRadius: 1
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      })()}
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  size={isMobile ? "medium" : "medium"}
                  error={formData.password !== formData.confirm_password && formData.confirm_password !== ''}
                  helperText={formData.password !== formData.confirm_password && formData.confirm_password !== '' ? 'Passwords do not match' : ''}
                />
              </>
            )}

            {/* Phone and Role */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
                placeholder="e.g., 9876543210"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
                size={isMobile ? "medium" : "medium"}
              />
              <FormControl fullWidth required size={isMobile ? "medium" : "medium"} disabled={loadingRoles}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role_id}
                  onChange={(e) => {
                    const selectedRole = roles.find(r => r.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      role_id: e.target.value,
                      role_name: selectedRole?.name || ''
                    });
                  }}
                  label="Role"
                  onOpen={() => {
                    // Roles are already loaded when dialog opens
                  }}
                >
                  {(() => {
                    if (loadingRoles) {
                      return <MenuItem value="">Loading roles...</MenuItem>;
                    }
                    
                    if (roles.length === 0) {
                      return <MenuItem value="">No roles available</MenuItem>;
                    }
                    
                    const filteredRoles = roles.filter(role => {
                      // Filter roles based on current user permissions
                      if (isSuperAdmin()) return true;
                      if (isAdmin()) return role.name.toLowerCase() !== 'superadmin';
                      return role.name.toLowerCase() === 'operator';
                    });
                    
                    return filteredRoles.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {roleService.getRoleDisplayName(role.name)}
                      </MenuItem>
                    ));
                  })()}
                </Select>
              </FormControl>
            </Stack>

            {/* Venue Selection */}
            {venues.length > 1 && (
              <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                  label="Venue"
                >
                  <MenuItem value="">All Venues</MenuItem>
                  {venues.map((venue) => (
                    <MenuItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Active Status */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              py: { xs: 1, sm: 1 },
              borderRadius: 1,
              backgroundColor: 'grey.50',
              px: { xs: 2, sm: 2 }
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Active User
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      User can log in and access the system
                    </Typography>
                  </Box>
                }
                sx={{ margin: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: { xs: 2.5, sm: 3 },
          pt: { xs: 2, sm: 2 },
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Update Dialog */}
      {selectedUser && (
        <PasswordUpdateDialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          onUpdate={(userId, newPassword) => handlePasswordUpdate(userId, newPassword)}
          user={{
            id: selectedUser.id,
            email: selectedUser.email,
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            role: selectedUser.role
          }}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, userId: '', userName: '', loading: false })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        itemName={deleteModal.userName}
        itemType="user account"
        description="This user account will be permanently removed from the system. The user will lose access to all restaurant management features."
        loading={deleteModal.loading}
        additionalWarnings={[
          'All user activity history will be preserved for audit purposes',
          'Any ongoing tasks assigned to this user may be affected',
          'User permissions and role assignments will be revoked',
          'This action cannot be undone'
        ]}
      />
    </Box>
  );
};

export default UserManagement;