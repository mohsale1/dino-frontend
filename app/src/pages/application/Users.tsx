/**
 * User Management Page
 *
 * Manage users for the venue with server-side pagination and blue design system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Paper,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
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
      if (searchTerm) filters.search = searchTerm;
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
  }, [currentWorkspace?.id, currentVenue?.id, searchTerm]);

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

  const textFieldFocusSx = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1976d2',
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
      {/* Header bar */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.0625rem', lineHeight: 1.3 }}
          >
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
            Manage users for {currentVenue?.name || 'your venue'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(null)}
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              px: 2.5,
              fontWeight: 600,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Add User
          </Button>
          <IconButton
            onClick={loadUsers}
            disabled={loading}
            size="small"
            sx={{ color: '#64748b', '&:hover': { bgcolor: 'rgba(25,118,210,0.08)' } }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats row */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Total */}
          <Paper
            elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2, px: 2.5, py: 2, flex: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(25,118,210,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PeopleIcon sx={{ fontSize: 20, color: '#1976d2' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                  Total Users
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Active */}
          <Paper
            elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2, px: 2.5, py: 2, flex: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(16,185,129,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 20, color: '#059669' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {activeUsersCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                  Active Users
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Inactive */}
          <Paper
            elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2, px: 2.5, py: 2, flex: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(239,68,68,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CancelIcon sx={{ fontSize: 20, color: '#dc2626' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {inactiveUsersCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                  Inactive Users
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Filters + Table */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          {/* Filter bar */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 220, ...textFieldFocusSx }}
            />

            <TextField
              select
              size="small"
              label="Filter by Role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ minWidth: 160, ...textFieldFocusSx }}
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
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Show Inactive
                </Typography>
              }
              sx={{ ml: 0.5, mr: 0 }}
            />

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
              disabled={loading}
              size="small"
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 600,
                borderColor: '#e2e8f0',
                color: '#475569',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Table area */}
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress color="primary" />
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
      </Box>

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
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
