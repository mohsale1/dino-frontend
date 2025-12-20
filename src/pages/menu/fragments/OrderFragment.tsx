import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  LinearProgress,
  Alert,
  Button,
} from '@mui/material';
import { trackingService, OrderTracking } from '../../../services/api';
import {
  OrdersHeader,
  OrderCard,
  EmptyOrdersState,
} from '../../../components/menu';

interface OrderFragmentProps {
  venueId?: string;
  tableId?: string;
}

const OrderFragment: React.FC<OrderFragmentProps> = ({ venueId, tableId }) => {
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const recentOrdersStr = localStorage.getItem('dino_recent_orders');
      if (recentOrdersStr) {
        const recentOrders = JSON.parse(recentOrdersStr);
        
        const orderPromises = recentOrders.map(async (orderId: string) => {
          try {
            return await trackingService.getOrderTrackingByNumber(orderId);
          } catch (err) {
            return null;
          }
        });

        const orderData = await Promise.all(orderPromises);
        const validOrders = orderData.filter((order): order is OrderTracking => order !== null);
        
        setOrders(validOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusInfo = trackingService.getStatusDisplayInfo(status as any);
    return statusInfo.color;
  };

  const getProgressPercentage = (status: string) => {
    return trackingService.getProgressPercentage(status as any);
  };

  const getStatusLabel = (status: string) => {
    const statusInfo = trackingService.getStatusDisplayInfo(status as any);
    return statusInfo.label;
  };

  const formatPrice = (price: number) => {
    return trackingService.formatCurrency(price);
  };

  const formatTime = (dateString: string) => {
    return trackingService.formatTime(dateString);
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          pb: { xs: 8, sm: 9 },
          backgroundColor: '#F8F9FA',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <OrdersHeader onRefresh={loadOrders} />

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <LinearProgress />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          pb: { xs: 8, sm: 9 },
          backgroundColor: '#F8F9FA',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <OrdersHeader onRefresh={loadOrders} />

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={loadOrders} 
            fullWidth
            sx={{
              backgroundColor: '#1E3A5F',
              '&:hover': {
                backgroundColor: '#2C5282',
              },
            }}
          >
            Retry
          </Button>
        </Container>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box 
        sx={{ 
          pb: { xs: 8, sm: 9 },
          backgroundColor: '#F8F9FA',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <OrdersHeader onRefresh={loadOrders} />

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <EmptyOrdersState />
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        pb: { xs: 14, sm: 16 },
        backgroundColor: '#F8F9FA',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <OrdersHeader onRefresh={loadOrders} />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 2.5 }}>
        <Stack spacing={2}>
          {orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              getStatusColor={getStatusColor}
              getProgressPercentage={getProgressPercentage}
              getStatusLabel={getStatusLabel}
              formatPrice={formatPrice}
              formatTime={formatTime}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default OrderFragment;