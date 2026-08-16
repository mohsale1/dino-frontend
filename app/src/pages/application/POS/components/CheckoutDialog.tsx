import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  IconButton,
  Alert,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  PointOfSale,
  Close,
  Person,
  Phone,
  TableRestaurant,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  Receipt,
} from '@mui/icons-material';
import { CartItem } from '../pos.types';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalItems: number;
  tables: Array<{ id: string; table_number?: string; tableNumber?: string }>;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  selectedTableId: string;
  setSelectedTableId: (v: string) => void;

  paymentMethod: 'cash' | 'card' | 'wallet';
  setPaymentMethod: (v: 'cash' | 'card' | 'wallet') => void;
  processingOrder: boolean;
  orderError: string;
  onPlaceOrder: () => void;
  formatINR: (n: number) => string;
  includeTax: boolean;
  onToggleTax: () => void;
}

const PAYMENT_METHODS: Array<{
  value: 'cash' | 'card' | 'wallet';
  label: string;
  icon: React.ReactNode;
}> = [
  { value: 'cash', label: 'Cash', icon: <AttachMoney fontSize="small" /> },
  { value: 'card', label: 'Card', icon: <CreditCard fontSize="small" /> },
  { value: 'wallet', label: 'Wallet', icon: <AccountBalanceWallet fontSize="small" /> },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    '&:hover fieldset': { borderColor: '#0f172a' },
    '&.Mui-focused fieldset': { borderColor: '#0f172a' },
  },
  '& label.Mui-focused': { color: '#0f172a' },
};

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0f172a',
      }}
    >
      {icon}
    </Box>
    <Typography variant="subtitle2" fontWeight={600} color="#0f172a">
      {label}
    </Typography>
  </Box>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}> = ({ label, value, bold = false, color }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography
      variant="body2"
      sx={{
        fontWeight: bold ? 800 : 400,
        fontSize: bold ? '0.9rem' : '0.82rem',
        color: color ?? (bold ? '#0f172a' : '#64748b'),
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: bold ? 800 : 500,
        fontSize: bold ? '1rem' : '0.82rem',
        color: color ?? '#0f172a',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  cart,
  subtotal,
  discount,
  tax,
  total,
  totalItems,
  tables,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  selectedTableId,
  setSelectedTableId,

  paymentMethod,
  setPaymentMethod,
  processingOrder,
  orderError,
  onPlaceOrder,
  formatINR,
  includeTax,
  onToggleTax,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {/* Icon Box */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: '#0f172a',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <PointOfSale fontSize="small" />
          </Box>

          {/* Title + Subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              Checkout
            </Typography>
            <Typography variant="caption" color="#64748b">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} &bull; {formatINR(total)}
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={3}>
          {/* 1. Order Summary */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Receipt fontSize="small" sx={{ color: '#0f172a' }} />
                <Typography variant="subtitle2" fontWeight={600} color="#0f172a">
                  Order Summary
                </Typography>
              </Box>

              {/* Cart Items */}
              <Stack spacing={1} sx={{ mb: 1.5 }}>
                {cart.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Chip
                      label={item.quantity}
                      size="small"
                      sx={{
                        bgcolor: '#0f172a',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 22,
                        minWidth: 28,
                        borderRadius: 1,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#0f172a',
                        fontSize: '0.82rem',
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: '#0f172a', fontSize: '0.82rem', flexShrink: 0 }}
                    >
                      {formatINR(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider sx={{ borderColor: '#e0e0e0' }} />

            {/* Totals */}
            <Stack spacing={0.75} sx={{ px: 2, py: 1.5 }}>
              <SummaryRow label="Subtotal" value={formatINR(subtotal)} />
              {discount > 0 && (
                <SummaryRow label="Discount" value={`-${formatINR(discount)}`} color="#16a34a" />
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={includeTax}
                    onChange={onToggleTax}
                    sx={{
                      color: '#0f172a',
                      '&.Mui-checked': { color: '#0f172a' },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Include Service Tax (10%)
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              {includeTax && (
                <SummaryRow label="Tax (10%)" value={formatINR(tax)} />
              )}
              <Box sx={{ borderTop: '2px solid #f1f5f9', pt: 0.75, mt: 0.25 }}>
                <SummaryRow label="Total" value={formatINR(total)} bold />
              </Box>
            </Stack>
          </Paper>

          {/* 2. Customer Details */}
          <Box>
            <SectionLabel icon={<Person fontSize="small" />} label="Customer Details" />
            <Stack spacing={2}>
              <TextField
                label="Customer Name"
                fullWidth
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                label="Phone Number"
                fullWidth
                size="small"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              {tables.length > 0 && (
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ '&.Mui-focused': { color: '#0f172a' } }}>
                    Table (optional)
                  </InputLabel>
                  <Select
                    value={selectedTableId}
                    label="Table (optional)"
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <TableRestaurant fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 1.5,
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0f172a' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0f172a' },
                    }}
                  >
                    <MenuItem value="">
                      <Typography color="#64748b">No table</Typography>
                    </MenuItem>
                    {tables.map((table) => (
                      <MenuItem key={table.id} value={table.id}>
                        {table.table_number ?? table.tableNumber ?? table.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </Box>

          {/* 3. Payment Method */}
          <Box>
            <SectionLabel icon={<CreditCard fontSize="small" />} label="Payment Method" />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {PAYMENT_METHODS.map((method) => {
                const isActive = paymentMethod === method.value;
                return (
                  <Button
                    key={method.value}
                    variant={isActive ? 'contained' : 'outlined'}
                    startIcon={method.icon}
                    onClick={() => setPaymentMethod(method.value)}
                    sx={{
                      flex: 1,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      py: 1,
                      boxShadow: 'none',
                      ...(isActive
                        ? {
                            bgcolor: '#0f172a',
                            color: '#fff',
                            borderColor: '#0f172a',
                            '&:hover': { bgcolor: '#1e293b', borderColor: '#1e293b', boxShadow: 'none' },
                          }
                        : {
                            bgcolor: '#fff',
                            color: '#64748b',
                            borderColor: '#e0e0e0',
                            '&:hover': {
                              borderColor: '#0f172a',
                              color: '#0f172a',
                              bgcolor: '#fff',
                              boxShadow: 'none',
                            },
                          }),
                    }}
                  >
                    {method.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* 4. Error Alert */}
          {orderError && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1.5,
                '& .MuiAlert-message': { fontSize: '0.875rem' },
              }}
            >
              {orderError}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #e0e0e0',
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            borderColor: '#e0e0e0',
            boxShadow: 'none',
            '&:hover': { borderColor: '#0f172a', color: '#0f172a', bgcolor: '#fff', boxShadow: 'none' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onPlaceOrder}
          variant="contained"
          disabled={processingOrder}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#0f172a',
            color: '#fff',
            px: 3,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          {processingOrder ? 'Placing Order...' : 'Place Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;