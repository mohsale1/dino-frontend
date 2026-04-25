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
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {
  Add as AddIcon,
  LocalOffer as CouponIcon,
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
import { usePermissions } from '../../hooks/usePermissions';
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
// StatCard component
// ---------------------------------------------------------------------------

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
}> = ({ label, value, icon }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        p: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          flexShrink: 0,
          bgcolor: 'rgba(25,118,210,0.08)',
          border: '1px solid rgba(25,118,210,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1976D2',
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 24,
            color: '#1C1C1E',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {animated}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#666666', mt: 0.25, fontWeight: 500 }}>
          {label}
        </Typography>
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

  // getCoupons() already returns Coupon[] — the service handles paginated unwrapping internally.
  const fetchCoupons = useCallback(async () => {
    if (!workspaceId) return;
    setError(null);
    try {
      const data = await couponService.getCoupons(workspaceId);
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
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
    totalSavings: 0, // TODO: implement when API provides savings data
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
      // Convert empty strings to undefined for optional numeric fields so the
      // backend does not receive an empty string where a number (or null) is expected.
      const sanitized = {
        ...data,
        maxDiscountAmount: data.maxDiscountAmount === '' ? undefined : data.maxDiscountAmount,
        minOrderAmount: data.minOrderAmount === '' ? undefined : data.minOrderAmount,
        usageLimit: data.usageLimit === '' ? undefined : data.usageLimit,
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, sanitized);
        setSnackbar({ open: true, message: 'Coupon updated successfully', severity: 'success' });
      } else {
        await couponService.createCoupon({ ...sanitized, workspaceId });
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* Page Header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 2, sm: '32px' },
          pt: '24px',
          pb: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: 20, lineHeight: 1.3 }}>
            Coupons &amp; Promotions
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
            Manage discount codes and promotions
          </Typography>
        </Box>
        {canCreateCoupons && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={handleCreateCoupon}
            sx={{
              bgcolor: '#1976D2',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            Create Coupon
          </Button>
        )}
      </Box>

      {/* Stat Cards */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Total Coupons" value={stats.totalCoupons} icon={<CouponIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Active Coupons" value={stats.activeCoupons} icon={<ActiveIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Total Redemptions" value={stats.totalRedemptions} icon={<RedemptionsIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Total Savings" value={stats.totalSavings} icon={<SavingsIcon />} />
          </Grid>
        </Grid>
      </Box>

      {/* Toolbar */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: 'none',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              pt: 2,
              pb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            {/* Search */}
            <Box
              sx={{
                flex: '1 1 220px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f7f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
              }}
            >
              <SearchIcon sx={{ fontSize: 17, color: '#999999', flexShrink: 0 }} />
              <InputBase
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem', color: '#1C1C1E' }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ p: 0.25, color: '#999999' }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f7f9fa' }}
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ color: '#999999' }}>All Status</Typography>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Type filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f7f9fa' }}
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ color: '#999999' }}>All Types</Typography>
                </MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
              </Select>
            </FormControl>

            {/* Result count */}
            <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="caption" sx={{ color: '#999999', fontWeight: 500 }}>
                {filteredCoupons.length} of {coupons.length} coupons
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 6 }}>
        {coupons.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              p: 6,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '8px',
                bgcolor: 'rgba(25,118,210,0.08)',
                border: '1px solid rgba(25,118,210,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                mb: 2.5,
                color: '#1976D2',
                '& svg': { fontSize: 32 },
              }}
            >
              <CouponIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', mb: 1 }}>
              No coupons yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
              Create your first coupon to start offering discounts and promotions to your customers
            </Typography>
            {canCreateCoupons && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddIcon />}
                onClick={handleCreateCoupon}
                sx={{
                  bgcolor: '#1976D2',
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
                }}
              >
                Create Your First Coupon
              </Button>
            )}
          </Paper>
        ) : filteredCoupons.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              p: 6,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', mb: 1 }}>
              No results found
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Paper>
        ) : (
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
        )}
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
