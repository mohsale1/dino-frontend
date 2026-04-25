import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Button,
  ButtonGroup,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import Delete from '@mui/icons-material/Delete';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Restaurant from '@mui/icons-material/Restaurant';
import LocalOffer from '@mui/icons-material/LocalOffer';
import Close from '@mui/icons-material/Close';
import { CartItem } from '../pos.types';

interface CartPanelProps {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalItems: number;
  discountAmount: string;
  setDiscountAmount: (v: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  onCheckout: () => void;
  inDrawer?: boolean;
  onClose?: () => void;
  formatINR: (n: number) => string;
}

const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  subtotal,
  discount,
  tax,
  total,
  totalItems,
  discountAmount,
  setDiscountAmount,
  updateQuantity,
  removeFromCart,
  clearCart,
  onCheckout,
  inDrawer = false,
  onClose,
  formatINR,
}) => {
  const isEmpty = cart.length === 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.5,
          py: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '1rem', lineHeight: 1 }}
          >
            Current Order
          </Typography>
          <Chip
            label={totalItems}
            size="small"
            sx={{
              bgcolor: '#1976D2',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 22,
              minWidth: 28,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Stack>

        {inDrawer && onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Scrollable Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#e0e0e0',
            borderRadius: 2,
          },
        }}
      >
        {isEmpty ? (
          /* Empty State */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5,
              }}
            >
              <ShoppingCart sx={{ fontSize: 34, color: '#94a3b8' }} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: '#1C1C1E', fontSize: '0.95rem' }}
            >
              Cart is empty
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
              Add items from the menu
            </Typography>
          </Box>
        ) : (
          <>
            {/* Cart Items */}
            <Stack spacing={1}>
              {cart.map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    transition: 'box-shadow 0.15s',
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    {/* Avatar */}
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: '#f1f5f9',
                        borderRadius: 1.5,
                        flexShrink: 0,
                      }}
                    >
                      <Restaurant sx={{ fontSize: 20, color: '#94a3b8' }} />
                    </Avatar>

                    {/* Name + Unit Price */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#1C1C1E',
                          fontSize: '0.82rem',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#1976D2', fontWeight: 700, fontSize: '0.78rem' }}
                      >
                        {formatINR(item.price)}
                      </Typography>
                    </Box>

                    {/* Qty Controls + Delete */}
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <ButtonGroup
                        size="small"
                        variant="outlined"
                        sx={{
                          '& .MuiButtonGroup-grouped': {
                            minWidth: 28,
                            px: 0,
                            borderColor: '#e0e0e0',
                            color: '#1C1C1E',
                            boxShadow: 'none',
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: '#1976D2',
                              color: '#1976D2',
                              bgcolor: 'transparent',
                            },
                          },
                        }}
                      >
                        <Button onClick={() => updateQuantity(item.id, -1)}>
                          <Remove sx={{ fontSize: 14 }} />
                        </Button>
                        <Button
                          disableRipple
                          sx={{
                            cursor: 'default',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: '#1C1C1E',
                            minWidth: '32px !important',
                            '&:hover': { bgcolor: 'transparent', borderColor: '#e0e0e0', color: '#1C1C1E' },
                          }}
                        >
                          {item.quantity}
                        </Button>
                        <Button onClick={() => updateQuantity(item.id, 1)}>
                          <Add sx={{ fontSize: 14 }} />
                        </Button>
                      </ButtonGroup>

                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.id)}
                        sx={{
                          color: '#ef4444',
                          ml: 0.25,
                          '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Line Total */}
                  <Box sx={{ mt: 0.75, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}
                    >
                      {formatINR(item.price * item.quantity)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>

            {/* Discount Field */}
            <TextField
              size="small"
              fullWidth
              label="Discount Amount"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOffer sx={{ fontSize: 16, color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e0e0e0' },
                  '&:hover fieldset': { borderColor: '#1976D2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976D2' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1976D2' },
              }}
            />

            {/* Order Summary */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                bgcolor: '#ffffff',
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                    Subtotal
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: '#1C1C1E', fontSize: '0.82rem' }}
                  >
                    {formatINR(subtotal)}
                  </Typography>
                </Stack>

                {discount > 0 && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#16a34a', fontSize: '0.82rem' }}>
                      Discount
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: '#16a34a', fontSize: '0.82rem' }}
                    >
                      -{formatINR(discount)}
                    </Typography>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                    Tax (10%)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: '#1C1C1E', fontSize: '0.82rem' }}
                  >
                    {formatINR(tax)}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    borderTop: '2px solid #f1f5f9',
                    pt: 1,
                    mt: 0.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9rem' }}
                  >
                    Total
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: '#1C1C1E', fontSize: '1rem' }}
                  >
                    {formatINR(total)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 2,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={isEmpty}
          startIcon={<CheckCircle />}
          onClick={onCheckout}
          sx={{
            bgcolor: '#1C1C1E',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderRadius: 2,
            py: 1.4,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#374151',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
            },
          }}
        >
          Checkout
        </Button>

        {!isEmpty && (
          <Button
            variant="text"
            fullWidth
            onClick={clearCart}
            sx={{
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: 2,
              py: 0.75,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' },
            }}
          >
            Clear Cart
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CartPanel;