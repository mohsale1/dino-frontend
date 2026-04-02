import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  LocalOffer as CouponIcon,
  CalendarToday,
  LocalOffer as TotalIcon,
  CheckCircle as ActiveIcon,
  Repeat as RedemptionsIcon,
  Savings as SavingsIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import CouponCard from './Coupons/CouponCard';
import CouponFormDialog from './Coupons/CouponFormDialog';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { couponService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import { useAuth } from '../../contexts/common/Auth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_COLORS } from '../../constants/app';
import type { Coupon } from '../../features/coupons/types';

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
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------

const HeroStat: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}> = ({ label, value, icon, rc }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alpha(rc.chipText, 0.9),
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: rc.statValue,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {animated}
          </Typography>
          <Typography sx={{ color: rc.statLabel, fontSize: '0.72rem', fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Coupons: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const { canCreateCoupons } = usePermissions();

  // Role detection
  const { userPermissions } = useAuth();
  const rawRole = (userPermissions?.role?.name || '').toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' = rawRole.includes('owner') || rawRole.includes('super')
    ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin')
    ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const data = await couponService.getCoupons(workspaceId);
      setCoupons(data);
    } catch (err: any) {
      console.error('Failed to fetch coupons:', err);
      setError(err.message || 'Failed to load coupons');
    }
  }, [workspaceId]);

  useEffect(() => {
    const loadData = async () => {
      if (!workspaceId) { setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        await fetchCoupons();
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [workspaceId, fetchCoupons]);

  const stats = {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter(c => c.isAvailable).length,
    totalRedemptions: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    totalSavings: 0,
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setOpenDialog(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (data: any) => {
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, data);
        setSnackbar({ open: true, message: 'Coupon updated successfully', severity: 'success' });
      } else {
        await couponService.createCoupon({ ...data, workspaceId });
        setSnackbar({ open: true, message: 'Coupon created successfully', severity: 'success' });
      }
      handleCloseDialog();
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save coupon', severity: 'error' });
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (coupon) { setDeletingCoupon(coupon); setDeleteDialogOpen(true); }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await couponService.deleteCoupon(deletingCoupon.id);
      setSnackbar({ open: true, message: 'Coupon deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeletingCoupon(null);
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete coupon', severity: 'error' });
    }
  };

  const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      await couponService.updateCoupon(couponId, { isAvailable: !currentStatus });
      setSnackbar({ open: true, message: 'Coupon status updated successfully', severity: 'success' });
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Compute filtered count for toolbar result count
  const filteredCoupons = coupons.filter((c) => {
    const matchSearch =
      !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      !filterStatus ||
      filterStatus === 'all' ||
      (filterStatus === 'active' ? c.isAvailable : !c.isAvailable);
    const matchType =
      !filterType ||
      filterType === 'all' ||
      c.discountType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f1f5f9' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: rc.gradient,
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 2.5, md: 4 },
          pb: { xs: 2.5, md: 4 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Overline above title row */}
          <Typography
            sx={{
              color: alpha(rc.chipText, 0.75),
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            APPLICATION CONTROL CENTER
          </Typography>

          {/* Title row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  fontSize: { xs: '1.4rem', md: '2rem' },
                }}
              >
                Coupons &amp; Promotions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha(rc.chipText, 0.6) }} />
                <Typography
                  variant="caption"
                  sx={{ color: alpha(rc.chipText, 0.6), fontWeight: 500, fontSize: '0.75rem' }}
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>

            {canCreateCoupons && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCoupon}
                sx={{
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  width: { xs: '100%', sm: 'auto' },
                  bgcolor: alpha('#fff', 0.15),
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: 'none',
                  },
                }}
              >
                Create Coupon
              </Button>
            )}
          </Box>

          {/* Hero stat tiles — CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <HeroStat label="Total Coupons" value={stats.totalCoupons} icon={<TotalIcon />} rc={rc} />
            <HeroStat label="Active Coupons" value={stats.activeCoupons} icon={<ActiveIcon />} rc={rc} />
            <HeroStat label="Total Redemptions" value={stats.totalRedemptions} icon={<RedemptionsIcon />} rc={rc} />
            <HeroStat label="Total Savings" value={stats.totalSavings} icon={<SavingsIcon />} rc={rc} />
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ pb: 6 }}>
        {/* Full-width toolbar */}
        <Box sx={{ pt: 0, pb: 0 }}>
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
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                borderBottom: '1px solid #e2e8f0',
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
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <SearchIcon sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
                <InputBase
                  placeholder="Search coupons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.25, color: '#94a3b8' }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>

              {/* Status filter */}
              <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
                >
                  <MenuItem value="all">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>All Status</Typography>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              {/* Type filter */}
              <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
                >
                  <MenuItem value="all">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>All Types</Typography>
                  </MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </Select>
              </FormControl>

              {/* Result count */}
              <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                  {filteredCoupons.length} of {coupons.length} coupons
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Content */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2, pb: 2 }}>
          {(() => {
            if (coupons.length === 0) {
              return (
                <Paper
                  elevation={0}
                  sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 6, textAlign: 'center', bgcolor: '#fff' }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: alpha(rc.primary, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto',
                      mb: 2.5,
                    }}
                  >
                    <CouponIcon sx={{ fontSize: 32, color: rc.primary }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    No coupons yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Create your first coupon to start offering discounts and promotions to your customers
                  </Typography>
                  {canCreateCoupons && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateCoupon}
                      sx={{
                        bgcolor: rc.primary,
                        '&:hover': { bgcolor: rc.secondary },
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        px: 2.5,
                      }}
                    >
                      Create Your First Coupon
                    </Button>
                  )}
                </Paper>
              );
            }

            if (filteredCoupons.length === 0) {
              return (
                <Paper
                  elevation={0}
                  sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 6, textAlign: 'center', bgcolor: '#fff' }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    No results found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Try adjusting your search or filter criteria
                  </Typography>
                </Paper>
              );
            }

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={handleEditCoupon}
                    onDelete={handleDeleteCoupon}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </Box>
            );
          })()}
        </Box>
      </Box>

      <CouponFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveCoupon}
        editingCoupon={editingCoupon}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingCoupon(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon"
        itemName={deletingCoupon?.name || ''}
        itemType="coupon"
        description="This will remove this coupon from the system. This action can be undone later."
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

export default Coupons;