import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
} from '@mui/material';
import { CheckCircle, Kitchen, Print } from '@mui/icons-material';

interface OrderConfirmationProps {
  open: boolean;
  onClose: () => void;
  completedOrder: {
    orderNumber: string;
    customer: { name: string; phone: string };
    paymentMethod: string;
    total: number;
    tableNumber?: string;
  } | null;
  onPrintReceipt: () => void;
  onPrintKOT: () => void;
  formatINR: (n: number) => string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  open,
  onClose,
  completedOrder,
  onPrintReceipt,
  onPrintKOT,
  formatINR,
}) => {
  if (!completedOrder) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        {/* Success Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircle sx={{ color: '#0f172a', fontSize: 40 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1C1C1E', mb: 0.5 }}
        >
          Order Confirmed
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{ color: '#64748b', fontSize: '0.85rem', mb: 3 }}
        >
          Order #{completedOrder.orderNumber} has been placed successfully.
        </Typography>

        {/* Details Paper */}
        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#f8fafc',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            textAlign: 'left',
          }}
        >
          <Stack spacing={1}>
            {completedOrder.customer.name && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                  Customer
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#1C1C1E', fontSize: '0.82rem' }}
                >
                  {completedOrder.customer.name}
                </Typography>
              </Box>
            )}

            {completedOrder.customer.phone && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                  Phone
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#1C1C1E', fontSize: '0.82rem' }}
                >
                  {completedOrder.customer.phone}
                </Typography>
              </Box>
            )}

            {completedOrder.tableNumber && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                  Table
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#1C1C1E', fontSize: '0.82rem' }}
                >
                  {completedOrder.tableNumber}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                Payment Method
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#1C1C1E',
                  fontSize: '0.82rem',
                  textTransform: 'capitalize',
                }}
              >
                {completedOrder.paymentMethod}
              </Typography>
            </Box>

            <Box
              sx={{
                borderTop: '1px solid #e0e0e0',
                pt: 1,
                mt: 0.25,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                Total Amount
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9rem' }}
              >
                {formatINR(completedOrder.total)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Kitchen />}
            onClick={onPrintKOT}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e0e0e0',
              color: '#1C1C1E',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#0f172a',
                color: '#0f172a',
                bgcolor: '#fff',
                boxShadow: 'none',
              },
            }}
          >
            Print KOT
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Print />}
            onClick={onPrintReceipt}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e0e0e0',
              color: '#1C1C1E',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#0f172a',
                color: '#0f172a',
                bgcolor: '#fff',
                boxShadow: 'none',
              },
            }}
          >
            Print Bill
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#0f172a',
              color: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
            }}
          >
            Done
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OrderConfirmation;