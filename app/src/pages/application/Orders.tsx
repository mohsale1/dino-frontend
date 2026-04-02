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
  Stepper,
  Step,
  StepLabel,
  Tooltip,
} from '@mui/material';
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
  ShoppingCart as ShoppingCartIcon,
  Pending as PendingIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CalendarToday,
} from '@mui/icons-material';
import { orderService, Order, OrderFilters } from '../../services/application/order.service';
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

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
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

const STATUS_FLOW: Partial<Record<Order['status'], { next: Order['status']; label: string; icon: React.ReactNode; color: string }>> = {
  pending:   { next: 'confirmed', label: 'Confirm',  icon: <CheckCircleIcon fontSize="small" />,    color: '#1e40af' },
  confirmed: { next: 'preparing', label: 'Prepare',  icon: <RestaurantIcon fontSize="small" />,     color: '#5b21b6' },
  preparing: { next: 'ready',     label: 'Ready',    icon: <DoneAllIcon fontSize="small" />,        color: '#065f46' },
  ready:     { next: 'served',    label: 'Serve',    icon: <DeliveryDiningIcon fontSize="small" />, color: '#0c4a6e' },
  served:    { next: 'completed', label: 'Complete', icon: <TaskAltIcon fontSize="small" />,        color: '#14532d' },
};

const STATUS_STEPS: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
const CANCELLABLE: Order['status'][] = ['pending', 'confirmed'];
const ROWS_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// useCountUp hook
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
// HeroStat component
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
        width: '100%',
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alpha(rc.chipText, 0.9),
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: rc.statValue,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {animated}
          </Typography>
          <Typography sx={{ color: rc.statLabel, fontSize: '0.72rem', fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// StatusBadge — dot + plain text (no chip)
// ---------------------------------------------------------------------------

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const c = STATUS_COLORS[status];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: c.dot,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500, textTransform: 'capitalize' }}>
        {status}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// StatusChip — for drawer header
// ---------------------------------------------------------------------------

const StatusChip: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const c = STATUS_COLORS[status];
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

const SkeletonRows: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i} sx={{ borderBottom: '1px solid #f1f5f9' }}>
        {Array.from({ length: 8 }).map((__, j) => (
          <TableCell key={j} sx={{ border: 'none', py: 1.5 }}>
            <Skeleton variant="text" width={j === 7 ? 80 : '80%'} height={20} />
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
    <TableCell colSpan={8} sx={{ border: 'none' }}>
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <ReceiptIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
        <Typography variant="h6" color="#94a3b8" fontWeight={600}>
          No orders found
        </Typography>
        <Typography variant="body2" color="#cbd5e1" mt={0.5}>
          Try adjusting your filters or check back later
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);

// ---------------------------------------------------------------------------
// Order Detail Drawer
// ---------------------------------------------------------------------------

const OrderDrawer: React.FC<{
  order: Order | null;
  open: boolean;
  onClose: () => void;
  actionLoading: string | null;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onCancel: (order: Order) => void;
}> = ({ order, open, onClose, actionLoading, onStatusUpdate, onCancel }) => {
  if (!order) return null;
  const flow = STATUS_FLOW[order.status];
  const canCancel = CANCELLABLE.includes(order.status);
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isLoading = actionLoading === order.id;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: '#f8fafc' } }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ fontFamily: 'monospace' }}>
            #{order.order_number}
          </Typography>
          <StatusChip status={order.status} />
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ borderRadius: 1.5, '&:hover': { bgcolor: '#f1f5f9' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
        {/* Order Info */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>
            Order Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <Typography variant="body2" color="#64748b">Customer:</Typography>
              <Typography variant="body2" fontWeight={600} color="#0f172a">
                {order.customer_name || 'Walk-in'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <Typography variant="body2" color="#64748b">Table:</Typography>
              <Typography variant="body2" fontWeight={600} color="#0f172a">
                {order.table_number || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <Typography variant="body2" color="#64748b">Placed:</Typography>
              <Typography variant="body2" fontWeight={600} color="#0f172a">
                {new Date(order.createdAt).toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <Typography variant="body2" color="#64748b">Items:</Typography>
              <Typography variant="body2" fontWeight={600} color="#0f172a">
                {order.items_count} item{order.items_count !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Financials */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>
            Financials
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="#64748b">Subtotal</Typography>
              <Typography variant="body2" fontWeight={500}>{formatINR(order.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="#64748b">Tax</Typography>
              <Typography variant="body2" fontWeight={500}>{formatINR(order.tax_amount)}</Typography>
            </Box>
            {order.discount_amount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="#64748b">Discount</Typography>
                <Typography variant="body2" fontWeight={500} color="#16a34a">
                  -{formatINR(order.discount_amount)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color="#0f172a">Total</Typography>
              <Typography variant="body2" fontWeight={700} color="#0f172a">{formatINR(order.total)}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Status Timeline */}
        {order.status !== 'cancelled' && (
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={2}>
              Status Timeline
            </Typography>
            <Stepper activeStep={stepIndex} alternativeLabel>
              {STATUS_STEPS.map((s) => (
                <Step key={s}>
                  <StepLabel
                    sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem', textTransform: 'capitalize' } }}
                  >
                    {s}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* Actions */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {flow && (
              <Button
                variant="contained"
                fullWidth
                disabled={isLoading}
                startIcon={flow.icon}
                onClick={() => onStatusUpdate(order.id, flow.next)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b' },
                  boxShadow: 'none',
                  borderRadius: 1.5,
                }}
              >
                {isLoading ? 'Updating...' : `Mark as ${flow.next.charAt(0).toUpperCase() + flow.next.slice(1)}`}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outlined"
                fullWidth
                disabled={isLoading}
                startIcon={<CancelIcon />}
                onClick={() => onCancel(order)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: '#fff5f5' },
                }}
              >
                Cancel Order
              </Button>
            )}
            {!flow && !canCancel && (
              <Typography variant="body2" color="#94a3b8" textAlign="center">
                No further actions available
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Drawer>
  );
};

// ---------------------------------------------------------------------------
// Mobile Order Card
// ---------------------------------------------------------------------------

const MobileOrderCard: React.FC<{
  order: Order;
  actionLoading: string | null;
  onOrderClick: (order: Order) => void;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onCancelOrder: (order: Order) => void;
}> = ({ order, actionLoading, onOrderClick, onStatusUpdate, onCancelOrder }) => {
  const flow = STATUS_FLOW[order.status];
  const canCancel = CANCELLABLE.includes(order.status);
  const isActing = actionLoading === order.id;
  const c = STATUS_COLORS[order.status];

  return (
    <Paper
      elevation={0}
      onClick={() => onOrderClick(order)}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: '#fafafa' },
      }}
    >
      {/* Row 1: Order number + Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
          #{order.order_number}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: c.dot }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500, textTransform: 'capitalize' }}>
            {order.status}
          </Typography>
        </Box>
      </Box>

      {/* Row 2: Customer name + Amount */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#374151' }}>
          {order.customer_name || 'Walk-in'}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
          {formatINR(order.total)}
        </Typography>
      </Box>

      {/* Row 3: Table + Items */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TableIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
            {order.table_number || '—'}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
          {order.items_count} item{order.items_count !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Row 4: Time + Action buttons */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {timeAgo(order.createdAt)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {flow && (
            <Tooltip title={`Mark as ${flow.next}`}>
              <span>
                <IconButton
                  size="small"
                  disabled={isActing}
                  onClick={() => onStatusUpdate(order.id, flow.next)}
                  sx={{ color: flow.color, borderRadius: 1.5 }}
                >
                  {flow.icon}
                </IconButton>
              </span>
            </Tooltip>
          )}
          {canCancel && (
            <Tooltip title="Cancel order">
              <span>
                <IconButton
                  size="small"
                  disabled={isActing}
                  onClick={() => onCancelOrder(order)}
                  sx={{ color: '#ef4444', borderRadius: 1.5 }}
                >
                  <CancelIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
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

  const venueId: string =
    userData?.venue?.id || (user as any)?.venueId || (user as any)?.venue_id || '';

  // Role detection — full pattern matching all pages
  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name ||
    user?.role ||
    ''
  ).toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super')
      ? 'Owner'
      : rawRole.includes('manager') || rawRole.includes('admin')
      ? 'Manager'
      : 'User';
  const rc = ROLE_COLORS[roleKey];

  // User display
  const firstName =
    (user as any)?.firstName ||
    (user as any)?.first_name ||
    user?.name?.split(' ')[0] ||
    '';
  const displayRole = userPermissions?.role?.displayName || userPermissions?.role?.name || roleKey;

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const loadOrders = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateFilter);
      const filters: OrderFilters = {
        venueId,
        status: statusFilter || undefined,
        startDate,
        endDate,
        page: page + 1,
        page_size: ROWS_PER_PAGE,
      };
      const res = await orderService.getOrders(filters);
      if (res.success) {
        const raw = res.data as any;
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && raw.items) {
          setOrders(raw.items as Order[]);
          setTotalOrders(raw.total ?? raw.items.length);
        } else {
          const list = Array.isArray(raw) ? raw : [];
          setOrders(list);
          setTotalOrders(list.length);
        }
      }
    } catch {
      showSnackbar('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [venueId, statusFilter, dateFilter, page]);

  const loadStats = useCallback(async () => {
    if (!venueId) return;
    setStatsLoading(true);
    try {
      const data = await orderService.getOrderStatistics(venueId);
      setStats(data ?? null);
    } catch {
      // stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadOrders();
    loadStats();
    const interval = setInterval(() => {
      loadOrders();
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadOrders, loadStats]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setActionLoading(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showSnackbar(`Order marked as ${newStatus}`, 'success');
      await loadOrders();
      await loadStats();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch {
      showSnackbar('Failed to update order status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelDialogOpen(false);
    setActionLoading(orderToCancel.id);
    try {
      await orderService.cancelOrder(orderToCancel.id);
      showSnackbar('Order cancelled successfully', 'success');
      if (drawerOpen && selectedOrder?.id === orderToCancel.id) setDrawerOpen(false);
      await loadOrders();
      await loadStats();
    } catch {
      showSnackbar('Failed to cancel order', 'error');
    } finally {
      setActionLoading(null);
      setOrderToCancel(null);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    loadOrders();
    loadStats();
  };

  const handleStatusFilterChange = (_: React.SyntheticEvent, v: StatusFilter) => {
    setStatusFilter(v);
    setPage(0);
  };

  const handleDateFilterChange = (d: DateFilter) => {
    setDateFilter(d);
    setPage(0);
  };

  // Client-side search filter
  const filteredOrders = debouncedSearch
    ? orders.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          o.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : orders;

  // Derived stat values
  const totalOrdersVal = stats?.total_orders ?? 0;
  const pendingVal = stats?.orders_by_status?.pending ?? 0;
  const preparingVal = stats?.orders_by_status?.preparing ?? 0;
  const completedVal = stats?.orders_by_status?.completed ?? 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f1f5f9' }}>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Section                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          position: 'relative',
          background: rc.gradient,
          px: { xs: 2, sm: 3, md: 5 },
          pt: { xs: 2.5, sm: 3 },
          pb: { xs: 2.5, sm: 3 },
          flexShrink: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Overline: FIRST NAME · ROLE */}
          <Typography
            sx={{
              color: alpha(rc.chipText, 0.75),
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            {firstName ? `${firstName} · ${displayRole}` : 'APPLICATION CONTROL CENTER'}
          </Typography>

          {/* Title row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  fontSize: { xs: '1.4rem', md: '2rem' },
                }}
              >
                Order Management
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha(rc.chipText, 0.6) }} />
                <Typography
                  variant="caption"
                  sx={{ color: alpha(rc.chipText, 0.6), fontWeight: 500, fontSize: '0.75rem' }}
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Refresh button — glassmorphism, full-width on xs */}
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                width: { xs: '100%', sm: 'auto' },
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.25),
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: 'none',
                },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Hero stat tiles — CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <HeroStat label="Total Orders"  value={statsLoading ? 0 : totalOrdersVal} icon={<ReceiptIcon />}             rc={rc} />
            <HeroStat label="Pending"       value={statsLoading ? 0 : pendingVal}     icon={<PendingIcon />}             rc={rc} />
            <HeroStat label="Preparing"     value={statsLoading ? 0 : preparingVal}   icon={<RestaurantIcon />}          rc={rc} />
            <HeroStat label="Completed"     value={statsLoading ? 0 : completedVal}   icon={<CheckCircleOutlineIcon />}  rc={rc} />
          </Box>
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Full-width Toolbar (flush, no top gap)                              */}
      {/* ------------------------------------------------------------------ */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: 'none',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          flexShrink: 0,
        }}
      >
        {/* Row 1: Search + Date filter + Result count */}
        <Box
          sx={{
            px: 2.5,
            pt: 2,
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Search */}
          <Box
            sx={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
            }}
          >
            <SearchIcon sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
            <InputBase
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}
            />
            {searchQuery && (
              <IconButton
                size="small"
                onClick={() => setSearchQuery('')}
                sx={{ p: 0.25, color: '#94a3b8' }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>

          {/* Date filter */}
          <FormControl size="small" sx={{ minWidth: 120, flexShrink: 0 }}>
            <Select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value as DateFilter)}
              displayEmpty
              sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
            >
              <MenuItem value=""><Typography variant="body2" sx={{ color: '#94a3b8' }}>All Dates</Typography></MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>

          {/* Result count */}
          <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              {filteredOrders.length} of {totalOrders}
            </Typography>
          </Box>
        </Box>

        {/* Row 2: Status tabs */}
        <Tabs
          value={statusFilter}
          onChange={handleStatusFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            px: 1,
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.8rem',
              textTransform: 'none',
              fontWeight: 600,
              py: 0,
              letterSpacing: 0,
            },
            '& .MuiTabs-indicator': { height: 2 },
          }}
        >
          {(['', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'] as StatusFilter[]).map((s) => (
            <Tab key={s} value={s} label={s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} />
          ))}
        </Tabs>
      </Paper>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 1.5, sm: 2.5, md: 4 },
          pt: 2.5,
          pb: { xs: 4, sm: 6 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Desktop Table (sm+) */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            bgcolor: '#fff',
            overflow: 'hidden',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <TableContainer>
            <Table
              size="small"
              sx={{ '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } } }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {[
                    { label: 'Order #',  width: '12%' },
                    { label: 'Customer', width: '18%' },
                    { label: 'Table',    width: '8%'  },
                    { label: 'Items',    width: '8%'  },
                    { label: 'Amount',   width: '12%' },
                    { label: 'Status',   width: '14%' },
                    { label: 'Time',     width: '10%' },
                    { label: 'Actions',  width: '18%' },
                  ].map((h) => (
                    <TableCell
                      key={h.label}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        color: '#64748b',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        py: 1.5,
                        whiteSpace: 'nowrap',
                        width: h.width,
                        border: 'none',
                      }}
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

                    return (
                      <TableRow
                        key={order.id}
                        sx={{
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: '#fafafa' },
                          '& .MuiTableCell-root': { border: 'none' },
                        }}
                      >
                        <TableCell
                          onClick={() => handleOrderClick(order)}
                          sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}
                        >
                          #{order.order_number}
                        </TableCell>
                        <TableCell onClick={() => handleOrderClick(order)} sx={{ fontSize: '0.8rem', color: '#374151' }}>
                          {order.customer_name || 'Walk-in'}
                        </TableCell>
                        <TableCell onClick={() => handleOrderClick(order)} sx={{ fontSize: '0.8rem', color: '#374151' }}>
                          {order.table_number || '—'}
                        </TableCell>
                        <TableCell onClick={() => handleOrderClick(order)} sx={{ fontSize: '0.8rem', color: '#374151' }}>
                          {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell onClick={() => handleOrderClick(order)} sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                          {formatINR(order.total)}
                        </TableCell>
                        <TableCell onClick={() => handleOrderClick(order)}>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell onClick={() => handleOrderClick(order)} sx={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {timeAgo(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => handleOrderClick(order)}
                                sx={{ borderRadius: 1.5 }}
                              >
                                <VisibilityIcon sx={{ fontSize: 16, color: '#64748b' }} />
                              </IconButton>
                            </Tooltip>
                            {flow && (
                              <Tooltip title={`Mark as ${flow.next}`}>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={isActing}
                                    onClick={() => handleStatusUpdate(order.id, flow.next)}
                                    sx={{ color: flow.color, borderRadius: 1.5 }}
                                  >
                                    {flow.icon}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            {canCancel && (
                              <Tooltip title="Cancel order">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={isActing}
                                    onClick={() => handleCancelOrder(order)}
                                    sx={{ color: '#ef4444', borderRadius: 1.5 }}
                                  >
                                    <CancelIcon sx={{ fontSize: 16 }} />
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

          {/* Pagination */}
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
                '& .MuiTablePagination-displayedRows': { fontSize: '0.8rem', color: '#64748b' },
              }}
            />
          )}
        </Paper>

        {/* Mobile Card List (xs only) */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Skeleton variant="text" width={90} height={20} />
                    <Skeleton variant="text" width={64} height={20} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Skeleton variant="text" width={120} height={18} />
                    <Skeleton variant="text" width={60} height={18} />
                  </Box>
                  <Skeleton variant="text" width={100} height={16} sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="text" width={70} height={16} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Skeleton variant="circular" width={28} height={28} />
                      <Skeleton variant="circular" width={28} height={28} />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="#94a3b8" fontWeight={600}>No orders found</Typography>
              <Typography variant="body2" color="#cbd5e1" mt={0.5}>
                Try adjusting your filters or check back later
              </Typography>
            </Box>
          ) : (
            <>
              {filteredOrders.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  actionLoading={actionLoading}
                  onOrderClick={handleOrderClick}
                  onStatusUpdate={handleStatusUpdate}
                  onCancelOrder={handleCancelOrder}
                />
              ))}
              {/* Mobile pagination */}
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
                  '& .MuiTablePagination-displayedRows': { fontSize: '0.8rem', color: '#64748b' },
                }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Order Detail Drawer                                                  */}
      {/* ------------------------------------------------------------------ */}
      <OrderDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        actionLoading={actionLoading}
        onStatusUpdate={handleStatusUpdate}
        onCancel={handleCancelOrder}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => { setCancelDialogOpen(false); setOrderToCancel(null); }}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${orderToCancel?.order_number}? This action cannot be undone.`}
        severity="error"
        confirmLabel="Yes, Cancel Order"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagementPage;