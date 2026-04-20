import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  DeleteOutline as DeleteIcon,
  ShoppingCartOutlined as EmptyCartIcon,
} from '@mui/icons-material';
import { CartItem } from '../hooks/useCart';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onCheckout: () => void;
}

const TAX_RATE = 0.05;
const SERVICE_RATE = 0.10;

const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  cart,
  onUpdateQuantity,
  onCheckout,
}) => {
  const subtotal = cart.reduce((s, i) => s + i.total_price, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE);
  const total = subtotal + tax + serviceCharge;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f8fafc',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Your Cart</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, p: 0.75 }}
        >
          <CloseIcon sx={{ fontSize: 16, color: '#64748b' }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {cart.length === 0 ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <EmptyCartIcon sx={{ fontSize: 52, color: '#e2e8f0' }} />
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>Your cart is empty</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', px: 3 }}>
              Browse the menu and add items to get started
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {cart.map((item) => (
              <Box
                key={item.item_id}
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    width: 52,
                    height: 52,
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
                    <Typography sx={{ fontSize: '1.3rem' }}>🍽️</Typography>
                  )}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.item_name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#f97316', mt: 0.25 }}>
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                {/* Qty stepper */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)}
                    sx={{ bgcolor: '#f1f5f9', borderRadius: 1, p: 0.4, '&:hover': { bgcolor: item.quantity === 1 ? '#fee2e2' : '#e2e8f0' } }}
                  >
                    {item.quantity === 1 ? (
                      <DeleteIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                    ) : (
                      <RemoveIcon sx={{ fontSize: 14, color: '#374151' }} />
                    )}
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
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {cart.length > 0 && (
        <Box
          sx={{
            bgcolor: '#fff',
            borderTop: '1px solid #e2e8f0',
            px: 2.5,
            py: 2,
            flexShrink: 0,
          }}
        >
          {/* Bill summary */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Subtotal</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>₹{subtotal.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Tax (5%)</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>₹{tax.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Service (10%)</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>₹{serviceCharge.toLocaleString('en-IN')}</Typography>
            </Box>
            <Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Total</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>₹{total.toLocaleString('en-IN')}</Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => { onClose(); onCheckout(); }}
            sx={{
              bgcolor: '#f97316',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              borderRadius: 2,
              py: 1.3,
              boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              '&:hover': { bgcolor: '#ea6c0a', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' },
            }}
          >
            Proceed to Checkout · ₹{total.toLocaleString('en-IN')}
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;