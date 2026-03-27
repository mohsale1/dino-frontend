import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatRelativeTime } from '../../../utils/data';

export interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const getStatusColor = (status: OrderStatus) => {
  const colors = {
    pending: 'warning' as const,
    confirmed: 'info' as const,
    preparing: 'primary' as const,
    ready: 'success' as const,
    completed: 'success' as const,
    cancelled: 'error' as const,
  };
  return colors[status] || 'default' as const;
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              #{order.orderNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.createdAt ? formatRelativeTime(order.createdAt) : 'Just now'}
            </Typography>
          </Box>
          <Chip
            label={order.status.toUpperCase()}
            color={getStatusColor(order.status)}
            size="small"
          />
        </Box>

        {order.customerName && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            Customer: {order.customerName}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.5} mb={1.5}>
          {order.items.slice(0, 3).map((item) => (
            <Box key={item.id} display="flex" justifyContent="space-between">
              <Typography variant="body2">
                {item.quantity}x {item.name}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatCurrency(item.totalPrice)}
              </Typography>
            </Box>
          ))}
          {order.items.length > 3 && (
            <Typography variant="caption" color="text.secondary">
              +{order.items.length - 3} more items
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            Total
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {formatCurrency(order.total)}
          </Typography>
        </Box>

        {order.paymentStatus && (
          <Chip
            label={`Payment: ${order.paymentStatus}`}
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;