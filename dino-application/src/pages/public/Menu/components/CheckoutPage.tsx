import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  alpha,
  useTheme,
  Stack,
  Chip,
  Fade,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  TableRestaurant as TableIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as CartIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { CartItem } from '../hooks/useCart';
import OrderSuccessAnimation from './OrderSuccessAnimation';

interface CheckoutPageProps {
  cart: CartItem[];
  customerInfo: { name: string; phone: string };
  organizationId: string;
  tableId: string;
  menuData: any;
  onBack: () => void;
  onOrderPlaced: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  customerInfo,
  organizationId,
  tableId,
  menuData,
  onBack,
  onOrderPlaced,
}) => {
  const theme = useTheme();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * 0.05; // 5% tax
  const serviceCharge = subtotal * 0.10; // 10% service charge
  const total = subtotal + tax + serviceCharge;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate order number
      const orderNum = `ORD-${Date.now().toString().slice(-8)}`;
      setOrderNumber(orderNum);

      // Mock successful order placement
      console.log('Order placed:', {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        items: cart,
        special_instructions: specialInstructions,
        total: total,
        order_number: orderNum
      });

      setShowSuccess(true);
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Container maxWidth="md">
          <Toolbar disableGutters sx={{ py: 1.5 }}>
            <IconButton 
              onClick={onBack} 
              disabled={loading} 
              edge="start" 
              sx={{ 
                mr: 2,
                bgcolor: '#f3f4f6',
                '&:hover': {
                  bgcolor: '#e5e7eb',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                Checkout
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review your order
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, pb: 12 }}>
        {/* Customer Details Card */}
        <Fade in timeout={300}>
          <Card 
            elevation={0}
            sx={{ 
              mb: 2.5, 
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                p: 2.5,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  opacity: 0.08,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <Box sx={{ position: 'relative' }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5 }}>
                  Customer Details
                </Typography>
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Name
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="white">
                        {customerInfo.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PhoneIcon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="white">
                        {customerInfo.phone}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TableIcon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Table Number
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="white">
                        {menuData.table.table_number}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Card>
        </Fade>

        {/* Order Items Card */}
        <Fade in timeout={400}>
          <Card 
            elevation={0}
            sx={{ 
              mb: 2.5, 
              borderRadius: 2,
              border: '1px solid #e5e7eb',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CartIcon sx={{ fontSize: 20, color: '#1a1a1a' }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
                    Order Items
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </Typography>
                </Box>
              </Box>
              <Stack spacing={2.5}>
                {cart.map((item, index) => (
                  <Box key={item.item_id}>
                    <Box display="flex" gap={2}>
                      {/* Item Image Placeholder */}
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1.5,
                          bgcolor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#e5e7eb' }}>
                          {item.item_name.charAt(0)}
                        </Typography>
                      </Box>
                      
                      {/* Item Details */}
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body1" fontWeight={600} color="#1a1a1a" sx={{ mb: 0.5 }}>
                          {item.item_name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Chip
                            label={`Qty: ${item.quantity}`}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: '#f3f4f6',
                              color: '#6b7280',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            â‚¹{item.unit_price.toFixed(2)} each
                          </Typography>
                        </Box>
                        {item.description && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Item Price */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                          â‚¹{item.total_price.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    {index < cart.length - 1 && <Divider sx={{ mt: 2.5 }} />}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Special Instructions Card */}
        <Fade in timeout={500}>
          <Card 
            elevation={0}
            sx={{ 
              mb: 2.5, 
              borderRadius: 2,
              border: '1px solid #e5e7eb',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EditIcon sx={{ fontSize: 20, color: '#1a1a1a' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
                    Special Instructions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Optional
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Any special requests or dietary requirements?"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: '#f9fafb',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Fade>

        {/* Bill Summary Card */}
        <Fade in timeout={600}>
          <Card 
            elevation={0}
            sx={{ 
              mb: 2.5, 
              borderRadius: 2,
              border: '1px solid #e5e7eb',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 20, color: '#1a1a1a' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
                  Bill Summary
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1a1a1a">
                    â‚¹{subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Tax (5%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1a1a1a">
                    â‚¹{tax.toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Service Charge (10%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1a1a1a">
                    â‚¹{serviceCharge.toFixed(2)}
                  </Typography>
                </Box>
                <Divider />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: '#f9fafb',
                    border: '2px solid #1a1a1a',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#1a1a1a">
                    â‚¹{total.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Error Message */}
        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2.5, 
                borderRadius: 1.5,
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Place Order Button */}
        <Fade in timeout={700}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            sx={{
              py: 2,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 1.5,
              bgcolor: '#1a1a1a',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: '#2d2d2d',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                bgcolor: '#e5e7eb',
                color: '#9ca3af',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1.5}>
                <CircularProgress size={24} sx={{ color: 'white' }} />
                <span>Placing Order...</span>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <span>Place Order</span>
                <Box 
                  component="span" 
                  sx={{ 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '0.875rem',
                  }}
                >
                  â‚¹{total.toFixed(2)}
                </Box>
              </Box>
            )}
          </Button>
        </Fade>

        {/* Trust Indicators */}
        <Fade in timeout={800}>
          <Box 
            sx={{ 
              mt: 3, 
              p: 2.5, 
              borderRadius: 1.5,
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              ðŸ”’ Secure Checkout â€¢ Your order will be confirmed instantly
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Questions? Contact our staff for assistance
            </Typography>
          </Box>
        </Fade>
      </Container>

      {/* Order Success Animation */}
      {showSuccess && (
        <OrderSuccessAnimation
          orderNumber={orderNumber}
          onComplete={onOrderPlaced}
        />
      )}
    </Box>
  );
};

export default CheckoutPage;