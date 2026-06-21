import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Grid, Typography, Skeleton, TablePagination, Snackbar, Alert,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

import { orderService, OrderFilters } from '../../../services/application/order.service';
import { useUserData } from '../../../contexts/application/UserData';
import { ConfirmationDialog } from '../../../components/dialogs/ConfirmationDialog';

import {
  Order, StatusFilter, DateFilter, TableFilter, ROWS_PER_PAGE, getDateRange, toISODate,
} from './orders.types';

import OrdersToolbar from './components/OrdersToolbar';
import OrderCard from './components/OrderCard';
import OrderDetailPanel from './components/OrderDetailPanel';

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e8ecf0',
      borderLeft: '3px solid #e2e8f0',
      borderRadius: 2.5,
      overflow: 'hidden',
    }}
  >
    <Box sx={{ px: 2, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
      <Skeleton variant="text" width={72} height={16} />
      <Skeleton variant="text" width={56} height={14} />
    </Box>
    <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Skeleton variant="text" width="55%" height={15} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={72} height={20} sx={{ borderRadius: 1 }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={48} height={15} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5, borderTop: '1px solid #f1f5f9' }}>
        <Skeleton variant="text" width={52} height={14} />
        <Skeleton variant="text" width={60} height={22} />
      </Box>
    </Box>
    <Box sx={{ px: 2, py: 1, borderTop: '1px solid #f1f5f9', bgcolor: '#fafbfc', display: 'flex', gap: 0.75 }}>
      <Skeleton variant="rounded" height={28} sx={{ flex: 1, borderRadius: 1.5 }} />
      <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 1.5 }} />
    </Box>
  </Box>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ hasFilters: boolean }> = ({ hasFilters }) => (
  <Box sx={{ py: 12, textAlign: 'center' }}>
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '14px',
        bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2,
      }}
    >
      <ReceiptIcon sx={{ fontSize: 28, color: '#94a3b8' }} />
    </Box>
    <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
      No orders found
    </Typography>
    <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', mt: 0.5 }}>
      {hasFilters ? 'Try adjusting your filters or date range' : 'Orders will appear here once placed'}
    </Typography>
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
  const [dateFilter, setDateFilter] = useState<DateFilter>('');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [tableFilter, setTableFilter] = useState<TableFilter>('');
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
    if (dateFilter === 'custom' && (!customStartDate || !customEndDate)) return;
    setLoading(true);
    const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);
    const filters: OrderFilters = {
      persona_id: personaId,
      status: statusFilter || undefined,
      page: page + 1,
      page_size: ROWS_PER_PAGE,
      start_date: startDate,
      end_date: endDate,
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

  // ── Derived: available table numbers from loaded orders ───────────────────
  const availableTables = useMemo(() => {
    const seen = new Set<string>();
    const tables: string[] = [];
    for (const o of orders) {
      if (o.table_number && !seen.has(o.table_number)) {
        seen.add(o.table_number);
        tables.push(o.table_number);
      }
    }
    return tables.sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [orders]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!personaId) return;
    setActionLoading(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus, personaId);
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
    if (!orderToCancel || !personaId) return;
    setCancelDialogOpen(false);
    setActionLoading(orderToCancel.id);
    try {
      await orderService.cancelOrder(orderToCancel.id, personaId);
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
    if (d === 'custom' && !customStartDate && !customEndDate) {
      const today = toISODate(new Date());
      setCustomStartDate(today);
      setCustomEndDate(today);
    }
  };
  const handleCustomStartDateChange = (v: string) => { setCustomStartDate(v); setPage(0); };
  const handleCustomEndDateChange = (v: string) => { setCustomEndDate(v); setPage(0); };
  const handleTableFilterChange = (v: TableFilter) => { setTableFilter(v); setPage(0); };

  // ── Client-side filtering (search + table) ────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q)
      );
    }

    if (tableFilter) {
      result = result.filter((o) => o.table_number === tableFilter);
    }

    return result;
  }, [orders, debouncedSearch, tableFilter]);

  const hasActiveFilters = !!(debouncedSearch || tableFilter || statusFilter || dateFilter);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* Toolbar */}
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
        tableFilter={tableFilter}
        onTableFilterChange={handleTableFilterChange}
        availableTables={availableTables}
        filteredCount={filteredOrders.length}
        totalCount={totalOrders}
        onRefresh={handleRefresh}
      />

      {/* Card grid */}
      <Box sx={{ flex: 1, px: { xs: 1.5, sm: 2.5, md: 3 }, pt: 2.5, pb: 6 }}>
        {loading ? (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : filteredOrders.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
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
                  '& .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: '#64748b' },
                  '& .MuiTablePagination-actions button': {
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    color: '#64748b',
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
        personaId={personaId}
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