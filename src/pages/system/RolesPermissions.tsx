import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
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
  DialogTitle,
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
} from '@mui/icons-material';
import { systemRoleService } from '../../services/system/role';
import { systemPermissionService } from '../../services/system/permission';
import { DeleteConfirmationDialog } from '../../components/dialogs';

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
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    roleType: 0,
  });

  // Permission management states
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');

  // Fetch all data
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Role CRUD operations
  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      roleType: tabValue === 0 ? 0 : 1,
    });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      roleType: role.roleType,
    });
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: any) => {
    setDeletingRole(role);
    setDeleteDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        // Update role
        await systemRoleService.updateRole(editingRole.id, {
          description: roleForm.description,
        });

        setSnackbar({
          open: true,
          message: 'Role updated successfully',
          severity: 'success',
        });
      } else {
        // Create role
        await systemRoleService.createRole({
          name: roleForm.name,
          description: roleForm.description,
          roleType: roleForm.roleType,
        });

        setSnackbar({
          open: true,
          message: 'Role created successfully',
          severity: 'success',
        });
      }

      setRoleDialogOpen(false);
      setEditingRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save role',
        severity: 'error',
      });
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

      if (toAdd.length > 0) {
        await systemRoleService.addPermissions(managingPermissionsRole.id, toAdd);
      }
      if (toRemove.length > 0) {
        await systemRoleService.removePermissions(managingPermissionsRole.id, toRemove);
      }

      setSnackbar({
        open: true,
        message: 'Permissions updated successfully',
        severity: 'success',
      });
      setPermissionDialogOpen(false);
      setManagingPermissionsRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update permissions',
        severity: 'error',
      });
    }
  };

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;

    try {
      await systemRoleService.deleteRole(deletingRole.id);
      setSnackbar({
        open: true,
        message: 'Role deactivated successfully. You can restore it later if needed.',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setDeletingRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to deactivate role',
        severity: 'error',
      });
    }
  };


  const getRoleColor = (roleType: number, index: number) => {
    if (roleType === 0) {
      // System roles - dark colors
      const colors = ['#0f172a', '#1e293b', '#334155', '#475569'];
      return colors[index % colors.length];
    } else {
      // Application roles - vibrant colors
      const colors = ['#7c3aed', '#2563eb', '#059669', '#dc2626'];
      return colors[index % colors.length];
    }
  };

  const renderRoleCard = (role: any, index: number) => {
    const color = getRoleColor(role.roleType, index);
    
    return (
      <Grid item xs={12} md={6} lg={4} key={role.id}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            transition: 'all 0.2s',
            height: '100%',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                {role.roleType === 0 ? (
                  <Business sx={{ fontSize: 24, color }} />
                ) : (
                  <Store sx={{ fontSize: 24, color }} />
                )}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {role.name}
                </Typography>
                <Chip
                  label={role.roleType === 0 ? 'System' : 'Application'}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 20,
                    mt: 0.5,
                    bgcolor: alpha(color, 0.08),
                    color: color,
                  }}
                />
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
              {role.description || 'No description provided'}
            </Typography>

            {role.isSystem && (
              <Chip
                label="Protected"
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  mb: 2,
                  bgcolor: alpha('#ef4444', 0.1),
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              />
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 1, display: 'block' }}>
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
                        bgcolor: alpha(color, 0.05),
                        border: `1px solid ${alpha(color, 0.2)}`,
                        color: color,
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
                        bgcolor: alpha(color, 0.05),
                        border: `1px solid ${alpha(color, 0.2)}`,
                        color: color,
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

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                startIcon={<Security sx={{ fontSize: 16 }} />}
                onClick={() => handleManagePermissions(role)}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  borderColor: alpha(color, 0.3),
                  color: color,
                  '&:hover': {
                    borderColor: color,
                    bgcolor: alpha(color, 0.05),
                  },
                }}
              >
                Permissions
              </Button>
              <Button
                size="small"
                startIcon={<Edit sx={{ fontSize: 16 }} />}
                onClick={() => handleEditRole(role)}
                sx={{
                  textTransform: 'none',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                }}
              >
                Edit
              </Button>
              {!role.isSystem && (
                <Button
                  size="small"
                  startIcon={<Delete sx={{ fontSize: 16 }} />}
                  onClick={() => handleDeleteRole(role)}
                  sx={{
                    textTransform: 'none',
                    color: '#f59e0b',
                    fontSize: '0.875rem',
                  }}
                >
                  Deactivate
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
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
              Roles Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Manage system and application roles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateRole}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create Role
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`System Roles (${systemRoles.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label={`Application Roles (${applicationRoles.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* System Roles Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {systemRoles.map((role, index) => renderRoleCard(role, index))}
          </Grid>
        </TabPanel>

        {/* Application Roles Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {applicationRoles.map((role, index) => renderRoleCard(role, index))}
          </Grid>
        </TabPanel>
      </Container>

      {/* Permission Management Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: alpha('#7c3aed', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Security sx={{ fontSize: 22, color: '#7c3aed' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Manage Permissions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {managingPermissionsRole?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setPermissionDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
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

          {/* Permission List */}
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
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: alpha('#7c3aed', 0.05),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedPermissions.includes(permission.name)}
                        tabIndex={-1}
                        disableRipple
                        sx={{
                          color: alpha('#7c3aed', 0.3),
                          '&.Mui-checked': {
                            color: '#7c3aed',
                          },
                        }}
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
                                bgcolor: alpha('#7c3aed', 0.1),
                                color: '#7c3aed',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={permission.description}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary',
                      }}
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
                <Typography variant="body2" color="text.secondary">
                  No permissions found
                </Typography>
              </Box>
            )}
          </List>

          {/* Selected Count */}
          <Box sx={{ px: 3, py: 2, bgcolor: alpha('#7c3aed', 0.05), borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#7c3aed' }}>
              {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setPermissionDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#7c3aed',
              '&:hover': { bgcolor: '#6d28d9' },
            }}
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Create/Edit Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </Typography>
          <IconButton onClick={() => setRoleDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Info */}
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
                  helperText={editingRole ? "Role name cannot be changed" : "Enter a descriptive name (e.g., 'Manager', 'Cashier', 'Waiter')"}
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
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            disabled={!roleForm.name}
            sx={{
              textTransform: 'none',
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            {editingRole ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingRole(null);
        }}
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
          'You can restore this role later from the system settings'
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

export default RolesPermissions;