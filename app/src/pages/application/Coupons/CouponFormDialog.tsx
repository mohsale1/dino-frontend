import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  Box,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number | '';
  minOrderAmount: number | '';
  usageLimit: number | '';
  validFrom: string;
  validUntil: string;
  isAvailable: boolean;
}

interface CouponFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CouponFormData) => Promise<void>;
  editingCoupon?: any | null;
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#1976d2',
  },
};

const defaultFormData: CouponFormData = {
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  maxDiscountAmount: '',
  minOrderAmount: '',
  usageLimit: '',
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
  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingCoupon) {
        setFormData({
          code: editingCoupon.code || '',
          name: editingCoupon.name || '',
          description: editingCoupon.description || '',
          discountType: editingCoupon.discountType || 'percentage',
          discountValue: editingCoupon.discountValue || 0,
          maxDiscountAmount: editingCoupon.maxDiscountAmount || '',
          minOrderAmount: editingCoupon.minOrderAmount || '',
          usageLimit: editingCoupon.usageLimit || '',
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
    try {
      setLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save coupon:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.125rem' }}>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.5 }}>
              {editingCoupon ? 'Update coupon information' : 'Create a new discount code or promotion'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2.5}>

          {/* Coupon Code + Generate */}
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
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
                height: 56,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                borderColor: '#e2e8f0',
                color: '#475569',
                '&:hover': {
                  borderColor: '#94a3b8',
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
              label="Max Discount Amount"
              type="number"
              value={formData.maxDiscountAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxDiscountAmount: e.target.value === '' ? '' : parseFloat(e.target.value),
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
              label="Min Order Amount"
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderAmount: e.target.value === '' ? '' : parseFloat(e.target.value),
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
              label="Usage Limit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usageLimit: e.target.value === '' ? '' : parseInt(e.target.value),
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                    Available
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                    Coupon can be used by customers
                  </Typography>
                </Box>
              }
            />
          </Grid>

        </Grid>
      </DialogContent>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            color: '#475569',
            borderRadius: 1.5,
            px: 3,
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
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
            bgcolor: '#1976d2',
            boxShadow: '0 4px 14px rgba(25,118,210,0.3)',
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponFormDialog;