
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { OrderTracking } from '../../../services/api';
import OrderProgressBar from './OrderProgressBar';
import OrderItemsList from './OrderItemsList';

interface OrderCardProps {
  order: OrderTracking;
  getStatusColor: (status: string) => string;
  getProgressPercentage: (status: string) => number;
  getStatusLabel: (status: string) => string;
  formatPrice: (price: number) => string;
  formatTime: (dateString: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusColor,
  getProgressPercentage,
  getStatusLabel,
  formatPrice,
  formatTime,
}) => {
  const statusColor = getStatusColor(order.status);
  const progressPercentage = getProgressPercentage(order.status);
  const statusLabel = getStatusLabel(order.status);

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: '1px solid #E0E0E0',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top Status Bar */}
      <Box
        sx={{
          height: 4,
          backgroundColor: statusColor,
        }}
      />

      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Order Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              sx={{ 
                mb: 0.25,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                color: '#1E3A5F',
              }}
            >
              Order #{order.order_number || order.order_id}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              {formatTime(order.createdAt)}
            </Typography>
          </Box>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              backgroundColor: statusColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        </Stack>

        {/* Progress Bar */}
        <OrderProgressBar
          status={order.status}
          percentage={progressPercentage}
          color={statusColor}
        />

        <Divider sx={{ my: 1.5 }} />

        {/* Order Items */}
        <Typography 
          variant="subtitle2" 
          fontWeight="600" 
          sx={{ 
            mb: 1,
            fontSize: '0.85rem',
            color: '#2C3E50',
          }}
        >
          Items ({order.items.length})
        </Typography>
        <OrderItemsList
          items={order.items}
          formatPrice={formatPrice}
          maxDisplay={3}
        />

        <Divider sx={{ my: 1.5 }} />

        {/* Total */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6" 
            fontWeight="600"
            sx={{ fontSize: '0.95rem', color: '#2C3E50' }}
          >
            Total
          </Typography>
          <Typography 
            variant="h6" 
            fontWeight="700" 
            sx={{ fontSize: '1.05rem', color: '#1E3A5F' }}
          >
            {formatPrice((order.pricing.subtotal || 0) + (order.pricing.tax_amount || 0) - (order.pricing.discount_amount || 0))}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrderCard;