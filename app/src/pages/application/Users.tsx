/**
 * User Management Page
 *
 * Hero + glassmorphism stats + full-width table (md+) + mobile card list (xs/sm),
 * role-colored per ROLE_COLORS. Table layout aligned with system UserManagement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  MenuItem,
  Typography,
  Paper,
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
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  CalendarToday as CalendarTodayIcon,
  FilterAltOutlined,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/common/Auth';
import { applicationUserService } from '../../services/application/user';
import UserFormDialog from './Users/UserFormDialog';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { ROLE_COLORS } from '../../constants/app';

// ─── Design tokens (mirrors system C object) ─────────────────────────────────
const C = {
  dark0:   '#0f172a',
  dark1:   '#1e293b',
  slate:   '#64748b',
  muted:   '#94a3b8',
  border:  '#e2e8f0',
  surface: '#ffffff',
  bg:      '#f1f5f9',
  emerald: '#10b981',
  rose:    '#f43f5e',
  amber:   '#f59e0b',
};

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat component
// Fix 1: width: '100%', centered content, no flex shrink/grow
// ---------------------------------------------------------------------------
const HeroStat: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
  roleKey: 'Owner' | 'Manager' | 'User';
}> = ({ label, value, icon, roleKey }) => {
  const animated = useCountUp(value);
  const rc = ROLE_COLORS[roleKey];
  return (
    <Box
      sx={{
        width: '100%',
        px: 2.5,
        py: 2,
        borderRadius: 2.5,
        bgcolor: alpha('#ffffff', 0.07),
        border: `1px solid ${alpha('#ffffff', 0.12)}`,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: alpha('#ffffff', 0.11) },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          flexShrink: 0,
          bgcolor: alpha('#ffffff', 0.1),
          border: `1px solid ${alpha('#ffffff', 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: alpha(rc.chipText, 0.9),
          '& svg': { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            color: rc.statValue,
            fontSize: { xs: '1.35rem', md: '1.6rem' },
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {animated}
        </Typography>
        <Typography variant="caption" sx={{ color: rc.statLabel, fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// getRoleChipStyle — for mobile cards only
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

  // Role detection
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
  const rc = ROLE_COLORS[roleKey];

  // State
  const [users, setUsers]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar]     = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error',
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false, userId: '', userName: '', loading: false,
  });

  // API
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (currentWorkspace?.id) filters.workspaceId = currentWorkspace.id;
      if (currentVenue?.id)     filters.organizationId = currentVenue.id;
      if (searchTerm)           filters.search = searchTerm;
      const usersData = await applicationUserService.getUsers(1, 100, filters);
      setUsers(usersData);
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, currentVenue?.id, searchTerm]);

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

  // Derived
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole   = !filterRole || u.role?.name === filterRole;
    const matchesActive = showInactive || u.isActive;
    return matchesSearch && matchesRole && matchesActive;
  });

  const activeCount   = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  const adminCount    = users.filter(u => {
    const n = (u.role?.name || '').toLowerCase();
    return n.includes('admin') || n.includes('owner') || n.includes('manager');
  }).length;

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const hasFilters = !!(searchTerm || filterRole || showInactive);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: C.bg }}>

      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          background: rc.gradient,
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 2.5, md: 4 },
          pb: { xs: 2.5, md: 4 },
          '&::before': {
            content: '""', position: 'absolute', top: -100, right: -60,
            width: 360, height: 360, borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""', position: 'absolute', bottom: -80, left: '25%',
            width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${alpha('#fff', 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#fff', 0.03)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        {/* Fix 2: Title row — column on xs, row on sm+ */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'flex-start' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: `${rc.chipText}bf`, fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
              APPLICATION CONTROL CENTER
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              User Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 13, color: `${rc.chipText}99` }} />
              <Typography variant="caption" sx={{ color: `${rc.chipText}99`, fontWeight: 500, fontSize: '0.75rem' }}>
                {today}
              </Typography>
            </Box>
          </Box>

          {canCreateUsers && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(null)}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                width: { xs: '100%', sm: 'auto' },
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha('#fff', 0.25)}`,
                px: 2.5, py: 1,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: alpha('#fff', 0.25), border: `1px solid ${alpha('#fff', 0.4)}`, boxShadow: 'none' },
              }}
            >
              Add User
            </Button>
          )}
        </Box>

        {/* Fix 1: Stats row — CSS Grid, 2 cols on xs/sm, 4 cols on md+ */}
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <HeroStat label="Total Users"    value={users.length}  icon={<PeopleIcon />}       roleKey={roleKey} />
          <HeroStat label="Active Users"   value={activeCount}   icon={<CheckCircleIcon />}  roleKey={roleKey} />
          <HeroStat label="Inactive Users" value={inactiveCount} icon={<BlockIcon />}        roleKey={roleKey} />
          <HeroStat label="Admins"         value={adminCount}    icon={<AdminIcon />}        roleKey={roleKey} />
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ pb: 6 }}>

        {/* Fix 3: Toolbar — two-row layout on xs */}
        <Box sx={{ pt: 0, pb: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              border: 'none',
              borderTop: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
              bgcolor: C.surface,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                pt: 2,
                pb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                borderBottom: `1px solid ${C.border}`,
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
                  border: `1px solid ${C.border}`,
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <SearchIcon sx={{ fontSize: 17, color: C.muted, flexShrink: 0 }} />
                <InputBase
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
                  sx={{ flex: 1, fontSize: '0.875rem', color: C.dark0, '& input::placeholder': { color: C.muted } }}
                />
                {searchTerm && (
                  <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }} sx={{ p: 0.25, color: C.muted }}>
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
                    sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
                  >
                    <MenuItem value=""><Typography variant="body2" sx={{ color: C.muted }}>All Roles</Typography></MenuItem>
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
                    sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
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
                      textTransform: 'none', color: C.slate, fontWeight: 600,
                      fontSize: '0.8125rem', borderRadius: 2, px: 1.5,
                      '&:hover': { bgcolor: alpha(C.slate, 0.06) },
                    }}
                  >
                    Clear
                  </Button>
                )}

                {/* Result count */}
                <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontWeight: 500 }}>
                    {filteredUsers.length} of {users.length} users
                  </Typography>
                </Box>
            </Box>
          </Paper>
        </Box>

        {/* ── Desktop Table (md+) ── */}
        {!isMobile && (
          <Box sx={{ borderBottom: `1px solid ${C.border}` }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 0, border: 'none', bgcolor: C.surface, overflowX: 'auto' }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: rc.primary }} />
                </Box>
              ) : paginatedUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: C.surface }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '50%',
                    bgcolor: '#f1f5f9', border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                  }}>
                    <PeopleIcon sx={{ fontSize: 30, color: C.muted }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: C.dark1, mb: 0.5 }}>No Users Found</Typography>
                  <Typography variant="body2" sx={{ color: C.muted }}>
                    {hasFilters ? 'Try adjusting your filters' : 'No users in this category yet'}
                  </Typography>
                </Box>
              ) : (
                <Table sx={{
                  tableLayout: 'fixed', width: '100%', minWidth: 700,
                  '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } },
                }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                      <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, width: '30%' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '14%' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '12%' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '14%' }}>Joined</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '14%' }}>Actions</TableCell>
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

                      return (
                        <TableRow
                          key={u.id}
                          sx={{
                            bgcolor: C.surface,
                            borderBottom: `1px solid ${C.border}`,
                            '&:last-child': { borderBottom: 'none' },
                            '&:hover': { bgcolor: '#fafafa' },
                            transition: 'background-color 0.1s',
                          }}
                        >
                          {/* User */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 36, height: 36,
                                  bgcolor: alpha(C.dark0, 0.08),
                                  color: C.dark1,
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: C.dark0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {u.firstName} {u.lastName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.73rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                  {u.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Phone */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: C.slate, fontSize: '0.8125rem' }}>
                              {u.phone || '—'}
                            </Typography>
                          </TableCell>

                          {/* Role */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: C.slate, fontSize: '0.8125rem' }}>
                              {typeof u.role === 'string'
                                ? u.role
                                : u.role?.displayName || u.role?.name || '—'}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Box sx={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                bgcolor: u.isActive ? C.emerald : C.muted,
                              }} />
                              <Typography variant="body2" sx={{ color: u.isActive ? C.dark1 : C.muted, fontSize: '0.8125rem', fontWeight: u.isActive ? 500 : 400 }}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Joined */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: C.slate, fontSize: '0.8125rem' }}>
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
                                  sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: C.dark0, bgcolor: alpha(C.dark0, 0.06) } }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={u.isActive ? 'Deactivate user' : 'Activate user'} arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                  sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: u.isActive ? C.amber : C.emerald, bgcolor: alpha(u.isActive ? C.amber : C.emerald, 0.08) } }}
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
                  borderTop: `1px solid ${C.border}`,
                  bgcolor: C.surface,
                  '& .MuiTablePagination-toolbar': { color: C.slate },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
                }}
              />
            )}
          </Box>
        )}

        {/* Fix 4: Mobile Card List (xs / sm) — px: { xs: 1.5, sm: 2 } */}
        {isMobile && (
          <Box sx={{ borderBottom: `1px solid ${C.border}` }}>
            <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 2, pb: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: rc.primary }} />
                </Box>
              ) : paginatedUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '50%',
                    bgcolor: '#f1f5f9', border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                  }}>
                    <PeopleIcon sx={{ fontSize: 30, color: C.muted }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: C.dark1, mb: 0.5 }}>No Users Found</Typography>
                  <Typography variant="body2" sx={{ color: C.muted }}>
                    {hasFilters ? 'Try adjusting your filters' : 'No users in this category yet'}
                  </Typography>
                </Box>
              ) : (
                paginatedUsers.map((u) => {
                  const roleName = typeof u.role === 'string' ? u.role : (u.role?.name || '');
                  const chipStyle = getRoleChipStyle(roleName);
                  const initials =
                    `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`.toUpperCase() ||
                    u.email?.charAt(0)?.toUpperCase() || 'U';
                  const joinedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';

                  return (
                    <Paper
                      key={u.id}
                      elevation={0}
                      sx={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 2,
                        p: 2,
                        mb: 1.5,
                        bgcolor: C.surface,
                        transition: 'background-color 0.1s',
                        '&:hover': { bgcolor: '#fafafa' },
                      }}
                    >
                      {/* Top row: Avatar + name/email + role chip */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(C.dark0, 0.08),
                            color: C.dark1,
                            width: 40, height: 40,
                            fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, color: C.dark0, fontSize: '0.875rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.firstName} {u.lastName}
                          </Typography>
                          <Typography sx={{ color: C.muted, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

                      {/* Middle row: status dot + text + phone */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: u.isActive ? C.emerald : C.muted, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: u.isActive ? C.dark1 : C.muted, fontSize: '0.8125rem', fontWeight: u.isActive ? 500 : 400 }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                        <Typography sx={{ color: C.slate, fontSize: '0.8rem', ml: 'auto' }}>
                          {u.phone || '—'}
                        </Typography>
                      </Box>

                      {/* Bottom row: joined date + actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ color: C.muted, fontSize: '0.75rem', flex: 1 }}>
                          Joined {joinedDate}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <Tooltip title="Edit user" arrow>
                            <IconButton size="small" onClick={() => handleOpenDialog(u)}
                              sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: C.dark0, bgcolor: alpha(C.dark0, 0.06) } }}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.isActive ? 'Deactivate user' : 'Activate user'} arrow>
                            <IconButton size="small" onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                              sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: u.isActive ? C.amber : C.emerald, bgcolor: alpha(u.isActive ? C.amber : C.emerald, 0.08) } }}>
                              {u.isActive ? <BlockIcon sx={{ fontSize: 16 }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </Tooltip>

                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          </Box>
        )}

        {/* Mobile Pagination */}
        {isMobile && !loading && (
          <Paper elevation={0} sx={{ borderTop: `1px solid ${C.border}`, bgcolor: C.surface }}>
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
                '& .MuiTablePagination-toolbar': { color: C.slate, minHeight: 48, px: 1 },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.8rem', m: 0 },
                '& .MuiTablePagination-selectLabel': { display: 'none' },
                '& .MuiInputBase-root': { display: 'none' },
              }}
            />
          </Paper>
        )}
      </Box>

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
