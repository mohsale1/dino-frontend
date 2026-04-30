import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Button,
  Divider,
  Chip,
  Skeleton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close,
  Person,
  TableRestaurant,
  AccessTime,
  CheckCircle,

  DeliveryDining,
  TaskAlt,
  Cancel,
  Whatshot,
} from '@mui/icons-material';
import {
  Order,
  OrderDetail,
  STATUS_FLOW,
  CANCELLABLE,

  timeAgo,
  formatINR,
} from '../orders.types';
import StatusBadge from './StatusBadge';
import { orderService } from '../../../../services/application/order.service';

interface OrderDetailPanelProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  personaId: number | undefined;
  actionLoading: string | null;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onCancel: (orderId: string, orderNumber: string) => void;
}

const STATUS_ICON: Partial<Record<Order['status'], React.ReactElement>> = {
  pending:   <CheckCircle sx={{ fontSize: 17 }} />,
  confirmed: <Whatshot sx={{ fontSize: 17 }} />,
  preparing: <TaskAlt sx={{ fontSize: 17 }} />,
  ready:     <DeliveryDining sx={{ fontSize: 17 }} />,
};

const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
  orderId,
  open,
  onClose,
  personaId,
  actionLoading,
  onStatusUpdate,
  onCancel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !orderId || !personaId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setDetail(null);

    orderService
      .getOrder(orderId, personaId)
      .then((res) => {
        if (!cancelled) setDetail(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, open, personaId]);

  const flow = detail ? STATUS_FLOW[detail.status] ?? null : null;
  const nextStatus = flow?.next ?? null;
  const canAdvance = nextStatus !== null;
  const canCancel = detail ? CANCELLABLE.includes(detail.status) : false;
  const isActing = actionLoading === orderId;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: {
          width: isMobile ? '100vw' : 400,
          top: 64,
          height: 'calc(100% - 64px)',
          bgcolor: '#ffffff',
          border: 'none',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {/* Row 1: label + close */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#94a3b8',
            }}
          >
            Order Details
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#64748b',
              p: 0.5,
              borderRadius: 1.5,
              '&:hover': { bgcolor: '#f8fafc', color: '#1C1C1E' },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Row 2: order number */}
        {loading ? (
          <Skeleton variant="text" width={160} height={34} sx={{ mb: 0.75 }} />
        ) : (
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#1C1C1E',
              mb: 0.75,
            }}
          >
            {detail ? `#${detail.order_number}` : '\u2014'}
          </Typography>
        )}

        {/* Row 3: status badge + bullet + time ago */}
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={52} height={18} />
          </Box>
        ) : detail ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusBadge status={detail.status} size="sm" />
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1 }}>&bull;</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {timeAgo(detail.createdAt)}
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* ── SCROLLABLE BODY ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 2 },
        }}
      >
        {/* Loading skeletons */}
        {loading && (
          <>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          </>
        )}

        {/* Loaded content */}
        {!loading && detail && (
          <>
            {/* A. INFO CARD */}
            <Box
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: 2,
                p: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              {/* Customer row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Person sx={{ fontSize: 15, color: '#64748b' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#94a3b8',
                      lineHeight: 1.2,
                    }}
                  >
                    Customer
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1C1C1E',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {detail.customer_name || 'Walk-in Customer'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#e0e0e0', my: 1.5 }} />

              {/* 3-col flex row */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Table */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <TableRestaurant sx={{ fontSize: 12, color: '#94a3b8' }} />
                    <Typography
                      sx={{
                        fontSize: '0.62rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      Table
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1C1E' }}>
                    {detail.table_number ? `#${detail.table_number}` : 'N/A'}
                  </Typography>
                </Box>

                {/* Time */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <AccessTime sx={{ fontSize: 12, color: '#94a3b8' }} />
                    <Typography
                      sx={{
                        fontSize: '0.62rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      Time
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1C1E' }}>
                    {new Date(detail.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>

                {/* Payment — only if paymentStatus exists */}
                {detail.payment_status && (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Typography
                      sx={{
                        fontSize: '0.62rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      Payment
                    </Typography>
                    <Chip
                      label={detail.payment_status}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        bgcolor: detail.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: detail.payment_status === 'paid' ? '#14532d' : '#92400e',
                        border: 'none',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {/* B. SPECIAL INSTRUCTIONS */}
            {detail.special_instructions && (
              <Box
                sx={{
                  bgcolor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#92400e',
                    mb: 0.5,
                  }}
                >
                  Special Instructions
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5 }}>
                  {detail.special_instructions}
                </Typography>
              </Box>
            )}

            {/* C. ITEMS SECTION */}
            <Box>
              {/* Section header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#374151',
                  }}
                >
                  Items
                </Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.15,
                    borderRadius: 0.75,
                    bgcolor: '#e2e8f0',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
                    {detail.items.length}
                  </Typography>
                </Box>
              </Box>

              {/* Items bordered box */}
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                {detail.items.map((item, idx) => (
                  <Box
                    key={item.item_id ?? idx}
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: idx < detail.items.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}
                  >
                    {/* Qty pill */}
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        bgcolor: '#1C1C1E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}
                      >
                        {item.quantity}
                      </Typography>
                    </Box>

                    {/* Name + unit price */}
                    <Box sx={{ flex: 1, ml: 1.5, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#1C1C1E',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.item_name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        {formatINR(item.unit_price)} each
                      </Typography>
                    </Box>

                    {/* Line total */}
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1C1C1E', flexShrink: 0 }}>
                      {formatINR(item.total_price)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* D. BILL SUMMARY */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              {/* Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#374151',
                  }}
                >
                  Bill Summary
                </Typography>
              </Box>

              {/* Rows */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.875 }}>
                {/* Subtotal */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#1C1C1E', fontWeight: 500 }}>
                    {formatINR(detail.subtotal)}
                  </Typography>
                </Box>

                {/* Tax */}
                {detail.tax_amount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Tax</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#1C1C1E', fontWeight: 500 }}>
                      {formatINR(detail.tax_amount)}
                    </Typography>
                  </Box>
                )}

                {/* Service charge */}
                {detail.service_charge > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Service Charge</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#1C1C1E', fontWeight: 500 }}>
                      {formatINR(detail.service_charge)}
                    </Typography>
                  </Box>
                )}

                {/* Discount */}
                {detail.discount_amount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Discount</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 500 }}>
                      -{formatINR(detail.discount_amount)}
                    </Typography>
                  </Box>
                )}

                {/* Total */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '2px solid #f1f5f9',
                    pt: 1,
                    mt: 0.25,
                  }}
                >
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#1C1C1E' }}>
                    Total
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1C1C1E' }}>
                    {formatINR(detail.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* ── ACTIONS FOOTER ──────────────────────────────────────────────────── */}
      {detail && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2.5,
            py: 2,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* Primary action button */}
          {canAdvance && nextStatus && flow && (
            <Button
              fullWidth
              variant="contained"
              disabled={isActing}
              startIcon={
                isActing
                  ? undefined
                  : STATUS_ICON[detail.status]
              }
              onClick={() => onStatusUpdate(detail.id, nextStatus)}
              sx={{
                bgcolor: flow.btnBg,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                py: 1.1,
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: flow.btnBg,
                  filter: 'brightness(0.9)',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              {isActing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={15} sx={{ color: '#94a3b8' }} />
                  <span>Updating...</span>
                </Box>
              ) : (
                flow.label
              )}
            </Button>
          )}

          {/* Cancel button */}
          {canCancel && (
            <Button
              fullWidth
              variant="outlined"
              disabled={isActing}
              startIcon={<Cancel sx={{ fontSize: 16 }} />}
              onClick={() => onCancel(detail.id, String(detail.order_number))}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 1.1,
                borderRadius: 1.5,
                textTransform: 'none',
                borderColor: '#e0e0e0',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#f43f5e',
                  color: '#f43f5e',
                  bgcolor: '#fff1f2',
                },
                '&.Mui-disabled': {
                  borderColor: '#e0e0e0',
                  color: '#94a3b8',
                },
              }}
            >
              Cancel Order
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default OrderDetailPanel;