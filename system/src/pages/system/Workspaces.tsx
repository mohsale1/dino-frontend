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
  alpha,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputBase,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Business,
  Close,
  Person,
  LocationOn,
  CalendarToday,
  AttachMoneyOutlined,
  Visibility,
  Search,
  CheckCircleOutline,
  CancelOutlined,
  WorkspacesOutlined,
  GroupOutlined,
} from '@mui/icons-material';
import { systemWorkspaceService } from '../../services/system/workspace';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#00A6CA',
  hover:   '#005F8D',
  border:  '#e0e0e0',
  bg:      '#f8fafc',
  surface: '#ffffff',
  text:    '#1C1C1E',
  sub:     '#666666',
  muted:   '#999999',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getPlanColor = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'premium': case 'pro':        return '#FF871F';
    case 'standard': case 'basic':     return '#00A6CA';
    case 'enterprise':                 return '#005F8D';
    default:                           return '#999999';
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':                     return '#10b981';
    case 'inactive': case 'suspended': return '#ef4444';
    case 'trial':                      return '#f59e0b';
    default:                           return '#999999';
  }
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; value: number | string; label: string }> = ({ icon, value, label }) => (
  <Box sx={{ flex: '1 1 140px', bgcolor: C.bg, border: `1px solid ${C.border}`, borderRadius: 2, px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(0,166,202,0.10)', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& svg': { fontSize: 18 } }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: C.text, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: C.sub, mt: 0.25 }}>{label}</Typography>
    </Box>
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────
const Workspaces: React.FC = () => {
  const [workspaces,      setWorkspaces]      = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [snackbar,        setSnackbar]        = useState({ open: false, message: '', severity: 'error' as 'success' | 'error' });

  // Filters
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter,   setPlanFilter]   = useState('');

  // Dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [workspaceDetails,  setWorkspaceDetails]  = useState<any | null>(null);
  const [detailsLoading,    setDetailsLoading]    = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await systemWorkspaceService.getWorkspaces();
      setWorkspaces(data);
      setError(null);
    } catch (err: any) {
      const msg = err.message || 'Failed to load workspaces';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total    = workspaces.length;
  const active   = workspaces.filter(w => w.isActive).length;
  const inactive = total - active;
  const plans    = new Set(workspaces.map(w => w.subscriptionPlan).filter(Boolean)).size;

  // ── Filters ────────────────────────────────────────────────────────────────
  const filtered = workspaces.filter(w => {
    const matchSearch = !searchQuery || w.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === 'active' ? w.isActive : !w.isActive);
    const matchPlan   = !planFilter   || w.subscriptionPlan?.toLowerCase() === planFilter.toLowerCase();
    return matchSearch && matchStatus && matchPlan;
  });

  const hasFilters = !!(searchQuery || statusFilter || planFilter);
  const clearFilters = () => { setSearchQuery(''); setStatusFilter(''); setPlanFilter(''); };

  // ── View details ───────────────────────────────────────────────────────────
  const handleViewDetails = async (workspace: any) => {
    setSelectedWorkspace(workspace);
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    try {
      const details = await systemWorkspaceService.getWorkspace(workspace.id);
      setWorkspaceDetails(details);
    } catch {
      setWorkspaceDetails(workspace);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedWorkspace(null);
    setWorkspaceDetails(null);
  };


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: C.bg }}>

      {/* ── Page Header ── */}
      <Box sx={{
        bgcolor: C.surface,
        px: { xs: 3, sm: 4, md: 5 },
        pt: 3, pb: 3,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>
            Workspaces
          </Typography>
          <Typography sx={{ fontSize: '13px', color: C.sub, mt: 0.5 }}>
            Manage platform workspaces and subscriptions
          </Typography>
        </Box>
        <Box sx={{ bgcolor: '#f2f2f2', color: C.sub, fontSize: '12px', borderRadius: 2, px: 1.5, py: 0.5 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', px: { xs: 3, sm: 4, md: 5 }, py: 2.5, bgcolor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <StatCard icon={<WorkspacesOutlined />} value={total}    label="Total Workspaces" />
        <StatCard icon={<CheckCircleOutline />} value={active}   label="Active" />
        <StatCard icon={<CancelOutlined />}     value={inactive} label="Inactive" />
        <StatCard icon={<GroupOutlined />}      value={plans}    label="Unique Plans" />
      </Box>

      {/* ── Content ── */}
      <Box sx={{ pb: 6 }}>

        {/* Filter toolbar — identical structure to Billing */}
        <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderBottom: `1px solid ${C.border}`, bgcolor: C.surface }}>
          <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

            {/* Search */}
            <Box sx={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: C.bg, border: `1px solid ${C.border}`, borderRadius: 2, px: 1.5, py: 0.75 }}>
              <Search sx={{ fontSize: 17, color: C.muted, flexShrink: 0 }} />
              <InputBase
                placeholder="Search workspace..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem' }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, color: C.muted }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 130 } }}>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: C.bg }}>
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Plan filter */}
            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 130 } }}>
              <Select value={planFilter} onChange={e => setPlanFilter(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: C.bg }}>
                <MenuItem value="">All Plans</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="pro">Pro</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>

            {/* Clear */}
            {hasFilters && (
              <Button size="small" onClick={clearFilters} sx={{ textTransform: 'none', color: C.sub, fontWeight: 600, fontSize: '0.8125rem', borderRadius: 2, px: 1.5 }}>
                Clear
              </Button>
            )}
          </Box>
        </Paper>

        {/* Table / Empty state */}
        {filtered.length === 0 ? (
          <Box sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: `1px solid ${C.border}`, borderRadius: 3, bgcolor: C.surface, mt: 3 }}>
              <Business sx={{ fontSize: 48, color: C.muted, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: C.sub, mb: 1 }}>
                No Workspaces Found
              </Typography>
              <Typography variant="body2" sx={{ color: C.muted }}>
                {hasFilters ? 'Try adjusting your filters.' : 'There are no workspaces in the system yet.'}
              </Typography>
              {hasFilters && (
                <Button onClick={clearFilters} variant="outlined" size="small"
                  sx={{ mt: 2, textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'rgba(0,166,202,0.3)', color: C.primary, '&:hover': { borderColor: C.primary, bgcolor: 'rgba(0,166,202,0.04)' } }}>
                  Clear Filters
                </Button>
              )}
            </Paper>
          </Box>
        ) : (
          <Box sx={{ borderBottom: `1px solid ${C.border}` }}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: 'none', bgcolor: C.surface, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: C.bg, borderBottom: `2px solid ${C.border}` }}>
                    {[
                      { label: 'Workspace',    hide: false },
                      { label: 'Plan',         hide: false },
                      { label: 'Status',       hide: false },
                      { label: 'Subscription', hide: false, xs: true },
                      { label: 'Created',      hide: false, md: true },
                      { label: 'Actions',      hide: false, right: true },
                    ].map(({ label, xs, md, right }) => (
                      <TableCell key={label} align={right ? 'right' : 'left'}
                        sx={{
                          fontWeight: 600, color: C.sub, fontSize: '0.75rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          ...(xs ? { display: { xs: 'none', sm: 'table-cell' } } : {}),
                          ...(md ? { display: { xs: 'none', md: 'table-cell' } } : {}),
                        }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(w => (
                    <TableRow key={w.id} sx={{ bgcolor: C.surface, borderBottom: `1px solid ${C.border}`, '&:last-child': { borderBottom: 'none' }, '&:hover': { bgcolor: '#fafafa' } }}>

                      {/* Workspace */}
                      <TableCell sx={{ maxWidth: { xs: 160, sm: 260 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Business sx={{ fontSize: 18, color: C.primary }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: C.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {w.name}
                            </Typography>
                            {w.description && (
                              <Typography variant="caption" sx={{ color: C.muted, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: 120, sm: 200 } }}>
                                {w.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Plan */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: getPlanColor(w.subscriptionPlan) }}>
                          {w.subscriptionPlan || 'Free'}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: w.isActive ? '#10b981' : C.muted, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: w.isActive ? C.text : C.muted, fontSize: '0.8125rem' }}>
                            {w.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Subscription */}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {w.subscriptionStatus ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getStatusColor(w.subscriptionStatus), flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: C.text, fontSize: '0.8125rem', textTransform: 'capitalize' }}>
                              {w.subscriptionStatus}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: C.muted }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Created */}
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ color: C.sub }}>
                          {w.createdAt ? new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(w)} sx={{ color: C.muted, '&:hover': { color: C.text } }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* ── Details Dialog ── */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: C.surface, px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, color: C.text, fontSize: '1rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedWorkspace?.name || 'Workspace Details'}
            </Typography>
            <Typography variant="caption" sx={{ color: C.sub, fontSize: '0.8125rem', display: 'block' }}>
              Workspace Details
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetails} size="small" sx={{ color: 'rgba(0,0,0,0.45)', flexShrink: 0, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: C.primary }} />
            </Box>
          ) : workspaceDetails ? (
            <Box>
              {/* Status chips */}
              <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={workspaceDetails.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: alpha(getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), 0.1), color: getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), border: `1px solid ${alpha(getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), 0.3)}` }}
                />
                {workspaceDetails.subscriptionPlan && (
                  <Chip label={workspaceDetails.subscriptionPlan} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: alpha(getPlanColor(workspaceDetails.subscriptionPlan), 0.1), color: getPlanColor(workspaceDetails.subscriptionPlan), border: `1px solid ${alpha(getPlanColor(workspaceDetails.subscriptionPlan), 0.3)}` }}
                  />
                )}
                {workspaceDetails.subscriptionStatus && (
                  <Chip label={workspaceDetails.subscriptionStatus} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: alpha(getStatusColor(workspaceDetails.subscriptionStatus), 0.1), color: getStatusColor(workspaceDetails.subscriptionStatus), border: `1px solid ${alpha(getStatusColor(workspaceDetails.subscriptionStatus), 0.3)}` }}
                  />
                )}
                {workspaceDetails.orderType !== undefined && (
                  <Chip label={workspaceDetails.orderType === 0 ? 'Online' : 'Manual'} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: 'rgba(0,166,202,0.08)', color: C.primary, border: '1px solid rgba(0,166,202,0.2)' }}
                  />
                )}
              </Box>

              {workspaceDetails.description && (
                <Box sx={{ px: 3, pb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{workspaceDetails.description}</Typography>
                </Box>
              )}

              <Divider />

              {/* Owner */}
              <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Person sx={{ fontSize: 16, color: C.primary }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.text }}>Owner</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Name',  value: workspaceDetails.ownerName  || '—' },
                    { label: 'Email', value: workspaceDetails.ownerEmail || '—' },
                    ...(workspaceDetails.ownerPhone ? [{ label: 'Phone', value: workspaceDetails.ownerPhone }] : []),
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                      <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">{label}</Typography></Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, wordBreak: 'break-all' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Contact & Location */}
              {(workspaceDetails.address || workspaceDetails.city || workspaceDetails.phone || workspaceDetails.email) && (
                <>
                  <Divider />
                  <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LocationOn sx={{ fontSize: 16, color: C.primary }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.text }}>Contact &amp; Location</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {workspaceDetails.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Email</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, wordBreak: 'break-all' }}>{workspaceDetails.email}</Typography>
                        </Box>
                      )}
                      {workspaceDetails.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Phone</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>{workspaceDetails.phone}</Typography>
                        </Box>
                      )}
                      {(workspaceDetails.address || workspaceDetails.city) && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0, pt: 0.1 }}><Typography variant="caption" color="text.secondary">Address</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>
                            {[workspaceDetails.address, workspaceDetails.city, workspaceDetails.state, workspaceDetails.postalCode, workspaceDetails.country].filter(Boolean).join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* Billing */}
              {(workspaceDetails.billingEmail || workspaceDetails.billingAddress) && (
                <>
                  <Divider />
                  <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AttachMoneyOutlined sx={{ fontSize: 16, color: C.primary }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.text }}>Billing</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {workspaceDetails.billingEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Email</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, wordBreak: 'break-all' }}>{workspaceDetails.billingEmail}</Typography>
                        </Box>
                      )}
                      {workspaceDetails.billingAddress && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0, pt: 0.1 }}><Typography variant="caption" color="text.secondary">Address</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>{workspaceDetails.billingAddress}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* Timeline */}
              <Divider />
              <Box sx={{ px: 3, pt: 2.5, pb: 3, bgcolor: C.bg }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(0,166,202,0.08)', border: '1px solid rgba(0,166,202,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CalendarToday sx={{ fontSize: 14, color: C.primary }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.text }}>Timeline</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Created',      value: workspaceDetails.createdAt },
                    { label: 'Last Updated', value: workspaceDetails.updatedAt },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ px: 1.5, py: 1.25, borderRadius: 2, bgcolor: C.surface, border: `1px solid ${C.border}` }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, fontSize: '0.8rem' }}>
                          {value ? new Date(value).toLocaleString() : '—'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No details available.</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <Button onClick={handleCloseDetails} variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: C.primary, '&:hover': { bgcolor: C.hover }, borderRadius: 2, boxShadow: 'none' }}>
            Close
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

export default Workspaces;