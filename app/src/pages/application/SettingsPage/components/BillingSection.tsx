import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import {
  CreditCard,
  StarOutlined,
  ArrowUpward,
} from '@mui/icons-material';

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

const BillingSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: BRAND.primaryBg,
              border: `1px solid ${BRAND.primaryBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: BRAND.primary,
              flexShrink: 0,
            }}
          >
            <CreditCard sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}
            >
              Billing & Plan
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage your subscription and payment details
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Current Plan */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
                flexShrink: 0,
              }}
            >
              <StarOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1E' }}
                >
                  Current Plan
                </Typography>
                <Chip
                  label="Free"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: BRAND.primaryBg,
                    color: BRAND.primary,
                    border: `1px solid ${BRAND.primaryBorder}`,
                    borderRadius: '6px',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.8125rem' }}>
                Free Plan - basic features included
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<ArrowUpward sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              px: 2.5,
              bgcolor: BRAND.primary,
              boxShadow: 'none',
              '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: 'none' },
            }}
          >
            Upgrade Plan
          </Button>
        </Box>

        <Divider sx={{ borderColor: '#e0e0e0' }} />

        {/* Payment Method */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
                flexShrink: 0,
              }}
            >
              <CreditCard sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1E', mb: 0.25 }}
              >
                Payment Method
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.8125rem' }}>
                No payment method added
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<CreditCard sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              px: 2.5,
              borderColor: '#e0e0e0',
              color: '#1C1C1E',
              boxShadow: 'none',
              '&:hover': {
                borderColor: BRAND.primaryBorder,
                bgcolor: BRAND.primaryBg,
                color: BRAND.primary,
                boxShadow: 'none',
              },
            }}
          >
            Add Payment Method
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BillingSection;
