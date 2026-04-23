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
  CalendarToday,
  AdminPanelSettingsOutlined,
  StoreOutlined,
  SecurityOutlined,
  Visibility,
  CheckCircleOutline,
  RemoveCircleOutline,
} from '@mui/icons-material';
import { systemRoleService } from '../../services/system/role';
import { systemPermissionService } from '../../services/system/permission';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary:       '#1976D2',
  primaryHover:  '#1565C0',
  primaryLight:  '#42A5F5',
  primaryBg:     'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

// ─── useCountUp ───────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf   = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    start.current = null;
    const step = (ts: number) => {
      if (start.current === null) start.current = ts;
      const p = Math.min((ts - start.current) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return value;
}

// ─── HeroStat ─────────────────────────────────────────────────────────────────
const HeroStat: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => {
  const count = useCountUp(value);
  return (
    <Box sx={{ flex: '1 1 140px', minWidth: 0, px: 2.5, py: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(144,202,249,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: { xs: '1.35rem', md: '1.6rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>{count}</Typography>
        <Typography sx={{ color: 'rgba(144,202,249,0.65)', fontSize: '0.75rem', mt: 0.25 }}>{label}</Typography>
      </Box>
    </Box>
  );
};


// ─── TabPanel ─────────────────────────────────────────────────────────────────
const TabPanel: React.FC<{ children?: React.ReactNode; index: number; value: number }> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// ─── Dialog header ────────────────────────────────────────────────────────────
const DialogHeader: React.FC<{ title: string; subtitle: string; onClose: () => void }> = ({ title, subtitle, onClose }) => (
  <Box sx={{
    background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 60%, #1565C0 100%)',
    px: 3, pt: 2.5, pb: 2.5, position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.25) 0%, transparent 70%)', pointerEvents: 'none' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.7)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</Typography>
      </Box>
      <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0, alignSelf: 'flex-start', mt: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
        <Close fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────
const RolesPermissions: React.FC = () => {
  const [tabValue,          setTabValue]          = useState(0);
  const [systemRoles,       setSystemRoles]       = useState<any[]>([]);
  const [applicationRoles,  setApplicationRoles]  = useState<any[]>([]);
  const [allPermissions,    setAllPermissions]    = useState<any[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [snackbar,          setSnackbar]          = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // View dialog
  const [viewDialogOpen,    setViewDialogOpen]    = useState(false);
  const [viewingRole,       setViewingRole]       = useState<any | null>(null);

  // Permission dialog (edit = add/remove permissions only)
  const [permDialogOpen,    setPermDialogOpen]    = useState(false);
  const [permRole,          setPermRole]          = useState<any | null>(null);
  const [selectedPerms,     setSelectedPerms]     = useState<string[]>([]);
  const [permSearch,        setPermSearch]        = useState('');
  const [savingPerms,       setSavingPerms]       = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
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
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Resolve permission IDs or names → always return name strings ──────────
  // role.permissions may contain IDs or names depending on the backend response.
  // We normalise to names so matching against allPermissions (by name) always works.
  const resolvePermNames = useCallback((rawPerms: string[]): string[] => {
    return rawPerms.map(raw => {
      // Try matching by id first, then by name
      const found = allPermissions.find(p => p.id === raw || p.name === raw);
      return found ? found.name : raw;
    });
  }, [allPermissions]);

  // ── View role ─────────────────────────────────────────────────────────────
  const handleViewRole = (role: any) => {
    setViewingRole(role);
    setViewDialogOpen(true);
  };

  // ── Manage permissions ────────────────────────────────────────────────────
  const handleEditPermissions = (role: any) => {
    setPermRole(role);
    setSelectedPerms(resolvePermNames(role.permissions || []));
    setPermSearch('');
    setPermDialogOpen(true);
  };

  const handleTogglePerm = (name: string) => {
    setSelectedPerms(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const handleSavePerms = async () => {
    if (!permRole) return;
    setSavingPerms(true);
    try {
      const currentNames = new Set<string>(resolvePermNames(permRole.permissions || []));
      const nextNames    = new Set<string>(selectedPerms);
      const toAdd        = selectedPerms.filter(p => !currentNames.has(p));
      const toRemove     = Array.from(currentNames).filter(p => !nextNames.has(p));
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

  // ── Filtered permissions ──────────────────────────────────────────────────
  const filteredPerms = allPermissions.filter(p =>
    permSearch === '' ||
    p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
    p.description?.toLowerCase().includes(permSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(permSearch.toLowerCase())
  );

  // ── Role card ─────────────────────────────────────────────────────────────
  const renderRoleCard = (role: any) => {
    const permCount = (role.permissions || []).length;
    return (
      <Grid item xs={12} sm={6} lg={4} key={role.id}>
        <Card elevation={0} sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.07)', transform: 'translateY(-1px)' },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`, flexShrink: 0 }}>
                {role.roleType === 0
                  ? <Business sx={{ fontSize: 22, color: BRAND.primary }} />
                  : <Store     sx={{ fontSize: 22, color: BRAND.primary }} />
                }
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {role.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={role.roleType === 0 ? 'System' : 'Application'}
                    size="small"
                    sx={{ fontSize: '0.68rem', height: 18, bgcolor: alpha('#0f172a', 0.06), color: '#334155', border: '1px solid #e2e8f0' }}
                  />
                  {role.isSystem && (
                    <Chip label="Protected" size="small" sx={{ fontSize: '0.68rem', height: 18, bgcolor: alpha('#f43f5e', 0.08), color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }} />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8125rem', flex: 1 }}>
              {role.description || 'No description provided.'}
            </Typography>

            {/* Permission count badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Security sx={{ fontSize: 15, color: BRAND.primary }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                {permCount} permission{permCount !== 1 ? 's' : ''} assigned
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Actions — View + Edit Permissions only */}
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
                  borderColor: '#e2e8f0',
                  color: '#64748b',
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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress sx={{ color: BRAND.primary }} />
        <Typography variant="body2" color="text.secondary">Loading roles...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 45%, #1565C0 100%)',
        px: { xs: 2.5, sm: 4, md: 6 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, md: 5 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: -100, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.22) 0%, transparent 70%)', pointerEvents: 'none' },
        '&::after':  { content: '""', position: 'absolute', bottom: -80, left: '25%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', mb: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(144,202,249,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
            SYSTEM CONTROL CENTER
          </Typography>
          <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Roles &amp; Permissions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
            <CalendarToday sx={{ fontSize: 13, color: 'rgba(144,202,249,0.6)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative' }}>
          <HeroStat icon={<AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />} value={systemRoles.length}      label="System Roles" />
          <HeroStat icon={<StoreOutlined            sx={{ fontSize: 18 }} />} value={applicationRoles.length}  label="App Roles" />
          <HeroStat icon={<SecurityOutlined         sx={{ fontSize: 18 }} />} value={allPermissions.length}    label="Total Permissions" />
        </Box>
      </Box>

      {/* ── Tabs — flush to hero, full width ── */}
      <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            minHeight: 50,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' }, minHeight: 50, color: '#64748b' },
            '& .Mui-selected': { color: BRAND.primary },
            '& .MuiTabs-indicator': { bgcolor: BRAND.primary, height: 3 },
          }}
        >
          <Tab icon={<AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label={`System Roles (${systemRoles.length})`} />
          <Tab icon={<StoreOutlined             sx={{ fontSize: 18 }} />} iconPosition="start" label={`App Roles (${applicationRoles.length})`} />
        </Tabs>
      </Paper>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 1.5, sm: 3, md: 5 }, pb: { xs: 4, sm: 6 } }}>
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
          subtitle={viewingRole?.roleType === 0 ? 'System Role' : 'Application Role'}
          onClose={() => setViewDialogOpen(false)}
        />

        <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
          {viewingRole && (
            <Box>
              {/* Info rows */}
              <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', minWidth: 110 }}>Type</Typography>
                  <Chip
                    label={viewingRole.roleType === 0 ? 'System' : 'Application'}
                    size="small"
                    sx={{ fontSize: '0.72rem', height: 20, bgcolor: BRAND.primaryBg, color: BRAND.primary, border: `1px solid ${BRAND.primaryBorder}` }}
                  />
                  {viewingRole.isSystem && (
                    <Chip label="Protected" size="small" sx={{ fontSize: '0.72rem', height: 20, bgcolor: alpha('#f43f5e', 0.08), color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', minWidth: 110 }}>Description</Typography>
                  <Typography variant="body2" color="text.secondary">{viewingRole.description || 'No description provided.'}</Typography>
                </Box>
              </Box>

              <Divider />

              {/* Permissions list */}
              <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Security sx={{ fontSize: 16, color: BRAND.primary }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Permissions ({(viewingRole.permissions || []).length})
                  </Typography>
                </Box>

                {(viewingRole.permissions || []).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary">No permissions assigned to this role.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(viewingRole.permissions as string[]).map((permName, i) => {
                      const full = allPermissions.find(p => p.id === permName || p.name === permName);
                      return (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}` }}>
                          <CheckCircleOutline sx={{ fontSize: 16, color: BRAND.primary, mt: 0.1, flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>
                              {full?.displayName || full?.name || permName}
                            </Typography>
                            {full?.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                {full.description}
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: BRAND.primary, mt: 0.25, display: 'block' }}>
                              {permName}
                            </Typography>
                          </Box>
                          {full?.category && (
                            <Chip label={full.category} size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', ml: 'auto', flexShrink: 0 }} />
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

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', gap: 1 }}>
          <Button onClick={() => setViewDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
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
      {/* PERMISSIONS DIALOG — add / remove only                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={permDialogOpen}
        onClose={() => setPermDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', height: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogHeader
          title="Edit Permissions"
          subtitle={permRole?.name || ''}
          onClose={() => setPermDialogOpen(false)}
        />

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>

          {/* Search + counts */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              fullWidth
              placeholder="Search permissions..."
              value={permSearch}
              onChange={e => setPermSearch(e.target.value)}
              size="small"
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: BRAND.primary } } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CheckCircleOutline sx={{ fontSize: 15, color: '#10b981' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
                  {selectedPerms.length} assigned
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <RemoveCircleOutline sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>
                  {allPermissions.length - selectedPerms.length} unassigned
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Permission list — Assigned first, then Unassigned */}
          <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 2 } }}>
            {filteredPerms.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="body2" color="text.secondary">No permissions match your search.</Typography>
              </Box>
            ) : (() => {
              const assigned   = filteredPerms.filter(p => selectedPerms.includes(p.name));
              const unassigned = filteredPerms.filter(p => !selectedPerms.includes(p.name));

              const renderRow = (permission: any, isSelected: boolean) => (
                <ListItem key={permission.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleTogglePerm(permission.name)}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isSelected ? BRAND.primaryBorder : '#f1f5f9',
                      bgcolor: isSelected ? BRAND.primaryBg : '#fafafa',
                      '&:hover': { bgcolor: isSelected ? 'rgba(25,118,210,0.12)' : '#f1f5f9', borderColor: isSelected ? BRAND.primaryBorder : '#e2e8f0' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                        sx={{ color: 'rgba(25,118,210,0.3)', '&.Mui-checked': { color: BRAND.primary }, p: 0 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8375rem', color: isSelected ? BRAND.primary : '#0f172a', lineHeight: 1.3 }}>
                            {permission.displayName || permission.name}
                          </Typography>
                          {permission.category && (
                            <Chip label={permission.category} size="small" sx={{ height: 16, fontSize: '0.62rem', bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {permission.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', lineHeight: 1.4 }}>
                              {permission.description}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: isSelected ? BRAND.primary : '#94a3b8', display: 'block', mt: 0.25 }}>
                            {permission.name}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );

              return (
                <>
                  {/* ── Assigned section ── */}
                  {assigned.length > 0 && (
                    <Box sx={{ px: 1.5, pt: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 0.5 }}>
                        <CheckCircleOutline sx={{ fontSize: 14, color: '#10b981' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                          Assigned ({assigned.length})
                        </Typography>
                      </Box>
                      <List disablePadding>
                        {assigned.map(p => renderRow(p, true))}
                      </List>
                    </Box>
                  )}

                  {/* ── Divider between sections ── */}
                  {assigned.length > 0 && unassigned.length > 0 && (
                    <Divider sx={{ mx: 1.5, my: 1.5 }} />
                  )}

                  {/* ── Unassigned section ── */}
                  {unassigned.length > 0 && (
                    <Box sx={{ px: 1.5, pb: 1.5, pt: assigned.length === 0 ? 1.5 : 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 0.5 }}>
                        <RemoveCircleOutline sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                          Unassigned ({unassigned.length})
                        </Typography>
                      </Box>
                      <List disablePadding>
                        {unassigned.map(p => renderRow(p, false))}
                      </List>
                    </Box>
                  )}
                </>
              );
            })()}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', gap: 1 }}>
          <Button onClick={() => setPermDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePerms}
            variant="contained"
            disabled={savingPerms}
            startIcon={savingPerms ? <CircularProgress size={14} color="inherit" /> : <Security sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', bgcolor: BRAND.primary, '&:hover': { bgcolor: BRAND.primaryHover }, boxShadow: 'none', '&:disabled': { bgcolor: alpha(BRAND.primary, 0.4) } }}
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
