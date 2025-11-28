import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Receipt,
  Schedule,
  CheckCircle,
  Refresh,
  Restaurant,
} from '@mui/icons-material';
import { trackingService, OrderTracking } from '../../../services/api';

interface OrderStatusFragmentProps {
  venueId?: string;
  tableId?: string;
}

const OrderStatusFragment: React.FC<OrderStatusFragmentProps> = ({ venueId, tableId }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get orders from localStorage (recent orders)
      const recentOrdersStr = localStorage.getItem('dino_recent_orders');
      if (recentOrdersStr) {
        const recentOrders = JSON.parse(recentOrdersStr);
        
        // Fetch tracking data for each order
        const orderPromises = recentOrders.map(async (orderId: string) => {
          try {
            return await trackingService.getOrderTrackingByNumber(orderId);
          } catch {
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

  const formatPrice = (price: number) => {
    return trackingService.formatCurrency(price);
  };

  const formatTime = (dateString: string) => {
    return trackingService.formatTime(dateString);
  };

  if (loading) {
    return (
      <Box sx={{ pb: 10, backgroundColor: theme.palette.background.default }}>
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            py: { xs: 3, sm: 4 },
            mb: 3,
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
              }}
            >
              Your Orders
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 0.5,
                opacity: 0.9,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Track your order status in real-time
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="md">
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Loading orders...
          </Typography>
          <LinearProgress />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pb: 10, backgroundColor: theme.palette.background.default }}>
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            py: { xs: 3, sm: 4 },
            mb: 3,
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
              }}
            >
              Your Orders
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 0.5,
                opacity: 0.9,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Track your order status in real-time
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={loadOrders} fullWidth>
            Retry
          </Button>
        </Container>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ pb: 10, backgroundColor: theme.palette.background.default }}>
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            py: { xs: 3, sm: 4 },
            mb: 3,
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
              }}
            >
              Your Orders
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 0.5,
                opacity: 0.9,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Track your order status in real-time
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'background.paper',
              borderRadius: 3,
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Receipt sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No Orders Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your order history will appear here
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10, backgroundColor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 3, sm: 4 },
          mb: 3,
        }}
      >
        <Container maxWidth="md">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                }}
              >
                Your Orders
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                Track your order status in real-time
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadOrders}
              size="small"
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md">

        <Stack spacing={3}>
          {orders.map((order) => (
            <Card
              key={order.order_id}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Order Header */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                      Order #{order.order_number || order.order_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(order.created_at)}
                    </Typography>
                  </Box>
                  <Chip
                    label={trackingService.getStatusDisplayInfo(order.status).label}
                    sx={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(getProgressPercentage(order.status))}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(order.status)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1.5 }}>
                  Items ({order.items.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {order.items.slice(0, 3).map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 1 }}>
                      <Avatar
                        src={item.image_url}
                        alt={item.name}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      >
                        <Restaurant />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="500">
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </Typography>
                        }
                      />
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {formatPrice(item.total_price)}
                      </Typography>
                    </ListItem>
                  ))}
                  {order.items.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 7 }}>
                      +{order.items.length - 3} more items
                    </Typography>
                  )}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Total */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="600">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="primary.main">
                    {formatPrice(order.pricing.total_amount)}
                  </Typography>
                </Stack>
              </CardContent>

              {/* Status Indicator Bar */}
              <Box
                sx={{
                  height: 4,
                  background: `linear-gradient(90deg, ${getStatusColor(order.status)} 0%, ${alpha(
                    getStatusColor(order.status),
                    0.6
                  )} 100%)`,
                }}
              />
            </Card>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default OrderStatusFragment;
    