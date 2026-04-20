import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Paper,
  Divider,
  IconButton,
  Chip,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  CircularProgress,
  Drawer,
  Snackbar,
  Alert,
  Badge,
  FormControl,
  Select,
  MenuItem,
  InputBase,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Search,
  Receipt,
  CheckCircle,
  Restaurant,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  Print,
  Person,
  Phone,
  GridView,
  ViewList,
  Inventory,
  TrendingUp,
  ErrorOutline,
  Refresh,
  Close,
  TableRestaurant,
  Notes,
  LocalOffer,
  CalendarToday,
  PointOfSale,
  ShoppingBag,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { useUserData } from '../../contexts/application/UserData';
import { catalogService } from '../../features/catalog/services';
import { orderService } from '../../services/application/order.service';
import { tableService, Table } from '../../services/application/table.service';
import type { Category } from '../../features/catalog/types';
import { ROLE_COLORS } from '../../constants/app';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  categoryName?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  image?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (amount: number) =>
  `₹${(amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TAX_RATE = 0.1;

// ─── useCountUp ───────────────────────────────────────────────────────────────

const useCountUp = (target: number, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
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

// ─── HeroStat ─────────────────────────────────────────────────────────────────

const HeroStat: React.FC<{
  label: string;
  value: number;
  prefix?: string;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}> = ({ label, value, prefix = '', icon, rc }) => {
  const animated = useCountUp(Math.round(value));
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 }, py: 1.75, borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: alpha(rc.chipText, 0.9), flexShrink: 0 }}>
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, color: rc.statValue, fontSize: { xs: '1.1rem', sm: '1.4rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {prefix}{animated.toLocaleString('en-IN')}
          </Typography>
          <Typography sx={{ color: rc.statLabel, fontSize: '0.72rem', fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const POS: React.FC = () => {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('md'));
  const { user, userPermissions } = useAuth();
  const { userData } = useUserData();

  const currentVenue     = userData?.venue;
  const currentWorkspace = userData?.workspace;

  // Role colours — same pattern as Orders page
  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name ||
    user?.role || ''
  ).toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super') ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin') ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

  const firstName = (user as any)?.firstName || (user as any)?.first_name || user?.name?.split(' ')[0] || '';
  const displayRole = userPermissions?.role?.displayName || userPermissions?.role?.name || roleKey;

  // ── Data state ──────────────────────────────────────────────────────────────
  const [menuItems,  setMenuItems]  = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables,     setTables]     = useState<Table[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [dataError,  setDataError]  = useState('');

  // ── UI state ────────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [viewMode,         setViewMode]         = useState<'grid' | 'list'>('grid');
  const [cartOpen,         setCartOpen]         = useState(false);

  // ── Cart state ──────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Payment dialog ──────────────────────────────────────────────────────────
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod,     setPaymentMethod]     = useState<'cash' | 'card' | 'wallet'>('cash');
  const [customerName,      setCustomerName]      = useState('');
  const [customerPhone,     setCustomerPhone]     = useState('');
  const [selectedTableId,   setSelectedTableId]   = useState<string>('');
  const [orderNotes,        setOrderNotes]        = useState('');
  const [discountAmount,    setDiscountAmount]    = useState<string>('');
  const [processingOrder,   setProcessingOrder]   = useState(false);
  const [orderError,        setOrderError]        = useState('');

  // ── Confirmation dialog ──────────────────────────────────────────────────────
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [completedOrder,   setCompletedOrder]   = useState<any>(null);

  // ── Snackbar ─────────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  // ── Today's stats (derived from orders) ─────────────────────────────────────
  const [todayOrders,  setTodayOrders]  = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);

  // ── Load real data ───────────────────────────────────────────────────────────
  const loadMenuData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      setDataError('');

      const [rawItems, rawCategories] = await Promise.all([
        catalogService.getCatalogItems(currentWorkspace.id),
        catalogService.getCategories(currentWorkspace.id),
      ]);

      const categoryMap = new Map<string, string>(
        (rawCategories || []).map(c => [c.id, c.name])
      );

      const mapped: MenuItem[] = (rawItems || [])
        .filter(item => item.isAvailable)
        .map(item => ({
          id:           item.id,
          name:         item.name,
          description:  item.description,
          price:        Number(item.basePrice) || 0,
          categoryId:   item.categoryId,
          categoryName: categoryMap.get(item.categoryId) || 'Uncategorized',
          isAvailable:  item.isAvailable,
          image:        item.imageUrls?.[0],
        }));

      setMenuItems(mapped);
      setCategories(rawCategories || []);
    } catch (err: any) {
      setDataError(err.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  const loadTables = useCallback(async () => {
    if (!currentVenue?.id) return;
    try {
      const res = await tableService.getTables({ venueId: currentVenue.id, isActive: true });
      if (res.success && res.data) {
        setTables((res.data as any) || []);
      }
    } catch {
      // tables are non-critical
    }
  }, [currentVenue?.id]);

  const loadTodayStats = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await orderService.getOrders({
        workspaceId: currentWorkspace.id,
        startDate: today,
        endDate: today,
        page_size: 100,
      });
      if (res.success && res.data) {
        const items = res.data.items || [];
        const completed = items.filter(o => o.status !== 'cancelled');
        setTodayOrders(completed.length);
        setTodayRevenue(completed.reduce((s, o) => s + (o.total || 0), 0));
      }
    } catch {
      // non-critical
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadMenuData();
    loadTables();
    loadTodayStats();
  }, [loadMenuData, loadTables, loadTodayStats]);

  // ── Cart operations ──────────────────────────────────────────────────────────
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image, categoryName: item.categoryName }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  };

  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(c => c.id !== itemId));
  const clearCart      = ()              => setCart([]);

  // ── Calculations ─────────────────────────────────────────────────────────────
  const subtotal    = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const discount    = Math.min(parseFloat(discountAmount) || 0, subtotal);
  const taxable     = subtotal - discount;
  const tax         = taxable * TAX_RATE;
  const total       = taxable + tax;
  const totalItems  = cart.reduce((s, c) => s + c.quantity, 0);

  // ── Filtered items ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return menuItems.filter(item => {
      const matchCat    = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  // ── Place order ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!customerName.trim()) return;
    if (!currentWorkspace?.id) { setOrderError('No workspace found.'); return; }
    if (!currentVenue?.id)     { setOrderError('No venue/organization found.'); return; }

    setProcessingOrder(true);
    setOrderError('');

    try {
      const selectedTable = tables.find(t => t.id === selectedTableId);

      // Coerce all numeric values explicitly — the API transformer runs toSnakeCase
      // but does NOT coerce types, so null/undefined prices must be guarded here.
      const safeSubtotal  = Number(subtotal)  || 0;
      const safeDiscount  = Number(discount)  || 0;
      const safeTax       = Number(tax)       || 0;
      const safeTotal     = Number(total)     || 0;

      const payload: any = {
        organization_id: currentVenue.id,
        workspace_id:    currentWorkspace.id,
        customer_name:   customerName.trim(),
        customer_phone:  customerPhone.trim() || undefined,
        table_number:    selectedTable?.table_number || selectedTable?.tableNumber || undefined,
        payment_method:  paymentMethod,
        order_type:      'pos',
        notes:           orderNotes.trim() || undefined,
        subtotal:        safeSubtotal,
        discount_amount: safeDiscount,
        tax_amount:      safeTax,
        total:           safeTotal,
        items: cart.map(c => {
          const unitPrice  = Number(c.price)    || 0;
          const qty        = Number(c.quantity) || 1;
          const totalPrice = parseFloat((unitPrice * qty).toFixed(2));
          return {
            product_id:   c.id,
            product_name: c.name,
            quantity:     qty,
            unit_price:   unitPrice,
            total_price:  totalPrice,
          };
        }),
      };

      const response = await orderService.createOrder(payload);

      const orderData = {
        orderNumber:  (response.data as any)?.order_number || `POS-${Date.now()}`,
        orderId:      (response.data as any)?.id,
        items:        cart,
        customer:     { name: customerName, phone: customerPhone },
        tableNumber:  selectedTable?.table_number || selectedTable?.tableNumber || '',
        paymentMethod,
        notes:        orderNotes,
        subtotal:     safeSubtotal,
        discount:     safeDiscount,
        tax:          safeTax,
        total:        safeTotal,
        timestamp:    new Date().toISOString(),
      };

      setCompletedOrder(orderData);
      setPaymentDialogOpen(false);
      setConfirmationOpen(true);
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setSelectedTableId('');
      setOrderNotes('');
      setDiscountAmount('');
      loadTodayStats();
      showSnackbar(`Order #${orderData.orderNumber} placed successfully`, 'success');
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };



  // ── Print receipt ────────────────────────────────────────────────────────────
  const handlePrintReceipt = () => {
    if (!completedOrder) return;
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt - ${completedOrder.orderNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{margin:0;size:80mm auto}
body{font-family:'Courier New',monospace;padding:8mm 4mm;max-width:80mm;margin:0 auto;font-size:11px;line-height:1.3}
.logo-box{background:#000;color:#fff;text-align:center;padding:5px 0;margin-bottom:6px}
.logo{font-size:20px;font-weight:bold;letter-spacing:3px}
.tagline{font-size:8px;letter-spacing:1px}
.header{text-align:center;margin-bottom:10px;padding-bottom:8px;border-bottom:2px dashed #000}
.venue-name{font-size:13px;font-weight:bold;margin:6px 0 4px;text-transform:uppercase}
.venue-info{font-size:9px;color:#333}
.badge{text-align:center;margin-bottom:8px}
.badge span{background:#000;color:#fff;padding:3px 12px;font-size:9px;font-weight:bold;letter-spacing:1.5px}
.order-num{font-size:11px;font-weight:bold;text-align:center;padding:5px;background:#f5f5f5;border:1px dashed #000;margin-bottom:6px}
.section{margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #000}
.row{display:flex;justify-content:space-between;margin-bottom:2px;font-size:9px}
.label{font-weight:bold;text-transform:uppercase;font-size:8px}
.customer-box{background:#f9f9f9;border:1px solid #ddd;padding:6px;margin-bottom:8px}
.items-header{background:#000;color:#fff;text-align:center;padding:4px;font-size:9px;font-weight:bold;letter-spacing:1.5px;margin-bottom:6px}
.item{margin-bottom:5px;padding-bottom:4px;border-bottom:1px dotted #ccc}
.item:last-child{border-bottom:none}
.item-row{display:flex;justify-content:space-between}
.item-name{font-weight:bold;font-size:10px}
.item-total{font-weight:bold;font-size:10px}
.item-detail{color:#666;font-size:8px;padding-left:6px}
.totals{border-top:2px solid #000;border-bottom:2px solid #000;padding:6px 0;margin-bottom:8px}
.grand{font-size:13px;font-weight:bold;margin-top:5px;padding-top:5px;border-top:2px dashed #000}
.payment-box{background:#f0f0f0;border:1px solid #ccc;padding:6px;margin-bottom:8px}
.footer{text-align:center;border-top:2px dashed #000;padding-top:8px;margin-top:8px}
.ty-box{background:#000;color:#fff;padding:6px;margin-bottom:6px}
.ty{font-size:12px;font-weight:bold;letter-spacing:2px}
.ty-sub{font-size:7px;margin-top:2px}
.powered{font-size:7px;color:#999;margin-top:6px;padding-top:6px;border-top:1px solid #ddd}
</style></head><body>
<div class="logo-box"><div class="logo">DINO</div><div class="tagline">POINT OF SALE</div></div>
<div class="header">
  <div class="venue-name">${currentVenue?.name || 'Venue'}</div>
  <div class="venue-info">${currentVenue?.location?.address || ''}<br>Tel: ${currentVenue?.phone || 'N/A'}</div>
</div>
<div class="badge"><span>SALES RECEIPT</span></div>
<div class="order-num">ORDER #${completedOrder.orderNumber}</div>
<div class="section">
  <div class="row"><span class="label">Date:</span><span>${new Date(completedOrder.timestamp).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
  <div class="row"><span class="label">Time:</span><span>${new Date(completedOrder.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
  <div class="row"><span class="label">Cashier:</span><span>${userData?.user?.firstName || 'Staff'}</span></div>
  ${completedOrder.tableNumber ? `<div class="row"><span class="label">Table:</span><span>${completedOrder.tableNumber}</span></div>` : ''}
</div>
<div class="customer-box">
  <div class="row"><span>Name:</span><span>${completedOrder.customer.name}</span></div>
  ${completedOrder.customer.phone ? `<div class="row"><span>Phone:</span><span>${completedOrder.customer.phone}</span></div>` : ''}
</div>
<div class="items-header">ORDER ITEMS</div>
${completedOrder.items.map((item: CartItem, i: number) => `
<div class="item">
  <div class="item-row"><span class="item-name">${i + 1}. ${item.name}</span><span class="item-total">₹${(item.price * item.quantity).toFixed(2)}</span></div>
  <div class="item-detail">${item.quantity} x ₹${item.price.toFixed(2)}</div>
</div>`).join('')}
<div class="totals">
  <div class="row"><span>Subtotal:</span><span>₹${completedOrder.subtotal.toFixed(2)}</span></div>
  ${completedOrder.discount > 0 ? `<div class="row"><span>Discount:</span><span>-₹${completedOrder.discount.toFixed(2)}</span></div>` : ''}
  <div class="row"><span>Tax (10%):</span><span>₹${completedOrder.tax.toFixed(2)}</span></div>
  <div class="row grand"><span>TOTAL:</span><span>₹${completedOrder.total.toFixed(2)}</span></div>
</div>
<div class="payment-box">
  <div class="row"><span>Method:</span><span style="font-weight:bold;text-transform:uppercase">${completedOrder.paymentMethod}</span></div>
  <div class="row"><span>Status:</span><span style="background:#000;color:#fff;padding:1px 6px;font-size:8px;font-weight:bold">PAID</span></div>
</div>
${completedOrder.notes ? `<div class="customer-box"><div class="row"><span>Notes:</span><span>${completedOrder.notes}</span></div></div>` : ''}
<div class="footer">
  <div class="ty-box"><div class="ty">THANK YOU!</div><div class="ty-sub">PLEASE COME AGAIN</div></div>
  <div class="powered">Powered by Dino POS</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},250)};window.onafterprint=function(){setTimeout(function(){window.close()},100)}</script>
</body></html>`);
    win.document.close();
  };

  // ── No workspace guard ───────────────────────────────────────────────────────
  if (!currentWorkspace?.id && !loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', flexDirection: 'column', gap: 2, bgcolor: '#f1f5f9', p: 4 }}>
        <ErrorOutline sx={{ fontSize: 56, color: '#cbd5e1' }} />
        <Typography variant="h6" fontWeight={600} color="#374151">No Workspace Found</Typography>
        <Typography variant="body2" color="#6b7280">Your account is not linked to a workspace. Please contact support.</Typography>
      </Box>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f1f5f9' }}>

      {/* ── Hero Section ── */}
      <Box
        sx={{
          position: 'relative',
          background: rc.gradient,
          px: { xs: 2, sm: 3, md: 5 },
          pt: { xs: 2.5, sm: 3 },
          pb: { xs: 2.5, sm: 3 },
          flexShrink: 0,
          '&::before': {
            content: '""', position: 'absolute', top: -80, right: -80,
            width: 360, height: 360, borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""', position: 'absolute', bottom: -60, left: '25%',
            width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Overline */}
          <Typography sx={{ color: alpha(rc.chipText, 0.75), fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem', textTransform: 'uppercase', mb: 1 }}>
            {firstName ? `${firstName} · ${displayRole}` : 'APPLICATION CONTROL CENTER'}
          </Typography>

          {/* Title row */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, fontSize: { xs: '1.4rem', md: '2rem' } }}>
                Point of Sale
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha(rc.chipText, 0.6) }} />
                <Typography variant="caption" sx={{ color: alpha(rc.chipText, 0.6), fontWeight: 500, fontSize: '0.75rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => { loadMenuData(); loadTodayStats(); }}
                sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', fontWeight: 600, textTransform: 'none', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', px: 2.5, py: 1, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: alpha('#fff', 0.25), boxShadow: 'none' } }}
              >
                Refresh
              </Button>
              <Badge badgeContent={totalItems} color="error" max={99}>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => setCartOpen(true)}
                  sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', fontWeight: 600, textTransform: 'none', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', px: 2.5, py: 1, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: alpha('#fff', 0.25), boxShadow: 'none' } }}
                >
                  Cart
                </Button>
              </Badge>
            </Box>
          </Box>

          {/* Hero stat tiles */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, sm: 2 } }}>
            <HeroStat label="Today's Orders"  value={todayOrders}          icon={<Receipt />}       rc={rc} />
            <HeroStat label="Today's Revenue" value={Math.round(todayRevenue)} prefix="₹"          icon={<TrendingUp />}    rc={rc} />
            <HeroStat label="Cart Items"      value={totalItems}           icon={<ShoppingBag />}   rc={rc} />
            <HeroStat label="Menu Items"      value={menuItems.length}     icon={<Inventory />}     rc={rc} />
          </Box>
        </Box>
      </Box>

      {/* ── Toolbar ── */}
      <Paper elevation={0} sx={{ borderRadius: 0, border: 'none', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff', flexShrink: 0 }}>
        {/* Row 1: Search + view toggle */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, px: 1.5, py: 0.75 }}>
            <Search sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
            <InputBase
              placeholder="Search items by name or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}
            />
            {searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ p: 0.25, color: '#94a3b8' }}>
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>

          <ButtonGroup variant="outlined" size="small" sx={{ flexShrink: 0 }}>
            {(['grid', 'list'] as const).map(mode => (
              <Button
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{ backgroundColor: viewMode === mode ? '#0f172a' : '#ffffff', color: viewMode === mode ? '#ffffff' : '#64748b', borderColor: '#e2e8f0', '&:hover': { backgroundColor: viewMode === mode ? '#1e293b' : '#f8fafc', borderColor: '#e2e8f0' } }}
              >
                {mode === 'grid' ? <GridView fontSize="small" /> : <ViewList fontSize="small" />}
              </Button>
            ))}
          </ButtonGroup>

          <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              {filteredItems.length} of {menuItems.length} items
            </Typography>
          </Box>
        </Box>

        {/* Row 2: Category chips */}
        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', gap: 1, overflowX: 'auto', pb: 1.5 }}>
          {[{ id: 'all', name: 'All Items' }, ...categories].map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => setSelectedCategory(cat.id)}
                size="small"
                sx={{
                  flexShrink: 0, fontWeight: 600, fontSize: '0.8rem', height: 30,
                  backgroundColor: active ? '#0f172a' : '#f8fafc',
                  color: active ? '#ffffff' : '#475569',
                  border: '1px solid', borderColor: active ? '#0f172a' : '#e2e8f0',
                  '&:hover': { backgroundColor: active ? '#1e293b' : '#f1f5f9' },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* ── Menu Items ── */}
      <Box sx={{ flex: 1, px: { xs: 1.5, sm: 2.5, md: 4 }, pt: 2.5, pb: 6 }}>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : dataError ? (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 10, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <ErrorOutline sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ color: '#374151', mb: 1 }}>Failed to load items</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>{dataError}</Typography>
            <Button variant="outlined" onClick={loadMenuData} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Retry</Button>
          </Paper>
        ) : filteredItems.length === 0 ? (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 12, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Search sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ color: '#374151', mb: 1 }}>No items found</Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>Try adjusting your search or category filter</Typography>
          </Paper>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={2}>
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%', display: 'flex', flexDirection: 'column',
                      borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease', overflow: 'hidden',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(15,23,42,0.1)', borderColor: '#cbd5e1' },
                    }}
                  >
                    <Box onClick={() => addToCart(item)} sx={{ position: 'relative', height: 150, bgcolor: '#f8fafc', cursor: 'pointer', overflow: 'hidden' }}>
                      {item.image ? (
                        <CardMedia component="img" height="150" image={item.image} alt={item.name} sx={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                          <Restaurant sx={{ fontSize: 40, color: '#cbd5e1' }} />
                        </Box>
                      )}
                      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                        <Chip label={item.categoryName} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.92)', color: '#374151', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(4px)', '& .MuiChip-label': { px: 1 } }} />
                      </Box>
                      {inCart && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', bgcolor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>{inCart.quantity}</Typography>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.4, mb: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 32 }}>
                        {item.description || 'No description'}
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
                          {formatINR(item.price)}
                        </Typography>
                        {inCart ? (
                          <ButtonGroup size="small" variant="outlined">
                            <Button onClick={() => updateQuantity(item.id, -1)} sx={{ minWidth: 28, borderColor: '#e2e8f0', color: '#374151', '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' } }}>
                              <Remove sx={{ fontSize: 14 }} />
                            </Button>
                            <Button disabled sx={{ minWidth: 32, fontWeight: 700, color: '#0f172a !important', borderColor: '#e2e8f0', fontSize: '0.8rem' }}>
                              {inCart.quantity}
                            </Button>
                            <Button onClick={() => updateQuantity(item.id, 1)} sx={{ minWidth: 28, borderColor: '#e2e8f0', color: '#374151', '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' } }}>
                              <Add sx={{ fontSize: 14 }} />
                            </Button>
                          </ButtonGroup>
                        ) : (
                          <Button variant="contained" size="small" onClick={() => addToCart(item)} startIcon={<Add sx={{ fontSize: 14 }} />}
                            sx={{ bgcolor: '#0f172a', color: '#fff', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderRadius: 1.5, px: 1.5, py: 0.5, boxShadow: 'none', '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' } }}>
                            Add
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fff', overflow: 'hidden' }}>
            {filteredItems.map((item, idx) => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderBottom: idx < filteredItems.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s', '&:hover': { bgcolor: '#fafafa' } }}
                >
                  {item.image ? (
                    <Avatar src={item.image} variant="rounded" sx={{ width: 64, height: 64, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                  ) : (
                    <Avatar variant="rounded" sx={{ width: 64, height: 64, bgcolor: '#f1f5f9', flexShrink: 0 }}>
                      <Restaurant sx={{ color: '#94a3b8', fontSize: 24 }} />
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a', mb: 0.25 }}>{item.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</Typography>
                    <Chip label={item.categoryName} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }} />
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>{formatINR(item.price)}</Typography>
                    {inCart ? (
                      <ButtonGroup size="small" variant="outlined">
                        <Button onClick={() => updateQuantity(item.id, -1)} sx={{ minWidth: 28, borderColor: '#e2e8f0', color: '#374151' }}><Remove sx={{ fontSize: 14 }} /></Button>
                        <Button disabled sx={{ minWidth: 32, fontWeight: 700, color: '#0f172a !important', borderColor: '#e2e8f0', fontSize: '0.8rem' }}>{inCart.quantity}</Button>
                        <Button onClick={() => updateQuantity(item.id, 1)} sx={{ minWidth: 28, borderColor: '#e2e8f0', color: '#374151' }}><Add sx={{ fontSize: 14 }} /></Button>
                      </ButtonGroup>
                    ) : (
                      <Button variant="contained" size="small" onClick={() => addToCart(item)} startIcon={<Add sx={{ fontSize: 14 }} />}
                        sx={{ bgcolor: '#0f172a', color: '#fff', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderRadius: 1.5, px: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' } }}>
                        Add
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Paper>
        )}
      </Box>

      {/* ── Cart Drawer ── */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, bgcolor: '#f8fafc' } }}
      >
        {/* Drawer header */}
        <Box sx={{ px: 3, py: 2, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={700} color="#0f172a">Current Order</Typography>
            {totalItems > 0 && (
              <Chip label={`${totalItems} items`} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#0f172a', color: '#fff' }} />
            )}
          </Box>
          <IconButton onClick={() => setCartOpen(false)} size="small" sx={{ borderRadius: 1.5, '&:hover': { bgcolor: '#f1f5f9' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ShoppingCart sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} color="#94a3b8">Cart is empty</Typography>
              <Typography variant="body2" color="#cbd5e1" mt={0.5}>Add items from the menu</Typography>
            </Box>
          ) : (
            <>
              {/* Cart items */}
              <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fff', overflow: 'hidden' }}>
                {cart.map((item, idx) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2, borderBottom: idx < cart.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    {item.image ? (
                      <Avatar src={item.image} variant="rounded" sx={{ width: 44, height: 44, flexShrink: 0 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: '#f1f5f9', flexShrink: 0 }}>
                        <Restaurant sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </Avatar>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>{formatINR(item.price)} each</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <ButtonGroup size="small" variant="outlined">
                        <Button onClick={() => updateQuantity(item.id, -1)} sx={{ minWidth: 26, borderColor: '#e2e8f0', color: '#374151', p: 0.25 }}><Remove sx={{ fontSize: 13 }} /></Button>
                        <Button disabled sx={{ minWidth: 30, fontWeight: 700, color: '#0f172a !important', borderColor: '#e2e8f0', fontSize: '0.8rem', p: 0 }}>{item.quantity}</Button>
                        <Button onClick={() => updateQuantity(item.id, 1)} sx={{ minWidth: 26, borderColor: '#e2e8f0', color: '#374151', p: 0.25 }}><Add sx={{ fontSize: 13 }} /></Button>
                      </ButtonGroup>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', minWidth: 56, textAlign: 'right' }}>{formatINR(item.price * item.quantity)}</Typography>
                      <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.08) } }}>
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* Order summary */}
              <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5, bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Order Summary</Typography>
                <Stack spacing={0.75}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="#64748b">Subtotal</Typography>
                    <Typography variant="body2" fontWeight={600} color="#0f172a">{formatINR(subtotal)}</Typography>
                  </Box>
                  {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="#16a34a">Discount</Typography>
                      <Typography variant="body2" fontWeight={600} color="#16a34a">-{formatINR(discount)}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="#64748b">Tax (10%)</Typography>
                    <Typography variant="body2" fontWeight={600} color="#0f172a">{formatINR(tax)}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">Total</Typography>
                    <Typography variant="h6" fontWeight={800} color="#0f172a">{formatINR(total)}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </>
          )}
        </Box>

        {/* Drawer footer */}
        <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#fff', flexShrink: 0 }}>
          <Stack spacing={1.5}>
            <Button
              fullWidth variant="contained" size="large"
              disabled={cart.length === 0}
              onClick={() => { setCartOpen(false); setPaymentDialogOpen(true); }}
              startIcon={<CheckCircle />}
              sx={{ bgcolor: '#0f172a', color: '#fff', textTransform: 'none', fontWeight: 700, py: 1.5, borderRadius: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' }, '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' } }}
            >
              Proceed to Checkout
            </Button>
            {cart.length > 0 && (
              <Button fullWidth variant="outlined" color="error" onClick={clearCart} startIcon={<Delete />} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
                Clear Cart
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      {/* ── Floating Cart Button (mobile) ── */}
      {cart.length > 0 && !cartOpen && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
          <Badge badgeContent={totalItems} color="error" max={99}>
            <Button
              variant="contained"
              onClick={() => setCartOpen(true)}
              startIcon={<ShoppingCart />}
              sx={{ bgcolor: '#0f172a', color: '#fff', textTransform: 'none', fontWeight: 700, px: 3, py: 1.5, borderRadius: 3, boxShadow: '0 8px 24px rgba(15,23,42,0.3)', '&:hover': { bgcolor: '#1e293b' } }}
            >
              {formatINR(total)}
            </Button>
          </Badge>
        </Box>
      )}

      {/* ── Payment / Checkout Dialog ── */}
      <Dialog open={paymentDialogOpen} onClose={() => { setPaymentDialogOpen(false); setOrderError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PointOfSale sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#0f172a">Checkout</Typography>
                <Typography variant="caption" color="#64748b">{totalItems} items · {formatINR(total)}</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => { setPaymentDialogOpen(false); setOrderError(''); }} size="small" sx={{ borderRadius: 1.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={3}>
            {/* Order summary */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Order Summary</Typography>
              <Stack spacing={0.75}>
                {cart.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={item.quantity} size="small" sx={{ height: 18, minWidth: 26, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#0f172a', color: '#fff' }} />
                      <Typography variant="body2" color="#374151">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="#0f172a">{formatINR(item.price * item.quantity)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 0.75 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="#64748b">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatINR(subtotal)}</Typography>
                </Box>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="#16a34a">Discount</Typography>
                    <Typography variant="body2" fontWeight={600} color="#16a34a">-{formatINR(discount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="#64748b">Tax (10%)</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatINR(tax)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">{formatINR(total)}</Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Payment method */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Payment Method</Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {([
                  { key: 'cash',   label: 'Cash',   icon: <AttachMoney /> },
                  { key: 'card',   label: 'Card',   icon: <CreditCard /> },
                  { key: 'wallet', label: 'Wallet', icon: <AccountBalanceWallet /> },
                ] as const).map(({ key, label, icon }) => (
                  <Button
                    key={key} fullWidth
                    variant={paymentMethod === key ? 'contained' : 'outlined'}
                    onClick={() => setPaymentMethod(key)}
                    startIcon={icon}
                    sx={{ py: 1.25, borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: paymentMethod === key ? '#0f172a' : '#fff', color: paymentMethod === key ? '#fff' : '#374151', borderColor: '#e2e8f0', boxShadow: 'none', '&:hover': { bgcolor: paymentMethod === key ? '#1e293b' : '#f8fafc', borderColor: '#e2e8f0', boxShadow: 'none' } }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Customer details */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Customer Details</Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth label="Customer Name *" placeholder="Enter customer name"
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#0f172a' } } }}
                />
                <TextField
                  fullWidth label="Phone Number" placeholder="Optional"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#0f172a' } } }}
                />
              </Stack>
            </Box>

            {/* Table + Discount + Notes */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Order Details</Typography>
              <Stack spacing={2}>
                {tables.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Table (optional)</InputLabel>
                    <Select
                      value={selectedTableId}
                      onChange={e => setSelectedTableId(e.target.value)}
                      label="Table (optional)"
                      startAdornment={<InputAdornment position="start"><TableRestaurant sx={{ color: '#94a3b8', fontSize: 18, ml: 0.5 }} /></InputAdornment>}
                      sx={{ borderRadius: 1.5, '& fieldset': { borderColor: '#e2e8f0' } }}
                    >
                      <MenuItem value=""><em>No table</em></MenuItem>
                      {tables.map(t => (
                        <MenuItem key={t.id} value={t.id}>
                          Table {t.table_number || t.tableNumber}
                          {t.capacity ? ` (${t.capacity} seats)` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  fullWidth label="Discount Amount" placeholder="0.00"
                  value={discountAmount} onChange={e => setDiscountAmount(e.target.value)}
                  type="number" size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocalOffer sx={{ color: '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#0f172a' } } }}
                />
                <TextField
                  fullWidth label="Order Notes" placeholder="Special instructions..."
                  value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                  multiline rows={2} size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><Notes sx={{ color: '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#0f172a' } } }}
                />
              </Stack>
            </Box>

            {/* Error */}
            {orderError && (
              <Box sx={{ p: 2, bgcolor: alpha('#ef4444', 0.08), borderRadius: 1.5, border: `1px solid ${alpha('#ef4444', 0.25)}` }}>
                <Typography variant="body2" color="#dc2626">{orderError}</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => { setPaymentDialogOpen(false); setOrderError(''); }} variant="outlined" sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3, borderColor: '#e2e8f0', color: '#374151', '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' } }}>
            Cancel
          </Button>
          <Button
            onClick={handlePlaceOrder} variant="contained"
            disabled={!customerName.trim() || processingOrder}
            startIcon={processingOrder ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircle />}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, px: 4, bgcolor: '#0f172a', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' }, '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' } }}
          >
            {processingOrder ? 'Placing Order...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Order Confirmation Dialog ── */}
      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 2, textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: '#dcfce7', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle sx={{ color: '#16a34a', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0f172a" mb={0.5}>Order Placed!</Typography>
              <Typography variant="body2" color="#64748b" sx={{ fontFamily: 'monospace' }}>#{completedOrder?.orderNumber}</Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Order Details</Typography>
              <Stack spacing={1}>
                {completedOrder?.items.map((item: CartItem) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={item.quantity} size="small" sx={{ height: 18, minWidth: 26, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#0f172a', color: '#fff' }} />
                      <Typography variant="body2" color="#374151">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="#0f172a">{formatINR(item.price * item.quantity)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="#64748b">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatINR(completedOrder?.subtotal ?? 0)}</Typography>
                </Box>
                {(completedOrder?.discount ?? 0) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="#16a34a">Discount</Typography>
                    <Typography variant="body2" fontWeight={600} color="#16a34a">-{formatINR(completedOrder.discount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="#64748b">Tax (10%)</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatINR(completedOrder?.tax ?? 0)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="#16a34a">{formatINR(completedOrder?.total ?? 0)}</Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={1.5}>Customer & Payment</Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Person sx={{ color: '#94a3b8', fontSize: 16 }} />
                  <Typography variant="body2" color="#374151">{completedOrder?.customer.name}</Typography>
                </Box>
                {completedOrder?.customer.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Phone sx={{ color: '#94a3b8', fontSize: 16 }} />
                    <Typography variant="body2" color="#374151">{completedOrder.customer.phone}</Typography>
                  </Box>
                )}
                {completedOrder?.tableNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TableRestaurant sx={{ color: '#94a3b8', fontSize: 16 }} />
                    <Typography variant="body2" color="#374151">Table {completedOrder.tableNumber}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CreditCard sx={{ color: '#94a3b8', fontSize: 16 }} />
                  <Typography variant="body2" color="#374151" sx={{ textTransform: 'capitalize' }}>{completedOrder?.paymentMethod}</Typography>
                </Box>
                {completedOrder?.notes && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Notes sx={{ color: '#94a3b8', fontSize: 16, mt: 0.25 }} />
                    <Typography variant="body2" color="#374151">{completedOrder.notes}</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1.5, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setConfirmationOpen(false)} variant="outlined" sx={{ flex: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 600, py: 1.25, borderColor: '#e2e8f0', color: '#374151', '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' } }}>
            Close
          </Button>
          <Button onClick={handlePrintReceipt} variant="contained" startIcon={<Print />} sx={{ flex: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, py: 1.25, bgcolor: '#0f172a', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' } }}>
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default POS;