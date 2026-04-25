import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Switch,
  MenuItem,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon, LocalOffer, AddCircleOutline } from '@mui/icons-material';
import type { Coupon } from '../../../features/coupons/types';

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  // Optional numeric fields use undefined (not '') so the service's
  // `if (data.x !== undefined)` guard correctly omits them from the payload
  // when they are not set.
  maxDiscountAmount: number | undefined;
  minOrderAmount: number | undefined;
  usageLimit: number | undefined;
  validFrom: string;
  validUntil: string;
  isAvailable: boolean;
}

interface CouponFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CouponFormData) => Promise<void>;
  editingCoupon?: Coupon | null;
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
};

const defaultFormData: CouponFormData = {
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  maxDiscountAmount: undefined,
  minOrderAmount: undefined,
  usageLimit: undefined,
  validFrom: '',
  validUntil: '',
  isAvailable: true,
};

const CouponFormDialog: React.FC<CouponFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingCoupon,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSaveError(null);
      if (editingCoupon) {
        setFormData({
          // code is editable and must be included in the update payload
          code: editingCoupon.code || '',
          name: editingCoupon.name || '',
          description: editingCoupon.description || '',
          discountType: editingCoupon.discountType || 'percentage',
          discountValue: editingCoupon.discountValue || 0,
          // Use undefined (not '') for optional numeric fields so the service
          // omits them from the PATCH payload when they are not set.
          maxDiscountAmount: editingCoupon.maxDiscountAmount != null
            ? editingCoupon.maxDiscountAmount
            : undefined,
          minOrderAmount: editingCoupon.minOrderAmount != null
            ? editingCoupon.minOrderAmount
            : undefined,
          usageLimit: editingCoupon.usageLimit != null
            ? editingCoupon.usageLimit
            : undefined,
          validFrom: editingCoupon.validFrom || '',
          validUntil: editingCoupon.validUntil || '',
          isAvailable: editingCoupon.isAvailable ?? true,
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, editingCoupon]);

  const handleSubmit = async () => {
    setSaveError(null);
    try {
      setLoading(true);
      await onSave(formData);
    } catch (error: any) {
      setSaveError(error?.message || 'Failed to save coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase().padEnd(8, '0');
    setFormData({ ...formData, code });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Light header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          pt: 3,
          pb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(25,118,210,0.08)',
                border: '1px solid rgba(25,118,210,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {editingCoupon ? (
                <LocalOffer sx={{ fontSize: 20, color: '#1976D2' }} />
              ) : (
                <AddCircleOutline sx={{ fontSize: 20, color: '#1976D2' }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem' }}>
                {editingCoupon ? 'Update coupon information' : 'Create a new discount code or promotion'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#666666',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSaveError(null)}>
            {saveError}
          </Alert>
        )}
        <Grid container spacing={2.5}>

          {/* Coupon Code + Generate */}
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              label="Coupon Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="e.g., SAVE20"
              sx={textFieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={generateCode}
              sx={{
                height: 40,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: '#e0e0e0',
                color: '#666666',
                '&:hover': {
                  borderColor: '#999999',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Generate Code
            </Button>
          </Grid>

          {/* Coupon Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Coupon Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Summer Sale 2025"
              sx={textFieldSx}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              placeholder="Optional description for internal use"
              sx={textFieldSx}
            />
          </Grid>

          {/* Discount Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              select
              label="Discount Type"
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })
              }
              required
              sx={textFieldSx}
            >
              <MenuItem value="percentage">Percentage Discount</MenuItem>
              <MenuItem value="fixed">Fixed Amount Discount</MenuItem>
            </TextField>
          </Grid>

          {/* Discount Value */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label={formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
              required
              InputProps={{
                startAdornment: formData.discountType === 'fixed'
                  ? <InputAdornment position="start">$</InputAdornment>
                  : undefined,
                endAdornment: formData.discountType === 'percentage'
                  ? <InputAdornment position="end">%</InputAdornment>
                  : undefined,
              }}
              sx={textFieldSx}
            />
          </Grid>

          {/* Max Discount Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Max Discount Amount"
              type="number"
              // Display empty string in the input when undefined so the field appears blank
              value={formData.maxDiscountAmount ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxDiscountAmount: e.target.value === '' ? undefined : parseFloat(e.target.value),
                })
              }
              placeholder="Optional"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={textFieldSx}
            />
          </Grid>

          {/* Min Order Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Min Order Amount"
              type="number"
              value={formData.minOrderAmount ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderAmount: e.target.value === '' ? undefined : parseFloat(e.target.value),
                })
              }
              placeholder="Optional"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={textFieldSx}
            />
          </Grid>

          {/* Usage Limit */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Usage Limit"
              type="number"
              value={formData.usageLimit ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usageLimit: e.target.value === '' ? undefined : parseInt(e.target.value),
                })
              }
              placeholder="Unlimited"
              sx={textFieldSx}
            />
          </Grid>

          {/* Valid From */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={textFieldSx}
            />
          </Grid>

          {/* Valid Until */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={textFieldSx}
            />
          </Grid>

          {/* Active Toggle */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: formData.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                    border: `1px solid ${formData.isAvailable ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <LocalOffer sx={{ fontSize: 17, color: formData.isAvailable ? '#10b981' : '#94a3b8' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3 }}>
                    {formData.isAvailable ? 'Available' : 'Unavailable'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem' }}>
                    {formData.isAvailable ? 'Coupon can be used by customers' : 'Coupon is disabled'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                color="success"
                size="small"
              />
            </Box>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#666666',
            borderRadius: 2,
            px: 2.5,
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            bgcolor: '#1976D2',
            '&:hover': { bgcolor: '#1565C0' },
          }}
        >
          {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponFormDialog;
