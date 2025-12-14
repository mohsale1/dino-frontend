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
  AppBar,
  Toolbar,
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
          } catch (err) {
            // Silently ignore backend errors (e.g., malformed error responses)            return null;
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
          pb: 10, 
          backgroundColor: theme.palette.background.default,
          width: '100%',
          overflowX: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Top Navigation Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            top: 0,
            zIndex: 100,
          }}
        >
          <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Receipt sx={{ color: theme.palette.primary.main, fontSize: 12 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Your Orders
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth="md"
          sx={{ px: { xs: 1, sm: 3 }, pt: { xs: 3, sm: 4 } }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 1, 
              textAlign: 'center',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
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
          pb: 10, 
          backgroundColor: theme.palette.background.default,
          width: '100%',
          overflowX: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Top Navigation Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            top: 0,
            zIndex: 100,
          }}
        >
          <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Receipt sx={{ color: theme.palette.primary.main, fontSize: 12 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Your Orders
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth="md"
          sx={{ px: { xs: 1, sm: 3 }, pt: { xs: 3, sm: 4 } }}
        >
          <Alert severity="error" sx={{ mb: 1 }}>
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
      <Box 
        sx={{ 
          pb: 10, 
          backgroundColor: theme.palette.background.default,
          width: '100%',
          overflowX: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Top Navigation Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            top: 0,
            zIndex: 100,
          }}
        >
          <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Receipt sx={{ color: theme.palette.primary.main, fontSize: 12 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Your Orders
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth="md"
          sx={{ px: { xs: 1, sm: 3 }, pt: { xs: 3, sm: 4 } }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, sm: 8 },
              backgroundColor: 'background.paper',
              borderRadius: { xs: 2, sm: 3 },
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <Avatar
              sx={{
                width: { xs: 64, sm: 72, md: 80 },
                height: { xs: 64, sm: 72, md: 80 },
                mx: 'auto',
                mb: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Receipt sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />
            </Avatar>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              gutterBottom 
              fontWeight="600"
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              No Orders Yet
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
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
        pb: 10, 
        backgroundColor: theme.palette.background.default,
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Top Navigation Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          top: 0,
          zIndex: 100,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 1, sm: 3 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Receipt sx={{ color: theme.palette.primary.main, fontSize: 12 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Your Orders
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadOrders}
            size="small"
            sx={{
              px: { xs: 1, sm: 1 },
              py: { xs: 0.5, sm: 0.75 },
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
            }}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="md"
        sx={{ px: { xs: 1, sm: 3 }, pt: { xs: 3, sm: 4 } }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5, md: 1.5 }}>
          {orders.map((order) => (
            <Card
              key={order.order_id}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 1.5 } }}>
                {/* Order Header */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={{ xs: 1.5, sm: 1 }}
                  sx={{ mb: { xs: 1.5, sm: 1 } }}
                >
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="600" 
                      sx={{ 
                        mb: 0.5,
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      }}
                    >
                      Order #{order.order_number || order.order_id}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.8rem' } }}
                    >
                      {formatTime(order.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={trackingService.getStatusDisplayInfo(order.status).label}
                    sx={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      height: { xs: 28, sm: 32 },
                    }}
                  />
                </Stack>

                {/* Progress Bar */}
                <Box sx={{ mb: { xs: 1.5, sm: 1 } }}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    sx={{ mb: { xs: 0.75, sm: 1 } }}
                  >
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Progress
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      {Math.round(getProgressPercentage(order.status))}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(order.status)}
                    sx={{
                      height: { xs: 6, sm: 8 },
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                    }}
                  />
                </Box>

                <Divider sx={{ my: { xs: 1.5, sm: 1 } }} />

                {/* Order Items */}
                <Typography 
                  variant="subtitle2" 
                  fontWeight="600" 
                  sx={{ 
                    mb: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.8rem', sm: '0.9375rem' },
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
                        py: { xs: 0.75, sm: 1 },
                        gap: { xs: 1, sm: 1 },
                      }}
                    >
                      <Avatar
                        src={item.image_url}
                        alt={item.name}
                        sx={{ 
                          width: { xs: 36, sm: 40 }, 
                          height: { xs: 36, sm: 40 },
                        }}
                      >
                        <Restaurant />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            fontWeight="500"
                            sx={{ fontSize: { xs: '0.85rem', sm: '0.9375rem' } }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </Typography>
                        }
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight="600" 
                        color="primary.main"
                        sx={{ 
                          fontSize: { xs: '0.85rem', sm: '0.9375rem' },
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
                        pl: { xs: 6, sm: 7 },
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      }}
                    >
                      +{order.items.length - 3} more items
                    </Typography>
                  )}
                </List>

                <Divider sx={{ my: { xs: 1.5, sm: 1 } }} />

                {/* Total */}
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center"
                >
                  <Typography 
                    variant="h6" 
                    fontWeight="600"
                    sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
                  >
                    Total
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="700" 
                    color="primary.main"
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' } }}
                  >
                    {formatPrice((order.pricing.subtotal || 0) + (order.pricing.tax_amount || 0) - (order.pricing.discount_amount || 0))}
                  </Typography>
                </Stack>
              </CardContent>

              {/* Status Indicator Bar */}
              <Box
                sx={{
                  height: { xs: 3, sm: 4 },
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