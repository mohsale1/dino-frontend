import React, { useState, useEffect, useCallback } from 'react';
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
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  TextField,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Business,
  Store,
  Close,
  Security,
  Search,
  AdminPanelSettingsOutlined,
  StoreOutlined,
  Visibility,
  CheckCircleOutline,
  RemoveCircleOutline,
} from '@mui/icons-material';
import { systemRoleService } from '../../services/system/role';
import { systemPermissionService } from '../../services/system/permission';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary:       '#00A6CA',
  primaryHover:  '#005F8D',
  primaryBg:     'rgba(0,166,202,0.08)',
  primaryBorder: 'rgba(0,166,202,0.2)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a raw permission object from the backend.
 * The backend returns snake_case fields; map to a consistent shape.
 */
function normalisePermission(p: any): any {
  return {
    id:          String(p.id ?? p.permission_id ?? ''),
    name:        p.name        ?? `${p.resource}:${p.action}`,
    displayName: p.display_name ?? p.displayName ?? p.name ?? `${p.resource}:${p.action}`,
    description: p.description ?? '',
    category:    p.category    ?? '',
    resource:    p.resource    ?? '',
    action:      p.action      ?? '',
    isActive:    p.is_active   ?? p.isActive ?? true,
  };
}

/**
 * Build a human-readable label for a permission.
 * Prefers display_name, falls back to "Resource - Action" capitalised.
 */
function permLabel(p: any): string {
  if (p.displayName && p.displayName !== p.name) return p.displayName;
  const res = p.resource ? p.resource.charAt(0).toUpperCase() + p.resource.slice(1) : '';
  const act = p.action   ? p.action.charAt(0).toUpperCase()   + p.action.slice(1)   : '';
  return res && act ? `${res} — ${act}` : p.name || String(p.id);
}

