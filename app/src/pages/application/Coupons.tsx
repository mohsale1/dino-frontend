import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalOffer as CouponIcon,
} from '@mui/icons-material';
import CouponStats from './Coupons/CouponStats';
import CouponFilters from './Coupons/CouponFilters';
import CouponCard from './Coupons/CouponCard';
import CouponFormDialog from './Coupons/CouponFormDialog';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { couponService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import type { Coupon } from '../../features/coupons/types';

const Coupons: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Data state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch coupons
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

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

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
        setSnackbar({
          open: true,
          message: 'Coupon updated successfully',
          severity: 'success',
        });
      } else {
        await couponService.createCoupon({ ...data, workspaceId });
        setSnackbar({
          open: true,
          message: 'Coupon created successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save coupon',
        severity: 'error',
      });
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (coupon) {
      setDeletingCoupon(coupon);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;

    try {
      await couponService.deleteCoupon(deletingCoupon.id);
      setSnackbar({
        open: true,
        message: 'Coupon deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setDeletingCoupon(null);
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete coupon',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      await couponService.updateCoupon(couponId, { isAvailable: !currentStatus });
      setSnackbar({
        open: true,
        message: 'Coupon status updated successfully',
        severity: 'success',
      });
      await fetchCoupons();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update status',
        severity: 'error',
      });
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.0625rem' }}
          >
            Coupons & Promotions
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Create and manage discount codes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCoupon}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            px: 2.5,
          }}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Stats */}
        <CouponStats stats={stats} />

        {/* Filters */}
        <CouponFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterType={filterType}
          onTypeChange={setFilterType}
        />

        {/* Coupons List or Empty State */}
        {coupons.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                bgcolor: 'rgba(25,118,210,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                mb: 2.5,
              }}
            >
              <CouponIcon sx={{ fontSize: 32, color: '#1976d2' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              No coupons yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Create your first coupon to start offering discounts and promotions to your customers
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCoupon}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2.5,
              }}
            >
              Create Your First Coupon
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {coupons.map((coupon) => (
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

      {/* Create/Edit Dialog */}
      <CouponFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveCoupon}
        editingCoupon={editingCoupon}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingCoupon(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon"
        itemName={deletingCoupon?.name || ''}
        itemType="coupon"
        description="This will remove this coupon from the system. This action can be undone later."
        requireTyping={false}
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
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Coupons;