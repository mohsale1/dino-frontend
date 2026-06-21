/**
 * User Management Page
 *
 * Canonical layout: white header bar, stat strip, toolbar, content area.
 * Server-side pagination + filtering. Snake_case field mapping from backend.
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
  Fab,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  FilterAltOutlined,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/common/Auth';
import { applicationUserService, ApplicationUser } from '../../services/application/user';
import { apiService } from '../../utils/api';
import UserFormDialog from './Users/UserFormDialog';

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------
const PRIMARY        = '#1976D2';
const PRIMARY_BG     = 'rgba(25,118,210,0.08)';
const PRIMARY_BORDER = 'rgba(25,118,210,0.2)';

// ---------------------------------------------------------------------------
// getRoleChipStyle
// ---------------------------------------------------------------------------
const getRoleChipStyle = (roleName: string) => {
  const n = (roleName || '').toLowerCase();
  if (n.includes('owner') || n.includes('super'))
    return { bg: 'rgba(99,102,241,0.1)', color: '#4338ca', border: 'rgba(99,102,241,0.25)' };
  if (n.includes('manager') || n.includes('admin'))
    return { bg: 'rgba(14,165,233,0.1)', color: '#0369a1', border: 'rgba(14,165,233,0.25)' };
  return { bg: PRIMARY_BG, color: PRIMARY, border: PRIMARY_BORDER };
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const UserManagement: React.FC = () => {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { userData }       = useUserData();
  const currentVenue       = userData?.venue;
  const currentWorkspace   = userData?.workspace;
  const { canCreateUsers } = usePermissions();
  const { user, userPermissions } = useAuth();

  // Role detection (kept for downstream use)
  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name  ||
    (user as any)?.role        ||
    'user'
  ).toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super')
      ? 'Owner'
      : rawRole.includes('manager') || rawRole.includes('admin')
      ? 'Manager'
      : 'User';
  void roleKey;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [users, setUsers]             = useState<ApplicationUser[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(false);
  const [roles, setRoles]             = useState<any[]>([]);

  const [openDialog, setOpenDialog]   = useState(false);
  const [editingUser, setEditingUser] = useState<ApplicationUser | null>(null);

  const [searchTerm, setSearchTerm]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRoleId, setFilterRoleId]     = useState<number | ''>('');
  const [showInactive, setShowInactive]     = useState(false);

  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error',
  });

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Debounce search → 400 ms
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm]);

  // ---------------------------------------------------------------------------
  // Load roles once on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.get('/application/roles', {
          params: { page: 1, page_size: 100 },
        });
        const raw = (response.data as any);
        let arr: any[] = [];
        if (Array.isArray(raw))            arr = raw;
        else if (Array.isArray(raw?.data)) arr = raw.data;
        else if (Array.isArray(raw?.items)) arr = raw.items;
        setRoles(arr);
      } catch {
        // Non-critical — role filter will just be empty
      }
    };
    fetchRoles();
  }, []);

  // ---------------------------------------------------------------------------
  // Load users — server-side pagination + filters
  // ---------------------------------------------------------------------------
  const loadUsers = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      const filters: Record<string, any> = {};
      if (debouncedSearch)          filters.search    = debouncedSearch;
      if (filterRoleId !== '')      filters.role_id   = filterRoleId;
      if (!showInactive)            filters.is_active = true;

      const result = await applicationUserService.getUsers(page + 1, rowsPerPage, filters);
      setUsers(result.data ?? []);
      setTotal(result.pagination?.total ?? 0);
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, filterRoleId, showInactive, currentWorkspace?.id]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOpenDialog  = (u: ApplicationUser | null = null) => { setEditingUser(u); setOpenDialog(true); };
  const handleCloseDialog = () => { setOpenDialog(false); setEditingUser(null); };

  const handleSuccess = () => {
    loadUsers();
    setSnackbar({
      open: true,
      message: editingUser ? 'User updated successfully' : 'User created successfully',
      severity: 'success',
    });
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRoleId('');
    setShowInactive(false);
    setPage(0);
  };

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const hasFilters = !!(searchTerm || filterRoleId !== '' || showInactive);

  const activeCount   = users.filter(u => u.is_active).length;
  const inactiveCount = users.filter(u => !u.is_active).length;

  const getDisplayName = (u: ApplicationUser) =>
    `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;

  const getInitials = (u: ApplicationUser) =>
    `${u.first_name?.charAt(0) || ''}${u.last_name?.charAt(0) || ''}`.toUpperCase() ||
    u.email?.charAt(0)?.toUpperCase() || 'U';

  const formatDate = (dateStr: string | undefined) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—';

  // ---------------------------------------------------------------------------
  // Shared cell styles
  // ---------------------------------------------------------------------------
  const headerCellSx = {
    fontWeight: 600,
    color: '#666666',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    py: 1.5,
    borderBottom: '1px solid #e0e0e0',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fafc' }}>

      {/* ── White Header Bar ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 3,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1C1C1E',
              fontSize: '22px',
              letterSpacing: '-0.3px',
              lineHeight: 1.3,
            }}
          >
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
            Manage your workspace users and their access permissions
          </Typography>
        </Box>

        {canCreateUsers && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(null)}
            disableElevation
            sx={{
              bgcolor: PRIMARY,
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              boxShadow: 'none',
              display: { xs: 'none', md: 'inline-flex' },
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            Add User
          </Button>
        )}
      </Box>

      {/* ── Stat Strip ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          py: 2.5,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {[
          { icon: <PeopleIcon sx={{ fontSize: 18 }} />,      value: total,         label: 'Total Users' },
          { icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, value: activeCount,   label: 'Active'      },
          { icon: <BlockIcon sx={{ fontSize: 18 }} />,       value: inactiveCount, label: 'Inactive'    },
        ].map(({ icon, value, label }) => (
          <Box
            key={label}
            sx={{
              flex: '1 1 140px',
              bgcolor: '#f8fafc',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: PRIMARY_BG,
                color: PRIMARY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.1, color: '#1C1C1E' }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#666666', mt: 0.25 }}>
                {label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Toolbar ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: 'none',
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <Box
            sx={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#f8fafc',
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
              onChange={e => setSearchTerm(e.target.value)}
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

          {/* Role dropdown — dynamic from API */}
          <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
            <Select
              value={filterRoleId}
              onChange={e => { setFilterRoleId(e.target.value as number | ''); setPage(0); }}
              displayEmpty
              sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
            >
              <MenuItem value="">
                <Typography variant="body2" sx={{ color: '#999999' }}>All Roles</Typography>
              </MenuItem>
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  <Typography variant="body2">{role.displayName || role.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status dropdown */}
          <FormControl size="small" sx={{ minWidth: 120, flexShrink: 0 }}>
            <Select
              value={showInactive ? 'all' : 'active'}
              onChange={e => { setShowInactive(e.target.value === 'all'); setPage(0); }}
              displayEmpty
              sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
            >
              <MenuItem value="active">
                <Typography variant="body2">Active Only</Typography>
              </MenuItem>
              <MenuItem value="all">
                <Typography variant="body2">All Status</Typography>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Clear filters */}
          {hasFilters && (
            <Button
              size="small"
              startIcon={<FilterAltOutlined sx={{ fontSize: 14 }} />}
              onClick={handleClearFilters}
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
          <Typography
            variant="caption"
            sx={{
              ml: 'auto',
              color: '#999999',
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {total} user{total !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* ── Content Area ── */}
      <Box sx={{ bgcolor: '#f8fafc', px: { xs: 2, sm: 3, md: 4 }, pt: 3, pb: 6 }}>

        {/* ── Desktop Table (md+) ── */}
        {!isMobile && (
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer component={Box} sx={{ bgcolor: '#ffffff', overflowX: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: PRIMARY }} />
                </Box>
              ) : users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#ffffff' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 30, color: '#999999' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1C1C1E', mb: 0.5 }}>
                    No Users Found
                  </Typography>
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
                    <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e0e0e0' }}>
                      <TableCell sx={{ ...headerCellSx, width: '30%' }}>User</TableCell>
                      <TableCell sx={{ ...headerCellSx, width: '14%' }}>Phone</TableCell>
                      <TableCell sx={{ ...headerCellSx, width: '16%' }}>Role</TableCell>
                      <TableCell sx={{ ...headerCellSx, width: '12%' }}>Status</TableCell>
                      <TableCell sx={{ ...headerCellSx, width: '14%' }}>Joined</TableCell>
                      <TableCell align="right" sx={{ ...headerCellSx, width: '14%' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.map((u) => {
                      const initials    = getInitials(u);
                      const displayName = getDisplayName(u);
                      const joinedDate  = formatDate(u.created_at);
                      const roleName    = u.role?.name || '';
                      const chipStyle   = getRoleChipStyle(roleName);

                      return (
                        <TableRow
                          key={u.id}
                          sx={{
                            height: 56,
                            borderBottom: '1px solid #e0e0e0',
                            '&:last-child': { borderBottom: 'none' },
                            '&:hover': { bgcolor: 'rgba(25,118,210,0.04)' },
                            transition: 'background-color 0.1s',
                          }}
                        >
                          {/* User */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: PRIMARY_BG,
                                  color: PRIMARY,
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#1C1C1E',
                                    lineHeight: 1.3,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {displayName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#999999',
                                    fontSize: '0.73rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                  }}
                                >
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
                              label={u.role?.name || 'Unknown'}
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
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  bgcolor: u.is_active ? '#10b981' : '#999999',
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: u.is_active ? '#1C1C1E' : '#999999',
                                  fontSize: '0.8125rem',
                                  fontWeight: u.is_active ? 500 : 400,
                                }}
                              >
                                {u.is_active ? 'Active' : 'Inactive'}
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
                                  sx={{
                                    color: '#999999',
                                    borderRadius: 1.5,
                                    '&:hover': { color: '#1C1C1E', bgcolor: 'rgba(0,0,0,0.06)' },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={u.is_active ? 'Deactivate user' : 'Activate user'} arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                  sx={{
                                    color: '#999999',
                                    borderRadius: 1.5,
                                    '&:hover': {
                                      color: u.is_active ? '#f59e0b' : '#10b981',
                                      bgcolor: u.is_active ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                                    },
                                  }}
                                >
                                  {u.is_active
                                    ? <BlockIcon sx={{ fontSize: 16 }} />
                                    : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
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
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{
                  borderTop: '1px solid #e0e0e0',
                  bgcolor: '#ffffff',
                  '& .MuiTablePagination-toolbar': { color: '#666666' },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
                }}
              />
            )}
          </Paper>
        )}

        {/* ── Mobile Card List (xs / sm) ── */}
        {isMobile && (
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: PRIMARY }} />
                </Box>
              ) : users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 30, color: '#999999' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1C1C1E', mb: 0.5 }}>
                    No Users Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999999' }}>
                    {hasFilters ? 'Try adjusting your filters' : 'No users in this category yet'}
                  </Typography>
                </Box>
              ) : (
                users.map((u) => {
                  const roleName    = u.role?.name || '';
                  const chipStyle   = getRoleChipStyle(roleName);
                  const initials    = getInitials(u);
                  const displayName = getDisplayName(u);
                  const joinedDate  = formatDate(u.created_at);

                  return (
                    <Box
                      key={u.id}
                      sx={{
                        p: 2,
                        bgcolor: '#ffffff',
                        borderBottom: '1px solid #e0e0e0',
                        '&:last-child': { borderBottom: 'none' },
                        transition: 'background-color 0.1s',
                        '&:hover': { bgcolor: 'rgba(25,118,210,0.04)' },
                      }}
                    >
                      {/* Top row: Avatar + name/email + role chip */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                        <Avatar
                          sx={{
                            bgcolor: PRIMARY_BG,
                            color: PRIMARY,
                            width: 40,
                            height: 40,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: '#1C1C1E',
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {displayName}
                          </Typography>
                          <Typography
                            sx={{
                              color: '#999999',
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {u.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={u.role?.name || 'Unknown'}
                          size="small"
                          sx={{
                            bgcolor: chipStyle.bg,
                            color: chipStyle.color,
                            border: `1px solid ${chipStyle.border}`,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      {/* Middle row: status + phone */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: u.is_active ? '#10b981' : '#999999',
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: u.is_active ? '#1C1C1E' : '#999999',
                            fontSize: '0.8125rem',
                            fontWeight: u.is_active ? 500 : 400,
                          }}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
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
                              sx={{
                                color: '#999999',
                                borderRadius: 1.5,
                                '&:hover': { color: '#1C1C1E', bgcolor: 'rgba(0,0,0,0.06)' },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.is_active ? 'Deactivate user' : 'Activate user'} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                              sx={{
                                color: '#999999',
                                borderRadius: 1.5,
                                '&:hover': {
                                  color: u.is_active ? '#f59e0b' : '#10b981',
                                  bgcolor: u.is_active ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                                },
                              }}
                            >
                              {u.is_active
                                ? <BlockIcon sx={{ fontSize: 16 }} />
                                : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                              }
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
                  count={total}
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
            </>
          </Paper>
        )}
      </Box>

      {/* ── Mobile FAB ── */}
      {canCreateUsers && isMobile && (
        <Fab
          onClick={() => handleOpenDialog(null)}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: PRIMARY,
            color: '#ffffff',
            '&:hover': { bgcolor: '#1565C0' },
            boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
          }}
        >
          <AddIcon />
        </Fab>
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
        roles={roles}
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