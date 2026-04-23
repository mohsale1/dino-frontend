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
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  Divider,
  InputBase,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Visibility,
  Edit,
  Close,
  CalendarToday,
  PaymentOutlined,
  TrendingUpOutlined,
  ReceiptOutlined,
  WarningAmberOutlined,
  Search,
} from '@mui/icons-material';
import { systemBillingService } from '../../services/system/billing';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  primary:  '#1976D2',
  dark0:    '#0f172a',
  dark1:    '#1e293b',
  slate:    '#64748b',
  muted:    '#94a3b8',
  border:   '#e2e8f0',
  surface:  '#ffffff',
  bg:       '#f1f5f9',
  emerald:  '#10b981',
  rose:     '#f43f5e',
  amber:    '#f59e0b',
};

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// HeroStat component — icon beside value
// ---------------------------------------------------------------------------
interface HeroStatProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const HeroStat: React.FC<HeroStatProps> = ({ icon, value, label }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{ flex: '1 1 140px', px: 2.5, py: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(144,202,249,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& svg': { fontSize: 18 } }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: { xs: '1.35rem', md: '1.6rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {animated}
        </Typography>
        <Typography sx={{ color: 'rgba(144,202,249,0.65)', fontSize: '0.75rem', mt: 0.25 }}>{label}</Typography>
      </Box>
    </Box>
  );
};


// ---------------------------------------------------------------------------
// HeroStatCurrency — prefixes animated value with '$', icon beside value
// ---------------------------------------------------------------------------
const HeroStatCurrency: React.FC<HeroStatProps> = ({ icon, value, label }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{ flex: '1 1 140px', px: 2.5, py: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(144,202,249,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& svg': { fontSize: 18 } }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: { xs: '1.35rem', md: '1.6rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
          ${animated}
        </Typography>
        <Typography sx={{ color: 'rgba(144,202,249,0.65)', fontSize: '0.75rem', mt: 0.25 }}>{label}</Typography>
      </Box>
    </Box>
  );
};


// ---------------------------------------------------------------------------
// Gradient dialog header
// ---------------------------------------------------------------------------
interface DialogHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ title, subtitle, onClose }) => (
  <Box
    sx={{
      background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 60%, #1565C0 100%)',
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
        background: 'radial-gradient(circle, rgba(25,118,210,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      },
    }}
  >
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.125rem' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: 'rgba(144,202,249,0.7)', fontSize: '0.8rem', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)', mt: -0.5 }}>
        <Close fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':   return COLORS.emerald;
    case 'past due': return COLORS.rose;
    case 'trial':    return COLORS.amber;
    case 'cancelled':
    case 'inactive': return COLORS.muted;
    default:         return COLORS.muted;
  }
};