// ─── TabPanel ─────────────────────────────────────────────────────────────────
const TabPanel: React.FC<{ children?: React.ReactNode; index: number; value: number }> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// ─── Dialog header ────────────────────────────────────────────────────────────
const DialogHeader: React.FC<{ title: string; subtitle: string; onClose: () => void }> = ({ title, subtitle, onClose }) => (
  <Box sx={{ bgcolor: '#ffffff', px: 3, pt: 2.5, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '1rem', lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.8125rem', display: 'block' }}>
          {subtitle}
        </Typography>
      </Box>
      <IconButton onClick={onClose} size="small" sx={{ color: '#999999', flexShrink: 0, '&:hover': { bgcolor: '#f5f5f5' } }}>
        <Close fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────
const RolesPermissions: React.FC = () => {
  const [tabValue,         setTabValue]         = useState(0);
  const [systemRoles,      setSystemRoles]      = useState<any[]>([]);
  const [applicationRoles, setApplicationRoles] = useState<any[]>([]);
  const [allPermissions,   setAllPermissions]   = useState<any[]>([]); // normalised
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [snackbar,         setSnackbar]         = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // View dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingRole,    setViewingRole]    = useState<any | null>(null);
  const [viewPermIds,    setViewPermIds]    = useState<Set<string>>(new Set()); // IDs assigned to viewed role

  // Permission edit dialog
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [permRole,       setPermRole]       = useState<any | null>(null);
  const [selectedPerms,  setSelectedPerms]  = useState<Set<string>>(new Set()); // numeric ID strings
  const [permSearch,     setPermSearch]     = useState('');
  const [savingPerms,    setSavingPerms]    = useState(false);
  const [loadingPerms,   setLoadingPerms]   = useState(false);

  // ── Fetch all roles + all permissions ─────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sysRoles, appRoles, rawPerms] = await Promise.all([
        systemRoleService.getSystemRoles(),
        systemRoleService.getApplicationRoles(),
        systemPermissionService.getPermissions(1, 200),
      ]);
      setSystemRoles(sysRoles);
      setApplicationRoles(appRoles);
      setAllPermissions((rawPerms as any[]).map(normalisePermission));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Fetch assigned permission IDs for a specific role ─────────────────────
  // GET /system/roles/{id}/permissions → [1, 5, 12, ...]  (integer IDs)
  const fetchRolePermIds = useCallback(async (roleId: any): Promise<Set<string>> => {
    try {
      const response = await systemRoleService.getRolePermissions(roleId);
      const ids = (response as any[]).map(id => String(id));
      return new Set(ids);
    } catch {
      return new Set();
    }
  }, []);

  // ── View role ─────────────────────────────────────────────────────────────
  const handleViewRole = async (role: any) => {
    setViewingRole(role);
    setViewPermIds(new Set());
    setViewDialogOpen(true);
    const ids = await fetchRolePermIds(role.id);
    setViewPermIds(ids);
  };

  // ── Open permissions edit dialog ──────────────────────────────────────────
  const handleEditPermissions = async (role: any) => {
    setPermRole(role);
    setSelectedPerms(new Set());
    setPermSearch('');
    setPermDialogOpen(true);
    setLoadingPerms(true);
    try {
      const ids = await fetchRolePermIds(role.id);
      setSelectedPerms(ids);
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleTogglePerm = (id: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Save permission changes ───────────────────────────────────────────────
  const handleSavePerms = async () => {
    if (!permRole) return;
    setSavingPerms(true);
    try {
      // Re-fetch current state from server to diff accurately
      const currentIds = await fetchRolePermIds(permRole.id);
      const nextIds    = selectedPerms;

      const toAdd    = Array.from(nextIds).filter(id => !currentIds.has(id));
      const toRemove = Array.from(currentIds).filter(id => !nextIds.has(id));

      if (toAdd.length    > 0) await systemRoleService.addPermissions(permRole.id, toAdd);
      if (toRemove.length > 0) await systemRoleService.removePermissions(permRole.id, toRemove);

      setSnackbar({ open: true, message: 'Permissions updated successfully.', severity: 'success' });
      setPermDialogOpen(false);
      setPermRole(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update permissions.', severity: 'error' });
    } finally {
      setSavingPerms(false);
    }
  };

  // ── Filtered permissions list ─────────────────────────────────────────────
  const filteredPerms = allPermissions.filter(p => {
    if (!permSearch) return true;
    const q = permSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.displayName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.resource?.toLowerCase().includes(q) ||
      p.action?.toLowerCase().includes(q)
    );
  });

  // ── Role card ─────────────────────────────────────────────────────────────
  const renderRoleCard = (role: any) => {
    // role_type from backend is snake_case; handle both
    const roleType = role.role_type ?? role.roleType ?? 0;
    const isSystem = role.is_system ?? role.isSystem ?? false;

    return (
      <Grid item xs={12} sm={6} lg={4} key={role.id}>
        <Card elevation={0} sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 0.15s',
          '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`, flexShrink: 0 }}>
                {roleType === 0
                  ? <Business sx={{ fontSize: 22, color: BRAND.primary }} />
                  : <Store     sx={{ fontSize: 22, color: BRAND.primary }} />
                }
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {role.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={roleType === 0 ? 'System' : 'Application'}
                    size="small"
                    sx={{ fontSize: '0.68rem', height: 18, bgcolor: 'rgba(0,0,0,0.05)', color: '#666666', border: '1px solid #e0e0e0' }}
                  />
                  {isSystem && (
                    <Chip
                      label="Protected"
                      size="small"
                      sx={{ fontSize: '0.68rem', height: 18, bgcolor: 'rgba(235,0,0,0.07)', color: '#c00', border: '1px solid rgba(200,0,0,0.2)' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Description */}
            <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8125rem', color: '#666666', flex: 1, lineHeight: 1.5 }}>
              {role.description || 'No description provided.'}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<Visibility sx={{ fontSize: 15 }} />}
                onClick={() => handleViewRole(role)}
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  borderColor: '#e0e0e0',
                  color: '#666666',
                  '&:hover': { borderColor: BRAND.primary, color: BRAND.primary, bgcolor: BRAND.primaryBg },
                }}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<Security sx={{ fontSize: 15 }} />}
                onClick={() => handleEditPermissions(role)}
                variant="contained"
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  bgcolor: BRAND.primary,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: 'none' },
                }}
              >
                Permissions
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // ── Loading / error ───────────────────────────────────────────────────────

  if (error) {
    return (
      <Box sx={{ p: 4, bgcolor: '#f8fafc' }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
      <Box sx={{ bgcolor: '#ffffff', px: { xs: 3, sm: 4, md: 5 }, pt: 3, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '22px', letterSpacing: '-0.3px' }}>
          Roles &amp; Permissions
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#666666', mt: 0.5 }}>
          Manage system and application roles and their permission assignments
        </Typography>
      </Box>

      {/* ── Tabs ── */}
      <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #e0e0e0', bgcolor: '#ffffff' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            minHeight: 50,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' }, minHeight: 50, color: '#666666' },
            '& .Mui-selected': { color: BRAND.primary },
            '& .MuiTabs-indicator': { bgcolor: BRAND.primary, height: 2.5 },
          }}
        >
          <Tab icon={<AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label={`System Roles (${systemRoles.length})`} />
          <Tab icon={<StoreOutlined             sx={{ fontSize: 18 }} />} iconPosition="start" label={`App Roles (${applicationRoles.length})`} />
        </Tabs>
      </Paper>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pb: { xs: 4, sm: 6 } }}>
        <TabPanel value={tabValue} index={0}>
          {systemRoles.length === 0
            ? <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">No system roles found.</Typography></Box>
            : <Grid container spacing={{ xs: 2, sm: 3 }}>{systemRoles.map(r => renderRoleCard(r))}</Grid>
          }
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {applicationRoles.length === 0
            ? <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">No application roles found.</Typography></Box>
            : <Grid container spacing={{ xs: 2, sm: 3 }}>{applicationRoles.map(r => renderRoleCard(r))}</Grid>
          }
        </TabPanel>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* VIEW ROLE DIALOG                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogHeader
          title={viewingRole?.name || ''}
          subtitle={(viewingRole?.role_type ?? viewingRole?.roleType) === 0 ? 'System Role' : 'Application Role'}
          onClose={() => setViewDialogOpen(false)}
        />

        <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
          {viewingRole && (
            <Box>
              {/* Info rows */}
              <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#666666', minWidth: 100, flexShrink: 0 }}>Type</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip
                      label={(viewingRole.role_type ?? viewingRole.roleType) === 0 ? 'System' : 'Application'}
                      size="small"
                      sx={{ fontSize: '0.72rem', height: 20, bgcolor: BRAND.primaryBg, color: BRAND.primary, border: `1px solid ${BRAND.primaryBorder}` }}
                    />
                    {(viewingRole.is_system ?? viewingRole.isSystem) && (
                      <Chip label="Protected" size="small" sx={{ fontSize: '0.72rem', height: 20, bgcolor: 'rgba(235,0,0,0.07)', color: '#c00', border: '1px solid rgba(200,0,0,0.2)' }} />
                    )}
                  </Box>
                </Box>
                {viewingRole.description && (
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#666666', minWidth: 100, flexShrink: 0 }}>Description</Typography>
                    <Typography variant="body2" sx={{ color: '#444444', lineHeight: 1.6 }}>{viewingRole.description}</Typography>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Permissions list */}
              <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Security sx={{ fontSize: 16, color: BRAND.primary }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C1C1E' }}>
                    Assigned Permissions ({viewPermIds.size})
                  </Typography>
                </Box>

                {viewPermIds.size === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Security sx={{ fontSize: 32, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No permissions assigned to this role.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Array.from(viewPermIds).map(id => {
                      const perm = allPermissions.find(p => p.id === id);
                      return (
                        <Box
                          key={id}
                          sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 1.5,
                            px: 1.5, py: 1.25, borderRadius: 2,
                            bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
                          }}
                        >
                          <CheckCircleOutline sx={{ fontSize: 16, color: BRAND.primary, mt: 0.15, flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3 }}>
                              {perm ? permLabel(perm) : `Permission #${id}`}
                            </Typography>
                            {perm?.description && (
                              <Typography variant="caption" sx={{ color: '#666666', display: 'block', mt: 0.25, lineHeight: 1.4 }}>
                                {perm.description}
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: BRAND.primary, mt: 0.25, display: 'block' }}>
                              {perm ? `${perm.resource}:${perm.action}` : id}
                            </Typography>
                          </Box>
                          {perm?.category && (
                            <Chip
                              label={perm.category}
                              size="small"
                              sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#ffffff', border: '1px solid #e0e0e0', color: '#666666', ml: 'auto', flexShrink: 0 }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
          <Button onClick={() => setViewDialogOpen(false)} sx={{ textTransform: 'none', color: '#666666' }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Security sx={{ fontSize: 16 }} />}
            onClick={() => { setViewDialogOpen(false); if (viewingRole) handleEditPermissions(viewingRole); }}
            sx={{ textTransform: 'none', bgcolor: BRAND.primary, '&:hover': { bgcolor: BRAND.primaryHover }, boxShadow: 'none' }}
          >
            Edit Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PERMISSIONS EDIT DIALOG                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={permDialogOpen}
        onClose={() => setPermDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogHeader
          title={`Edit Permissions — ${permRole?.name || ''}`}
          subtitle={`${selectedPerms.size} of ${allPermissions.length} permissions assigned`}
          onClose={() => setPermDialogOpen(false)}
        />

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>

          {/* Search + counts bar */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
            <TextField
              fullWidth
              placeholder="Search by name, resource, action, category..."
              value={permSearch}
              onChange={e => setPermSearch(e.target.value)}
              size="small"
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: BRAND.primary } } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#999999' }} />
                  </InputAdornment>
                ),
                endAdornment: permSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setPermSearch('')} sx={{ color: '#999999' }}>
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CheckCircleOutline sx={{ fontSize: 15, color: '#10b981' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
                  {selectedPerms.size} assigned
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <RemoveCircleOutline sx={{ fontSize: 15, color: '#999999' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#999999' }}>
                  {allPermissions.length - selectedPerms.size} unassigned
                </Typography>
              </Box>
              {filteredPerms.length !== allPermissions.length && (
                <Typography variant="caption" sx={{ color: '#999999', ml: 'auto' }}>
                  Showing {filteredPerms.length} of {allPermissions.length}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Permission list */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loadingPerms ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={28} sx={{ color: BRAND.primary }} />
              </Box>
            ) : filteredPerms.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body2" color="text.secondary">No permissions match your search.</Typography>
              </Box>
            ) : (() => {
              const assigned   = filteredPerms.filter(p => selectedPerms.has(p.id));
              const unassigned = filteredPerms.filter(p => !selectedPerms.has(p.id));

              const renderRow = (permission: any, isSelected: boolean) => (
                <ListItem key={permission.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleTogglePerm(permission.id)}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isSelected ? BRAND.primaryBorder : '#f0f0f0',
                      bgcolor: isSelected ? BRAND.primaryBg : '#fafafa',
                      py: 1,
                      '&:hover': {
                        bgcolor: isSelected ? 'rgba(0,166,202,0.12)' : '#f2f2f2',
                        borderColor: isSelected ? BRAND.primaryBorder : '#e0e0e0',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                        sx={{ color: 'rgba(0,166,202,0.3)', '&.Mui-checked': { color: BRAND.primary }, p: 0 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8375rem', color: '#1C1C1E', lineHeight: 1.3 }}>
                            {permLabel(permission)}
                          </Typography>
                          {permission.category && (
                            <Chip
                              label={permission.category}
                              size="small"
                              sx={{ height: 16, fontSize: '0.62rem', bgcolor: '#f2f2f2', border: '1px solid #e0e0e0', color: '#666666' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {permission.description && (
                            <Typography variant="caption" sx={{ color: '#666666', display: 'block', fontSize: '0.72rem', lineHeight: 1.4 }}>
                              {permission.description}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: isSelected ? BRAND.primary : '#999999', display: 'block', mt: 0.25 }}>
                            {permission.resource}:{permission.action}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );

              return (
                <>
                  {assigned.length > 0 && (
                    <Box sx={{ px: 1.5, pt: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 0.5 }}>
                        <CheckCircleOutline sx={{ fontSize: 14, color: '#10b981' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                          Assigned ({assigned.length})
                        </Typography>
                      </Box>
                      <List disablePadding>{assigned.map(p => renderRow(p, true))}</List>
                    </Box>
                  )}

                  {assigned.length > 0 && unassigned.length > 0 && (
                    <Divider sx={{ mx: 1.5, my: 1.5 }} />
                  )}

                  {unassigned.length > 0 && (
                    <Box sx={{ px: 1.5, pb: 1.5, pt: assigned.length === 0 ? 1.5 : 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 0.5 }}>
                        <RemoveCircleOutline sx={{ fontSize: 14, color: '#999999' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                          Unassigned ({unassigned.length})
                        </Typography>
                      </Box>
                      <List disablePadding>{unassigned.map(p => renderRow(p, false))}</List>
                    </Box>
                  )}
                </>
              );
            })()}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1, flexShrink: 0 }}>
          <Button onClick={() => setPermDialogOpen(false)} sx={{ textTransform: 'none', color: '#666666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePerms}
            variant="contained"
            disabled={savingPerms || loadingPerms}
            startIcon={savingPerms ? <CircularProgress size={14} color="inherit" /> : <Security sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              bgcolor: BRAND.primary,
              '&:hover': { bgcolor: BRAND.primaryHover },
              boxShadow: 'none',
              '&:disabled': { bgcolor: alpha(BRAND.primary, 0.4) },
            }}
          >
            {savingPerms ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesPermissions;
