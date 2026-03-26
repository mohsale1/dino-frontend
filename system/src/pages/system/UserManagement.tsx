import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
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
  CalendarToday,
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

// â”€â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  indigo:  '#6366f1',
  emerald: '#10b981',
  sky:     '#0ea5e9',
  violet:  '#8b5cf6',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  dark0:   '#0f172a',
  dark1:   '#1e293b',
  dark2:   '#334155',
  slate:   '#64748b',
  muted:   '#94a3b8',
  border:  '#e2e8f0',
  surface: '#ffffff',
  bg:      '#f1f5f9',
};

// â”€â”€â”€ Animated counter hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

// â”€â”€â”€ Hero stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface HeroStatProps {
  label: string;
  value: number;
  icon: React.ReactElement;
}

const HeroStat: React.FC<HeroStatProps> = ({ label, value, icon }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        flex: '1 1 140px',
        px: 2.5,
        py: 2,
        borderRadius: 2.5,
        bgcolor: alpha('#ffffff', 0.07),
        border: `1px solid ${alpha('#ffffff', 0.12)}`,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: alpha('#ffffff', 0.11) },
      }}
    >
      <Box
        sx={{
          width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
          bgcolor: alpha('#ffffff', 0.1),
          border: `1px solid ${alpha('#ffffff', 0.15)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: alpha('#c7d2fe', 0.9),
          '& svg': { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            fontSize: { xs: '1.35rem', md: '1.6rem' },
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {animated}
        </Typography>
        <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.65), fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// â”€â”€â”€ Tab panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box>{children}</Box>}
  </div>
);

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  const [searchQuery, setSearchQuery]       = useState('');
  const [roleFilter, setRoleFilter]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('');

  const [userForm, setUserForm] = useState({ email: '', firstName: '', lastName: '', phone: '', roleId: '', password: '' });

  // â”€â”€ Data fetching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sysUsers, appUsers, rolesData, wsData] = await Promise.all([
        systemUserService.getUsers(1, 100),
        systemUserService.getUsers(1, 100),
        systemRoleService.getRoles(1, 100),
        systemWorkspaceService.getWorkspaces(1, 100),
      ]);
      setSystemUsers(Array.isArray(sysUsers) ? sysUsers : []);
      setApplicationUsers(Array.isArray(appUsers) ? appUsers : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setWorkspaces(Array.isArray(wsData) ? wsData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      const selectedRole = roles.find(r => r.id === userForm.roleId);
      const service = selectedRole?.roleType === 0 ? systemUserService : systemUserService;
      if (editingUser) {
        await service.updateUser(editingUser.id, { firstName: userForm.firstName, lastName: userForm.lastName, phone: userForm.phone, roleId: userForm.roleId });
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await service.createUser({ email: userForm.email, password: userForm.password, firstName: userForm.firstName, lastName: userForm.lastName, phone: userForm.phone, roleId: userForm.roleId });
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
      const selectedRole = roles.find(r => r.id === selectedUser.roleId);
      const service = selectedRole?.roleType === 0 ? systemUserService : systemUserService;
      await service.deleteUser(selectedUser.id);
      setSnackbar({ open: true, message: 'User deactivated successfully', severity: 'success' });
      setDeleteDialogOpen(false); setSelectedUser(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to deactivate user', severity: 'error' });
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      const selectedRole = roles.find(r => r.id === user.roleId);
      const service = selectedRole?.roleType === 0 ? systemUserService : systemUserService;
      if (user.isActive) {
        await service.deactivateUser(user.id);
        setSnackbar({ open: true, message: 'User deactivated', severity: 'success' });
      } else {
        await service.activateUser(user.id);
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
      const selectedRole = roles.find(r => r.id === selectedUser.roleId);
      const service = selectedRole?.roleType === 0 ? systemUserService : systemUserService;
      await service.updateUser(selectedUser.id, { password: newPassword } as any);
      setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' });
      setPasswordDialogOpen(false); setSelectedUser(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update password', severity: 'error' });
    }
  };

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Table renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderUserTable = (users: any[], showWorkspace = false) => {
    const filtered = filterUsers(users);

    if (filtered.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: C.surface }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f1f5f9', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Person sx={{ fontSize: 30, color: C.muted }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: C.dark1, mb: 0.5 }}>No Users Found</Typography>
          <Typography variant="body2" sx={{ color: C.muted }}>
            {searchQuery || roleFilter || statusFilter || workspaceFilter ? 'Try adjusting your filters' : 'No users in this category yet'}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: 'none', bgcolor: C.surface, overflowX: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%', minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
              <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, width: '28%' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%' }}>Role</TableCell>
              {showWorkspace && <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>Workspaces</TableCell>}
              <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '12%' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '14%' }}>Joined</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '18%' }}>Actions</TableCell>
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
                    bgcolor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: '#fafafa' },
                    transition: 'background-color 0.1s',
                  }}
                >
                  {/* User */}
                  <TableCell sx={{ py: 1.75 }}>
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
                        <Typography variant="body2" sx={{ fontWeight: 600, color: C.dark0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</Typography>
                        <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.73rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: C.slate, fontSize: '0.8125rem' }}>
                      {getRoleName(user.roleId)}
                    </Typography>
                  </TableCell>

                  {/* Workspaces */}
                  {showWorkspace && (
                    <TableCell>
                      {(() => {
                        const wsIds = user.workspaceIds || (user.workspaceId ? [user.workspaceId] : []);
                        if (wsIds.length === 0) return <Typography variant="caption" sx={{ color: C.muted }}>â€”</Typography>;
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {wsIds.slice(0, 2).map((id: string) => (
                              <Chip key={id} label={getWorkspaceName(id)} size="small"
                                sx={{ fontSize: '0.7rem', height: 20, bgcolor: alpha(C.dark0, 0.06), color: C.dark1, fontWeight: 500, border: `1px solid ${alpha(C.dark0, 0.1)}` }} />
                            ))}
                            {wsIds.length > 2 && (
                              <Chip label={`+${wsIds.length - 2}`} size="small"
                                sx={{ fontSize: '0.7rem', height: 20, bgcolor: alpha(C.dark0, 0.06), color: C.slate, fontWeight: 500 }} />
                            )}
                          </Box>
                        );
                      })()}
                    </TableCell>
                  )}

                  {/* Status */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        bgcolor: user.isActive ? C.emerald : C.muted,
                      }} />
                      <Typography variant="body2" sx={{ color: user.isActive ? C.dark1 : C.muted, fontSize: '0.8125rem', fontWeight: user.isActive ? 500 : 400 }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Joined */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: C.slate, fontSize: '0.8125rem' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'â€”'}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                      <Tooltip title="View Details" arrow>
                        <IconButton size="small" onClick={() => handleViewDetails(user)}
                          sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: C.dark0, bgcolor: alpha(C.dark0, 0.06) } }}>
                          <Visibility sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User" arrow>
                        <IconButton size="small" onClick={() => handleEditUser(user)}
                          sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: C.dark0, bgcolor: alpha(C.dark0, 0.06) } }}>
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Password" arrow>
                        <IconButton size="small" onClick={() => handleChangePassword(user)}
                          sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: C.dark0, bgcolor: alpha(C.dark0, 0.06) } }}>
                          <VpnKey sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'} arrow>
                        <IconButton size="small" onClick={() => handleToggleActive(user)}
                          sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: user.isActive ? C.amber : C.emerald, bgcolor: alpha(user.isActive ? C.amber : C.emerald, 0.08) } }}>
                          {user.isActive ? <Block sx={{ fontSize: 16 }} /> : <CheckCircle sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User" arrow>
                        <IconButton size="small" onClick={() => handleDeleteClick(user)}
                          sx={{ color: C.muted, borderRadius: 1.5, '&:hover': { color: C.rose, bgcolor: alpha(C.rose, 0.08) } }}>
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

  // â”€â”€ Loading / error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={36} sx={{ color: C.indigo }} />
          <Typography variant="body2" sx={{ mt: 2, color: C.muted }}>Loading users...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    );
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: C.bg }}>

      {/* â”€â”€ Hero (title + stats inside) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${C.dark0} 0%, #1e1b4b 45%, #312e81 100%)`,
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""', position: 'absolute', top: -100, right: -60,
            width: 360, height: 360, borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(C.indigo, 0.22)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""', position: 'absolute', bottom: -80, left: '25%',
            width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(C.violet, 0.15)} 0%, transparent 70%)`,
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

        {/* Title row */}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="overline" sx={{ color: alpha('#c7d2fe', 0.75), fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
              SYSTEM CONTROL CENTER
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              User Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <CalendarToday sx={{ fontSize: 13, color: alpha('#c7d2fe', 0.6) }} />
              <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.6), fontWeight: 500, fontSize: '0.75rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<PersonAddAltOutlined />}
            onClick={handleCreateUser}
            sx={{
              mt: 1,
              bgcolor: alpha('#fff', 0.15),
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha('#fff', 0.25)}`,
              px: 2.5, py: 1,
              borderRadius: 2,
              '&:hover': { bgcolor: alpha('#fff', 0.25), border: `1px solid ${alpha('#fff', 0.4)}` },
            }}
          >
            Add User
          </Button>
        </Box>

        {/* Stats row â€” inside hero */}
        <Box sx={{ position: 'relative', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <HeroStat label="Total Users"   value={systemUsers.length + applicationUsers.length} icon={<GroupOutlined />} />
          <HeroStat label="System Users"  value={systemUsers.length}                           icon={<AdminPanelSettingsOutlined />} />
          <HeroStat label="App Users"     value={applicationUsers.length}                      icon={<PeopleOutline />} />
          <HeroStat label="Active Users"  value={activeCount}                                  icon={<CheckCircleOutline />} />
        </Box>
      </Box>

      {/* â”€â”€ Toolbar + Table (full width, no side padding) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box sx={{ pb: 6 }}>

        {/* Toolbar */}
        <Box sx={{ pt: 3, pb: 0 }}>
          <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, bgcolor: C.surface, overflow: 'hidden' }}>

            {/* Search + filters */}
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderBottom: `1px solid ${C.border}` }}>
              <Box sx={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 2, px: 1.5, py: 0.75 }}>
                <Search sx={{ fontSize: 17, color: C.muted, flexShrink: 0 }} />
                <InputBase
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.875rem', color: C.dark0, '& input::placeholder': { color: C.muted } }}
                />
                {searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, color: C.muted }}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}>
                  <MenuItem value=""><Typography variant="body2" sx={{ color: C.muted }}>All Roles</Typography></MenuItem>
                  {roles.map(r => <MenuItem key={r.id} value={r.id}><Typography variant="body2">{r.name}</Typography></MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}>
                  <MenuItem value=""><Typography variant="body2" sx={{ color: C.muted }}>All Status</Typography></MenuItem>
                  <MenuItem value="active"><Typography variant="body2">Active</Typography></MenuItem>
                  <MenuItem value="inactive"><Typography variant="body2">Inactive</Typography></MenuItem>
                </Select>
              </FormControl>

              {tabValue === 1 && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select value={workspaceFilter} onChange={e => setWorkspaceFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}>
                    <MenuItem value=""><Typography variant="body2" sx={{ color: C.muted }}>All Workspaces</Typography></MenuItem>
                    {workspaces.map(w => <MenuItem key={w.id} value={w.id}><Typography variant="body2">{w.name}</Typography></MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {(searchQuery || roleFilter || statusFilter || workspaceFilter) && (
                <Button size="small" startIcon={<FilterAltOutlined sx={{ fontSize: 14 }} />}
                  onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); setWorkspaceFilter(''); }}
                  sx={{ textTransform: 'none', color: C.slate, fontWeight: 600, fontSize: '0.8125rem', borderRadius: 2, px: 1.5, '&:hover': { bgcolor: alpha(C.slate, 0.06) } }}>
                  Clear
                </Button>
              )}
            </Box>

            {/* Tabs */}
            <Tabs value={tabValue} onChange={handleTabChange} sx={{
              px: 2, minHeight: 44,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44, color: C.slate },
              '& .Mui-selected': { color: C.dark0 },
              '& .MuiTabs-indicator': { bgcolor: C.dark0, height: 2, borderRadius: 2 },
            }}>
              <Tab label={`System Users (${filterUsers(systemUsers).length})`} />
              <Tab label={`Application Users (${filterUsers(applicationUsers).length})`} />
            </Tabs>
          </Paper>
        </Box>

        {/* Table â€” full width */}
        <Box sx={{ borderBottom: `1px solid ${C.border}` }}>
          <TabPanel value={tabValue} index={0}>{renderUserTable(systemUsers, false)}</TabPanel>
          <TabPanel value={tabValue} index={1}>{renderUserTable(applicationUsers, true)}</TabPanel>
        </Box>
      </Box>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          Create / Edit User Dialog
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{
          background: `linear-gradient(135deg, ${C.dark0} 0%, #1e1b4b 60%, #312e81 100%)`,
          px: 3, pt: 3, pb: 3, position: 'relative', overflow: 'hidden',
          '&::before': { content: '""', position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(C.indigo, 0.25)} 0%, transparent 70%)`, pointerEvents: 'none' },
        }}>
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha('#fff', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${alpha('#fff', 0.2)}` }}>
                {editingUser ? <Edit sx={{ fontSize: 20, color: '#fff' }} /> : <PersonAddAltOutlined sx={{ fontSize: 20, color: '#fff' }} />}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.7), fontSize: '0.75rem' }}>
                  {editingUser ? `Editing ${getUserName(editingUser)}` : 'Fill in the details below'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setUserDialogOpen(false)} size="small" sx={{ color: alpha('#fff', 0.7), '&:hover': { bgcolor: alpha('#fff', 0.1) } }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: C.slate, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</Typography>
              <TextField type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} disabled={!!editingUser} fullWidth required placeholder="user@example.com" size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: C.muted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

            {!editingUser && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: C.slate, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</Typography>
                <TextField type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} fullWidth required placeholder="Min. 8 characters" size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockResetOutlined sx={{ fontSize: 18, color: C.muted }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: C.slate, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name</Typography>
                <TextField value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} fullWidth placeholder="John" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: C.slate, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name</Typography>
                <TextField value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} fullWidth placeholder="Doe" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: C.slate, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</Typography>
              <TextField value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} fullWidth placeholder="+1 (555) 000-0000" size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 18, color: C.muted }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: C.slate, mb: 0.75, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</Typography>
              <FormControl fullWidth required size="small">
                <Select value={userForm.roleId} onChange={e => setUserForm({ ...userForm, roleId: e.target.value })} displayEmpty sx={{ borderRadius: 2 }}>
                  <MenuItem value="" disabled><Typography variant="body2" sx={{ color: C.muted }}>Select a role...</Typography></MenuItem>
                  <MenuItem disabled sx={{ opacity: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>System Roles</Typography>
                  </MenuItem>
                  {roles.filter(r => r.roleType === 0).map(r => (
                    <MenuItem key={r.id} value={r.id} sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettingsOutlined sx={{ fontSize: 16, color: C.slate }} />
                        <Typography variant="body2">{r.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  <MenuItem disabled sx={{ opacity: 1, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>Application Roles</Typography>
                  </MenuItem>
                  {roles.filter(r => r.roleType === 1).map(r => (
                    <MenuItem key={r.id} value={r.id} sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Store sx={{ fontSize: 16, color: C.slate }} />
                        <Typography variant="body2">{r.displayName || r.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${C.border}`, gap: 1 }}>
          <Button onClick={() => setUserDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, color: C.slate, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: alpha(C.slate, 0.06) } }}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained"
            disabled={!userForm.email || !userForm.roleId || (!editingUser && !userForm.password)}
            startIcon={editingUser ? <Edit sx={{ fontSize: 17 }} /> : <PersonAddAltOutlined sx={{ fontSize: 17 }} />}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
              bgcolor: C.dark0, '&:hover': { bgcolor: C.dark1 },
              '&:disabled': { bgcolor: C.border },
            }}>
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          User Details Dialog
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedUser && (() => {
          const name = getUserName(selectedUser);
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <Box sx={{
              background: `linear-gradient(135deg, ${C.dark0} 0%, #1e1b4b 60%, #312e81 100%)`,
              px: 3, pt: 3, pb: 3, position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(C.indigo, 0.25)} 0%, transparent 70%)`, pointerEvents: 'none' },
            }}>
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#fff', 0.15), color: '#fff', fontWeight: 700, fontSize: '1rem', border: `1px solid ${alpha('#fff', 0.25)}` }}>
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>{name}</Typography>
                    <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.7) }}>{selectedUser.email}</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setDetailsDialogOpen(false)} size="small" sx={{ color: alpha('#fff', 0.7), '&:hover': { bgcolor: alpha('#fff', 0.1) } }}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          );
        })()}

        <DialogContent sx={{ p: 0 }}>
          {selectedUser && (
            <Box>
              <Box sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: C.slate, letterSpacing: '0.08em', fontSize: '0.68rem' }}>Basic Information</Typography>
                <Stack spacing={0} sx={{ mt: 1.5 }}>
                  {[
                    { icon: <Person sx={{ fontSize: 17 }} />, label: 'Full Name', value: getUserName(selectedUser) },
                    { icon: <Email sx={{ fontSize: 17 }} />, label: 'Email', value: selectedUser.email },
                    ...(selectedUser.phone ? [{ icon: <Phone sx={{ fontSize: 17 }} />, label: 'Phone', value: selectedUser.phone }] : []),
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25, borderBottom: `1px solid ${C.border}` }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: '#f1f5f9', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.slate, flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.7rem', display: 'block' }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: C.dark0 }}>{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: '#f1f5f9', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.slate, flexShrink: 0 }}>
                      <Badge sx={{ fontSize: 17 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.7rem', display: 'block' }}>Role</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: C.dark0 }}>{getRoleName(selectedUser.roleId)}</Typography>
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
                      <Typography variant="overline" sx={{ fontWeight: 700, color: C.slate, letterSpacing: '0.08em', fontSize: '0.68rem' }}>Workspaces ({wsIds.length})</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                        {wsIds.map((id: string) => (
                          <Chip key={id} icon={<Store sx={{ fontSize: 14 }} />} label={getWorkspaceName(id)}
                            size="small" sx={{ bgcolor: alpha(C.dark0, 0.06), color: C.dark1, fontWeight: 500, border: `1px solid ${alpha(C.dark0, 0.1)}` }} />
                        ))}
                      </Box>
                    </Box>
                  </>
                );
              })()}

              <Divider />
              <Box sx={{ p: 3, bgcolor: '#f8fafc' }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: C.slate, letterSpacing: '0.08em', fontSize: '0.68rem' }}>Account Status</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: selectedUser.isActive ? C.emerald : C.muted }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: selectedUser.isActive ? C.dark0 : C.muted }}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: 'Created At', value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A' },
                    { label: 'Last Updated', value: selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A' },
                    ...(selectedUser.lastLogin ? [{ label: 'Last Login', value: new Date(selectedUser.lastLogin).toLocaleString() }] : []),
                  ].map((item, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Typography variant="caption" sx={{ color: C.muted, display: 'block', mb: 0.25 }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: C.dark1 }}>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.border}` }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: C.border, color: C.slate, '&:hover': { borderColor: C.slate, bgcolor: 'transparent' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* â”€â”€ Password + Delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ Snackbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;