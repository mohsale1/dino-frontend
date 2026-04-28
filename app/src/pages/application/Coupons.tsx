import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {
  Add as AddIcon,
  LocalOffer as CouponIcon,
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

const Coupons: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const { canCreateCoupons } = usePermissions();

  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]     = useState('all');
  const [openDialog, setOpenDialog]     = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon]   = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const venueId = userData?.venue?.id || '';

  const fetchCoupons = useCallback(async () => {
    if (!venueId) return;
    setError(null);
    try {
      const result = await couponService.getCouponsByVenue(venueId);
      const raw = (result as any)?.data ?? result;
      setCoupons(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons');
    }
  }, [venueId]);

  useEffect(() => {
    const loadData = async () => {
      if (!venueId) { setLoading(false); return; }
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

  const handleCreateCoupon = () => { setEditingCoupon(null); setOpenDialog(true); };
  const handleEditCoupon   = (coupon: Coupon) => { setEditingCoupon(coupon); setOpenDialog(true); };
  const handleCloseDialog  = () => { setOpenDialog(false); setEditingCoupon(null); };

  const handleSaveCoupon = async (data: any) => {
    try {
      const sanitized = {
        ...data,
        maxDiscountAmount: data.maxDiscountAmount === '' ? undefined : data.maxDiscountAmount,
        minOrderAmount:    data.minOrderAmount    === '' ? undefined : data.minOrderAmount,
        usageLimit:        data.usageLimit        === '' ? undefined : data.usageLimit,
      };
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, sanitized);
        setSnackbar({ open: true, message: 'Coupon updated successfully', severity: 'success' });
      } else {
        await couponService.createCoupon({ ...sanitized, venue_id: venueId });
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
      await couponService.updateCoupon(couponId, { is_active: !currentStatus });
      setSnackbar({ open: true, message: 'Coupon status updated successfully', severity: 'success' });
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const filteredCoupons = coupons.filter((c) => {
    const matchSearch =
      !searchQuery ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' ? c.is_active : !c.is_active);
    const matchType =
      filterType === 'all' ||
      c.discount_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const hasFilters = searchQuery !== '' || filterStatus !== 'all' || filterType !== 'all';

  return (
    <Box sx={{ maxWidth: '1440px', margin: '0 auto', px: { xs: 2, sm: 3 }, pt: 3, pb: 6 }}>

      {/* ── Inline Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1C1C1E', lineHeight: 1.2 }}>
            Coupons &amp; Promotions
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#666666', mt: 0.5 }}>
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} &middot; Manage discount codes and promotions
          </Typography>
        </Box>
        {canCreateCoupons && (
          <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
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
                '&:hover': { bgcolor: '#1565C0' },
              }}
            >
              Create Coupon
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Search / Filter Row ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
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
            <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, color: '#999999' }}>
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
            <MenuItem value="all"><Typography variant="body2" sx={{ color: '#999999' }}>All Status</Typography></MenuItem>
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
            <MenuItem value="all"><Typography variant="body2" sx={{ color: '#999999' }}>All Types</Typography></MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="fixed">Fixed</MenuItem>
          </Select>
        </FormControl>

        {/* Clear filters */}
        {hasFilters && (
          <Button
            size="small"
            onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterType('all'); }}
            sx={{ textTransform: 'none', color: '#666666', fontWeight: 500, fontSize: '0.875rem' }}
          >
            Clear
          </Button>
        )}

        {/* Count */}
        <Typography sx={{ fontSize: '0.875rem', color: '#999999', ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
          {filteredCoupons.length} of {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* ── Bordered Content Container ── */}
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#ffffff' }}>

        {/* Empty — no coupons at all */}
        {coupons.length === 0 && (
          <Box sx={{ py: 10, px: 3, textAlign: 'center', bgcolor: '#FCFCFD' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '12px',
                bgcolor: '#F7F9FA',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                color: '#999999',
              }}
            >
              <CouponIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '1rem', mb: 0.75 }}>
              No coupons yet
            </Typography>
            <Typography sx={{ color: '#666666', fontSize: '0.875rem', mb: 3, maxWidth: 320, mx: 'auto' }}>
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
                  '&:hover': { bgcolor: '#1565C0' },
                }}
              >
                Create Your First Coupon
              </Button>
            )}
          </Box>
        )}

        {/* Empty — filters returned no results */}
        {coupons.length > 0 && filteredCoupons.length === 0 && (
          <Box sx={{ py: 10, px: 3, textAlign: 'center', bgcolor: '#FCFCFD' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '12px',
                bgcolor: '#F7F9FA',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                color: '#999999',
              }}
            >
              <SearchIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '1rem', mb: 0.75 }}>
              No results found
            </Typography>
            <Typography sx={{ color: '#666666', fontSize: '0.875rem' }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        )}

        {/* Coupon list — rows separated by dividers */}
        {filteredCoupons.length > 0 && filteredCoupons.map((coupon, idx) => (
          <React.Fragment key={coupon.id}>
            <CouponCard
              coupon={coupon}
              onEdit={handleEditCoupon}
              onDelete={handleDeleteCoupon}
              onToggleStatus={handleToggleStatus}
            />
            {idx < filteredCoupons.length - 1 && (
              <Divider sx={{ borderColor: '#f1f5f9' }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* ── Dialogs ── */}
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
        itemName={deletingCoupon?.code || ''}
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
