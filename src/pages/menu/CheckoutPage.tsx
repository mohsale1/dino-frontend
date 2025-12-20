import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  Avatar,
  IconButton,
  Button,
  TextField,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  useTheme,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Person,
  Phone,
  CheckCircle,
  CreditCard,
  AccountBalanceWallet,
  Money,
  LocalOffer,
  LocationOn,
  Schedule,
  Restaurant,
  Receipt,
  ArrowBack,
  ArrowForward,
  Email,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import FloatingOrderConfirmation from '../../components/checkout/FloatingOrderConfirmation';

import { promoService, PromoValidation } from '../../services/api';
import { orderService } from '../../services/business';

import { useValidation } from '../../hooks/useValidation';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useToast } from '../../contexts/ToastContext';
import { 
  createCustomerValidationRules, 
  sanitizePhoneNumber,
  type CustomerFormData 
} from '../../utils/validation';

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  specialInstructions: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { cafeId, tableId, venueId } = useParams<{ cafeId?: string; tableId: string; venueId?: string }>();
  const actualCafeId = cafeId || venueId;
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount, getTotalItems } = useCart();
  const { handleApiError } = useErrorHandler();
  const toast = useToast();
  
  const [activeStep, setActiveStep] = useState(0);
  
  const customerValidation = useValidation<CustomerFormData>({
    rules: createCustomerValidationRules(),
    initialValues: {
      name: '',
      phone: '',
      email: '',
      specialInstructions: '',
    },
    validateOnChange: true,
    validateOnBlur: true,
  });
  
  const customerInfo = customerValidation.values as CustomerInfo;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<string[]>([]);

  useEffect(() => {
    const loadAvailablePromos = async () => {
      if (!actualCafeId) return;
      
      try {
        const promoCodes = await promoService.getActivePromoCodes(actualCafeId);
        setAvailablePromos(promoCodes.map(promo => promo.code));
      } catch (error) {
        // Silently handle error
      }
    };

    loadAvailablePromos();
  }, [actualCafeId]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: <Money />,
      description: 'Pay with cash at the table',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard />,
      description: 'Visa, Mastercard, Amex',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: <AccountBalanceWallet />,
      description: 'PayPal, Apple Pay, Google Pay',
    },
  ];

  const steps = ['Review Order', 'Customer Info', 'Payment'];

  const subtotal = getTotalAmount();
  const deliveryFee = subtotal >= 25 ? 0 : 2.99;
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const promoDiscount = appliedPromo ? appliedPromo.discount_amount : 0;
  const total = subtotal + deliveryFee + tax - promoDiscount;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !actualCafeId) {
      toast.showWarning('Please enter a valid promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const orderData = {
        venueId: actualCafeId,
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          unit_price: item.menuItem.price,
        })),
        subtotal: subtotal,
      };

      const validation = await promoService.validatePromoCode(promoCode.toUpperCase(), orderData);
      
      if (validation.is_valid) {
        setAppliedPromo(validation);
        setShowPromoDialog(false);
        setPromoCode('');
        toast.showSuccess(`Promo code ${promoCode.toUpperCase()} applied successfully!`);
      } else {
        toast.showError(validation.error_message || 'Invalid promo code');
      }
    } catch (error) {
      handleApiError(error, 'Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!actualCafeId || !tableId) {
      toast.showError('Missing venue or table information. Please try again.');
      return;
    }

    setLoading(true);
    
    try {
      if (!customerValidation.validateAll()) {
        toast.showWarning('Please fill in all required fields correctly');
        setActiveStep(1);
        setLoading(false);
        return;
      }
      
      const orderData = {
        venueId: actualCafeId,
        table_id: tableId,
        customer: {
          name: customerInfo.name.trim(),
          phone: sanitizePhoneNumber(customerInfo.phone),
          email: customerInfo.email?.trim() || undefined,
        },
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })),
        order_type: 'qr_scan' as const,
        special_instructions: customerInfo.specialInstructions,
      };

      const response = await orderService.createPublicOrder(orderData);
      
      if (response && (response.success || response.data)) {
        const orderResponseData = response.data?.data || response.data;
        const orderIdValue = orderResponseData?.order_id || orderResponseData?.id || orderResponseData?.order_number || 'ORDER_' + Date.now();
        
        const completeOrderData = {
          orderId: orderIdValue,
          orderNumber: orderResponseData?.order_number || orderIdValue,
          total: orderResponseData?.total || ((orderResponseData?.subtotal || 0) + (orderResponseData?.tax_amount || 0) - (orderResponseData?.discount_amount || 0)) || total,
          subtotal: orderResponseData?.subtotal || subtotal,
          tax: orderResponseData?.tax_amount || tax,
          deliveryFee: orderResponseData?.delivery_fee || deliveryFee,
          customerInfo: {
            name: orderResponseData?.customer?.name || customerInfo.name,
            phone: orderResponseData?.customer?.phone || customerInfo.phone,
            email: orderResponseData?.customer?.email || customerInfo.email,
          },
          tableId: orderResponseData?.table_id || tableId,
          venueId: orderResponseData?.venueId || actualCafeId,
          status: orderResponseData?.status || 'pending',
          estimatedTime: orderResponseData?.estimated_ready_time || orderResponseData?.estimated_minutes || 30,
          items: orderResponseData?.items || items.map(item => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
            total: item.menuItem.price * item.quantity
          })),
          createdAt: orderResponseData?.createdAt || new Date().toISOString(),
          paymentMethod: selectedPaymentMethod,
          specialInstructions: orderResponseData?.special_instructions || customerInfo.specialInstructions
        };
        
        // Clear cart and navigate immediately to success page
        clearCart();
        localStorage.setItem(`order_${orderIdValue}`, JSON.stringify(completeOrderData));
        
        // Navigate immediately without intermediate screen
        navigate(`/order-success/${orderIdValue}`, { 
          state: completeOrderData,
          replace: true 
        });
        
      } else {
        throw new Error(response?.message || 'Order creation failed - invalid response');
      }
    } catch (error: any) {
      if (error.response?.status === 200 || error.response?.status === 201) {
        const responseData = error.response?.data;
        
        if (responseData && (responseData.id || responseData.order_number || responseData.order_id)) {
          const orderIdValue = responseData.order_number || responseData.id || responseData.order_id;
          
          // Build order data for success page
          const completeOrderData = {
            orderId: orderIdValue,
            orderNumber: orderIdValue,
            total: responseData?.total || total,
            subtotal: responseData?.subtotal || subtotal,
            tax: responseData?.tax_amount || tax,
            deliveryFee: responseData?.delivery_fee || deliveryFee,
            customerInfo: {
              name: responseData?.customer?.name || customerInfo.name,
              phone: responseData?.customer?.phone || customerInfo.phone,
              email: responseData?.customer?.email || customerInfo.email,
            },
            tableId: responseData?.table_id || tableId,
            venueId: responseData?.venueId || actualCafeId,
            status: responseData?.status || 'pending',
            estimatedTime: responseData?.estimated_ready_time || responseData?.estimated_minutes || 30,
            items: responseData?.items || items.map(item => ({
              name: item.menuItem.name,
              quantity: item.quantity,
              price: item.menuItem.price,
              total: item.menuItem.price * item.quantity
            })),
            createdAt: responseData?.createdAt || new Date().toISOString(),
            paymentMethod: selectedPaymentMethod,
            specialInstructions: responseData?.special_instructions || customerInfo.specialInstructions
          };
          
          clearCart();
          localStorage.setItem(`order_${orderIdValue}`, JSON.stringify(completeOrderData));
          
          navigate(`/order-success/${orderIdValue}`, { 
            state: completeOrderData,
            replace: true 
          });
          return;
        }
      }
      
      handleApiError(error, 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: 
        return items.length > 0;
      case 1: 
        return customerValidation.isValid && 
               customerInfo.name?.trim() !== '' && 
               customerInfo.phone?.trim() !== '';
      case 2: 
        return !!selectedPaymentMethod;
      default: 
        return true;
    }
  };

  // Empty Cart State
  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#1E3A5F', color: 'white', py: 2 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                Checkout
              </Typography>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: 6 }}>
          <Box sx={{ textAlign: 'center', py: 6, backgroundColor: 'white', borderRadius: 1, border: '1px solid #E0E0E0' }}>
            <ShoppingCart sx={{ fontSize: 64, color: '#CED4DA', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2C3E50' }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add some delicious items to your cart to get started!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/menu/${actualCafeId}/${tableId}`)}
              startIcon={<Restaurant />}
              sx={{
                backgroundColor: '#1E3A5F',
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#2C5282' },
              }}
            >
              Browse Menu
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  // Order Placed State - Removed, navigating directly to success page

  // Main Checkout
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA', pb: activeStep === 2 ? 15 : 4 }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1E3A5F', color: 'white', py: 2, mb: 3 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
              Checkout
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Step Indicator */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
            {steps.map((step, index) => (
              <Box key={index} sx={{ flex: 1, maxWidth: 120 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 4,
                    backgroundColor: index <= activeStep ? '#1E3A5F' : '#E0E0E0',
                    borderRadius: 2,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                    color: index <= activeStep ? '#1E3A5F' : '#6C757D',
                    fontWeight: index === activeStep ? 700 : 500,
                    fontSize: '0.7rem',
                  }}
                >
                  {step}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Grid container spacing={3} sx={{ mb: activeStep === 2 ? 2 : 0 }}>
          {/* Main Content */}
          <Grid item xs={12} md={activeStep === 2 ? 8 : 12}>
            <Paper sx={{ backgroundColor: 'white', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
              {/* Step 0: Review Order */}
              {activeStep === 0 && (
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1E3A5F' }}>
                    Review Your Order ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </Typography>
                  
                  <List sx={{ p: 0 }}>
                    {items.map((item) => (
                      <ListItem
                        key={item.menuItem.id}
                        sx={{
                          px: 0,
                          py: 2,
                          borderBottom: '1px solid #E0E0E0',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                          <Avatar
                            src={item.menuItem.image}
                            sx={{ width: 60, height: 60, borderRadius: 1, border: '1px solid #E0E0E0' }}
                          >
                            <Restaurant />
                          </Avatar>
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 0.5 }}>
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  border: `2px solid ${item.menuItem.isVeg ? '#4CAF50' : '#F44336'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  mt: 0.25,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: item.menuItem.isVeg ? '50%' : 0,
                                    backgroundColor: item.menuItem.isVeg ? '#4CAF50' : '#F44336',
                                  }}
                                />
                              </Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#2C3E50' }}>
                                {item.menuItem.name}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              {formatPrice(item.menuItem.price)} each
                            </Typography>
                            {item.specialInstructions && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
                                Note: {item.specialInstructions}
                              </Typography>
                            )}
                          </Box>
                          
                          <Stack spacing={1} alignItems="flex-end">
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A5F', fontSize: '1.05rem' }}>
                              {formatPrice(item.menuItem.price * item.quantity)}
                            </Typography>
                            
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ border: '1px solid #E0E0E0', borderRadius: 1, p: 0.5 }}>
                              <IconButton size="small" onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)} sx={{ width: 24, height: 24 }}>
                                <Remove sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton size="small" onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)} sx={{ width: 24, height: 24 }}>
                                <Add sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(0)}
                      endIcon={<ArrowForward />}
                      fullWidth
                      sx={{
                        backgroundColor: '#1E3A5F',
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#2C5282' },
                      }}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/menu/${actualCafeId}/${tableId}`)}
                      startIcon={<Restaurant />}
                      fullWidth
                      sx={{
                        borderColor: '#1E3A5F',
                        color: '#1E3A5F',
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#2C5282' },
                      }}
                    >
                      Add More Items
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Step 1: Customer Information */}
              {activeStep === 1 && (
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E3A5F' }}>
                    Customer Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={customerInfo.name || ''}
                        onChange={customerValidation.handleChange('name')}
                        onBlur={customerValidation.handleBlur('name')}
                        required
                        error={customerValidation.touched.name && !!customerValidation.errors.name}
                        helperText={customerValidation.touched.name && customerValidation.errors.name}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: '#6C757D', fontSize: 20 }} />
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={customerInfo.phone || ''}
                        onChange={customerValidation.handleChange('phone')}
                        onBlur={customerValidation.handleBlur('phone')}
                        required
                        error={customerValidation.touched.phone && !!customerValidation.errors.phone}
                        helperText={customerValidation.touched.phone ? customerValidation.errors.phone : 'Enter 10-digit phone number'}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: '#6C757D', fontSize: 20 }} />
                        }}
                        inputProps={{ maxLength: 10, pattern: '[0-9]*', inputMode: 'numeric' }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email (Optional)"
                        name="email"
                        type="email"
                        value={customerInfo.email || ''}
                        onChange={customerValidation.handleChange('email')}
                        onBlur={customerValidation.handleBlur('email')}
                        error={customerValidation.touched.email && !!customerValidation.errors.email}
                        helperText={customerValidation.touched.email && customerValidation.errors.email}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: '#6C757D', fontSize: 20 }} />
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Instructions (Optional)"
                        name="specialInstructions"
                        value={customerInfo.specialInstructions || ''}
                        onChange={customerValidation.handleChange('specialInstructions')}
                        onBlur={customerValidation.handleBlur('specialInstructions')}
                        multiline
                        rows={3}
                        placeholder="Any special requests for your order..."
                        helperText={`${(customerInfo.specialInstructions || '').length}/500 characters`}
                      />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }} justifyContent="space-between">
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      sx={{
                        borderColor: '#1E3A5F',
                        color: '#1E3A5F',
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(1)}
                      endIcon={<ArrowForward />}
                      sx={{
                        backgroundColor: '#1E3A5F',
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#2C5282' },
                      }}
                    >
                      Continue
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Step 2: Payment Method */}
              {activeStep === 2 && (
                <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: { xs: 4, sm: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1E3A5F' }}>
                    Payment Method
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
                      {paymentMethods.map((method) => (
                        <Card
                          key={method.id}
                          sx={{
                            mb: 2,
                            border: selectedPaymentMethod === method.id ? '2px solid #1E3A5F' : '1px solid #E0E0E0',
                            cursor: 'pointer',
                            boxShadow: 'none',
                          }}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <FormControlLabel
                              value={method.id}
                              control={<Radio />}
                              label={
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Box sx={{ color: selectedPaymentMethod === method.id ? '#1E3A5F' : '#6C757D' }}>
                                    {React.cloneElement(method.icon as React.ReactElement, { sx: { fontSize: 28 } })}
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                      {method.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      {method.description}
                                    </Typography>
                                  </Box>
                                </Stack>
                              }
                              sx={{ margin: 0, width: '100%' }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  {/* Back Button */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }} justifyContent="space-between">
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      sx={{
                        borderColor: '#1E3A5F',
                        color: '#1E3A5F',
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Back
                    </Button>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Order Summary Sidebar - Only show in Payment step */}
          {activeStep === 2 && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2.5, pb: 4, backgroundColor: 'white', border: '1px solid #E0E0E0', boxShadow: 'none', position: 'sticky', top: 20, mb: { xs: 10, md: 0 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1E3A5F' }}>
                  Order Summary
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Subtotal ({getTotalItems()} items)</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatPrice(subtotal)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Delivery Fee</Typography>
                    <Typography variant="body2" fontWeight={600} color={deliveryFee === 0 ? '#28A745' : 'text.primary'}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Tax (8%)</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatPrice(tax)}</Typography>
                  </Stack>
                  {appliedPromo && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: '#28A745', fontWeight: 600 }}>
                        Promo ({appliedPromo.promo_code?.code})
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#28A745', fontWeight: 700 }}>
                        -{formatPrice(promoDiscount)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                
                <Divider sx={{ mb: 2 }} />
                
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1E3A5F' }}>
                    {formatPrice(total)}
                  </Typography>
                </Stack>

                {/* Promo Code Section */}
                <Box sx={{ mb: 2 }}>
                  {appliedPromo ? (
                    <Box sx={{ p: 1.5, backgroundColor: '#E8F5E9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #28A745' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalOffer sx={{ color: '#28A745', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#28A745', fontWeight: 600, fontSize: '0.85rem' }}>
                          {appliedPromo.promo_code?.code} Applied!
                        </Typography>
                      </Stack>
                      <IconButton size="small" onClick={handleRemovePromo} sx={{ color: '#28A745' }}>
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setShowPromoDialog(true)}
                      startIcon={<LocalOffer />}
                      sx={{
                        py: 1,
                        borderColor: '#1E3A5F',
                        color: '#1E3A5F',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      Apply Promo Code
                    </Button>
                  )}
                </Box>

                {/* Delivery Info */}
                <Box sx={{ p: 1.5, backgroundColor: '#F8F9FA', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn sx={{ fontSize: 18, color: '#1E3A5F' }} />
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                        Table Number: {tableId}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Floating Order Confirmation - Only show in Payment step */}
      {activeStep === 2 && (
        <FloatingOrderConfirmation
          totalAmount={total}
          loading={loading}
          disabled={!isStepValid(2)}
          onConfirm={handlePlaceOrder}
        />
      )}

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onClose={() => setShowPromoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>Apply Promo Code</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            sx={{ mt: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApplyPromo();
              }
            }}
          />
          
          {availablePromos.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Available Promo Codes:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {availablePromos.map((code) => (
                  <Chip
                    key={code}
                    label={code}
                    variant="outlined"
                    onClick={() => setPromoCode(code)}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowPromoDialog(false)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyPromo}
            variant="contained"
            disabled={!promoCode.trim() || promoLoading}
            startIcon={promoLoading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
            sx={{ backgroundColor: '#1E3A5F', fontWeight: 700, '&:hover': { backgroundColor: '#2C5282' } }}
          >
            {promoLoading ? 'Validating...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckoutPage;
