/**
 * OrderCard Component - Clean Professional Design
 * 
 * Display individual order information
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person,
  AccessTime,
} from '@mui/icons-material';
import type { Order, OrderStatus } from '../../../features/orders/types';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const getStatusConfig = (status: OrderStatus) => {
  const configs = {
    pending: {
      label: 'Pending',
      bg: '#fef3c7',
      color: '#92400e',
      border: '#fde68a',
    },
    confirmed: {
      label: 'Confirmed',
      bg: '#dbeafe',
      color: '#1e40af',
      border: '#bfdbfe',
    },
    preparing: {
      label: 'Preparing',
      bg: '#dbeafe',
      color: '#1e40af',
      border: '#bfdbfe',
    },
    ready: {
      label: 'Ready',
      bg: '#dcfce7',
      color: '#166534',
      border: '#bbf7d0',
    },
    completed: {
      label: 'Completed',
      bg: '#dcfce7',
      color: '#166534',
      border: '#bbf7d0',
    },
    cancelled: {
      label: 'Cancelled',
      bg: '#fee2e2',
      color: '#991b1b',
      border: '#fecaca',
    },
  };
  return configs[status] || configs.pending;
};

const formatRelativeTime = (dateString: string) => {
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

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const statusConfig = getStatusConfig(order.status);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.125rem', mb: 0.5 }}>
            #{order.orderNumber}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 14, color: '#9ca3af' }} />
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
              {order.createdAt ? formatRelativeTime(order.createdAt) : 'Just now'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={statusConfig.label}
          size="small"
          sx={{
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
            border: `1px solid ${statusConfig.border}`,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      </Box>

      {/* Customer */}
      {order.customerName && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Person sx={{ fontSize: 16, color: '#6b7280' }} />
          <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.875rem' }}>
            {order.customerName}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Items */}
      <Box sx={{ mb: 2 }}>
        {order.items.slice(0, 3).map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.875rem' }}>
              {item.quantity}x {item.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.875rem' }}>
              ${item.totalPrice.toFixed(2)}
            </Typography>
          </Box>
        ))}
        {order.items.length > 3 && (
          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
            +{order.items.length - 3} more items
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
          Total
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.125rem' }}>
          ${order.total.toFixed(2)}
        </Typography>
      </Box>

      {/* Payment Status */}
      {order.paymentStatus && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Payment: ${order.paymentStatus}`}
            size="small"
            variant="outlined"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              borderColor: '#e5e7eb',
              color: '#6b7280',
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default OrderCard;