const isActiveStatus = (status: string) => status?.toLowerCase() === 'active';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const Billing: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ plan: '', status: '' });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [billingData, statsData] = await Promise.all([
        systemBillingService.getAllBilling(1, 100),
        systemBillingService.getStats(),
      ]);
      setSubscriptions(billingData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleViewDetails = async (workspace: any) => {
    setSelectedWorkspace(workspace);
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    try {
      const details = await systemBillingService.getWorkspaceBilling(workspace.workspace_id);
      setWorkspaceDetails(details);
    } catch (err: any) {
      console.error('Failed to fetch workspace details:', err);
      setWorkspaceDetails(workspace);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditSubscription = (workspace: any) => {
    setSelectedWorkspace(workspace);
    setEditForm({ plan: workspace.subscription_plan || '', status: workspace.subscription_status || '' });
    setEditDialogOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedWorkspace) return;
    try {
      await systemBillingService.updateSubscription(
        selectedWorkspace.workspace_id,
        editForm.plan,
        editForm.status,
      );
      setSnackbar({ open: true, message: 'Subscription updated successfully', severity: 'success' });
      setEditDialogOpen(false);
      setSelectedWorkspace(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update subscription', severity: 'error' });
    }
  };

  // Filter function
  const filterSubscriptions = (subs: any[]) => {
    return subs.filter(s => {
      const matchesSearch = !searchQuery || s.workspace_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = !planFilter || s.subscription_plan?.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = !statusFilter || s.subscription_status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesPlan && matchesStatus;
    });
  };

  const hasActiveFilters = !!(searchQuery || planFilter || statusFilter);
  const filteredSubscriptions = filterSubscriptions(subscriptions);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
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
      {/* Hero                                                                */}
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
            background: 'radial-gradient(circle, rgba(25,118,210,0.22) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)',
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
          {/* Overline */}
          <Typography
            variant="overline"
            sx={{ color: 'rgba(144,202,249,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}
          >
            SYSTEM CONTROL CENTER
          </Typography>

          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                }}
              >
                Billing Management
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                <CalendarToday sx={{ fontSize: 13, color: 'rgba(144,202,249,0.6)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hero stats */}
          {stats && (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap', mt: 3, position: 'relative' }}>
              <HeroStat
                icon={<PaymentOutlined sx={{ fontSize: 18 }} />}
                value={stats?.active_subscriptions || 0}
                label="Active Subscriptions"
              />
              <HeroStatCurrency
                icon={<TrendingUpOutlined sx={{ fontSize: 18 }} />}
                value={stats?.monthly_revenue || 0}
                label="Monthly Revenue"
              />
              <HeroStat
                icon={<ReceiptOutlined sx={{ fontSize: 18 }} />}
                value={stats?.total_invoices || 0}
                label="Total Invoices"
              />
              <HeroStat
                icon={<WarningAmberOutlined sx={{ fontSize: 18 }} />}
                value={stats?.past_due || 0}
                label="Past Due"
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Content area                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ pt: { xs: 0, sm: 0 }, pb: 6 }}>

        {/* Filter toolbar */}
        <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Search */}
            <Box sx={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, px: 1.5, py: 0.75 }}>
              <Search sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
              <InputBase
                placeholder="Search workspace..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem' }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, color: '#94a3b8' }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
            {/* Plan filter */}
            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 130 } }}>
              <Select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="">All Plans</MenuItem>
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Pro">Pro</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 130 } }}>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Trial">Trial</MenuItem>
                <MenuItem value="Past Due">Past Due</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            {/* Clear */}
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={() => { setSearchQuery(''); setPlanFilter(''); setStatusFilter(''); }}
                sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 2, px: 1.5 }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Paper>

        {/* Subscriptions table */}
        {filteredSubscriptions.length === 0 ? (
          <Box sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 3,
                bgcolor: COLORS.surface,
                mt: 3,
              }}
            >
              <PaymentOutlined sx={{ fontSize: 48, color: COLORS.muted, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.slate, mb: 1 }}>
                No Subscriptions Found
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.muted }}>
                {hasActiveFilters
                  ? 'Try adjusting your filters.'
                  : 'There are no billing records in the system yet.'}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 0, border: 'none', bgcolor: COLORS.surface, overflowX: 'auto' }}
            >
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {/* Workspace */}
                    <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Workspace
                    </TableCell>
                    {/* Plan */}
                    <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Plan
                    </TableCell>
                    {/* Status */}
                    <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Status
                    </TableCell>
                    {/* Amount — hidden on xs */}
                    <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: { xs: 'none', md: 'table-cell' } }}>
                      Amount
                    </TableCell>
                    {/* Next Billing — hidden on xs */}
                    <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: { xs: 'none', sm: 'table-cell' } }}>
                      Next Billing
                    </TableCell>
                    {/* Actions */}
                    <TableCell align="right" sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow
                      key={sub.workspace_id}
                      sx={{
                        bgcolor: COLORS.surface,
                        borderBottom: `1px solid ${COLORS.border}`,
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { bgcolor: '#fafafa' },
                      }}
                    >
                      {/* Workspace */}
                      <TableCell sx={{ maxWidth: { xs: 140, sm: 'none' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.dark0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.workspace_name || sub.workspace_id}
                        </Typography>
                      </TableCell>

                      {/* Plan — plain text, no chip */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.dark0 }}>
                          {sub.subscription_plan || 'Free'}
                        </Typography>
                      </TableCell>

                      {/* Status — dot + text */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(sub.subscription_status),
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: isActiveStatus(sub.subscription_status) ? COLORS.dark0 : COLORS.muted,
                              fontSize: '0.8125rem',
                            }}
                          >
                            {sub.subscription_status || 'Active'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Amount — hidden on xs */}
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.dark0 }}>
                          ${sub.amount || 0}/{sub.billing_cycle === 'Yearly' ? 'yr' : 'mo'}
                        </Typography>
                      </TableCell>

                      {/* Next Billing — hidden on xs */}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ color: COLORS.slate }}>
                          {sub.next_billing_date
                            ? new Date(sub.next_billing_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(sub)}
                            sx={{
                              color: COLORS.muted,
                              '&:hover': { color: COLORS.dark0 },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Subscription">
                          <IconButton
                            size="small"
                            onClick={() => handleEditSubscription(sub)}
                            sx={{
                              color: COLORS.muted,
                              '&:hover': { color: COLORS.dark0 },
                            }}
                          >
                            <Edit fontSize="small" />
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
      {/* Details Dialog                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden', maxHeight: fullScreen ? '100vh' : '85vh', display: 'flex', flexDirection: 'column' } }}
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
                {selectedWorkspace?.workspace_name || selectedWorkspace?.workspace_id || 'Billing Details'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.7)', display: 'block' }}>Billing Details</Typography>
            </Box>
            <IconButton onClick={() => setDetailsDialogOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0, alignSelf: 'flex-start', mt: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
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
              {/* Status chips */}
              <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {workspaceDetails.subscription_plan && (
                  <Chip label={workspaceDetails.subscription_plan} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }} />
                )}
                {workspaceDetails.subscription_status && (
                  <Chip label={workspaceDetails.subscription_status} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24,
                      bgcolor: alpha(getStatusColor(workspaceDetails.subscription_status), 0.1),
                      color: getStatusColor(workspaceDetails.subscription_status),
                      border: `1px solid ${alpha(getStatusColor(workspaceDetails.subscription_status), 0.3)}` }} />
                )}
                {workspaceDetails.billing_cycle && (
                  <Chip label={workspaceDetails.billing_cycle} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: 'rgba(25,118,210,0.08)', color: '#1976D2', border: '1px solid rgba(25,118,210,0.2)' }} />
                )}
              </Box>

              <Divider />

              {/* Subscription section */}
              <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PaymentOutlined sx={{ fontSize: 16, color: '#1976D2' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Subscription</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Plan',    value: workspaceDetails.subscription_plan   || 'Free' },
                    { label: 'Status',  value: workspaceDetails.subscription_status || 'Active' },
                    { label: 'Cycle',   value: workspaceDetails.billing_cycle        || 'Monthly' },
                    { label: 'Amount',  value: `$${workspaceDetails.amount || 0} ${workspaceDetails.currency || 'USD'}` },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ minWidth: 72, flexShrink: 0 }}><Typography variant="caption" color="text.secondary">{label}</Typography></Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider />

              {/* Billing contact section */}
              <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ReceiptOutlined sx={{ fontSize: 16, color: '#1976D2' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Billing Contact</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Email',   value: workspaceDetails.billing_email   || '—' },
                    { label: 'Address', value: workspaceDetails.billing_address || '—' },
                    { label: 'Method',  value: workspaceDetails.payment_method  || 'Not Set' },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ minWidth: 72, flexShrink: 0, pt: 0.1 }}><Typography variant="caption" color="text.secondary">{label}</Typography></Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider />

              {/* Timeline */}
              <Box sx={{ px: 3, pt: 2.5, pb: 3, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: 'rgba(25,118,210,0.08)', border: '1px solid rgba(25,118,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CalendarToday sx={{ fontSize: 14, color: '#1976D2' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Next Billing</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 1.25, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>Next Billing Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                    {workspaceDetails.next_billing_date
                      ? new Date(workspaceDetails.next_billing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No details available.</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', flexShrink: 0, gap: 1 }}>
          <Button
            onClick={() => { setDetailsDialogOpen(false); if (selectedWorkspace) handleEditSubscription(selectedWorkspace); }}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: 'rgba(25,118,210,0.3)', color: '#1976D2', borderRadius: 2, '&:hover': { bgcolor: 'rgba(25,118,210,0.04)' } }}
          >
            Edit Subscription
          </Button>
          <Button
            onClick={() => setDetailsDialogOpen(false)}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1976D2', '&:hover': { bgcolor: '#1565C0' }, borderRadius: 2, boxShadow: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Edit Subscription Dialog                                            */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden' } }}
      >
        <DialogHeader
          title="Edit Subscription"
          subtitle={selectedWorkspace?.workspace_name || selectedWorkspace?.workspace_id}
          onClose={() => setEditDialogOpen(false)}
        />
        <DialogContent sx={{ pt: { xs: 2, sm: 3 }, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: COLORS.slate, fontWeight: 600, mb: 0.75, display: 'block' }}>
                Subscription Plan
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="Free">Free</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                  <MenuItem value="Pro">Pro</MenuItem>
                  <MenuItem value="Enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: COLORS.slate, fontWeight: 600, mb: 0.75, display: 'block' }}>
                Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Trial">Trial</MenuItem>
                  <MenuItem value="Past Due">Past Due</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ textTransform: 'none', color: COLORS.slate }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSubscription}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#1976D2',
              borderRadius: 1.5,
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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

export default Billing;
