import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  keyframes,
  Fade,
  Slide,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Restaurant,
  Phone,
  LocationOn,
  Person,
  Receipt,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

interface OrderSuccessState {
  orderId: string;
  orderNumber?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  tableId: string;
  venueId: string;
  status?: string;
  estimatedTime?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  createdAt?: string;
  paymentMethod?: string;
  specialInstructions?: string;
}

// Animation for the success icon pop-in
const popIn = keyframes`
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

// Circular expansion animation from center
const circularExpand = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(25);
    opacity: 1;
  }
`;

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orderData, setOrderData] = useState<OrderSuccessState | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(true);
  const [showGreenExpansion, setShowGreenExpansion] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isNewOrder, setIsNewOrder] = useState(true);

  useEffect(() => {    
    // Get order data from navigation state or localStorage
    const stateData = location.state as OrderSuccessState;
    
    if (stateData) {      
      setOrderData(stateData);
      // Store in localStorage for page refresh
      localStorage.setItem(`order_${orderId}`, JSON.stringify(stateData));
      // This is a new order, show animation
      setIsNewOrder(true);
      setShowSuccessAnimation(true);
      setShowOrderDetails(false);
    } else {
      // Try to get from localStorage
      const storedData = localStorage.getItem(`order_${orderId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);        
        setOrderData(parsedData);
        // If data is from localStorage, skip animation
        setIsNewOrder(false);
        setShowSuccessAnimation(false);
        setShowOrderDetails(true);
      } else {        
        // Set a minimal fallback order data
        setOrderData({
          orderId: orderId || 'UNKNOWN',
          orderNumber: orderId || 'UNKNOWN',
          total: 0,
          customerInfo: {
            name: 'Customer',
            phone: 'N/A'
          },
          tableId: 'N/A',
          venueId: 'N/A',
          status: 'pending',
          estimatedTime: 30,
          createdAt: new Date().toISOString()
        });
        setIsNewOrder(false);
        setShowSuccessAnimation(false);
        setShowOrderDetails(true);
      }
    }
  }, [orderId, location.state]);

  // Animation sequence - only run for new orders
  useEffect(() => {
    if (showSuccessAnimation && orderData && isNewOrder) {
      // Step 1: Show icon animation for 1.5s
      const timer1 = setTimeout(() => {
        setShowGreenExpansion(true);
      }, 1500);

      // Step 2: After green expansion (0.8s), transition to order details
      const timer2 = setTimeout(() => {
        setShowSuccessAnimation(false);
        setTimeout(() => {
          setShowOrderDetails(true);
        }, 300);
      }, 2300); // 1500 + 800

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [showSuccessAnimation, orderData, isNewOrder]);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const handleTrackOrder = () => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handleOrderMore = () => {
    if (orderData) {
      navigate(`/menu/${orderData.venueId}/${orderData.tableId}`);
    } else {
      navigate('/');
    }
  };

  // Show loading state while order data is being loaded
  if (!orderData && orderId) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#1E3A5F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2, color: 'white' }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
            Loading Order Details...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Please wait while we retrieve your order information.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: showOrderDetails ? '#1E3A5F' : 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, sm: 3 },
      position: 'relative',
      overflow: 'hidden',
      transition: 'background-color 0.3s ease',
    }}>
      {/* Success Animation Screen */}
      <Fade in={showSuccessAnimation} timeout={500} unmountOnExit>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            zIndex: 10,
          }}
        >
          {/* Green circular expansion */}
          {showGreenExpansion && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 120, sm: 140 },
                height: { xs: 120, sm: 140 },
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                animation: `${circularExpand} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                zIndex: 1,
              }}
            />
          )}

          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            {/* Animated Success Icon */}
            <Box 
              sx={{ 
                position: 'relative',
                display: 'inline-block',
                mb: 3,
              }}
            >
              {/* Main success icon */}
              <Box
                sx={{
                  width: { xs: 120, sm: 140 },
                  height: { xs: 120, sm: 140 },
                  margin: '0 auto',
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.6)',
                  position: 'relative',
                  zIndex: 3,
                  animation: `${popIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
                }}
              >
                <CheckCircle 
                  sx={{ 
                    fontSize: { xs: 70, sm: 80 }, 
                    color: 'white',
                  }} 
                />
              </Box>
            </Box>
            
            {/* Success Message */}
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 2, 
                fontWeight: 700, 
                color: showGreenExpansion ? 'white' : '#2C3E50',
                fontSize: { xs: '2rem', sm: '2.5rem' },
                textShadow: showGreenExpansion ? '0 2px 10px rgba(0, 0, 0, 0.3)' : 'none',
                transition: 'color 0.3s ease',
              }}
            >
              Order Placed!
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                fontWeight: 500,
                color: showGreenExpansion ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)',
                transition: 'color 0.3s ease',
              }}
            >
              Your order has been confirmed
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* Order Details Screen - Only render when ready to show */}
      {showOrderDetails && (
        <Fade in={showOrderDetails} timeout={600}>
          <Container maxWidth="sm">
            <Slide direction="up" in={showOrderDetails} timeout={500}>
            <Box>
              {/* Compact Success Header */}
              <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                <Box
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    margin: '0 auto',
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)',
                    mb: 1.5,
                  }}
                >
                  <CheckCircle 
                    sx={{ 
                      fontSize: { xs: 60, sm: 72 }, 
                      color: 'white',
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 700, 
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '1.75rem' }
                  }}
                >
                  Order Confirmed!
                </Typography>

                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.95rem'
                  }}
                >
                  Thank you for your order
                </Typography>
              </Box>

              {/* Order ID Card */}
              <Box sx={{ 
                mb: 3, 
                p: 2.5,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                border: '2px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                  Order ID
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'white',
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: 1
                  }}
                >
                  #{orderData?.orderNumber || orderId}
                </Typography>
              </Box>


              {/* Minimal Order Summary */}
              <Box sx={{ 
                mb: 3, 
                p: 2.5,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}>
                <Stack spacing={2}>
                  {/* Customer & Table Info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Person sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        Customer
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                        {orderData?.customerInfo.name}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Phone sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                        {orderData?.customerInfo.phone}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <LocationOn sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        Table Number
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                        Table {orderData?.tableId}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

                  {/* Items Count & Total */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Receipt sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        Items
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                        {orderData?.items?.length || 0} {orderData?.items?.length === 1 ? 'item' : 'items'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

                  {/* Total Amount */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 700, fontSize: '1.5rem' }}>
                      {formatPrice(orderData?.total || 0)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleTrackOrder}
                  startIcon={<Schedule />}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '1rem',
                    backgroundColor: '#4CAF50',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                    '&:hover': {
                      backgroundColor: '#45a049',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Track Order
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleOrderMore}
                  startIcon={<Restaurant />}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '1rem',
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.5)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Order More
                </Button>
              </Stack>

              {/* Thank You Message */}
              <Box sx={{ 
                pt: 2,
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                  Thank you for choosing Dino! We hope you enjoy your meal!
                </Typography>
              </Box>
            </Box>
          </Slide>
        </Container>
      </Fade>
      )}
    </Box>
  );
};

export default OrderSuccessPage;
