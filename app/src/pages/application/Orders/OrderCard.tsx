import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  TableRestaurant,
  Person,
  ShoppingBag,
  ArrowForward,
} from '@mui/icons-material';
import { Order } from '../../../services/application/order.service';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: '#fef3c7', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  confirmed: { label: 'Confirmed', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  preparing: { label: 'Preparing', bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe', dot: '#8b5cf6' },
  ready:     { label: 'Ready',     bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', dot: '#10b981' },
  served:    { label: 'Served',    bg: '#e0f2fe', color: '#0c4a6e', border: '#bae6fd', dot: '#0ea5e9' },
  completed: { label: 'Completed', bg: '#dcfce7', color: '#14532d', border: '#bbf7d0', dot: '#22c55e' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#7f1d1d', border: '#fecaca', dot: '#ef4444' },
};

const STATUS_FLOW: Record<string, string | null> = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'served',
  served:    'completed',
  completed: null,
  cancelled: null,
};

const ADVANCE_LABELS: Record<string, string> = {
  pending:   'Confirm',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Mark Served',
  served:    'Complete',
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatCurrency = (amount: number): string =>
  `\u20B9${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (id: string, status: string) => void;
  onCancel: (order: Order) => void;
  onClick: (order: Order) => void;
  actionLoading: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusUpdate,
  onCancel,
  onClick,
  actionLoading,
}) => {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const nextStatus = STATUS_FLOW[order.status];
  const canAdvance = nextStatus !== null && order.status !== 'cancelled';
  const canCancel = order.status !== 'completed' && order.status !== 'cancelled';

  return (
    <Paper
      elevation={0}
      onClick={() => onClick(order)}
      sx={{
        position: 'relative',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: '#fafafa' },
      }}
    >
      {/* Left accent border */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: cfg.dot,
          borderRadius: '2px 0 0 2px',
        }}
      />

      <Box sx={{ pl: { xs: '16px', sm: '20px' }, pr: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        {/* Top row: order number + status dot + label */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              fontSize: '0.9375rem',
              color: '#1C1C1E',
              letterSpacing: '0.02em',
            }}
          >
            #{order.order_number}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500, textTransform: 'capitalize' }}>
              {order.status}
            </Typography>
          </Box>
        </Box>

        {/* Middle: meta info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Person sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#475569' }}>
              {order.customer_name || 'Walk-in'}
            </Typography>
          </Box>

          {order.table_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TableRestaurant sx={{ fontSize: 14, color: '#94a3b8' }} />
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#475569' }}>
                Table {order.table_number}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <ShoppingBag sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#475569' }}>
              {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AccessTime sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              {formatRelativeTime(order.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9', mb: 1.5 }} />

        {/* Bottom: total + actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#1C1C1E',
              letterSpacing: '-0.01em',
              minWidth: 0,
            }}
          >
            {formatCurrency(order.total)}
          </Typography>

          <Box
            sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}
            onClick={(e) => e.stopPropagation()}
          >
            {canCancel && (
              <Button
                size="small"
                variant="text"
                disabled={actionLoading}
                onClick={() => onCancel(order)}
                sx={{
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  minWidth: 0,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: '#fee2e2' },
                }}
              >
                Cancel
              </Button>
            )}
            {canAdvance && nextStatus && (
              <Button
                size="small"
                variant="outlined"
                disabled={actionLoading}
                endIcon={<ArrowForward sx={{ fontSize: '0.875rem !important' }} />}
                onClick={() => onStatusUpdate(order.id, nextStatus)}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderColor: cfg.dot,
                  color: cfg.color,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: cfg.bg,
                    borderColor: cfg.dot,
                  },
                }}
              >
                {ADVANCE_LABELS[order.status]}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderCard;
