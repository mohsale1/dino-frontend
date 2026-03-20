import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  IconButton,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Search,
  FilterList,
  Close,
  Person,
  Email,
  Phone,
  Badge,
  CalendarToday,
  VpnKey,
  Visibility,
  Store,
} from '@mui/icons-material';
import { systemUserService } from '../../services/system/user';
import { applicationUserService } from '../../services/application/user';
import { systemRoleService } from '../../services/system/role';
import { systemWorkspaceService } from '../../services/system/workspace';
import { DeleteConfirmationDialog, PasswordUpdateDialog } from '../../components/dialogs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [applicationUsers, setApplicationUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('');

  // Form states
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: '',
    password: '',
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users, roles, and workspaces...');
      const [systemUsersData, applicationUsersData, roles, workspaces] = await Promise.all([
        systemUserService.getUsers(1, 100),
        applicationUserService.getUsers(1, 100),
        systemRoleService.getRoles(1, 100),
        systemWorkspaceService.getWorkspaces(1, 100),
      ]);
      
      console.log('✅ Raw API responses:', { 
        systemUsersData,
        applicationUsersData,
        roles,
        workspaces
      });
      
      // Ensure we have arrays
      const systemUsersArray = Array.isArray(systemUsersData) ? systemUsersData : [];
      const applicationUsersArray = Array.isArray(applicationUsersData) ? applicationUsersData : [];
      const rolesArray = Array.isArray(roles) ? roles : [];
      const workspacesArray = Array.isArray(workspaces) ? workspaces : [];
      
      console.log('📊 Processed data:', {
        systemUsers: systemUsersArray.length,
        applicationUsers: applicationUsersArray.length,
        roles: rolesArray.length,
        workspaces: workspacesArray.length
      });
      
      setSystemUsers(systemUsersArray);
      setApplicationUsers(applicationUsersArray);
      setRoles(rolesArray);
      setWorkspaces(workspacesArray);
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to fetch data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset filters when switching tabs
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setWorkspaceFilter('');
  };

  // User CRUD operations
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      roleId: '',
      password: '',
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      roleId: user.roleId || '',
      password: '',
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      // Determine if this is a system user or application user based on role type
      const selectedRole = roles.find(r => r.id === userForm.roleId);
      const isSystemUser = selectedRole?.roleType === 0;
      const service = isSystemUser ? systemUserService : applicationUserService;

      if (editingUser) {
        // Update user
        await service.updateUser(editingUser.id, {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phone: userForm.phone,
          roleId: userForm.roleId,
        });
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        // Create user
        await service.createUser({
          email: userForm.email,
          password: userForm.password,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phone: userForm.phone,
          roleId: userForm.roleId,
        });
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      }
      setUserDialogOpen(false);
      setEditingUser(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save user',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      // Determine if this is a system user or application user
      const selectedRole = roles.find(r => r.id === selectedUser.roleId);
      const isSystemUser = selectedRole?.roleType === 0;
      const service = isSystemUser ? systemUserService : applicationUserService;

      await service.deleteUser(selectedUser.id);
      setSnackbar({
        open: true,
        message: 'User deactivated successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to deactivate user',
        severity: 'error',
      });
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      // Determine if this is a system user or application user
      const selectedRole = roles.find(r => r.id === user.roleId);
      const isSystemUser = selectedRole?.roleType === 0;
      const service = isSystemUser ? systemUserService : applicationUserService;

      if (user.isActive) {
        await service.deactivateUser(user.id);
        setSnackbar({
          open: true,
          message: 'User deactivated successfully',
          severity: 'success',
        });
      } else {
        await service.activateUser(user.id);
        setSnackbar({
          open: true,
          message: 'User activated successfully',
          severity: 'success',
        });
      }
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update user status',
        severity: 'error',
      });
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const handleChangePassword = (user: any) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    if (!selectedUser) return;

    try {
      // Determine if this is a system user or application user
      const selectedRole = roles.find(r => r.id === selectedUser.roleId);
      const isSystemUser = selectedRole?.roleType === 0;
      const service = isSystemUser ? systemUserService : applicationUserService;

      // Call password update API
      await service.updateUser(selectedUser.id, { password: newPassword } as any);
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success',
      });
      setPasswordDialogOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update password',
        severity: 'error',
      });
    }
  };

  // Helper functions
  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#ef4444';
  };

  const getUserName = (user: any) => {
    if (!user) return 'Unknown User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.email) return user.email.split('@')[0];
    return 'Unknown User';
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'No Role';
  };

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.name || workspaceId;
  };

  // Filter users
  const filterUsers = (users: any[]) => {
    if (!Array.isArray(users)) {
      console.warn('filterUsers received non-array:', users);
      return [];
    }
    
    return users.filter(user => {
      if (!user) return false;
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        getUserName(user).toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.includes(searchQuery));

      // Role filter
      const matchesRole = !roleFilter || user.roleId === roleFilter;

      // Status filter
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      // Workspace filter (for application users)
      const matchesWorkspace = !workspaceFilter || 
        (user.workspaceIds && user.workspaceIds.includes(workspaceFilter)) ||
        (user.workspaceId && user.workspaceId === workspaceFilter);

      return matchesSearch && matchesRole && matchesStatus && matchesWorkspace;
    });
  };

  const renderUserTable = (users: any[], showWorkspace: boolean = false) => {
    const filteredUsers = filterUsers(users);

    if (filteredUsers.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Person sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
            No Users Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || roleFilter || statusFilter || workspaceFilter
              ? 'Try adjusting your filters'
              : 'No users in this category yet'}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              {showWorkspace && <TableCell sx={{ fontWeight: 600 }}>Workspaces</TableCell>}
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                sx={{
                  '&:hover': { bgcolor: '#f8fafc' },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha('#0f172a', 0.1),
                        color: '#0f172a',
                        fontWeight: 600,
                      }}
                    >
                      {getUserName(user).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getUserName(user)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getRoleName(user.roleId)}
                    size="small"
                    sx={{
                      bgcolor: alpha('#0f172a', 0.08),
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                {showWorkspace && (
                  <TableCell>
                    {(() => {
                      // Handle both workspaceIds (array) and workspaceId (single)
                      const workspaceIds = user.workspaceIds || (user.workspaceId ? [user.workspaceId] : []);
                      
                      if (workspaceIds.length > 0) {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {workspaceIds.slice(0, 2).map((wsId: string) => (
                              <Chip
                                key={wsId}
                                label={getWorkspaceName(wsId)}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: alpha('#3b82f6', 0.1),
                                  color: '#3b82f6',
                                }}
                              />
                            ))}
                            {workspaceIds.length > 2 && (
                              <Chip
                                label={`+${workspaceIds.length - 2}`}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: alpha('#3b82f6', 0.1),
                                  color: '#3b82f6',
                                }}
                              />
                            )}
                          </Box>
                        );
                      }
                      
                      return (
                        <Typography variant="caption" color="text.secondary">
                          No workspaces
                        </Typography>
                      );
                    })()}
                  </TableCell>
                )}
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(user.isActive), 0.1),
                      color: getStatusColor(user.isActive),
                      fontWeight: 600,
                      border: `1px solid ${alpha(getStatusColor(user.isActive), 0.3)}`,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => handleViewDetails(user)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit User">
                    <IconButton size="small" sx={{ color: '#0f172a' }} onClick={() => handleEditUser(user)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Change Password">
                    <IconButton size="small" sx={{ color: '#8b5cf6' }} onClick={() => handleChangePassword(user)}>
                      <VpnKey fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      size="small"
                      sx={{ color: user.isActive ? '#f59e0b' : '#10b981' }}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      sx={{ color: '#ef4444' }}
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              User Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Manage system and application users
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add User
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {systemUsers.length + applicationUsers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                {systemUsers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                {applicationUsers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Application Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                {[...systemUsers, ...applicationUsers].filter(u => u.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {tabValue === 1 && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Workspace</InputLabel>
                  <Select
                    value={workspaceFilter}
                    onChange={(e) => setWorkspaceFilter(e.target.value)}
                    label="Workspace"
                  >
                    <MenuItem value="">All Workspaces</MenuItem>
                    {workspaces.map(ws => (
                      <MenuItem key={ws.id} value={ws.id}>{ws.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                  setStatusFilter('');
                  setWorkspaceFilter('');
                }}
                sx={{ textTransform: 'none' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={`System Users (${filterUsers(systemUsers).length})`} 
              sx={{ textTransform: 'none', fontWeight: 600 }} 
            />
            <Tab 
              label={`Application Users (${filterUsers(applicationUsers).length})`} 
              sx={{ textTransform: 'none', fontWeight: 600 }} 
            />
          </Tabs>
        </Box>

        {/* System Users Tab */}
        <TabPanel value={tabValue} index={0}>
          {renderUserTable(systemUsers, false)}
        </TabPanel>

        {/* Application Users Tab */}
        <TabPanel value={tabValue} index={1}>
          {renderUserTable(applicationUsers, true)}
        </TabPanel>
      </Container>

      {/* User Create/Edit Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingUser ? 'Edit User' : 'Create New User'}
          </Typography>
          <IconButton onClick={() => setUserDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              disabled={!!editingUser}
              fullWidth
              required
            />
            {!editingUser && (
              <TextField
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                fullWidth
                required
                helperText="Minimum 8 characters"
              />
            )}
            <TextField
              label="First Name"
              value={userForm.firstName}
              onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={userForm.lastName}
              onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={userForm.roleId}
                onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                label="Role"
              >
                <MenuItem disabled sx={{ fontWeight: 600, color: '#0f172a' }}>System Roles</MenuItem>
                {roles.filter(r => r.roleType === 0).map(role => (
                  <MenuItem key={role.id} value={role.id} sx={{ pl: 3 }}>{role.name}</MenuItem>
                ))}
                <MenuItem disabled sx={{ fontWeight: 600, color: '#0f172a', mt: 1 }}>Application Roles</MenuItem>
                {roles.filter(r => r.roleType === 1).map(role => (
                  <MenuItem key={role.id} value={role.id} sx={{ pl: 3 }}>{role.displayName || role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setUserDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={!userForm.email || !userForm.roleId || (!editingUser && !userForm.password)}
            sx={{
              textTransform: 'none',
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: alpha('#0f172a', 0.1),
                color: '#0f172a',
                fontWeight: 600,
              }}
            >
              {selectedUser && getUserName(selectedUser).charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                User Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {selectedUser && (
            <Box>
              {/* Basic Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Basic Information
                </Typography>
                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Person sx={{ fontSize: 20, color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Full Name</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{getUserName(selectedUser)}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Email sx={{ fontSize: 20, color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Email</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.email}</Typography>}
                    />
                  </ListItem>
                  {selectedUser.phone && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Phone sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption" color="text.secondary">Phone</Typography>}
                        secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.phone}</Typography>}
                      />
                    </ListItem>
                  )}
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Badge sx={{ fontSize: 20, color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Role</Typography>}
                      secondary={
                        <Chip
                          label={getRoleName(selectedUser.roleId)}
                          size="small"
                          sx={{
                            bgcolor: alpha('#0f172a', 0.08),
                            fontWeight: 600,
                            mt: 0.5,
                          }}
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Box>

              <Divider />

              {/* Workspaces (for application users) */}
              {(() => {
                const workspaceIds = selectedUser.workspaceIds || (selectedUser.workspaceId ? [selectedUser.workspaceId] : []);
                if (workspaceIds.length > 0) {
                  return (
                    <>
                      <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                          Workspaces ({workspaceIds.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {workspaceIds.map((wsId: string) => (
                            <Chip
                              key={wsId}
                              icon={<Store sx={{ fontSize: 16 }} />}
                              label={getWorkspaceName(wsId)}
                              sx={{
                                bgcolor: alpha('#3b82f6', 0.1),
                                color: '#3b82f6',
                                fontWeight: 600,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Divider />
                    </>
                  );
                }
                return null;
              })()}

              {/* Status & Timestamps */}
              <Box sx={{ p: 3, bgcolor: alpha('#f8fafc', 0.5) }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Account Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedUser.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(selectedUser.isActive), 0.1),
                        color: getStatusColor(selectedUser.isActive),
                        fontWeight: 600,
                        border: `1px solid ${alpha(getStatusColor(selectedUser.isActive), 0.3)}`,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption" color="text.secondary">Created At</Typography>}
                        secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</Typography>}
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption" color="text.secondary">Last Updated</Typography>}
                        secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}</Typography>}
                      />
                    </ListItem>
                  </Grid>
                  {selectedUser.lastLogin && (
                    <Grid item xs={12}>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CalendarToday sx={{ fontSize: 20, color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="caption" color="text.secondary">Last Login</Typography>}
                          secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedUser.lastLogin).toLocaleString()}</Typography>}
                        />
                      </ListItem>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Update Dialog */}
      <PasswordUpdateDialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handlePasswordUpdate}
        userName={selectedUser ? getUserName(selectedUser) : ''}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate User"
        itemName={selectedUser ? getUserName(selectedUser) : ''}
        itemType="user"
        description="The user will be deactivated and will not be able to log in."
        requireTyping={false}
        isSoftDelete={true}
        additionalWarnings={[
          'User data will be preserved',
          'You can reactivate this user later',
          'All user sessions will be terminated'
        ]}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 1.5,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;