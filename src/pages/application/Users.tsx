/**
 * User Management Page - Clean Professional Design
 * 
 * Manage users for the venue with a modern, minimal interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Container,
  Paper,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/application/UserData';
import { applicationUserService } from '../../services/application/user';
import UserFormDialog from './Users/UserFormDialog';
import UserTable from './Users/UserTable';
import { DeleteConfirmationDialog } from '../../components/dialogs';

const UserManagement: React.FC = () => {
  const { userData } = useUserData();
  const currentVenue = userData?.venue;
  const currentWorkspace = userData?.workspace;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: '', userName: '', loading: false });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (currentWorkspace?.id) filters.workspaceId = currentWorkspace.id;
      if (currentVenue?.id) filters.organizationId = currentVenue.id;
      const usersData = await applicationUserService.getUsers(1, 100, filters);
      setUsers(usersData);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to load users',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, currentVenue?.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenDialog = (user: any | null = null) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    loadUsers();
    setSnackbar({
      open: true,
      message: editingUser ? 'User updated successfully' : 'User created successfully',
      severity: 'success',
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setDeleteModal({
      open: true,
      userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'this user',
      loading: false,
    });
  };

  const confirmDeleteUser = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      await applicationUserService.deleteUser(deleteModal.userId);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      loadUsers();
      setDeleteModal({ open: false, userId: '', userName: '', loading: false });
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to delete user', severity: 'error' });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await applicationUserService.deactivateUser(userId);
      } else {
        await applicationUserService.activateUser(userId);
      }
      setSnackbar({ open: true, message: 'User status updated', severity: 'success' });
      loadUsers();
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to update status', severity: 'error' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role?.name === filterRole;
    const matchesActive = showInactive || user.isActive;
    return matchesSearch && matchesRole && matchesActive;
  });

  const activeUsersCount = users.filter(u => u.isActive).length;
  const inactiveUsersCount = users.filter(u => !u.isActive).length;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.125rem' },
                }}
              >
                User Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                }}
              >
                Manage users for {currentVenue?.name || 'your venue'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(null)}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                fontWeight: 600,
                backgroundColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: '#374151',
                },
              }}
            >
              Add User
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper
              elevation={0}
              sx={{
                px: 3,
                py: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                flex: 1,
                minWidth: 200,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 24, color: '#374151' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    {users.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                px: 3,
                py: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                flex: 1,
                minWidth: 200,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={activeUsersCount}
                  sx={{
                    height: 48,
                    width: 48,
                    borderRadius: 1.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  }}
                />
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                px: 3,
                py: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                flex: 1,
                minWidth: 200,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={inactiveUsersCount}
                  sx={{
                    height: 48,
                    width: 48,
                    borderRadius: 1.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                  }}
                />
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Inactive Users
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Filters */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flexGrow: 1,
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a1a1a',
                  },
                }}
              />
              <TextField
                select
                label="Filter by Role"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                sx={{
                  minWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a1a1a',
                  },
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="operator">Operator</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#1a1a1a',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#1a1a1a',
                      },
                    }}
                  />
                }
                label="Show Inactive"
                sx={{ ml: 1 }}
              />

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadUsers}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  fontWeight: 600,
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb',
                  },
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* User Table */}
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#1a1a1a' }} />
              </Box>
            ) : (
              <UserTable
                users={filteredUsers}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
              />
            )}
          </Box>
        </Paper>
      </Container>

      <UserFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        editingUser={editingUser}
        workspaceId={currentWorkspace?.id || ''}
        venueId={currentVenue?.id || ''}
        venues={currentVenue ? [currentVenue] : []}
      />

      <DeleteConfirmationDialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        itemName={deleteModal.userName}
        itemType="user"
        description="This will permanently remove the user from the system."
        loading={deleteModal.loading}
        requireTyping={false}
      />

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