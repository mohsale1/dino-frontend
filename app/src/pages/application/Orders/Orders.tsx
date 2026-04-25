import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Grid, Typography, Skeleton, TablePagination, Snackbar, Alert,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

import { orderService, OrderFilters } from '../../../services/application/order.service';
import { useUserData } from '../../../contexts/application/UserData';
import { ConfirmationDialog } from '../../../components/dialogs/ConfirmationDialog';

import {
  Order, StatusFilter, DateFilter, ROWS_PER_PAGE, getDateRange, toISODate,
} from './orders.types';

import OrdersToolbar from './components/OrdersToolbar';
import OrderCard from './components/OrderCard';
import OrderDetailPanel from './components/OrderDetailPanel';

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
    <Box sx={{ px: 2, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
      <Skeleton variant="text" width={80} height={18} />
      <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 1 }} />
    </Box>
    <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="80%" height={16} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width={70} height={22} />
      </Box>
    </Box>
    <Box sx={{ px: 2, py: 1.25, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
      <Skeleton variant="rounded" height={30} sx={{ flex: 1, borderRadius: 1.5 }} />
      <Skeleton variant="rounded" width={72} height={30} sx={{ borderRadius: 1.5 }} />
    </Box>
  </Box>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <Box sx={{ py: 12, textAlign: 'center' }}>
    <Box sx={{ width: 64, height: 64, borderRadius: '12px', bgcolor: '#F7F9FA', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
      <ReceiptIcon sx={{ fontSize: 30, color: '#999999' }} />
    </Box>
    <Typography sx={{ fontWeight: 600, color: '#666666', fontSize: '0.9rem' }}>No orders found</Typography>
    <Typography sx={{ color: '#666666', fontSize: '0.8rem', mt: 0.5 }}>Try adjusting your filters or date range</Typography>
  </Box>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const OrdersManagementPage: React.FC = () => {
  const { userData } = useUserData();

  const personaId: number | undefined =
    userData?.venue?.personaId || (userData?.venue?.id ? Number(userData.venue.id) : undefined);

  // ── State ─────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Debounced search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!personaId) return;
    // For custom range, only fetch when both dates are set
    if (dateFilter === 'custom' && (!customStartDate || !customEndDate)) return;
    setLoading(true);
    const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);
    const filters: OrderFilters = {
      personaId: String(personaId),
      status: statusFilter || undefined,
      startDate,
      endDate,
      page: page + 1,
      page_size: ROWS_PER_PAGE,
    };
    try {
      const res = await orderService.getOrders(filters);
      if (!res.success || !res.data) { showSnackbar('Failed to load orders', 'error'); return; }
      setOrders(res.data.items);
      setTotalOrders(res.data.total);
    } catch { showSnackbar('Failed to load orders', 'error'); }
    finally { setLoading(false); }
  }, [personaId, statusFilter, dateFilter, customStartDate, customEndDate, page]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadOrders();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setActionLoading(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showSnackbar(`Order marked as ${newStatus}`, 'success');
      await loadOrders();
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
      showSnackbar('Order cancelled', 'success');
      if (drawerOpen && selectedOrderId === orderToCancel.id) setDrawerOpen(false);
      await loadOrders();
    } catch { showSnackbar('Failed to cancel order', 'error'); }
    finally { setActionLoading(null); setOrderToCancel(null); }
  };

  const handleOrderClick = (order: Order) => { setSelectedOrderId(order.id); setDrawerOpen(true); };
  const handleRefresh = () => loadOrders();
  const handleStatusFilterChange = (v: StatusFilter) => { setStatusFilter(v); setPage(0); };
  const handleDateFilterChange = (d: DateFilter) => {
    setDateFilter(d);
    setPage(0);
    // Pre-fill custom range with today when switching to custom for the first time
    if (d === 'custom' && !customStartDate && !customEndDate) {
      const today = toISODate(new Date());
      setCustomStartDate(today);
      setCustomEndDate(today);
    }
  };
  const handleCustomStartDateChange = (v: string) => { setCustomStartDate(v); setPage(0); };
  const handleCustomEndDateChange = (v: string) => { setCustomEndDate(v); setPage(0); };

  // Client-side search
  const filteredOrders = debouncedSearch
    ? orders.filter((o) =>
        o.order_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : orders;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: '1440px', margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Toolbar: title + search + filters + status tabs */}
      <OrdersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={handleCustomStartDateChange}
        onCustomEndDateChange={handleCustomEndDateChange}
        filteredCount={filteredOrders.length}
        totalCount={totalOrders}
        onRefresh={handleRefresh}
      />

      {/* Card grid */}
      <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 3 }}>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : filteredOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Grid container spacing={2}>
              {filteredOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                  <OrderCard
                    order={order}
                    isSelected={selectedOrderId === order.id && drawerOpen}
                    actionLoading={actionLoading}
                    onOrderClick={handleOrderClick}
                    onStatusUpdate={handleStatusUpdate}
                    onCancelOrder={handleCancelOrder}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
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
                  '& .MuiTablePagination-selectLabel': { display: 'none' },
                  '& .MuiTablePagination-select': { display: 'none' },
                  '& .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: '#666666' },
                  '& .MuiTablePagination-actions button': {
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    color: '#666666',
                    mx: 0.25,
                    '&:hover': { bgcolor: '#f8fafc' },
                    '&.Mui-disabled': { opacity: 0.4 },
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Order detail panel */}
      <OrderDetailPanel
        orderId={selectedOrderId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        actionLoading={actionLoading}
        onStatusUpdate={handleStatusUpdate}
        onCancel={handleCancelById}
      />

      {/* Cancel confirmation */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => { setCancelDialogOpen(false); setOrderToCancel(null); }}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${orderToCancel?.order_number ?? ''}? This cannot be undone.`}
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
          sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagementPage;