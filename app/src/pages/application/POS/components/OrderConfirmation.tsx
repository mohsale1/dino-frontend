import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
} from '@mui/material'
import { CheckCircle, Print } from '@mui/icons-material'

interface OrderConfirmationProps {
  open: boolean
  onClose: () => void
  completedOrder: {
    orderNumber: string
    customer: { name: string; phone: string }
    paymentMethod: string
    total: number
    tableNumber?: string
  } | null
  onPrintReceipt: () => void
  formatINR: (n: number) => string
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  open,
  onClose,
  completedOrder,
  onPrintReceipt,
  formatINR,
}) => {
  if (!completedOrder) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircle sx={{ color: '#16a34a', fontSize: 36 }} />
        </Box>

        <Typography variant="h6" fontWeight="bold" mb={0.5}>
          Order Placed!
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Order #{completedOrder.orderNumber} has been placed successfully.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            px: 2,
            py: 1.5,
            textAlign: 'left',
          }}
        >
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Customer
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {completedOrder.customer.name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Payment Method
              </Typography>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ textTransform: 'capitalize' }}
              >
                {completedOrder.paymentMethod}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Total Amount
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatINR(completedOrder.total)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={onPrintReceipt}
          sx={{ borderColor: '#e2e8f0', color: '#0f172a' }}
        >
          Print Receipt
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#0f172a',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          New Order
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OrderConfirmation
