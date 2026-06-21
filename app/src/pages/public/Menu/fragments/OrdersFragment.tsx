import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Chip, Divider, IconButton } from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Restaurant as PrepIcon,
  DoneAll as ReadyIcon,
  DeliveryDining as ServedIcon,
} from '@mui/icons-material';
import { PublicOrder, publicMenuService } from '../../../../services/application/publicMenuService';

interface OrdersFragmentProps {
  organizationId: string;
  personaId: string;
  tableId: string;
  customerPhone?: string;
  recentOrderId?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: '#92400e', bg: '#fef3c7', border: '#fde68a', icon: <PendingIcon sx={{ fontSize: 14 }} /> },
  confirmed: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe', border: '#bfdbfe', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
  preparing: { label: 'Preparing', color: '#5b21b6', bg: '#ede9fe', border: '#ddd6fe', icon: <PrepIcon sx={{ fontSize: 14 }} /> },
  ready:     { label: 'Ready',     color: '#065f46', bg: '#d1fae5', border: '#a7f3d0', icon: <ReadyIcon sx={{ fontSize: 14 }} /> },
  served:    { label: 'Served',    color: '#0c4a6e', bg: '#e0f2fe', border: '#bae6fd', icon: <ServedIcon sx={{ fontSize: 14 }} /> },
  completed: { label: 'Completed', color: '#14532d', bg: '#dcfce7', border: '#bbf7d0', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
  cancelled: { label: 'Cancelled', color: '#7f1d1d', bg: '#fee2e2', border: '#fecaca', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Order progress bar ───────────────────────────────────────────────────────
const ORDER_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];

const OrderProgressBar: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'cancelled') return null;
  const idx = ORDER_STEPS.indexOf(status);
  const progress = idx === -1 ? 0 : Math.round(((idx + 1) / ORDER_STEPS.length) * 100);

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>Order progress</Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#f97316', fontWeight: 700 }}>{progress}%</Typography>
      </Box>
      <Box sx={{ height: 4, bgcolor: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            bgcolor: status === 'completed' ? '#22c55e' : '#f97316',
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
        {ORDER_STEPS.map((step, i) => (
          <Typography
            key={step}
            sx={{
              fontSize: '0.58rem',
              fontWeight: i <= idx ? 700 : 400,
              color: i <= idx ? '#f97316' : '#cbd5e1',
              textTransform: 'capitalize',
              display: { xs: i % 2 === 0 ? 'block' : 'none', sm: 'block' },
            }}
          >
            {step}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

// ── Single order card ────────────────────────────────────────────────────────
const OrderCard: React.FC<{ order: PublicOrder; isRecent?: boolean }> = ({ order, isRecent }) => {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: isRecent ? '1.5px solid #f97316' : '1px solid #e2e8f0',
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: isRecent ? '0 0 0 3px rgba(249,115,22,0.08)' : 'none',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRecent && (
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f97316', flexShrink: 0 }} />
          )}
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
            #{order.order_number}
          </Typography>
          {isRecent && (
            <Box sx={{ bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 1, px: 0.75, py: 0.1 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New</Typography>
            </Box>
          )}
        </Box>
        <Chip
          icon={<Box sx={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>{cfg.icon}</Box>}
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
            '& .MuiChip-icon': { ml: 0.5 },
          }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {/* Date + time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <TimeIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
            {formatDate(order.created_at)} at {formatTime(order.created_at)}
          </Typography>
        </Box>

        {/* Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          {order.items.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>
                <Box component="span" sx={{ fontWeight: 700, color: '#f97316', mr: 0.5 }}>{item.quantity}x</Box>
                {item.item_name}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                ₹{item.total_price.toLocaleString('en-IN')}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />

        {/* Bill summary */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Subtotal</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#374151' }}>₹{order.subtotal.toLocaleString('en-IN')}</Typography>
          </Box>
          {order.tax_amount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Tax</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#374151' }}>₹{order.tax_amount.toLocaleString('en-IN')}</Typography>
            </Box>
          )}
          {order.service_charge > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Service charge</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#374151' }}>₹{order.service_charge.toLocaleString('en-IN')}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>Total</Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
              ₹{order.total_amount.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>

        {/* Progress bar */}
        <OrderProgressBar status={order.status} />

        {/* Payment status */}
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            sx={{
              bgcolor: order.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
              border: `1px solid ${order.payment_status === 'paid' ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: 1,
              px: 1,
              py: 0.25,
            }}
          >
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: order.payment_status === 'paid' ? '#14532d' : '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {order.payment_status === 'paid' ? 'Paid' : 'Payment pending'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Main fragment ────────────────────────────────────────────────────────────
const OrdersFragment: React.FC<OrdersFragmentProps> = ({
  organizationId,
  personaId,
  tableId,
  customerPhone,
  recentOrderId,
}) => {
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!customerPhone) return;
    setLoading(true);
    try {
      const data = await publicMenuService.getOrdersByPhone(organizationId, personaId, customerPhone);
      setOrders(data);
      setLastRefresh(new Date());
    } catch {
      // Silently fail — keep existing orders visible
    } finally {
      setLoading(false);
    }
  }, [organizationId, personaId, tableId, customerPhone]);

  useEffect(() => {
    fetchOrders();
    if (!customerPhone) return;
    // Auto-refresh every 30s
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, customerPhone]);

  return (
    <Box sx={{ px: 2, pt: 2, pb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Your Orders
          </Typography>
          {customerPhone && lastRefresh && (
            <Typography sx={{ fontSize: '0.68rem', color: '#cbd5e1', mt: 0.25 }}>
              Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Typography>
          )}
        </Box>
        {customerPhone && (
          <IconButton
            size="small"
            onClick={fetchOrders}
            disabled={loading}
            sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, p: 0.75 }}
          >
            <RefreshIcon sx={{ fontSize: 16, color: '#64748b', animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
          </IconButton>
        )}
      </Box>

      {/* No phone — prompt to place an order first */}
      {!customerPhone && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 2 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', mb: 0.5 }}>No orders yet</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', px: 3, lineHeight: 1.6 }}>
            Place an order from the Menu tab and your orders will appear here.
          </Typography>
        </Box>
      )}

      {/* Loading */}
      {customerPhone && loading && orders.length === 0 && (
        <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={32} sx={{ color: '#f97316' }} />
          <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading your orders...</Typography>
        </Box>
      )}

      {/* Empty */}
      {customerPhone && !loading && orders.length === 0 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 2 }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', mb: 0.5 }}>No orders found</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Your orders for this table will appear here
          </Typography>
        </Box>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isRecent={order.id === recentOrderId}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OrdersFragment;