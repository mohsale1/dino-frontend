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
  CheckCircleOutline,
  AttachMoneyOutlined,
  TrendingUpOutlined,
  BusinessOutlined,
  Visibility,
  Search,
} from '@mui/icons-material';
import { systemWorkspaceService } from '../../services/system/workspace';

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = React.useState(0);
  const raf = useRef<number>(0);
  React.useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------
interface HeroStatProps { label: string; value: number; icon: React.ReactElement; }
const HeroStat: React.FC<HeroStatProps> = ({ label, value, icon }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{
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
    }}>
      <Box sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        flexShrink: 0,
        bgcolor: alpha('#ffffff', 0.1),
        border: `1px solid ${alpha('#ffffff', 0.15)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(144,202,249,0.9)',
        '& svg': { fontSize: 18 },
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{
          fontWeight: 700,
          color: '#ffffff',
          fontSize: { xs: '1.35rem', md: '1.6rem' },
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {animated}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.65)', fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const Workspaces: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await systemWorkspaceService.getWorkspaces();
      setWorkspaces(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch workspaces:', err);
      const msg = err.message || 'Failed to load workspaces';
      setError(msg);
      setSnackbarMessage(msg);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
      case 'pro':
        return '#f59e0b';
      case 'standard':
      case 'basic':
        return '#3b82f6';
      case 'enterprise':
        return '#1976D2';
      default:
        return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'inactive':
      case 'suspended':
        return '#ef4444';
      case 'trial':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const handleViewDetails = async (workspace: any) => {
    setSelectedWorkspace(workspace);
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    try {
      const details = await systemWorkspaceService.getWorkspace(workspace.id);
      setWorkspaceDetails(details);
    } catch (err: any) {
      console.error('Failed to fetch workspace details:', err);
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

  const filterWorkspaces = (list: any[]) => {
    return list.filter(w => {
      const matchesSearch = !searchQuery || w.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? w.isActive : !w.isActive);
      const matchesPlan = !planFilter || w.subscriptionPlan?.toLowerCase() === planFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPlan;
    });
  };

  const hasActiveFilters = searchQuery || statusFilter || planFilter;
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPlanFilter('');
  };

  // Derived stat values
  const totalWorkspaces = workspaces.length;
  const activeWorkspaces = workspaces.filter(w => w.isActive).length;
  const activeSubscriptions = workspaces.filter(w => w.subscriptionStatus?.toLowerCase() === 'active').length;
  const premiumPlans = workspaces.filter(w =>
    w.subscriptionPlan?.toLowerCase() === 'premium' || w.subscriptionPlan?.toLowerCase() === 'pro'
  ).length;

  const filteredWorkspaces = filterWorkspaces(workspaces);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
      </Box>
    );
  }

  if (error && workspaces.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 45%, #1565C0 100%)',
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
            background: `radial-gradient(circle, ${alpha('#1976D2', 0.22)} 0%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${alpha('#42A5F5', 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${alpha('#ffffff', 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#ffffff', 0.03)} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative' }}>
          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'rgba(144,202,249,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
                SYSTEM CONTROL CENTER
              </Typography>
              <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                Workspaces
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarToday sx={{ fontSize: 13, color: 'rgba(144,202,249,0.6)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hero Stats */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <HeroStat label="Total Workspaces" value={totalWorkspaces} icon={<BusinessOutlined />} />
            <HeroStat label="Active" value={activeWorkspaces} icon={<CheckCircleOutline />} />
            <HeroStat label="Active Subscriptions" value={activeSubscriptions} icon={<AttachMoneyOutlined />} />
            <HeroStat label="Premium Plans" value={premiumPlans} icon={<TrendingUpOutlined />} />
          </Box>
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Content Area                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ pb: { xs: 4, sm: 6 } }}>

        {/* Filter Toolbar */}
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
          <Box sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

            {/* Search */}
            <Box sx={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
            }}>
              <Search sx={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }} />
              <InputBase
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a', '& input::placeholder': { color: '#94a3b8' } }}
              />
            </Box>

            {/* Status filter */}
            <FormControl size="small">
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{
                  minWidth: { xs: 110, sm: 130 },
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Plan filter */}
            <FormControl size="small">
              <Select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                displayEmpty
                sx={{
                  minWidth: { xs: 110, sm: 130 },
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                }}
              >
                <MenuItem value="">All Plans</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="pro">Pro</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>

            {/* Clear button */}
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                size="small"
                sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600, flexShrink: 0 }}
              >
                Clear
              </Button>
            )}

            {/* Result count */}
            <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                {filteredWorkspaces.length} of {workspaces.length} workspaces
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Table */}
        {filteredWorkspaces.length === 0 ? (
          <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                mx: 'auto',
                maxWidth: 480,
              }}
            >
              <Business sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                No Workspaces Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasActiveFilters
                  ? 'No workspaces match your current filters. Try adjusting or clearing them.'
                  : 'There are no workspaces in the system yet.'}
              </Typography>
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(25,118,210,0.3)', color: '#1976D2', borderRadius: 2 }}
                >
                  Clear Filters
                </Button>
              )}
            </Paper>
          </Box>
        ) : (
          <Box sx={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 0, border: 'none', bgcolor: '#ffffff', overflowX: 'auto' }}
            >
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {[
                      { label: 'Workspace', display: undefined },
                      { label: 'Plan', display: undefined },
                      { label: 'Status', display: undefined },
                      { label: 'Subscription', display: { xs: 'none', sm: 'table-cell' } },
                      { label: 'Created', display: { xs: 'none', md: 'table-cell' } },
                      { label: 'Actions', display: undefined },
                    ].map(({ label, display }) => (
                      <TableCell
                        key={label}
                        align={label === 'Actions' ? 'right' : 'left'}
                        sx={{
                          fontWeight: 600,
                          color: '#64748b',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          py: 1.5,
                          px: label === 'Workspace' ? 3 : 2,
                          whiteSpace: 'nowrap',
                          ...(display ? { display } : {}),
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWorkspaces.map((workspace, idx) => (
                    <TableRow
                      key={workspace.id}
                      sx={{
                        bgcolor: '#ffffff',
                        borderBottom: idx < filteredWorkspaces.length - 1 ? '1px solid #e2e8f0' : 'none',
                        '&:last-child td': { border: 0 },
                        '&:hover': { bgcolor: '#fafafa' },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* Workspace */}
                      <TableCell sx={{ px: 3, py: 2, maxWidth: { xs: 160, sm: 260 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(25,118,210,0.08)',
                            border: '1px solid rgba(25,118,210,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Business sx={{ fontSize: 18, color: '#1976D2' }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                              {workspace.name}
                            </Typography>
                            {workspace.description && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#94a3b8',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: { xs: 120, sm: 200 },
                                }}
                              >
                                {workspace.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Plan */}
                      <TableCell sx={{ px: 2, py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: getPlanColor(workspace.subscriptionPlan),
                          }}
                        >
                          {workspace.subscriptionPlan || 'Free'}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ px: 2, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: workspace.isActive ? '#10b981' : '#94a3b8',
                            flexShrink: 0,
                          }} />
                          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                            {workspace.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Subscription */}
                      <TableCell sx={{ px: 2, py: 2, display: { xs: 'none', sm: 'table-cell' } }}>
                        {workspace.subscriptionStatus ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(workspace.subscriptionStatus),
                              flexShrink: 0,
                            }} />
                            <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, textTransform: 'capitalize' }}>
                              {workspace.subscriptionStatus}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Created */}
                      <TableCell sx={{ px: 2, py: 2, whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ color: '#374151' }}>
                          {workspace.createdAt
                            ? new Date(workspace.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ px: 2, py: 2 }} align="right">
                        <Tooltip title="View Details" placement="left">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(workspace)}
                            sx={{
                              color: '#64748b',
                              '&:hover': { bgcolor: 'rgba(25,118,210,0.08)', color: '#1976D2' },
                            }}
                          >
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

      {/* ------------------------------------------------------------------ */}
      {/* Workspace Details Dialog                                             */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 60%, #1565C0 100%)',
          px: 3, pt: 2.5, pb: 2.5, position: 'relative', overflow: 'hidden', flexShrink: 0,
          '&::before': { content: '""', position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.25) 0%, transparent 70%)', pointerEvents: 'none' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedWorkspace?.name || 'Workspace Details'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.7)', display: 'block' }}>
                Workspace Details
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDetails} size="small" sx={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0, alignSelf: 'flex-start', mt: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#1976D2' }} />
            </Box>
          ) : workspaceDetails ? (
            <Box>

              {/* ── Overview chips ── */}
              <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={workspaceDetails.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    fontWeight: 600, fontSize: '0.72rem', height: 24,
                    bgcolor: alpha(getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), 0.1),
                    color: getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'),
                    border: `1px solid ${alpha(getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), 0.3)}`,
                  }}
                />
                {workspaceDetails.subscriptionPlan && (
                  <Chip
                    label={workspaceDetails.subscriptionPlan}
                    size="small"
                    sx={{
                      fontWeight: 600, fontSize: '0.72rem', height: 24,
                      bgcolor: alpha(getPlanColor(workspaceDetails.subscriptionPlan), 0.1),
                      color: getPlanColor(workspaceDetails.subscriptionPlan),
                      border: `1px solid ${alpha(getPlanColor(workspaceDetails.subscriptionPlan), 0.3)}`,
                    }}
                  />
                )}
                {workspaceDetails.subscriptionStatus && (
                  <Chip
                    label={workspaceDetails.subscriptionStatus}
                    size="small"
                    sx={{
                      fontWeight: 600, fontSize: '0.72rem', height: 24,
                      bgcolor: alpha(getStatusColor(workspaceDetails.subscriptionStatus), 0.1),
                      color: getStatusColor(workspaceDetails.subscriptionStatus),
                      border: `1px solid ${alpha(getStatusColor(workspaceDetails.subscriptionStatus), 0.3)}`,
                    }}
                  />
                )}
                {workspaceDetails.orderType !== undefined && (
                  <Chip
                    label={workspaceDetails.orderType === 0 ? 'Online' : 'Manual'}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: 'rgba(25,118,210,0.08)', color: '#1976D2', border: '1px solid rgba(25,118,210,0.2)' }}
                  />
                )}
              </Box>

              {workspaceDetails.description && (
                <Box sx={{ px: 3, pb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {workspaceDetails.description}
                  </Typography>
                </Box>
              )}

              <Divider />

              {/* ── Owner ── */}
              <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Person sx={{ fontSize: 16, color: '#1976D2' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Owner</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Name',  value: workspaceDetails.ownerName  || '—' },
                    { label: 'Email', value: workspaceDetails.ownerEmail || '—' },
                    ...(workspaceDetails.ownerPhone ? [{ label: 'Phone', value: workspaceDetails.ownerPhone }] : []),
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ minWidth: 72, flexShrink: 0 }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ── Contact & Location ── */}
              {(workspaceDetails.address || workspaceDetails.city || workspaceDetails.phone || workspaceDetails.email) && (
                <>
                  <Divider />
                  <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#1976D2' }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Contact & Location</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {workspaceDetails.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Email</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{workspaceDetails.email}</Typography>
                        </Box>
                      )}
                      {workspaceDetails.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Phone</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{workspaceDetails.phone}</Typography>
                        </Box>
                      )}
                      {(workspaceDetails.address || workspaceDetails.city) && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0, pt: 0.1 }}><Typography variant="caption" color="text.secondary">Address</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {[workspaceDetails.address, workspaceDetails.city, workspaceDetails.state, workspaceDetails.postalCode, workspaceDetails.country].filter(Boolean).join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* ── Billing ── */}
              {(workspaceDetails.billingEmail || workspaceDetails.billingAddress) && (
                <>
                  <Divider />
                  <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AttachMoneyOutlined sx={{ fontSize: 16, color: '#1976D2' }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Billing</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {workspaceDetails.billingEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Email</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{workspaceDetails.billingEmail}</Typography>
                        </Box>
                      )}
                      {workspaceDetails.billingAddress && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ minWidth: 72, flexShrink: 0, pt: 0.1 }}><Typography variant="caption" color="text.secondary">Address</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{workspaceDetails.billingAddress}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* ── Timestamps ── */}
              <Divider />
              <Box sx={{ px: 3, pt: 2.5, pb: 3, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CalendarToday sx={{ fontSize: 14, color: '#1976D2' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Timeline</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>Created</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                        {workspaceDetails.createdAt ? new Date(workspaceDetails.createdAt).toLocaleString() : '—'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>Last Updated</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                        {workspaceDetails.updatedAt ? new Date(workspaceDetails.updatedAt).toLocaleString() : '—'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No details available.</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <Button
            onClick={handleCloseDetails}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1976D2', '&:hover': { bgcolor: '#1565C0' }, borderRadius: 2, boxShadow: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Workspaces;