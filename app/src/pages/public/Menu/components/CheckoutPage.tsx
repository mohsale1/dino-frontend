import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { publicMenuService, PublicOrder, type PublicMenuWithValidation } from '../../../../services/application/publicMenuService';
import { CartItem } from '../hooks/useCart';
import OrderSuccessAnimation from './OrderSuccessAnimation';

interface CheckoutPageProps {
  cart: CartItem[];
  customerInfo: { name: string; phone: string };
  organizationId: string;
  personaId: string;
  tableId?: string;
  menuData: PublicMenuWithValidation;
  onBack: () => void;
  onOrderPlaced: (order: PublicOrder) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  customerInfo,
  organizationId,
  personaId,
  tableId,
  menuData,
  onBack,
  onOrderPlaced,
  onUpdateQuantity,
}) => {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PublicOrder | null>(null);

  const { tax_rate, tax_label, service_charge_rate, service_charge_label } = menuData.billing_config;
  const subtotal = cart.reduce((s, i) => s + i.total_price, 0);
  const tax = Math.round(subtotal * tax_rate);
  const serviceCharge = Math.round(subtotal * service_charge_rate);
  const total = subtotal + tax + serviceCharge;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await publicMenuService.createOrder({
        workspace_id: organizationId,
        persona_id: personaId,
        table_id: tableId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        items: cart.map((i) => ({
          item_id: i.item_id,
          quantity: i.quantity,
        })),
        special_instructions: specialInstructions.trim() || undefined,
      });
      setPlacedOrder(order);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  // Show success animation
  if (placedOrder) {
    return (
      <OrderSuccessAnimation
        orderNumber={placedOrder.order_number}
        onComplete={() => onOrderPlaced(placedOrder)}
      />
    );
  }

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          onClick={onBack}
          sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, p: 0.75 }}
        >
          <BackIcon sx={{ fontSize: 18, color: '#374151' }} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Review Order</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {menuData.venue.name} · Table {menuData.table?.table_number}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#f97316' }}>
          {cart.reduce((s, i) => s + i.quantity, 0)} items
        </Typography>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', pb: '100px' }}>

        {/* Customer info card */}
        <Box sx={{ mx: 2, mt: 2, bgcolor: '#0f172a', borderRadius: 2.5, p: 2, mb: 2 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748b', mb: 1.5 }}>
            Customer Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{customerInfo.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>{customerInfo.phone}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Order items */}
        <Box sx={{ mx: 2, bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e2e8f0', overflow: 'hidden', mb: 2 }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>Order Items</Typography>
          </Box>
          {cart.map((item, idx) => (
            <Box key={item.item_id}>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Image */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    flexShrink: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.image_url ? (
                    <Box component="img" src={item.image_url} alt={item.item_name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Typography sx={{ fontSize: '1.2rem' }}>🍽️</Typography>
                  )}
                </Box>

                {/* Name + price */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.item_name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    ₹{item.unit_price.toLocaleString('en-IN')} each
                  </Typography>
                </Box>

                {/* Qty stepper */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)}
                    sx={{ bgcolor: '#f1f5f9', borderRadius: 1, p: 0.4, '&:hover': { bgcolor: '#fee2e2' } }}
                  >
                    {item.quantity === 1 ? <DeleteIcon sx={{ fontSize: 14, color: '#ef4444' }} /> : <RemoveIcon sx={{ fontSize: 14, color: '#374151' }} />}
                  </IconButton>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', minWidth: 20, textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
                    sx={{ bgcolor: '#f97316', borderRadius: 1, p: 0.4, '&:hover': { bgcolor: '#ea6c0a' } }}
                  >
                    <AddIcon sx={{ fontSize: 14, color: '#fff' }} />
                  </IconButton>
                </Box>

                {/* Total */}
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', minWidth: 56, textAlign: 'right' }}>
                  ₹{item.total_price.toLocaleString('en-IN')}
                </Typography>
              </Box>
              {idx < cart.length - 1 && <Divider sx={{ borderColor: '#f8fafc' }} />}
            </Box>
          ))}
        </Box>

        {/* Special instructions */}
        <Box sx={{ mx: 2, mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Any special instructions? (allergies, preferences...)"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.875rem',
                bgcolor: '#fff',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#f97316' },
                '&.Mui-focused fieldset': { borderColor: '#f97316' },
              },
            }}
          />
        </Box>

        {/* Bill summary */}
        <Box sx={{ mx: 2, bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e2e8f0', p: 2, mb: 2 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', mb: 1.5 }}>Bill Summary</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Subtotal</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>₹{subtotal.toLocaleString('en-IN')}</Typography>
            </Box>
            {tax_rate > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {tax_label} ({(tax_rate * 100).toFixed(0)}%)
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>₹{tax.toLocaleString('en-IN')}</Typography>
              </Box>
            )}
            {service_charge_rate > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {service_charge_label} ({(service_charge_rate * 100).toFixed(0)}%)
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>₹{serviceCharge.toLocaleString('en-IN')}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Total</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>₹{total.toLocaleString('en-IN')}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Box sx={{ mx: 2, mb: 2, bgcolor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 2, px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#7f1d1d' }}>{error}</Typography>
          </Box>
        )}
      </Box>

      {/* Fixed bottom bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: '#fff',
          borderTop: '1px solid #e2e8f0',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          zIndex: 100,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>Total amount</Typography>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>₹{total.toLocaleString('en-IN')}</Typography>
        </Box>
        <Button
          variant="contained"
          fullWidth
          disabled={placing || cart.length === 0}
          onClick={handlePlaceOrder}
          sx={{
            bgcolor: '#0f172a',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'none',
            borderRadius: 2,
            py: 1.3,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
            '&:disabled': { bgcolor: '#94a3b8' },
          }}
        >
          {placing ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Place Order'}
        </Button>
      </Box>
    </Box>
  );
};

export default CheckoutPage;