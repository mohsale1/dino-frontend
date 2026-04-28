import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
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
  Alert,
  Snackbar,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Tooltip,
  Stack,
  InputBase,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Delete,
  Block,
  CheckCircle,
  Search,
  Close,
  Person,
  Email,
  Phone,
  Badge,
  VpnKey,
  Visibility,
  Store,
  GroupOutlined,
  AdminPanelSettingsOutlined,
  PeopleOutline,
  CheckCircleOutline,
  FilterAltOutlined,
  PersonAddAltOutlined,
  LockResetOutlined,
} from '@mui/icons-material';
import { systemUserService } from '../../services/system/user';
import { systemRoleService } from '../../services/system/role';
import { systemWorkspaceService } from '../../services/system/workspace';
import { DeleteConfirmationDialog, PasswordUpdateDialog } from '../../components/dialogs';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   '#00A6CA',
  primaryHv: '#005F8D',
  textPri:   '#1C1C1E',
  textSec:   '#666666',
  textMuted: '#999999',
  border:    '#e0e0e0',
  borderLt:  '#f2f2f2',
  surface:   '#ffffff',
  bg:        '#f8fafc',
  toolbarBg: '#f7f9fa',
  success:   '#008A00',
  error:     '#EB0000',
  warning:   '#FF871F',
  // legacy chart colours kept for workspace chips / misc
  emerald:   '#10b981',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  slate:     '#64748b',
  muted:     '#94a3b8',
  dark0:     '#0f172a',
  dark1:     '#1e293b',
};

