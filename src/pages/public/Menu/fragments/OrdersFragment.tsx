import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Button,
  alpha,
  useTheme,
  Stack,
  Fade,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Restaurant as RestaurantIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { mockOrders } from '../mockData';

interface OrdersFragmentProps {
  organizationId: string;
  tableId: string;
  customerPhone?: string;
}

const OrdersFragment: React.FC<OrdersFragmentProps> = ({
  organizationId,
  tableId,
  customerPhone: initialPhone,
}) => {
  const theme = useTheme();
  const [phone, setPhone] = useState(initialPhone || '');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialPhone) {
      loadOrders(initialPhone);
    }
  }, [initialPhone]);

  const loadOrders = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Use mock data - filter by phone number
      const filteredOrders = mockOrders.filter(
        order => order.customer_phone === phoneNumber
      );

      setOrders(filteredOrders);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadOrders(phone);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'preparing':
        return 'info';
      case 'ready':
      case 'served':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <ScheduleIcon fontSize="small" />;
      case 'preparing':
        return <RestaurantIcon fontSize="small" />;
      case 'ready':
        return <ShippingIcon fontSize="small" />;
      case 'served':
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Phone Number Input */}
      {!initialPhone && (
        <Card sx={{ mb: 3, borderRadius: 1.5, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              View Your Orders
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter your phone number to view your order history
            </Typography>
            <Box display="flex" gap={1.5}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your phone number"
                type="tel"
                inputProps={{ maxLength: 15 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || phone.length < 10}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{
                  minWidth: 120,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <Box textAlign="center">
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading orders...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && hasSearched && orders.length === 0 && (
        <Card sx={{ borderRadius: 1.5, boxShadow: theme.shadows[1] }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You haven't placed any orders yet
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <Stack spacing={2}>
          {orders.map((order: any) => (
            <Fade in={true} key={order.id}>
              <Card
                sx={{
                  borderRadius: 1.5,
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Order Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2.5}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Order #{order.order_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(order.created_at)}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status) as any}
                      size="small"
                      icon={getStatusIcon(order.status)}
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Items */}
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Items
                    </Typography>
                    <Stack spacing={1.5} mt={1.5}>
                      {order.items.map((item: any, index: number) => (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {item.item_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{item.unit_price.toFixed(2)} × {item.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={700}>
                            ₹{item.total_price.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Total */}
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body2">
                        ₹{order.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Tax (5%)
                      </Typography>
                      <Typography variant="body2">
                        ₹{order.tax_amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Service Charge (10%)
                      </Typography>
                      <Typography variant="body2">
                        ₹{order.service_charge.toFixed(2)}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        Total
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ₹{order.total_amount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Payment Status */}
                  <Box mt={2}>
                    <Chip
                      label={`Payment: ${order.payment_status.toUpperCase()}`}
                      size="small"
                      color={order.payment_status === 'paid' ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OrdersFragment;