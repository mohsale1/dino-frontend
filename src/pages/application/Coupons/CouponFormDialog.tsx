/**
 * CouponFormDialog Component - Clean Professional Design
 * 
 * Create and edit coupons
 */

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
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  value: number;
  usageLimit: number | null;
  expiresAt: string;
  isActive: boolean;
  minPurchaseAmount: number | null;
}

interface CouponFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CouponFormData) => Promise<void>;
  editingCoupon?: any | null;
}

const CouponFormDialog: React.FC<CouponFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingCoupon,
}) => {
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    usageLimit: null,
    expiresAt: '',
    isActive: true,
    minPurchaseAmount: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingCoupon) {
        setFormData({
          code: editingCoupon.code || '',
          name: editingCoupon.name || '',
          description: editingCoupon.description || '',
          type: editingCoupon.type || 'percentage',
          value: editingCoupon.value || 0,
          usageLimit: editingCoupon.usageLimit || null,
          expiresAt: editingCoupon.expiresAt || '',
          isActive: editingCoupon.isActive !== undefined ? editingCoupon.isActive : true,
          minPurchaseAmount: editingCoupon.minPurchaseAmount || null,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          type: 'percentage',
          value: 0,
          usageLimit: null,
          expiresAt: '',
          isActive: true,
          minPurchaseAmount: null,
        });
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
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.25rem' }}>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', mt: 0.5 }}>
              {editingCoupon ? 'Update coupon information' : 'Create a new discount code or promotion'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Coupon Code */}
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Coupon Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="e.g., SAVE20"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={generateCode}
              sx={{
                height: '56px',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                borderColor: '#e5e7eb',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
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
              placeholder="e.g., Summer Sale 2024"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Discount Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            >
              <MenuItem value="percentage">Percentage Discount</MenuItem>
              <MenuItem value="fixed">Fixed Amount Discount</MenuItem>
              <MenuItem value="bogo">Buy One Get One</MenuItem>
              <MenuItem value="free_shipping">Free Shipping</MenuItem>
            </TextField>
          </Grid>

          {/* Value */}
          {formData.type !== 'bogo' && formData.type !== 'free_shipping' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formData.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                required
                InputProps={{
                  startAdornment: formData.type === 'fixed' ? '$' : undefined,
                  endAdornment: formData.type === 'percentage' ? '%' : undefined,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a1a1a',
                  },
                }}
              />
            </Grid>
          )}

          {/* Min Purchase Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Purchase Amount"
              type="number"
              value={formData.minPurchaseAmount || ''}
              onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || null })}
              placeholder="Optional"
              InputProps={{
                startAdornment: '$',
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>

          {/* Usage Limit */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Usage Limit"
              type="number"
              value={formData.usageLimit || ''}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || null })}
              placeholder="Unlimited"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>

          {/* Expiration Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiration Date"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#1a1a1a',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a' }}>
                    Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    Coupon can be used by customers
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
            color: '#374151',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
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
            backgroundColor: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#374151',
            },
          }}
        >
          {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponFormDialog;