/**
 * Coupons & Promotions Page - Clean Professional Design
 * 
 * Manage discount codes and promotional offers
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
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
    totalSavings: 0, // Calculate based on your business logic
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.125rem' },
                }}
              >
                Coupons & Promotions
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                }}
              >
                Create and manage discount codes and promotional offers
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCoupon}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                fontWeight: 600,
                backgroundColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: '#374151',
                },
              }}
            >
              Create Coupon
            </Button>
          </Box>

          {/* Statistics */}
          <CouponStats stats={stats} />
        </Box>

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
              p: 8,
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <CouponIcon sx={{ fontSize: 40, color: '#6b7280' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              No coupons yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 4, maxWidth: 500, mx: 'auto' }}>
              Create your first coupon to start offering discounts and promotions to your customers
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCoupon}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                px: 4,
                fontWeight: 600,
                backgroundColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: '#374151',
                },
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
      </Container>

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

export default Coupons;