// ─── Stat card (static, no animation) ─────────────────────────────────────────
interface StatCardProps { label: string; value: number; icon: React.ReactElement; }

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <Box sx={{
    bgcolor: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    p: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    height: '100%',
  }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: '8px', flexShrink: 0,
      bgcolor: 'rgba(0,166,202,0.08)',
      border: '1px solid rgba(0,166,202,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.primary,
      '& svg': { fontSize: 20 },
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 24, color: T.textPri, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: T.textSec, mt: 0.25, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ─── Tab panel ─────────────────────────────────────────────────────────────────
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box>{children}</Box>}
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────────────
const UserManagement: React.FC = () => {
  const [tabValue, setTabValue]                 = useState(0);
  const [systemUsers, setSystemUsers]           = useState<any[]>([]);
  const [applicationUsers, setApplicationUsers] = useState<any[]>([]);
  const [roles, setRoles]                       = useState<any[]>([]);
  const [workspaces, setWorkspaces]             = useState<any[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  const [snackbar, setSnackbar]                 = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [deleteDialogOpen, setDeleteDialogOpen]     = useState(false);
  const [userDialogOpen, setUserDialogOpen]         = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen]   = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser]             = useState<any | null>(null);
  const [editingUser, setEditingUser]               = useState<any | null>(null);

  const [searchQuery, setSearchQuery]         = useState('');
  const [roleFilter, setRoleFilter]           = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('');

  const [userForm, setUserForm] = useState({ email: '', firstName: '', lastName: '', phone: '', roleId: '', password: '' });

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, wsData] = await Promise.all([
        systemRoleService.getRoles(1, 100),
        systemWorkspaceService.getWorkspaces(1, 100),
      ]);
      const resolvedRoles = Array.isArray(rolesData) ? rolesData : [];
      setRoles(resolvedRoles);
      setWorkspaces(Array.isArray(wsData) ? wsData : []);

      const allUsers = await systemUserService.getUsers(1, 100);
      const usersArray = Array.isArray(allUsers) ? allUsers : [];
      const sysUsers = usersArray.filter(u => resolvedRoles.find(r => r.id === u.roleId)?.roleType === 0);
      const appUsers = usersArray.filter(u => resolvedRoles.find(r => r.id === u.roleId)?.roleType === 1);
      setSystemUsers(sysUsers);
      setApplicationUsers(appUsers);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTabValue(v);
    setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); setWorkspaceFilter('');
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({ email: '', firstName: '', lastName: '', phone: '', roleId: '', password: '' });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ email: user.email, firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', roleId: user.roleId || '', password: '' });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await systemUserService.updateUser(editingUser.id, { firstName: userForm.firstName, lastName: userForm.lastName, phone: userForm.phone, roleId: userForm.roleId });
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await systemUserService.createUser({ email: userForm.email, password: userForm.password, firstName: userForm.firstName, lastName: userForm.lastName, phone: userForm.phone, roleId: userForm.roleId });
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      setUserDialogOpen(false);
      setEditingUser(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save user', severity: 'error' });
    }
  };

  const handleDeleteClick    = (user: any) => { setSelectedUser(user); setDeleteDialogOpen(true); };
  const handleViewDetails    = (user: any) => { setSelectedUser(user); setDetailsDialogOpen(true); };
  const handleChangePassword = (user: any) => { setSelectedUser(user); setPasswordDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await systemUserService.deleteUser(selectedUser.id);
      setSnackbar({ open: true, message: 'User deactivated successfully', severity: 'success' });
      setDeleteDialogOpen(false); setSelectedUser(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to deactivate user', severity: 'error' });
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      if (user.isActive) {
        await systemUserService.deactivateUser(user.id);
        setSnackbar({ open: true, message: 'User deactivated', severity: 'success' });
      } else {
        await systemUserService.activateUser(user.id);
        setSnackbar({ open: true, message: 'User activated', severity: 'success' });
      }
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
    }
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    if (!selectedUser) return;
    try {
      await systemUserService.updateUser(selectedUser.id, { password: newPassword } as any);
      setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' });
      setPasswordDialogOpen(false); setSelectedUser(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update password', severity: 'error' });
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getUserName = (user: any) => {
    if (!user) return 'Unknown';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.email) return user.email.split('@')[0];
    return 'Unknown';
  };
  const getRoleName      = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'No Role';
  const getWorkspaceName = (wsId: string)   => workspaces.find(w => w.id === wsId)?.name || wsId;

  const filterUsers = (users: any[]) => {
    if (!Array.isArray(users)) return [];
    return users.filter(user => {
      if (!user) return false;
      const sl = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || getUserName(user).toLowerCase().includes(sl) || (user.email?.toLowerCase().includes(sl)) || (user.phone?.includes(searchQuery));
      const matchesRole   = !roleFilter   || user.roleId === roleFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive);
      const matchesWs     = !workspaceFilter || (user.workspaceIds?.includes(workspaceFilter)) || (user.workspaceId === workspaceFilter);
      return matchesSearch && matchesRole && matchesStatus && matchesWs;
    });
  };

  const activeCount = [...systemUsers, ...applicationUsers].filter(u => u.isActive).length;

  // ── Table renderer ────────────────────────────────────────────────────────────
  const renderUserTable = (users: any[], showWorkspace = false) => {
    const filtered = filterUsers(users);

    if (filtered.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: T.surface }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: T.toolbarBg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Person sx={{ fontSize: 30, color: T.textMuted }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: T.textPri, mb: 0.5 }}>No Users Found</Typography>
          <Typography variant="body2" sx={{ color: T.textMuted }}>
            {searchQuery || roleFilter || statusFilter || workspaceFilter ? 'Try adjusting your filters' : 'No users in this category yet'}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: 'none', bgcolor: T.surface, overflowX: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%', minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: T.toolbarBg, borderBottom: `2px solid ${T.border}` }}>
              <TableCell sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, width: '28%' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%', display: { xs: 'none', sm: 'table-cell' } }}>Role</TableCell>
              {showWorkspace && <TableCell sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>Workspaces</TableCell>}
              <TableCell sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '12%' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '14%', display: { xs: 'none', sm: 'table-cell' } }}>Joined</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '18%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => {
              const name = getUserName(user);
              const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <TableRow
                  key={user.id}
                  sx={{
                    bgcolor: T.surface,
                    borderBottom: `1px solid ${T.border}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: T.toolbarBg },
                    transition: 'background-color 0.1s',
                  }}
                >
                  {/* User */}
                  <TableCell sx={{ py: 1.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(T.textPri, 0.08), color: T.textPri, fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                        {initials}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: T.textPri, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</Typography>
                        <Typography variant="caption" sx={{ color: T.textMuted, fontSize: '0.73rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Role */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: T.textSec, fontSize: '0.8125rem' }}>
                      {getRoleName(user.roleId)}
                    </Typography>
                  </TableCell>

                  {/* Workspaces */}
                  {showWorkspace && (
                    <TableCell>
                      {(() => {
                        const wsIds = user.workspaceIds || (user.workspaceId ? [user.workspaceId] : []);
                        if (wsIds.length === 0) return <Typography variant="caption" sx={{ color: T.textMuted }}>—</Typography>;
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {wsIds.slice(0, 2).map((id: string) => (
                              <Chip key={id} label={getWorkspaceName(id)} size="small"
                                sx={{ fontSize: '0.7rem', height: 20, bgcolor: alpha(T.textPri, 0.06), color: T.textPri, fontWeight: 500, border: `1px solid ${alpha(T.textPri, 0.1)}` }} />
                            ))}
                            {wsIds.length > 2 && (
                              <Chip label={`+${wsIds.length - 2}`} size="small"
                                sx={{ fontSize: '0.7rem', height: 20, bgcolor: alpha(T.textPri, 0.06), color: T.textSec, fontWeight: 500 }} />
                            )}
                          </Box>
                        );
                      })()}
                    </TableCell>
                  )}

                  {/* Status */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, bgcolor: user.isActive ? T.success : T.textMuted }} />
                      <Typography variant="body2" sx={{ color: user.isActive ? T.textPri : T.textMuted, fontSize: '0.8125rem', fontWeight: user.isActive ? 500 : 400 }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Joined */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: T.textSec, fontSize: '0.8125rem' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                      <Tooltip title="View Details" arrow>
                        <IconButton size="small" onClick={() => handleViewDetails(user)}
                          sx={{ color: T.textMuted, borderRadius: 1.5, '&:hover': { color: T.textPri, bgcolor: alpha(T.textPri, 0.06) } }}>
                          <Visibility sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User" arrow>
                        <IconButton size="small" onClick={() => handleEditUser(user)}
                          sx={{ color: T.textMuted, borderRadius: 1.5, '&:hover': { color: T.textPri, bgcolor: alpha(T.textPri, 0.06) } }}>
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Password" arrow>
                        <IconButton size="small" onClick={() => handleChangePassword(user)}
                          sx={{ color: T.textMuted, borderRadius: 1.5, '&:hover': { color: T.textPri, bgcolor: alpha(T.textPri, 0.06) } }}>
                          <VpnKey sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'} arrow>
                        <IconButton size="small" onClick={() => handleToggleActive(user)}
                          sx={{ color: T.textMuted, borderRadius: 1.5, '&:hover': { color: user.isActive ? T.warning : T.success, bgcolor: alpha(user.isActive ? T.warning : T.success, 0.08) } }}>
                          {user.isActive ? <Block sx={{ fontSize: 16 }} /> : <CheckCircle sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User" arrow>
                        <IconButton size="small" onClick={() => handleDeleteClick(user)}
                          sx={{ color: T.textMuted, borderRadius: 1.5, '&:hover': { color: T.error, bgcolor: alpha(T.error, 0.08) } }}>
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ── Loading / error ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: T.bg }}>

      {/* ── Page header ── */}
      <Box sx={{
        bgcolor: T.surface,
        px: { xs: 2, sm: '32px' },
        pt: '24px',
        pb: '20px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: 20, lineHeight: 1.3 }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: T.textSec, mt: 0.5 }}>
            Manage system and application users, roles, and access
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddAltOutlined />}
          onClick={handleCreateUser}
          disableElevation
          sx={{
            bgcolor: T.primary,
            color: '#ffffff',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            px: 2.5,
            py: 1,
            boxShadow: 'none',
            '&:hover': { bgcolor: T.primaryHv, boxShadow: 'none' },
          }}
        >
          Add User
        </Button>
      </Box>

      {/* ── Stat cards row ── */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 0 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Total Users"  value={systemUsers.length + applicationUsers.length} icon={<GroupOutlined />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="System Users" value={systemUsers.length}                           icon={<AdminPanelSettingsOutlined />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="App Users"    value={applicationUsers.length}                      icon={<PeopleOutline />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Active Users" value={activeCount}                                  icon={<CheckCircleOutline />} />
          </Grid>
        </Grid>
      </Box>

      {/* ── Toolbar + Table ── */}
      <Box sx={{ pb: 6 }}>

        {/* Toolbar */}
        <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, bgcolor: T.surface, overflow: 'hidden' }}>

          {/* Search + filters */}
          <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderBottom: `1px solid ${T.border}` }}>
            <Box sx={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: T.toolbarBg, border: `1px solid ${T.border}`, borderRadius: 2, px: 1.5, py: 0.75 }}>
              <Search sx={{ fontSize: 17, color: T.textMuted, flexShrink: 0 }} />
              <InputBase
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem', color: T.textPri, '& input::placeholder': { color: T.textMuted } }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, color: T.textMuted }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 130 } }}>
              <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: T.toolbarBg }}>
                <MenuItem value=""><Typography variant="body2" sx={{ color: T.textMuted }}>All Roles</Typography></MenuItem>
                {roles.map(r => <MenuItem key={r.id} value={r.id}><Typography variant="body2">{r.name}</Typography></MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: 95, sm: 120 } }}>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: T.toolbarBg }}>
                <MenuItem value=""><Typography variant="body2" sx={{ color: T.textMuted }}>All Status</Typography></MenuItem>
                <MenuItem value="active"><Typography variant="body2">Active</Typography></MenuItem>
                <MenuItem value="inactive"><Typography variant="body2">Inactive</Typography></MenuItem>
              </Select>
            </FormControl>

            {tabValue === 1 && (
              <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 140 } }}>
                <Select value={workspaceFilter} onChange={e => setWorkspaceFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: T.toolbarBg }}>
                  <MenuItem value=""><Typography variant="body2" sx={{ color: T.textMuted }}>All Workspaces</Typography></MenuItem>
                  {workspaces.map(w => <MenuItem key={w.id} value={w.id}><Typography variant="body2">{w.name}</Typography></MenuItem>)}
                </Select>
              </FormControl>
            )}

            {(searchQuery || roleFilter || statusFilter || workspaceFilter) && (
              <Button size="small" startIcon={<FilterAltOutlined sx={{ fontSize: 14 }} />}
                onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); setWorkspaceFilter(''); }}
                sx={{ textTransform: 'none', color: T.textSec, fontWeight: 600, fontSize: '0.8125rem', borderRadius: 2, px: 1.5, '&:hover': { bgcolor: alpha(T.textSec, 0.06) } }}>
                Clear
              </Button>
            )}
          </Box>

          {/* Tabs */}
          <Tabs value={tabValue} onChange={handleTabChange} sx={{
            px: 2, minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44, color: T.textSec },
            '& .Mui-selected': { color: T.textPri },
            '& .MuiTabs-indicator': { bgcolor: T.primary, height: 2, borderRadius: 2 },
          }}>
            <Tab label={`System Users (${filterUsers(systemUsers).length})`} />
            <Tab label={`Application Users (${filterUsers(applicationUsers).length})`} />
          </Tabs>
        </Paper>

        {/* Table */}
        <Box sx={{ borderBottom: `1px solid ${T.border}` }}>
          <TabPanel value={tabValue} index={0}>{renderUserTable(systemUsers, false)}</TabPanel>
          <TabPanel value={tabValue} index={1}>{renderUserTable(applicationUsers, true)}</TabPanel>
        </Box>
      </Box>

      {/* ════════════════════════════════════════════════════════════════════════
          Create / Edit User Dialog
      ════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

        {/* Clean white dialog header */}
        <Box sx={{ bgcolor: T.surface, px: 3, pt: '20px', pb: '20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary }}>
              {editingUser ? <Edit sx={{ fontSize: 20 }} /> : <PersonAddAltOutlined sx={{ fontSize: 20 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: 16, lineHeight: 1.2 }}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </Typography>
              <Typography sx={{ color: T.textSec, fontSize: 13, mt: 0.25 }}>
                {editingUser ? `Editing ${getUserName(editingUser)}` : 'Fill in the details below'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setUserDialogOpen(false)} size="small" sx={{ color: T.textMuted, '&:hover': { color: T.textPri } }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: T.textSec, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</Typography>
              <TextField type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} disabled={!!editingUser} fullWidth required placeholder="user@example.com" size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: T.textMuted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

            {!editingUser && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: T.textSec, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</Typography>
                <TextField type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} fullWidth required placeholder="Min. 8 characters" size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockResetOutlined sx={{ fontSize: 18, color: T.textMuted }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: T.textSec, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name</Typography>
                <TextField value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} fullWidth placeholder="John" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: T.textSec, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name</Typography>
                <TextField value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} fullWidth placeholder="Doe" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: T.textSec, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</Typography>
              <TextField value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} fullWidth placeholder="+1 (555) 000-0000" size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 18, color: T.textMuted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: T.textSec, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</Typography>
              <FormControl fullWidth required size="small">
                <Select value={userForm.roleId} onChange={e => setUserForm({ ...userForm, roleId: e.target.value })} displayEmpty sx={{ borderRadius: 2 }}>
                  <MenuItem value="" disabled><Typography variant="body2" sx={{ color: T.textMuted }}>Select a role...</Typography></MenuItem>
                  <MenuItem disabled sx={{ opacity: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: T.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>System Roles</Typography>
                  </MenuItem>
                  {roles.filter(r => r.roleType === 0).map(r => (
                    <MenuItem key={r.id} value={r.id} sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettingsOutlined sx={{ fontSize: 16, color: T.textSec }} />
                        <Typography variant="body2">{r.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  <MenuItem disabled sx={{ opacity: 1, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: T.textSec, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>Application Roles</Typography>
                  </MenuItem>
                  {roles.filter(r => r.roleType === 1).map(r => (
                    <MenuItem key={r.id} value={r.id} sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Store sx={{ fontSize: 16, color: T.textSec }} />
                        <Typography variant="body2">{r.displayName || r.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${T.border}`, gap: 1 }}>
          <Button onClick={() => setUserDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, color: T.textSec, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: alpha(T.textSec, 0.06) } }}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained" disableElevation
            disabled={!userForm.email || !userForm.roleId || (!editingUser && !userForm.password)}
            startIcon={editingUser ? <Edit sx={{ fontSize: 17 }} /> : <PersonAddAltOutlined sx={{ fontSize: 17 }} />}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
              bgcolor: T.primary, boxShadow: 'none',
              '&:hover': { bgcolor: T.primaryHv, boxShadow: 'none' },
              '&:disabled': { bgcolor: T.border },
            }}>
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════════════════
          User Details Dialog
      ════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedUser && (() => {
          const name = getUserName(selectedUser);
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <>
              {/* Clean white dialog header */}
              <Box sx={{ bgcolor: T.surface, px: 3, pt: '20px', pb: '20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(0,166,202,0.08)', color: T.primary, fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(0,166,202,0.2)' }}>
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: 16, lineHeight: 1.2 }}>{name}</Typography>
                    <Typography sx={{ color: T.textSec, fontSize: 13 }}>{selectedUser.email}</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setDetailsDialogOpen(false)} size="small" sx={{ color: T.textMuted, '&:hover': { color: T.textPri } }}>
                  <Close />
                </IconButton>
              </Box>

              <DialogContent sx={{ p: 0 }}>
                <Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: T.textSec, letterSpacing: '0.08em', fontSize: '0.68rem' }}>Basic Information</Typography>
                    <Stack spacing={0} sx={{ mt: 1.5 }}>
                      {[
                        { icon: <Person sx={{ fontSize: 17 }} />, label: 'Full Name', value: getUserName(selectedUser) },
                        { icon: <Email sx={{ fontSize: 17 }} />, label: 'Email', value: selectedUser.email },
                        ...(selectedUser.phone ? [{ icon: <Phone sx={{ fontSize: 17 }} />, label: 'Phone', value: selectedUser.phone }] : []),
                      ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25, borderBottom: `1px solid ${T.border}` }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: T.toolbarBg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSec, flexShrink: 0 }}>
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: T.textMuted, fontSize: '0.7rem', display: 'block' }}>{item.label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: T.textPri }}>{item.value}</Typography>
                          </Box>
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: T.toolbarBg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSec, flexShrink: 0 }}>
                          <Badge sx={{ fontSize: 17 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: T.textMuted, fontSize: '0.7rem', display: 'block' }}>Role</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: T.textPri }}>{getRoleName(selectedUser.roleId)}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                  {(() => {
                    const wsIds = selectedUser.workspaceIds || (selectedUser.workspaceId ? [selectedUser.workspaceId] : []);
                    if (wsIds.length === 0) return null;
                    return (
                      <>
                        <Divider />
                        <Box sx={{ p: 3 }}>
                          <Typography variant="overline" sx={{ fontWeight: 700, color: T.textSec, letterSpacing: '0.08em', fontSize: '0.68rem' }}>Workspaces ({wsIds.length})</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                            {wsIds.map((id: string) => (
                              <Chip key={id} icon={<Store sx={{ fontSize: 14 }} />} label={getWorkspaceName(id)}
                                size="small" sx={{ bgcolor: alpha(T.textPri, 0.06), color: T.textPri, fontWeight: 500, border: `1px solid ${alpha(T.textPri, 0.1)}` }} />
                            ))}
                          </Box>
                        </Box>
                      </>
                    );
                  })()}

                  <Divider />
                  <Box sx={{ p: 3, bgcolor: T.bg }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: T.textSec, letterSpacing: '0.08em', fontSize: '0.68rem' }}>Account Status</Typography>
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: selectedUser.isActive ? T.success : T.textMuted }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: selectedUser.isActive ? T.textPri : T.textMuted }}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Created At',   value: selectedUser.createdAt  ? new Date(selectedUser.createdAt).toLocaleString()  : 'N/A' },
                        { label: 'Last Updated', value: selectedUser.updatedAt  ? new Date(selectedUser.updatedAt).toLocaleString()  : 'N/A' },
                        ...(selectedUser.lastLogin ? [{ label: 'Last Login', value: new Date(selectedUser.lastLogin).toLocaleString() }] : []),
                      ].map((item, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Typography variant="caption" sx={{ color: T.textMuted, display: 'block', mb: 0.25 }}>{item.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: T.textPri }}>{item.value}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${T.border}` }}>
                <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: T.border, color: T.textSec, '&:hover': { borderColor: T.textSec, bgcolor: 'transparent' } }}>
                  Close
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* ── Password + Delete ─────────────────────────────────────────────────── */}
      <PasswordUpdateDialog
        open={passwordDialogOpen}
        onClose={() => { setPasswordDialogOpen(false); setSelectedUser(null); }}
        onConfirm={handlePasswordUpdate}
        userName={selectedUser ? getUserName(selectedUser) : ''}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedUser(null); }}
        onConfirm={handleConfirmDelete}
        title="Deactivate User"
        itemName={selectedUser ? getUserName(selectedUser) : ''}
        itemType="user"
        description="The user will be deactivated and will not be able to log in."
        requireTyping={false}
        isSoftDelete={true}
        additionalWarnings={['User data will be preserved', 'You can reactivate this user later', 'All user sessions will be terminated']}
      />

      {/* ── Snackbar ─────────────────────────────────────────────────────────── */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
