import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Button,
  InputAdornment,
  Stack,
  Fade,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Restaurant as RestaurantIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { publicMenuService } from '../../../../services/application/publicMenuService';

interface OrdersFragmentProps {
  organizationId: string;
  tableId: string;
  customerPhone?: string;
}

const COLORS = {
  primary: '#1a1a1a',
  accent: '#f97316',
  bg: '#fafafa',
  card: '#ffffff',
  border: '#e8e8e8',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
};

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  confirmed:  { bg: '#dbeafe', color: '#2563eb', label: 'Confirmed' },
  preparing:  { bg: '#dbeafe', color: '#2563eb', label: 'Preparing' },
  ready:      { bg: '#dcfce7', color: '#16a34a', label: 'Ready' },
  served:     { bg: '#dcfce7', color: '#16a34a', label: 'Served' },
  completed:  { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

const PAYMENT_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  paid:    { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
  unpaid:  { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
  pending: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
};

const OrdersFragment: React.FC<OrdersFragmentProps> = ({
  organizationId,
  tableId,
  customerPhone: initialPhone,
}) => {
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

      const fetchedOrders = await publicMenuService.getOrders(
        organizationId,
        tableId,
        phoneNumber,
      );

      setOrders(fetchedOrders);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':  return <ScheduleIcon fontSize="small" />;
      case 'preparing':  return <RestaurantIcon fontSize="small" />;
      case 'ready':      return <ShippingIcon fontSize="small" />;
      case 'served':
      case 'completed':  return <CheckCircleIcon fontSize="small" />;
      default:           return <ScheduleIcon fontSize="small" />;
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

  const getStatusCfg = (status: string) =>
    STATUS_CONFIG[status] ?? { bg: '#f3f4f6', color: '#6b7280', label: status };

  const getPaymentCfg = (paymentStatus: string) =>
    PAYMENT_CONFIG[paymentStatus] ?? { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };

  return (
    <Box>
      {/* Phone Search Card */}
      {!initialPhone && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
            bgcolor: COLORS.card,
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: COLORS.textPrimary, mb: 0.5 }}
            >
              Track Your Orders
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: COLORS.textSecondary, mb: 2.5 }}
            >
              Enter your phone number to view your order history at this table.
            </Typography>

            <Box display="flex" gap={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Phone number"
                type="tel"
                inputProps={{ maxLength: 15 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: COLORS.bg,
                    fontSize: '0.95rem',
                    '& fieldset': { borderColor: COLORS.border },
                    '&:hover fieldset': { borderColor: '#d1d5db' },
                    '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: 2 },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || phone.length < 10}
                sx={{
                  minWidth: 110,
                  height: 56,
                  fontWeight: 700,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  bgcolor: COLORS.accent,
                  boxShadow: 'none',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: '#ea6c0a',
                    boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: alpha('#f97316', 0.4),
                    color: 'white',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  <>
                    <SearchIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    Search
                  </>
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 2.5,
            border: '1px solid #fecaca',
            bgcolor: '#fff5f5',
            '& .MuiAlert-icon': { color: '#dc2626' },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <Box textAlign="center">
            <CircularProgress
              size={40}
              thickness={4}
              sx={{ color: COLORS.accent }}
            />
            <Typography
              variant="body2"
              sx={{ mt: 2, color: COLORS.textSecondary, fontWeight: 500 }}
            >
              Loading your orders...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {!loading && hasSearched && orders.length === 0 && !error && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            bgcolor: COLORS.card,
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ color: COLORS.textPrimary, mb: 0.5 }}
          >
            No orders found
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            We couldn't find any orders linked to this number at this table.
          </Typography>
        </Box>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <Stack spacing={2}>
          {orders.map((order: any) => {
            const statusCfg = getStatusCfg(order.status);
            const paymentCfg = getPaymentCfg(order.payment_status);

            return (
              <Fade in key={order.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${COLORS.border}`,
                    bgcolor: COLORS.card,
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: `1px solid ${COLORS.border}`,
                      bgcolor: '#fafafa',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ color: COLORS.textPrimary, letterSpacing: '-0.01em' }}
                      >
                        Order #{order.order_number}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: COLORS.textSecondary, mt: 0.25, display: 'block' }}
                      >
                        {formatDate(order.created_at)}
                      </Typography>
                    </Box>

                    {/* Status Badge */}
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: '20px',
                        bgcolor: statusCfg.bg,
                      }}
                    >
                      <Box
                        sx={{
                          color: statusCfg.color,
                          display: 'flex',
                          alignItems: 'center',
                          '& svg': { fontSize: 14 },
                        }}
                      >
                        {getStatusIcon(order.status)}
                      </Box>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: statusCfg.color, lineHeight: 1 }}
                      >
                        {statusCfg.label}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    {/* Items List */}
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        color: COLORS.textSecondary,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 1.5,
                      }}
                    >
                      Items
                    </Typography>

                    <Stack spacing={1}>
                      {order.items.map((item: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1.25,
                            px: 1.5,
                            borderRadius: 2,
                            bgcolor: COLORS.bg,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                color: COLORS.textPrimary,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.item_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: COLORS.textSecondary }}
                            >
                              ₹{item.unit_price.toFixed(2)} &times; {item.quantity}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: COLORS.textPrimary, ml: 2, flexShrink: 0 }}
                          >
                            ₹{item.total_price.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    {/* Bill Summary */}
                    <Box
                      sx={{
                        mt: 2.5,
                        pt: 2,
                        borderTop: `1px dashed ${COLORS.border}`,
                      }}
                    >
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            Subtotal
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                            ₹{order.subtotal.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            Tax (5%)
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                            ₹{order.tax_amount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            Service Charge (10%)
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                            ₹{order.service_charge.toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 1.5, borderColor: COLORS.border }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{ color: COLORS.textPrimary }}
                        >
                          Total
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{ color: COLORS.accent, letterSpacing: '-0.02em' }}
                        >
                          ₹{order.total_amount.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Payment Status */}
                    <Box mt={2}>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '20px',
                          bgcolor: paymentCfg.bg,
                          border: `1px solid ${paymentCfg.border}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{ color: paymentCfg.color }}
                        >
                          Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default OrdersFragment;
