/**
 * CouponCard Component - Clean Professional Design
 *
 * Display individual coupon information
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
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

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const getTypeIcon = () => {
    switch (coupon.discountType) {
      case 'percentage':
        return <Percent sx={{ fontSize: 20 }} />;
      case 'fixed':
        return <AttachMoney sx={{ fontSize: 20 }} />;
      default:
        return <Percent sx={{ fontSize: 20 }} />;
    }
  };

  const getTypeLabel = () => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}% Off`;
      case 'fixed':
        return `$${coupon.discountValue} Off`;
      default:
        return 'Discount';
    }
  };

  const getTypeColor = () => {
    switch (coupon.discountType) {
      case 'percentage':
        return {
          bg: 'rgba(25,118,210,0.08)',
          color: '#1976d2',
          border: 'rgba(25,118,210,0.2)',
        };
      case 'fixed':
        return {
          bg: 'rgba(16,185,129,0.08)',
          color: '#059669',
          border: 'rgba(16,185,129,0.2)',
        };
      default:
        return {
          bg: 'rgba(25,118,210,0.08)',
          color: '#1976d2',
          border: 'rgba(25,118,210,0.2)',
        };
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
  };

  const typeColor = getTypeColor();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: typeColor.bg,
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
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.125rem' }}>
                {coupon.name}
              </Typography>
              <Chip
                label={getTypeLabel()}
                size="small"
                sx={{
                  backgroundColor: typeColor.bg,
                  color: typeColor.color,
                  border: `1px solid ${typeColor.border}`,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
              <Chip
                label={coupon.isAvailable ? 'Active' : 'Inactive'}
                size="small"
                onClick={() => onToggleStatus(coupon.id, coupon.isAvailable)}
                sx={{
                  backgroundColor: coupon.isAvailable
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                  color: coupon.isAvailable ? '#059669' : '#dc2626',
                  border: coupon.isAvailable
                    ? '1px solid rgba(16,185,129,0.2)'
                    : '1px solid rgba(239,68,68,0.2)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: coupon.isAvailable
                      ? 'rgba(16,185,129,0.15)'
                      : 'rgba(239,68,68,0.15)',
                  },
                }}
              />
            </Box>

            {/* Code */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                {coupon.code}
              </Box>
              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={handleCopyCode}
                  sx={{
                    color: '#94a3b8',
                    '&:hover': {
                      bgcolor: 'rgba(25,118,210,0.08)',
                      color: '#1976d2',
                    },
                  }}
                >
                  <CopyIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Description */}
            {coupon.description && (
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mb: 1 }}>
                {coupon.description}
              </Typography>
            )}

            {/* Usage Stats */}
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                  Used
                </Typography>
                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>
                  {coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                </Typography>
              </Box>
              {coupon.validUntil && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                    Expires
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit coupon">
            <IconButton
              size="small"
              onClick={() => onEdit(coupon)}
              sx={{
                color: '#94a3b8',
                '&:hover': {
                  bgcolor: 'rgba(25,118,210,0.08)',
                  color: '#1976d2',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete coupon">
            <IconButton
              size="small"
              onClick={() => onDelete(coupon.id)}
              sx={{
                color: '#94a3b8',
                '&:hover': {
                  bgcolor: 'rgba(239,68,68,0.08)',
                  color: '#dc2626',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default CouponCard;