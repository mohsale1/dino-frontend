import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Percent,
  AttachMoney,
} from '@mui/icons-material';
import type { Coupon } from '../../../features/coupons/types';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
  onToggleStatus: (couponId: string, currentStatus: boolean) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onEdit, onDelete, onToggleStatus }) => {

  const getTypeIcon = () => {
    switch (coupon.discount_type) {
      case 'fixed':      return <AttachMoney sx={{ fontSize: 20 }} />;
      case 'percentage':
      default:           return <Percent sx={{ fontSize: 20 }} />;
    }
  };

  const getTypeLabel = () => {
    switch (coupon.discount_type) {
      case 'fixed':      return `$${coupon.discount_value} Off`;
      case 'percentage':
      default:           return `${coupon.discount_value}% Off`;
    }
  };

  const typeColor = coupon.discount_type === 'fixed'
    ? { bg: 'rgba(16,185,129,0.08)',  color: '#059669', border: 'rgba(16,185,129,0.2)'  }
    : { bg: 'rgba(25,118,210,0.08)',  color: '#1976D2', border: 'rgba(25,118,210,0.2)'  };

  const handleCopyCode = () => {
    try { navigator.clipboard.writeText(coupon.code); } catch { /* ignore */ }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        bgcolor: '#ffffff',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: 'rgba(0,166,202,0.04)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        {/* ── Left: icon + info ── */}
        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flex: 1, minWidth: 0 }}>

          {/* Type icon box */}
          <Box
            sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: '10px',
              bgcolor: typeColor.bg,
              border: `1px solid ${typeColor.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: typeColor.color,
              flexShrink: 0,
            }}
          >
            {getTypeIcon()}
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Name + badges row */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem', lineHeight: 1.3 }}>
                {coupon.code}
              </Typography>
              <Chip
                label={getTypeLabel()}
                size="small"
                sx={{
                  bgcolor: typeColor.bg,
                  color: typeColor.color,
                  border: `1px solid ${typeColor.border}`,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 22,
                }}
              />
              <Chip
                label={coupon.is_active ? 'Active' : 'Inactive'}
                size="small"
                onClick={() => onToggleStatus(coupon.id, coupon.is_active)}
                sx={{
                  bgcolor: coupon.is_active ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  color:   coupon.is_active ? '#059669'               : '#dc2626',
                  border:  coupon.is_active ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 22,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: coupon.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  },
                }}
              />
            </Box>

            {/* Code row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: coupon.description ? 0.75 : 0 }}>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: '#F7F9FA',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#1C1C1E',
                  letterSpacing: '0.04em',
                }}
              >
                {coupon.code}
              </Box>
              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={handleCopyCode}
                  sx={{
                    color: '#999999',
                    width: 28,
                    height: 28,
                    '&:hover': { bgcolor: 'rgba(25,118,210,0.08)', color: '#1976D2' },
                  }}
                >
                  <CopyIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Description */}
            {coupon.description && (
              <Typography sx={{ color: '#666666', fontSize: '0.8125rem', mb: 0.75, lineHeight: 1.5 }}>
                {coupon.description}
              </Typography>
            )}

            {/* Usage stats row */}
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              <Box>
                <Typography sx={{ color: '#999999', fontSize: '0.72rem', fontWeight: 500, display: 'block', mb: 0.25 }}>
                  Used
                </Typography>
                <Typography sx={{ color: '#1C1C1E', fontWeight: 600, fontSize: '0.8125rem' }}>
                  {coupon.usage_count ?? 0}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                </Typography>
              </Box>
              {coupon.expiry_date && (
                <Box>
                  <Typography sx={{ color: '#999999', fontSize: '0.72rem', fontWeight: 500, display: 'block', mb: 0.25 }}>
                    Expires
                  </Typography>
                  <Typography sx={{ color: '#1C1C1E', fontWeight: 600, fontSize: '0.8125rem' }}>
                    {new Date(coupon.expiry_date).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              {coupon.min_order_amount != null && (
                <Box>
                  <Typography sx={{ color: '#999999', fontSize: '0.72rem', fontWeight: 500, display: 'block', mb: 0.25 }}>
                    Min Order
                  </Typography>
                  <Typography sx={{ color: '#1C1C1E', fontWeight: 600, fontSize: '0.8125rem' }}>
                    ${coupon.min_order_amount}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── Right: actions ── */}
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, pt: 0.25 }}>
          <Tooltip title="Edit coupon">
            <IconButton
              size="small"
              onClick={() => onEdit(coupon)}
              sx={{
                color: '#999999',
                width: 32,
                height: 32,
                borderRadius: '8px',
                '&:hover': { color: '#1976D2', bgcolor: alpha('#1976D2', 0.06) },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete coupon">
            <IconButton
              size="small"
              onClick={() => onDelete(coupon.id)}
              sx={{
                color: '#999999',
                width: 32,
                height: 32,
                borderRadius: '8px',
                '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244,63,94,0.08)' },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default CouponCard;
