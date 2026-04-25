/**
 * User Management Page
 *
 * Vanguard UI pattern: inline page header, no stat cards, simple filter row,
 * bordered+rounded table container. All business logic unchanged.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  MenuItem,
  Typography,
  Alert,
  Snackbar,
  Button,
  IconButton,
  InputBase,
  CircularProgress,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Select,
  FormControl,
  Paper,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  FilterAltOutlined,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/common/Auth';
import { applicationUserService } from '../../services/application/user';
import UserFormDialog from './Users/UserFormDialog';

// ---------------------------------------------------------------------------
// getRoleChipStyle
// ---------------------------------------------------------------------------
const getRoleChipStyle = (roleName: string) => {
  const n = (roleName || '').toLowerCase();
  if (n.includes('owner') || n.includes('super'))
    return { bg: 'rgba(99,102,241,0.1)', color: '#4338ca', border: 'rgba(99,102,241,0.25)' };
  if (n.includes('manager') || n.includes('admin'))
    return { bg: 'rgba(14,165,233,0.1)', color: '#0369a1', border: 'rgba(14,165,233,0.25)' };
  return { bg: 'rgba(16,185,129,0.1)', color: '#065f46', border: 'rgba(16,185,129,0.25)' };
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const UserManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { userData } = useUserData();
  const currentVenue = userData?.venue;
  const currentWorkspace = userData?.workspace;
  const { canCreateUsers } = usePermissions();
  const { user, userPermissions } = useAuth();

  // Role detection (kept for any downstream use)
  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name ||
    (user as any)?.role ||
    'user'
  ).toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super')
      ? 'Owner'
      : rawRole.includes('manager') || rawRole.includes('admin')
      ? 'Manager'
      : 'User';
  void roleKey; // suppress unused warning — kept for future use

  // State
  const [users, setUsers]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(false);
  const [openDialog, setOpenDialog]   = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterRole, setFilterRole]   = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar]       = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce searchTerm → debouncedSearch (300 ms)
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm]);

  // API — guard on workspaceId
  const loadUsers = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      const filters: any = { workspaceId: currentWorkspace.id };
      if (currentVenue?.id)   filters.organizationId = currentVenue.id;
      if (debouncedSearch)    filters.search = debouncedSearch;
      const usersData = await applicationUserService.getUsers(1, 100, filters);
      setUsers(usersData);
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, currentVenue?.id, debouncedSearch]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Handlers
  const handleOpenDialog  = (u: any | null = null) => { setEditingUser(u); setOpenDialog(true); };
  const handleCloseDialog = () => { setOpenDialog(false); setEditingUser(null); };

  const handleSuccess = () => {
    loadUsers();
    setSnackbar({
      open: true,
      message: editingUser ? 'User updated successfully' : 'User created successfully',
      severity: 'success',
    });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await applicationUserService.deactivateUser(Number(userId));
      } else {
        await applicationUserService.activateUser(Number(userId));
      }
      setSnackbar({ open: true, message: 'User status updated', severity: 'success' });
      loadUsers();
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to update status', severity: 'error' });
    }
  };

  // Derived — API handles search; client applies role + status filters
  const filteredUsers = users.filter(u => {
    const matchesRole   = !filterRole || u.role?.name?.toLowerCase() === filterRole.toLowerCase();
    const matchesActive = showInactive || u.isActive;
    return matchesRole && matchesActive;
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const hasFilters = !!(searchTerm || filterRole || showInactive);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ maxWidth: '1440px', margin: '0 auto', px: { xs: 2, sm: 3 }, pt: 3, pb: 6 }}>

      {/* ── Inline Page Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1C1C1E', lineHeight: 1.2 }}>
            User Management
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#666666', mt: 0.5 }}>
            Manage workspace users, roles and access
          </Typography>
        </Box>
        {canCreateUsers && (
          <Box sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(null)}
              sx={{
                bgcolor: '#1976D2',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
              }}
            >
              Add User
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Filter / Search Row ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        {/* Search */}
        <Box
          sx={{
            flex: '1 1 220px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#f7f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
          }}
        >
          <SearchIcon sx={{ fontSize: 17, color: '#999999', flexShrink: 0 }} />
          <InputBase
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ flex: 1, fontSize: '0.875rem', color: '#1C1C1E' }}
          />
          {searchTerm && (
            <IconButton
              size="small"
              onClick={() => { setSearchTerm(''); setPage(0); }}
              sx={{ p: 0.25, color: '#999999' }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        {/* Role dropdown */}
        <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
          <Select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(0); }}
            displayEmpty
            sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f7f9fa' }}
          >
            <MenuItem value=""><Typography variant="body2" sx={{ color: '#999999' }}>All Roles</Typography></MenuItem>
            <MenuItem value="admin"><Typography variant="body2">Admin</Typography></MenuItem>
            <MenuItem value="operator"><Typography variant="body2">Operator</Typography></MenuItem>
          </Select>
        </FormControl>

        {/* Status dropdown */}
        <FormControl size="small" sx={{ minWidth: 120, flexShrink: 0 }}>
          <Select
            value={showInactive ? 'all' : 'active'}
            onChange={e => { setShowInactive(e.target.value === 'all'); setPage(0); }}
            displayEmpty
            sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f7f9fa' }}
          >
            <MenuItem value="active"><Typography variant="body2">Active Only</Typography></MenuItem>
            <MenuItem value="all"><Typography variant="body2">All Status</Typography></MenuItem>
          </Select>
        </FormControl>

        {/* Clear filters */}
        {hasFilters && (
          <Button
            size="small"
            startIcon={<FilterAltOutlined sx={{ fontSize: 14 }} />}
            onClick={() => { setSearchTerm(''); setFilterRole(''); setShowInactive(false); setPage(0); }}
            sx={{
              textTransform: 'none',
              color: '#666666',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: 2,
              px: 1.5,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            Clear
          </Button>
        )}

        {/* Result count */}
        <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="caption" sx={{ color: '#999999', fontWeight: 500 }}>
            {filteredUsers.length} of {users.length} users
          </Typography>
        </Box>
      </Box>

      {/* ── Desktop Table (md+) ── */}
      {!isMobile && (
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#ffffff' }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 0, border: 'none', bgcolor: '#ffffff', overflowX: 'auto' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#1976D2' }} />
              </Box>
            ) : paginatedUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#ffffff' }}>
                <Box
                  sx={{
                    width: 64, height: 64, borderRadius: '12px',
                    bgcolor: '#f7f9fa', border: '1px solid #e0e0e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 30, color: '#999999' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1C1C1E', mb: 0.5 }}>No Users Found</Typography>
                <Typography variant="body2" sx={{ color: '#999999' }}>
                  {hasFilters ? 'Try adjusting your filters' : 'No users in this category yet'}
                </Typography>
              </Box>
            ) : (
              <Table
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                  minWidth: 700,
                  '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F7F9FA', borderBottom: '2px solid #e0e0e0' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #e0e0e0', width: '30%' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #e0e0e0', width: '14%' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #e0e0e0', width: '16%' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #e0e0e0', width: '12%' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #e0e0e0', width: '14%' }}>Joined</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #e0e0e0', width: '14%' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedUsers.map((u) => {
                    const initials =
                      `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`.toUpperCase() ||
                      u.email?.charAt(0)?.toUpperCase() || 'U';
                    const joinedDate = u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—';
                    const chipStyle = getRoleChipStyle(typeof u.role === 'string' ? u.role : (u.role?.name || ''));

                    return (
                      <TableRow
                        key={u.id}
                        sx={{
                          height: 56,
                          borderBottom: '1px solid #f1f5f9',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: 'rgba(0,166,202,0.04)' },
                          transition: 'background-color 0.1s',
                        }}
                      >
                        {/* User */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36, height: 36,
                                bgcolor: 'rgba(25,118,210,0.08)',
                                color: '#1976D2',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.firstName} {u.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.73rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                {u.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Phone */}
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.8125rem' }}>
                            {u.phone || '—'}
                          </Typography>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Chip
                            label={typeof u.role === 'string' ? u.role : (u.role?.displayName || u.role?.name || 'Unknown')}
                            size="small"
                            sx={{
                              bgcolor: chipStyle.bg,
                              color: chipStyle.color,
                              border: `1px solid ${chipStyle.border}`,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box
                              sx={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                bgcolor: u.isActive ? '#10b981' : '#999999',
                              }}
                            />
                            <Typography variant="body2" sx={{ color: u.isActive ? '#1C1C1E' : '#999999', fontSize: '0.8125rem', fontWeight: u.isActive ? 500 : 400 }}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Joined */}
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.8125rem' }}>
                            {joinedDate}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                            <Tooltip title="Edit user" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(u)}
                                sx={{ color: '#999999', borderRadius: 1.5, '&:hover': { color: '#1C1C1E', bgcolor: 'rgba(0,0,0,0.06)' } }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={u.isActive ? 'Deactivate user' : 'Activate user'} arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                sx={{
                                  color: '#999999',
                                  borderRadius: 1.5,
                                  '&:hover': {
                                    color: u.isActive ? '#f59e0b' : '#10b981',
                                    bgcolor: u.isActive ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                                  },
                                }}
                              >
                                {u.isActive
                                  ? <BlockIcon sx={{ fontSize: 16 }} />
                                  : <CheckCircleIcon sx={{ fontSize: 16 }} />
                                }
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {!loading && (
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: '1px solid #e0e0e0',
                bgcolor: '#ffffff',
                '& .MuiTablePagination-toolbar': { color: '#666666' },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
              }}
            />
          )}
        </Box>
      )}

      {/* ── Mobile Card List (xs / sm) ── */}
      {isMobile && (
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#ffffff' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#1976D2' }} />
            </Box>
          ) : paginatedUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: '12px',
                  bgcolor: '#f7f9fa', border: '1px solid #e0e0e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2,
                }}
              >
                <PeopleIcon sx={{ fontSize: 30, color: '#999999' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1C1C1E', mb: 0.5 }}>No Users Found</Typography>
              <Typography variant="body2" sx={{ color: '#999999' }}>
                {hasFilters ? 'Try adjusting your filters' : 'No users in this category yet'}
              </Typography>
            </Box>
          ) : (
            paginatedUsers.map((u) => {
              const roleName  = typeof u.role === 'string' ? u.role : (u.role?.name || '');
              const chipStyle = getRoleChipStyle(roleName);
              const initials  =
                `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`.toUpperCase() ||
                u.email?.charAt(0)?.toUpperCase() || 'U';
              const joinedDate = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';

              return (
                <Box
                  key={u.id}
                  sx={{
                    p: 2,
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #f1f5f9',
                    '&:last-child': { borderBottom: 'none' },
                    transition: 'background-color 0.1s',
                    '&:hover': { bgcolor: 'rgba(0,166,202,0.04)' },
                  }}
                >
                  {/* Top row: Avatar + name/email + role chip */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(25,118,210,0.08)',
                        color: '#1976D2',
                        width: 40, height: 40,
                        fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1C1C1E', fontSize: '0.875rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.firstName} {u.lastName}
                      </Typography>
                      <Typography sx={{ color: '#999999', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={typeof u.role === 'string' ? u.role : (u.role?.displayName || u.role?.name || 'Unknown')}
                      size="small"
                      sx={{
                        bgcolor: chipStyle.bg, color: chipStyle.color,
                        border: `1px solid ${chipStyle.border}`,
                        fontWeight: 600, fontSize: '0.7rem', height: 22, flexShrink: 0,
                      }}
                    />
                  </Box>

                  {/* Middle row: status + phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: u.isActive ? '#10b981' : '#999999', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: u.isActive ? '#1C1C1E' : '#999999', fontSize: '0.8125rem', fontWeight: u.isActive ? 500 : 400 }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography sx={{ color: '#666666', fontSize: '0.8rem', ml: 'auto' }}>
                      {u.phone || '—'}
                    </Typography>
                  </Box>

                  {/* Bottom row: joined date + actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#999999', fontSize: '0.75rem', flex: 1 }}>
                      Joined {joinedDate}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Tooltip title="Edit user" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(u)}
                          sx={{ color: '#999999', borderRadius: 1.5, '&:hover': { color: '#1C1C1E', bgcolor: 'rgba(0,0,0,0.06)' } }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={u.isActive ? 'Deactivate user' : 'Activate user'} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          sx={{
                            color: '#999999',
                            borderRadius: 1.5,
                            '&:hover': {
                              color: u.isActive ? '#f59e0b' : '#10b981',
                              bgcolor: u.isActive ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                            },
                          }}
                        >
                          {u.isActive ? <BlockIcon sx={{ fontSize: 16 }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}

          {/* Mobile pagination */}
          {!loading && (
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[]}
              labelRowsPerPage=""
              sx={{
                borderTop: '1px solid #e0e0e0',
                bgcolor: '#ffffff',
                '& .MuiTablePagination-toolbar': { color: '#666666', minHeight: 48, px: 1 },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.8rem', m: 0 },
                '& .MuiTablePagination-selectLabel': { display: 'none' },
                '& .MuiInputBase-root': { display: 'none' },
              }}
            />
          )}
        </Box>
      )}

      {/* ── Dialogs ── */}
      <UserFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        editingUser={editingUser}
        workspaceId={currentWorkspace?.id || ''}
        venueId={currentVenue?.id || ''}
        venues={currentVenue ? [currentVenue] : []}
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