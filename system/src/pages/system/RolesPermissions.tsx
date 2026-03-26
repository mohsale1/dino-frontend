import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  Store,
  Close,
  Security,
  Search,
  CalendarToday,
  AdminPanelSettingsOutlined,
  StoreOutlined,
  SecurityOutlined,
} from '@mui/icons-material';
import { systemRoleService } from '../../services/system/role';
import { systemPermissionService } from '../../services/system/permission';
import { DeleteConfirmationDialog } from '../../components/dialogs';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  indigo:  '#6366f1',
  dark0:   '#0f172a',
  dark1:   '#1e293b',
  violet:  '#8b5cf6',
  border:  '#e2e8f0',
  surface: '#ffffff',
  bg:      '#f1f5f9',
  slate:   '#64748b',
  muted:   '#94a3b8',
};

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    start.current = null;
    const step = (ts: number) => {
      if (start.current === null) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------
interface HeroStatProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const HeroStat: React.FC<HeroStatProps> = ({ icon, value, label }) => {
  const count = useCountUp(value);
  return (
    <Box
      sx={{
        flex: '1 1 140px',
        px: 2.5,
        py: 2,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(199,210,254,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: { xs: '1.35rem', md: '1.6rem' },
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {count}
      </Typography>
      <Typography sx={{ color: 'rgba(199,210,254,0.65)', fontSize: '0.75rem', mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// TabPanel
// ---------------------------------------------------------------------------
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const RolesPermissions: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [systemRoles, setSystemRoles] = useState<any[]>([]);
  const [applicationRoles, setApplicationRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [deletingRole, setDeletingRole] = useState<any | null>(null);
  const [managingPermissionsRole, setManagingPermissionsRole] = useState<any | null>(null);

  // Form states
  const [roleForm, setRoleForm] = useState({ name: '', description: '', roleType: 0 });

  // Permission management states
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sysRoles, appRoles, permissions] = await Promise.all([
        systemRoleService.getSystemRoles(),
        systemRoleService.getApplicationRoles(),
        systemPermissionService.getPermissions(1, 100),
      ]);
      setSystemRoles(sysRoles);
      setApplicationRoles(appRoles);
      setAllPermissions(permissions);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // ---------------------------------------------------------------------------
  // Role CRUD
  // ---------------------------------------------------------------------------
  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '', roleType: tabValue === 0 ? 0 : 1 });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, description: role.description || '', roleType: role.roleType });
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: any) => {
    setDeletingRole(role);
    setDeleteDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await systemRoleService.updateRole(editingRole.id, { description: roleForm.description });
        setSnackbar({ open: true, message: 'Role updated successfully', severity: 'success' });
      } else {
        await systemRoleService.createRole({ name: roleForm.name, description: roleForm.description, roleType: roleForm.roleType });
        setSnackbar({ open: true, message: 'Role created successfully', severity: 'success' });
      }
      setRoleDialogOpen(false);
      setEditingRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save role', severity: 'error' });
    }
  };

  const handleManagePermissions = (role: any) => {
    setManagingPermissionsRole(role);
    setSelectedPermissions(role.permissions || []);
    setPermissionSearch('');
    setPermissionDialogOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!managingPermissionsRole) return;
    try {
      const currentPerms = new Set(managingPermissionsRole.permissions || []);
      const newPerms = new Set(selectedPermissions);
      const toAdd = selectedPermissions.filter(p => !currentPerms.has(p));
      const toRemove = (managingPermissionsRole.permissions || []).filter((p: string) => !newPerms.has(p));
      if (toAdd.length > 0) await systemRoleService.addPermissions(managingPermissionsRole.id, toAdd);
      if (toRemove.length > 0) await systemRoleService.removePermissions(managingPermissionsRole.id, toRemove);
      setSnackbar({ open: true, message: 'Permissions updated successfully', severity: 'success' });
      setPermissionDialogOpen(false);
      setManagingPermissionsRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update permissions', severity: 'error' });
    }
  };

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName) ? prev.filter(p => p !== permissionName) : [...prev, permissionName]
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    try {
      await systemRoleService.deleteRole(deletingRole.id);
      setSnackbar({ open: true, message: 'Role deactivated successfully. You can restore it later if needed.', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeletingRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to deactivate role', severity: 'error' });
    }
  };

  // ---------------------------------------------------------------------------
  // Role card renderer
  // ---------------------------------------------------------------------------
  const renderRoleCard = (role: any, _index: number) => (
    <Grid item xs={12} md={6} lg={4} key={role.id}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          height: '100%',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0,
              }}
            >
              {role.roleType === 0 ? (
                <Business sx={{ fontSize: 24, color: '#64748b' }} />
              ) : (
                <Store sx={{ fontSize: 24, color: '#64748b' }} />
              )}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {role.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={role.roleType === 0 ? 'System' : 'Application'}
                  size="small"
                  sx={{
                    fontSize: '0.72rem',
                    height: 20,
                    bgcolor: alpha('#0f172a', 0.06),
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                  }}
                />
                {role.isSystem && (
                  <Chip
                    label="Protected"
                    size="small"
                    sx={{
                      fontSize: '0.72rem',
                      height: 20,
                      bgcolor: alpha('#f43f5e', 0.08),
                      color: '#f43f5e',
                      border: '1px solid rgba(244,63,94,0.25)',
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {role.description || 'No description provided'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Permissions */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 600, mb: 1, display: 'block', letterSpacing: '0.05em' }}
            >
              PERMISSIONS ({(role.permissions || []).length})
            </Typography>
            {(role.permissions || []).length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 80, overflowY: 'auto' }}>
                {((role.permissions || []) as string[]).slice(0, 6).map((perm: string, idx: number) => (
                  <Chip
                    key={idx}
                    label={perm}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      bgcolor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                    }}
                  />
                ))}
                {(role.permissions || []).length > 6 && (
                  <Chip
                    label={`+${(role.permissions || []).length - 6} more`}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      bgcolor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                    }}
                  />
                )}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No permissions assigned
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<Security sx={{ fontSize: 15 }} />}
              onClick={() => handleManagePermissions(role)}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontSize: '0.8rem',
                borderRadius: 2,
                borderColor: '#e2e8f0',
                color: '#0f172a',
                '&:hover': {
                  borderColor: '#0f172a',
                  bgcolor: alpha('#0f172a', 0.04),
                },
              }}
            >
              Permissions
            </Button>
            <Button
              size="small"
              startIcon={<Edit sx={{ fontSize: 15 }} />}
              onClick={() => handleEditRole(role)}
              sx={{ textTransform: 'none', color: '#64748b', fontSize: '0.8rem' }}
            >
              Edit
            </Button>
            {!role.isSystem && (
              <Button
                size="small"
                startIcon={<Delete sx={{ fontSize: 15 }} />}
                onClick={() => handleDeleteRole(role)}
                sx={{ textTransform: 'none', color: '#94a3b8', fontSize: '0.8rem' }}
              >
                Deactivate
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: COLORS.bg }}>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Header                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.dark0} 0%, #1e1b4b 45%, #312e81 100%)`,
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#6366f1', 0.22)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#8b5cf6', 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Title row */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'rgba(199,210,254,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}
            >
              SYSTEM CONTROL CENTER
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mt: 0.5,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              Roles &amp; Permissions
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
              <CalendarToday sx={{ fontSize: 13, color: 'rgba(199,210,254,0.6)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateRole}
            sx={{
              mt: 1,
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            Create Role
          </Button>
        </Box>

        {/* Hero stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative' }}>
          <HeroStat
            icon={<AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />}
            value={systemRoles.length}
            label="System Roles"
          />
          <HeroStat
            icon={<StoreOutlined sx={{ fontSize: 18 }} />}
            value={applicationRoles.length}
            label="App Roles"
          />
          <HeroStat
            icon={<SecurityOutlined sx={{ fontSize: 18 }} />}
            value={allPermissions.length}
            label="Total Permissions"
          />
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Content area                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ pt: 4, pb: 6, px: { xs: 2, sm: 3, md: 5 } }}>

        {/* Tabs toolbar */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: 'none',
            borderTop: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              px: 2,
              minHeight: 44,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 44,
                color: '#64748b',
              },
              '& .Mui-selected': { color: '#0f172a' },
              '& .MuiTabs-indicator': { bgcolor: '#0f172a', height: 2, borderRadius: 2 },
            }}
          >
            <Tab label={`System Roles (${systemRoles.length})`} />
            <Tab label={`Application Roles (${applicationRoles.length})`} />
          </Tabs>
        </Paper>

        {/* Tab panels */}
        <Box sx={{ mt: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {systemRoles.map((role, index) => renderRoleCard(role, index))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {applicationRoles.map((role, index) => renderRoleCard(role, index))}
            </Grid>
          </TabPanel>
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Permission Management Dialog                                        */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '80vh' } }}
      >
        {/* Gradient header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            px: 3,
            pt: 3,
            pb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#6366f1', 0.25)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                Manage Permissions
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.7)' }}>
                {managingPermissionsRole?.name}
              </Typography>
            </Box>
            <IconButton onClick={() => setPermissionDialogOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {/* Search */}
          <Box sx={{ p: 3, pb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search permissions..."
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Permission list */}
          <List sx={{ px: 2, pb: 2, maxHeight: 400, overflowY: 'auto' }}>
            {allPermissions
              .filter(perm =>
                permissionSearch === '' ||
                perm.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                perm.description?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                perm.category?.toLowerCase().includes(permissionSearch.toLowerCase())
              )
              .map((permission) => (
                <ListItem key={permission.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleTogglePermission(permission.name)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: alpha('#6366f1', 0.05) } }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedPermissions.includes(permission.name)}
                        tabIndex={-1}
                        disableRipple
                        sx={{ color: alpha('#6366f1', 0.3), '&.Mui-checked': { color: '#6366f1' } }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {permission.name}
                          </Typography>
                          {permission.category && (
                            <Chip
                              label={permission.category}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={permission.description}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            {allPermissions.filter(perm =>
              permissionSearch === '' ||
              perm.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
              perm.description?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
              perm.category?.toLowerCase().includes(permissionSearch.toLowerCase())
            ).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">No permissions found</Typography>
              </Box>
            )}
          </List>

          {/* Selected count */}
          <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
              {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setPermissionDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            sx={{ textTransform: 'none', bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Role Create / Edit Dialog                                           */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Gradient header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            px: 3,
            pt: 3,
            pb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#6366f1', 0.25)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.7)' }}>
                {editingRole ? `Editing ${editingRole.name}` : 'Define a new role and its type'}
              </Typography>
            </Box>
            <IconButton onClick={() => setRoleDialogOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Role Name"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  disabled={!!editingRole}
                  fullWidth
                  required
                  helperText={editingRole ? 'Role name cannot be changed' : "Enter a descriptive name (e.g., 'Manager', 'Cashier', 'Waiter')"}
                  placeholder="e.g., Manager"
                />
                <TextField
                  label="Description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Brief description of this role's purpose and responsibilities"
                  placeholder="e.g., Workspace owner with full access to all resources"
                />
                {!editingRole && (
                  <FormControl fullWidth required>
                    <InputLabel>Role Type</InputLabel>
                    <Select
                      value={roleForm.roleType}
                      onChange={(e) => setRoleForm({ ...roleForm, roleType: e.target.value as number })}
                      label="Role Type"
                    >
                      <MenuItem value={0}>System Role</MenuItem>
                      <MenuItem value={1}>Application Role</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            disabled={!roleForm.name}
            sx={{ textTransform: 'none', bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
          >
            {editingRole ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation                                                 */}
      {/* ------------------------------------------------------------------ */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingRole(null); }}
        onConfirm={handleConfirmDelete}
        title="Deactivate Role"
        itemName={deletingRole?.name || ''}
        itemType="role"
        description="Users with this role will need to be reassigned to another role."
        requireTyping={false}
        isSoftDelete={true}
        additionalWarnings={[
          'The role will be hidden from role selection',
          'Existing users with this role will retain it until reassigned',
          'You can restore this role later from the system settings',
        ]}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Snackbar                                                            */}
      {/* ------------------------------------------------------------------ */}
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

export default RolesPermissions;