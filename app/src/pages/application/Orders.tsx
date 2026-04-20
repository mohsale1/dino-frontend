import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  Button,
  Drawer,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getQROrderStats } from '../public/Menu/hooks/useOrderStorage';
import { alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  DoneAll as DoneAllIcon,
  TaskAlt as TaskAltIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  TableRestaurant as TableIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryDiningIcon,
  Pending as PendingIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CalendarToday,
  ShoppingBag as ShoppingBagIcon,
  ArrowForwardIos as ArrowIcon,
} from '@mui/icons-material';
import { orderService, Order, OrderDetail, OrderFilters } from '../../services/application/order.service';
import { useAuth } from '../../contexts/common/Auth';
import { useUserData } from '../../contexts/application/UserData';
import { ConfirmationDialog } from '../../components/dialogs/ConfirmationDialog';
import { ROLE_COLORS } from '../../constants/app';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  orders_by_status: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    served: number;
    completed: number;
    cancelled: number;
  };
  avg_order_value: number;
  today_orders: number;
  today_revenue: number;
}

type StatusFilter = '' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
type DateFilter = '' | 'today' | 'week' | 'month';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatINR(value: number | undefined | null): string {
  return `₹${(value ?? 0).toLocaleString('en-IN')}`;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDateRange(filter: DateFilter): { startDate?: string; endDate?: string } {
  const now = new Date();
  if (filter === 'today') {
    const s = toISODate(now);
    return { startDate: s, endDate: s };
  }
  if (filter === 'week') {
    const s = new Date(now);
    s.setDate(s.getDate() - 7);
    return { startDate: toISODate(s), endDate: toISODate(now) };
  }
  if (filter === 'month') {
    const s = new Date(now);
    s.setDate(s.getDate() - 30);
    return { startDate: toISODate(s), endDate: toISODate(now) };
  }
  return {};
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<Order['status'], { bg: string; color: string; border: string; dot: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  preparing: { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe', dot: '#8b5cf6' },
  ready:     { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', dot: '#10b981' },
  served:    { bg: '#e0f2fe', color: '#0c4a6e', border: '#bae6fd', dot: '#0ea5e9' },
  completed: { bg: '#dcfce7', color: '#14532d', border: '#bbf7d0', dot: '#22c55e' },
  cancelled: { bg: '#fee2e2', color: '#7f1d1d', border: '#fecaca', dot: '#ef4444' },
};

const STATUS_FLOW: Partial<Record<Order['status'], { next: Order['status']; label: string; icon: React.ReactNode; color: string; btnBg: string }>> = {
  pending:   { next: 'confirmed', label: 'Confirm',  icon: <CheckCircleIcon />,    color: '#1e40af', btnBg: '#1e40af' },
  confirmed: { next: 'preparing', label: 'Prepare',  icon: <RestaurantIcon />,     color: '#5b21b6', btnBg: '#5b21b6' },
  preparing: { next: 'ready',     label: 'Ready',    icon: <DoneAllIcon />,        color: '#065f46', btnBg: '#059669' },
  ready:     { next: 'served',    label: 'Serve',    icon: <DeliveryDiningIcon />, color: '#0c4a6e', btnBg: '#0284c7' },
  served:    { next: 'completed', label: 'Complete', icon: <TaskAltIcon />,        color: '#14532d', btnBg: '#16a34a' },
};

const CANCELLABLE: Order['status'][] = ['pending', 'confirmed'];
const ROWS_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// useCountUp
// ---------------------------------------------------------------------------

const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat
// ---------------------------------------------------------------------------

const HeroStat: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}> = ({ label, value, icon, rc }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.2s',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alpha(rc.chipText, 0.9),
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 18 } })}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: rc.statValue, fontSize: { xs: '1.25rem', sm: '1.5rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {animated}
          </Typography>
          <Typography sx={{ color: rc.statLabel, fontSize: '0.7rem', fontWeight: 500, mt: 0.3 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const c = STATUS_COLORS[status];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.4, borderRadius: 1, bgcolor: c.bg, border: `1px solid ${c.border}` }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.75rem', color: c.color, fontWeight: 600, textTransform: 'capitalize', lineHeight: 1 }}>
        {status}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

const SkeletonRows: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 7 }).map((__, j) => (
          <TableCell key={j} sx={{ border: 'none', py: 1.5 }}>
            <Skeleton variant="text" width={j === 6 ? 80 : '75%'} height={18} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

const EmptyState: React.FC = () => (
  <TableRow>
    <TableCell colSpan={7} sx={{ border: 'none' }}>
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
          <ReceiptIcon sx={{ fontSize: 32, color: '#cbd5e1' }} />
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>No orders found</Typography>
        <Typography sx={{ color: '#cbd5e1', fontSize: '0.8rem', mt: 0.5 }}>Try adjusting your filters</Typography>
      </Box>
    </TableCell>
  </TableRow>
);

// ---------------------------------------------------------------------------
// Order Detail Panel
// ---------------------------------------------------------------------------

const PANEL_WIDTH = 400;

const OrderPanel: React.FC<{
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  actionLoading: string | null;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onCancel: (orderId: string, orderNumber: string) => void;
}> = ({ orderId, open, onClose, actionLoading, onStatusUpdate, onCancel }) => {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  useEffect(() => {
    if (!open || !orderId) { setDetail(null); return; }
    setDetailLoading(true);
    orderService.getOrder(orderId)
      .then((res) => { if (res.success && res.data) setDetail(res.data); })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [orderId, open]);

  const flow = detail ? STATUS_FLOW[detail.status] : null;
  const canCancel = detail ? CANCELLABLE.includes(detail.status) : false;
  const isActing = !!orderId && actionLoading === orderId;
  const sc = detail ? STATUS_COLORS[detail.status] : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : PANEL_WIDTH,
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          border: 'none',
          top: { xs: '56px', sm: 0 },
          height: { xs: 'calc(100% - 56px)', sm: '100%' },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>
              Order Details
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
              {detail ? `#${detail.order_number}` : detailLoading ? '—' : '—'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ mt: 0.5, color: '#94a3b8', borderRadius: 1.5, '&:hover': { bgcolor: '#f8fafc', color: '#475569' } }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Status + time row */}
        {detail && sc && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StatusBadge status={detail.status} />
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {timeAgo(detail.createdAt)}
            </Typography>
          </Box>
        )}
        {detailLoading && <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 1 }} />}
      </Box>

      {/* ── Scrollable body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {detailLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          </Box>
        ) : detail ? (
          <>
            {/* ── Info card ── */}
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PersonIcon sx={{ fontSize: 16, color: '#64748b' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{detail.customer_name || 'Walk-in'}</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#e2e8f0' }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Table</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableIcon sx={{ fontSize: 14, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{detail.table_number || '—'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Placed</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                      {new Date(detail.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                {(detail as any).paymentStatus && (
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Payment</Typography>
                    <Chip
                      label={(detail as any).paymentStatus}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        bgcolor: (detail as any).paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: (detail as any).paymentStatus === 'paid' ? '#14532d' : '#92400e',
                        border: 'none',
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Special instructions ── */}
            {(detail as any).specialInstructions && (
              <Box sx={{ bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a', px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#92400e', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Special Instructions
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5 }}>
                  {(detail as any).specialInstructions}
                </Typography>
              </Box>
            )}

            {/* ── Items ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShoppingBagIcon sx={{ fontSize: 15, color: '#64748b' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Items ({detail.items?.length ?? 0})
                </Typography>
              </Box>

              <Box sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {detail.items && detail.items.length > 0 ? (
                  detail.items.map((item: any, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderBottom: idx < detail.items.length - 1 ? '1px solid #f8fafc' : 'none',
                        bgcolor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      {/* Qty pill */}
                      <Box
                        sx={{
                          minWidth: 28,
                          height: 28,
                          borderRadius: 1,
                          bgcolor: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mr: 1.5,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}>
                          {item.quantity ?? item.qty ?? 1}
                        </Typography>
                      </Box>

                      {/* Name + unit price */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.itemName ?? item.item_name ?? item.name ?? 'Item'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.1 }}>
                          {formatINR(item.unitPrice ?? item.unit_price ?? 0)} each
                        </Typography>
                      </Box>

                      {/* Line total */}
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', flexShrink: 0, ml: 1 }}>
                        {formatINR(item.totalPrice ?? item.total_price ?? 0)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>No items</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Bill summary ── */}
            <Box sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.25, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Bill Summary
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.875 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{formatINR(detail.subtotal)}</Typography>
                </Box>
                {detail.tax_amount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Tax</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{formatINR(detail.tax_amount)}</Typography>
                  </Box>
                )}
                {(detail as any).serviceCharge > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Service Charge</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{formatINR((detail as any).serviceCharge)}</Typography>
                  </Box>
                )}
                {detail.discount_amount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Discount</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 500 }}>-{formatINR(detail.discount_amount)}</Typography>
                  </Box>
                )}
                <Box sx={{ mt: 0.5, pt: 1, borderTop: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Total</Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{formatINR(detail.total)}</Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.5, py: 8 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 24, color: '#cbd5e1' }} />
            </Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Could not load order details</Typography>
          </Box>
        )}
      </Box>

      {/* ── Actions footer ── */}
      {detail && !detailLoading && (flow || canCancel) && (
        <Box sx={{ flexShrink: 0, px: 2.5, py: 2, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {flow && (
            <Button
              variant="contained"
              fullWidth
              disabled={isActing}
              startIcon={flow.icon}
              onClick={() => onStatusUpdate(detail.id, flow.next)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                bgcolor: flow.btnBg,
                borderRadius: 1.5,
                py: 1.1,
                boxShadow: 'none',
                '&:hover': { bgcolor: flow.btnBg, filter: 'brightness(0.9)', boxShadow: 'none' },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              {isActing ? 'Updating...' : `Mark as ${flow.next.charAt(0).toUpperCase() + flow.next.slice(1)}`}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outlined"
              fullWidth
              disabled={isActing}
              startIcon={<CancelIcon />}
              onClick={() => onCancel(detail.id, detail.order_number)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderRadius: 1.5,
                py: 1.1,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: '#fff5f5' },
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

// ---------------------------------------------------------------------------
// Mobile Order Card
// ---------------------------------------------------------------------------

const MobileOrderCard: React.FC<{
  order: Order;
  isSelected: boolean;
  actionLoading: string | null;
  onOrderClick: (order: Order) => void;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onCancelOrder: (order: Order) => void;
}> = ({ order, isSelected, actionLoading, onOrderClick, onStatusUpdate, onCancelOrder }) => {
  const flow = STATUS_FLOW[order.status];
  const canCancel = CANCELLABLE.includes(order.status);
  const isActing = actionLoading === order.id;
  const c = STATUS_COLORS[order.status];

  return (
    <Paper
      elevation={0}
      onClick={() => onOrderClick(order)}
      sx={{
        border: 'none',
        borderBottom: `1px solid ${isSelected ? '#cbd5e1' : '#f1f5f9'}`,
        borderRadius: 0,
        p: 2,
        cursor: 'pointer',
        bgcolor: isSelected ? '#f0f9ff' : '#ffffff',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: '#f8fafc' },
      }}
    >
      {/* Row 1 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
          #{order.order_number}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.35, borderRadius: 1, bgcolor: c.bg, border: `1px solid ${c.border}` }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c.dot }} />
          <Typography sx={{ fontSize: '0.72rem', color: c.color, fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</Typography>
        </Box>
      </Box>

      {/* Row 2 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
          {order.customer_name || 'Walk-in'}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
          {formatINR(order.total)}
        </Typography>
      </Box>

      {/* Row 3 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TableIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{order.table_number || '—'}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>{timeAgo(order.createdAt)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }} onClick={(e) => e.stopPropagation()}>
          {flow && (
            <Tooltip title={`Mark as ${flow.next}`}>
              <span>
                <IconButton size="small" disabled={isActing} onClick={() => onStatusUpdate(order.id, flow.next)} sx={{ color: flow.color, borderRadius: 1.5 }}>
                  {flow.icon}
                </IconButton>
              </span>
            </Tooltip>
          )}
          {canCancel && (
            <Tooltip title="Cancel">
              <span>
                <IconButton size="small" disabled={isActing} onClick={() => onCancelOrder(order)} sx={{ color: '#ef4444', borderRadius: 1.5 }}>
                  <CancelIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <ArrowIcon sx={{ fontSize: 12, color: '#cbd5e1', ml: 0.5 }} />
        </Box>
      </Box>
    </Paper>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const OrdersManagementPage: React.FC = () => {
  const { user, userPermissions } = useAuth();
  const { userData } = useUserData();
  const workspaceId: string =
    userData?.venue?.workspaceId || (user as any)?.workspaceId || (user as any)?.workspace_id || '';
  const organizationId: string = userData?.venue?.id || '';

  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name ||
    user?.role ||
    ''
  ).toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super') ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin') ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

  const firstName = (user as any)?.firstName || (user as any)?.first_name || user?.name?.split(' ')[0] || '';
  const displayRole = userPermissions?.role?.displayName || userPermissions?.role?.name || roleKey;

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [qrStats, setQrStats] = useState(() => getQROrderStats());
  const [qrBannerOpen, setQrBannerOpen] = useState(true);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  // Data fetching
  const loadOrders = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    const { startDate, endDate } = getDateRange(dateFilter);
    const filters: OrderFilters = {
      workspaceId,
      organizationId: organizationId || undefined,
      status: statusFilter || undefined,
      startDate,
      endDate,
      page: page + 1,
      page_size: ROWS_PER_PAGE,
    };
    const res = await orderService.getOrders(filters);
    if (!res.success || !res.data) { showSnackbar('Failed to load orders', 'error'); setLoading(false); return; }
    setOrders(res.data.items);
    setTotalOrders(res.data.total);
    setLoading(false);
  }, [workspaceId, organizationId, statusFilter, dateFilter, page]);

  const loadStats = useCallback(async () => {
    if (!workspaceId) return;
    setStatsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateFilter);
      const data = await orderService.getOrderStatistics(workspaceId, startDate && endDate ? { startDate, endDate } : undefined, organizationId);
      setStats(data ?? null);
    } catch { } finally { setStatsLoading(false); }
  }, [workspaceId, organizationId, dateFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { if (!workspaceId) return; loadStats(); setQrStats(getQROrderStats()); }, [loadStats, workspaceId]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') { loadOrders(); setQrStats(getQROrderStats()); }
    }, 60000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Handlers
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setActionLoading(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showSnackbar(`Order marked as ${newStatus}`, 'success');
      await loadOrders();
      await loadStats();
    } catch { showSnackbar('Failed to update order status', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleCancelOrder = (order: Order) => { setOrderToCancel(order); setCancelDialogOpen(true); };
  const handleCancelById = (orderId: string, orderNumber: string) => {
    setOrderToCancel({ id: orderId, order_number: orderNumber } as Order);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelDialogOpen(false);
    setActionLoading(orderToCancel.id);
    try {
      await orderService.cancelOrder(orderToCancel.id);
      showSnackbar('Order cancelled successfully', 'success');
      if (drawerOpen && selectedOrderId === orderToCancel.id) setDrawerOpen(false);
      await loadOrders();
      await loadStats();
    } catch { showSnackbar('Failed to cancel order', 'error'); }
    finally { setActionLoading(null); setOrderToCancel(null); }
  };

  const handleOrderClick = (order: Order) => { setSelectedOrderId(order.id); setDrawerOpen(true); };
  const handleRefresh = () => { loadOrders(); loadStats(); };
  const handleStatusFilterChange = (_: React.SyntheticEvent, v: StatusFilter) => { setStatusFilter(v); setPage(0); };
  const handleDateFilterChange = (d: DateFilter) => { setDateFilter(d); setPage(0); };

  const filteredOrders = debouncedSearch
    ? orders.filter((o) =>
        o.order_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : orders;

  const totalOrdersVal = stats?.total_orders ?? 0;
  const pendingVal = stats?.orders_by_status?.pending ?? 0;
  const preparingVal = stats?.orders_by_status?.preparing ?? 0;
  const completedVal = stats?.orders_by_status?.completed ?? 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f8fafc' }}>

      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          background: rc.gradient,
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2.5, sm: 3 },
          pb: { xs: 2.5, sm: 3 },
          flexShrink: 0,
          overflow: 'hidden',
          '&::before': {
            content: '""', position: 'absolute', top: 0, right: -40,
            width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""', position: 'absolute', bottom: -40, left: '20%',
            width: 220, height: 220, borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px', pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ color: alpha(rc.chipText, 0.7), fontWeight: 700, letterSpacing: 3, fontSize: '0.62rem', textTransform: 'uppercase', mb: 0.75 }}>
            {firstName ? `${firstName} · ${displayRole}` : 'Order Management'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                Orders
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                <CalendarToday sx={{ fontSize: 12, color: alpha(rc.chipText, 0.55) }} />
                <Typography sx={{ color: alpha(rc.chipText, 0.55), fontWeight: 500, fontSize: '0.72rem' }}>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={handleRefresh}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                bgcolor: alpha('#fff', 0.14),
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.85rem',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.22)',
                px: 2.5, py: 0.9,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: alpha('#fff', 0.22), boxShadow: 'none' },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Stat tiles */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: { xs: 1.25, sm: 1.5 } }}>
            <HeroStat label="Total Orders" value={statsLoading ? 0 : totalOrdersVal} icon={<ReceiptIcon />} rc={rc} />
            <HeroStat label="Pending"      value={statsLoading ? 0 : pendingVal}     icon={<PendingIcon />} rc={rc} />
            <HeroStat label="Preparing"    value={statsLoading ? 0 : preparingVal}   icon={<RestaurantIcon />} rc={rc} />
            <HeroStat label="Completed"    value={statsLoading ? 0 : completedVal}   icon={<CheckCircleOutlineIcon />} rc={rc} />
          </Box>
        </Box>
      </Box>

      {/* ── QR Banner ── */}
      {qrStats.count > 0 && (
        <Collapse in={qrBannerOpen}>
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 1.25, bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, flexWrap: 'wrap' }}>
              <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ReceiptIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412' }}>QR Orders (last 24h):</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${qrStats.count} orders`} size="small" sx={{ bgcolor: '#fff', border: '1px solid #fed7aa', color: '#9a3412', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                <Chip label={`₹${qrStats.totalRevenue.toLocaleString('en-IN')}`} size="small" sx={{ bgcolor: '#fff', border: '1px solid #fed7aa', color: '#9a3412', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setQrBannerOpen(false)} sx={{ color: '#c2410c', p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Collapse>
      )}

      {/* ── Toolbar ── */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        {/* Search + date */}
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 1.75, pb: 1.25, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, px: 1.5, py: 0.7 }}>
            <SearchIcon sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
            <InputBase
              placeholder="Search order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: '0.85rem', color: '#0f172a', '& input::placeholder': { color: '#94a3b8' } }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, color: '#94a3b8' }}>
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Box>

          <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
            <Select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value as DateFilter)}
              displayEmpty
              sx={{ borderRadius: 2, fontSize: '0.85rem', bgcolor: '#f8fafc', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
            >
              <MenuItem value=""><Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>All Dates</Typography></MenuItem>
              <MenuItem value="today" sx={{ fontSize: '0.85rem' }}>Today</MenuItem>
              <MenuItem value="week" sx={{ fontSize: '0.85rem' }}>This Week</MenuItem>
              <MenuItem value="month" sx={{ fontSize: '0.85rem' }}>This Month</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, ml: 'auto', display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
            {filteredOrders.length} of {totalOrders}
          </Typography>
        </Box>

        {/* Status tabs */}
        <Tabs
          value={statusFilter}
          onChange={handleStatusFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            px: { xs: 1, sm: 1.5 },
            '& .MuiTab-root': { minHeight: 38, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600, py: 0, px: { xs: 1.25, sm: 1.75 }, letterSpacing: 0, color: '#64748b' },
            '& .MuiTab-root.Mui-selected': { color: '#0f172a' },
            '& .MuiTabs-indicator': { height: 2, bgcolor: '#0f172a', borderRadius: '2px 2px 0 0' },
          }}
        >
          {(['', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'] as StatusFilter[]).map((s) => (
            <Tab key={s} value={s} label={s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} />
          ))}
        </Tabs>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Desktop table */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 0, border: 'none', bgcolor: '#fff', display: { xs: 'none', sm: 'block' }, flex: 1 }}
        >
          <TableContainer>
            <Table size="small" sx={{ '& .MuiTableCell-root': { px: { sm: 1.5, md: 2 } } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {[
                    { label: 'Order #',  width: '13%' },
                    { label: 'Customer', width: '22%' },
                    { label: 'Table',    width: '10%' },
                    { label: 'Amount',   width: '14%' },
                    { label: 'Status',   width: '18%' },
                    { label: 'Time',     width: '11%' },
                    { label: 'Actions',  width: '12%' },
                  ].map((h) => (
                    <TableCell
                      key={h.label}
                      sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', py: 1.5, whiteSpace: 'nowrap', width: h.width, border: 'none' }}
                    >
                      {h.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <SkeletonRows />
                ) : filteredOrders.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredOrders.map((order) => {
                    const flow = STATUS_FLOW[order.status];
                    const canCancel = CANCELLABLE.includes(order.status);
                    const isActing = actionLoading === order.id;
                    const isSelected = selectedOrderId === order.id && drawerOpen;

                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                        sx={{
                          cursor: 'pointer',
                          borderBottom: '1px solid #f8fafc',
                          bgcolor: isSelected ? '#f8fafc' : 'transparent',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: '#f8fafc' },
                          '& .MuiTableCell-root': { border: 'none' },
                          transition: 'background 0.1s',
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                          #{order.order_number}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.customer_name || 'Walk-in'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: '#374151' }}>
                          {order.table_number || '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {formatINR(order.total)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {timeAgo(order.createdAt)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={() => handleOrderClick(order)} sx={{ borderRadius: 1.5 }}>
                                <VisibilityIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                              </IconButton>
                            </Tooltip>
                            {flow && (
                              <Tooltip title={`Mark as ${flow.next}`}>
                                <span>
                                  <IconButton size="small" disabled={isActing} onClick={() => handleStatusUpdate(order.id, flow.next)} sx={{ color: flow.color, borderRadius: 1.5 }}>
                                    {flow.icon}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            {canCancel && (
                              <Tooltip title="Cancel">
                                <span>
                                  <IconButton size="small" disabled={isActing} onClick={() => handleCancelOrder(order)} sx={{ color: '#ef4444', borderRadius: 1.5 }}>
                                    <CancelIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && (
            <TablePagination
              component="div"
              count={totalOrders}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={ROWS_PER_PAGE}
              onRowsPerPageChange={() => {}}
              rowsPerPageOptions={[]}
              labelRowsPerPage=""
              sx={{
                borderTop: '1px solid #f1f5f9',
                '& .MuiTablePagination-selectLabel': { display: 'none' },
                '& .MuiTablePagination-select': { display: 'none' },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: '#64748b' },
              }}
            />
          )}
        </Paper>

        {/* Mobile cards */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, bgcolor: '#f8fafc' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2, bgcolor: '#fff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Skeleton variant="text" width={90} height={18} />
                    <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Skeleton variant="text" width={110} height={16} />
                    <Skeleton variant="text" width={60} height={16} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="text" width={80} height={14} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Skeleton variant="circular" width={26} height={26} />
                      <Skeleton variant="circular" width={26} height={26} />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <ReceiptIcon sx={{ fontSize: 28, color: '#cbd5e1' }} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.875rem' }}>No orders found</Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.8rem', mt: 0.5 }}>Try adjusting your filters</Typography>
            </Box>
          ) : (
            <>
              {filteredOrders.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrderId === order.id && drawerOpen}
                  actionLoading={actionLoading}
                  onOrderClick={handleOrderClick}
                  onStatusUpdate={handleStatusUpdate}
                  onCancelOrder={handleCancelOrder}
                />
              ))}
              <TablePagination
                component="div"
                count={totalOrders}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={ROWS_PER_PAGE}
                onRowsPerPageChange={() => {}}
                rowsPerPageOptions={[]}
                labelRowsPerPage=""
                sx={{
                  borderTop: '1px solid #f1f5f9',
                  '& .MuiTablePagination-selectLabel': { display: 'none' },
                  '& .MuiTablePagination-select': { display: 'none' },
                  '& .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: '#64748b' },
                }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* ── Order Panel ── */}
      <OrderPanel
        orderId={selectedOrderId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        actionLoading={actionLoading}
        onStatusUpdate={handleStatusUpdate}
        onCancel={handleCancelById}
      />

      {/* ── Cancel Dialog ── */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => { setCancelDialogOpen(false); setOrderToCancel(null); }}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${orderToCancel?.order_number ?? ''}? This action cannot be undone.`}
        severity="error"
        confirmLabel="Yes, Cancel Order"
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagementPage;