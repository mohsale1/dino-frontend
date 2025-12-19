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
  IconButton,
} from '@mui/material';
import {
  Receipt,
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
          pb: { xs: 10, sm: 12 },
          backgroundColor: '#F8F9FA',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#1E3A5F',
            color: 'white',
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
              }}
            >
              Your Orders
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 1.5, textAlign: 'center', color: '#6C757D' }}>
            Loading orders...
          </Typography>
          <LinearProgress />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          pb: { xs: 10, sm: 12 },
          backgroundColor: '#F8F9FA',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#1E3A5F',
            color: 'white',
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
              }}
            >
              Your Orders
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Alert severity="error" sx={{ mb: 1.5 }}>
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
          pb: { xs: 10, sm: 12 },
          backgroundColor: '#F8F9FA',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#1E3A5F',
            color: 'white',
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
              }}
            >
              Your Orders
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              backgroundColor: 'white',
              borderRadius: 1,
              border: '1px solid #E0E0E0',
            }}
          >
            <Receipt sx={{ fontSize: 52, color: '#CED4DA', mb: 1.5 }} />
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 1, fontWeight: 600, fontSize: '0.825rem' }}
            >
              No Orders Yet
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              Your order history will appear here
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        pb: { xs: 18, sm: 20 },
        backgroundColor: '#F8F9FA',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#1E3A5F',
          color: 'white',
          py: 1,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
              }}
            >
              Your Orders
            </Typography>
            <IconButton
              onClick={loadOrders}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <Refresh sx={{ fontSize: 12 }} />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 2.5 }}>
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card
              key={order.order_id}
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
                  backgroundColor: getStatusColor(order.status),
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
                        fontSize: { xs: '0.95rem', sm: '1.05rem' },
                        color: '#1E3A5F',
                      }}
                    >
                      Order #{order.order_number || order.order_id}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {formatTime(order.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={trackingService.getStatusDisplayInfo(order.status).label}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 18,
                    }}
                  />
                </Stack>

                {/* Progress Bar */}
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {Math.round(getProgressPercentage(order.status))}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(order.status)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#E0E0E0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStatusColor(order.status),
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Order Items */}
                <Typography 
                  variant="subtitle2" 
                  fontWeight="600" 
                  sx={{ 
                    mb: 1,
                    fontSize: '0.7rem',
                    color: '#2C3E50',
                  }}
                >
                  Items ({order.items.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {order.items.slice(0, 3).map((item, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        px: 0, 
                        py: 0.75,
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        src={item.image_url}
                        alt={item.name}
                        sx={{ 
                          width: 36, 
                          height: 18,
                          backgroundColor: '#F0F4F8',
                        }}
                      >
                        <Restaurant sx={{ fontSize: 12, color: '#6C757D' }} />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            fontWeight="500"
                            sx={{ fontSize: '0.7rem', color: '#2C3E50' }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </Typography>
                        }
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight="700" 
                        sx={{ 
                          fontSize: '0.7rem',
                          color: '#1E3A5F',
                          minWidth: 'fit-content',
                        }}
                      >
                        {formatPrice(item.unit_price * item.quantity)}
                      </Typography>
                    </ListItem>
                  ))}
                  {order.items.length > 3 && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        pl: 6,
                        fontSize: '0.7rem',
                      }}
                    >
                      +{order.items.length - 3} more items
                    </Typography>
                  )}
                </List>

                <Divider sx={{ my: 1.5 }} />

                {/* Total */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography 
                    variant="h6" 
                    fontWeight="600"
                    sx={{ fontSize: '0.825rem', color: '#2C3E50' }}
                  >
                    Total
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="700" 
                    sx={{ fontSize: '0.7rem', color: '#1E3A5F' }}
                  >
                    {formatPrice((order.pricing.subtotal || 0) + (order.pricing.tax_amount || 0) - (order.pricing.discount_amount || 0))}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default OrderStatusFragment;