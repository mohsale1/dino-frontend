import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Drawer, Snackbar, Alert, Badge, Button, useTheme, useMediaQuery,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

import { useUserData } from '../../../contexts/application/UserData';
import { catalogService } from '../../../features/catalog/services';
import { orderService } from '../../../services/application/order.service';
import { tableService, Table } from '../../../services/application/table.service';
import type { Category } from '../../../features/catalog/types';

import { CartItem, PosMenuItem, TAX_RATE, formatINR } from './pos.types';
import CategorySidebar from './components/CategorySidebar';
import POSToolbar from './components/POSToolbar';
import ItemsGrid from './components/ItemsGrid';
import CartPanel from './components/CartPanel';
import CheckoutDialog from './components/CheckoutDialog';
import OrderConfirmation from './components/OrderConfirmation';

const POS: React.FC = () => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));

  const { userData } = useUserData();
  const currentVenue = userData?.venue;
  const currentWorkspace = userData?.workspace; // used for catalog loading

  // ── Data state ──────────────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState<PosMenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartOpen, setCartOpen] = useState(false);

  // ── Cart state ───────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Checkout state ───────────────────────────────────────────────────────────
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // ── Confirmation state ───────────────────────────────────────────────────────
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // ── Snackbar ─────────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadMenuData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      setDataError('');
      const [rawItems, rawCategories] = await Promise.all([
        catalogService.getCatalogItems(currentWorkspace.id),
        catalogService.getCategories(currentWorkspace.id),
      ]);
      const categoryMap = new Map<string, string>((rawCategories || []).map(c => [c.id, c.name]));
      const mapped: PosMenuItem[] = (rawItems || [])
        .filter(item => item.isAvailable)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.basePrice) || 0,
          categoryId: item.categoryId,
          categoryName: categoryMap.get(item.categoryId) || 'Uncategorized',
          isAvailable: item.isAvailable,
          image: item.imageUrls?.[0],
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
      if (res.success && res.data) setTables((res.data as any) || []);
    } catch { /* non-critical */ }
  }, [currentVenue?.id]);

  useEffect(() => {
    loadMenuData();
    loadTables();
  }, [loadMenuData, loadTables]);

  // ── Cart operations ───────────────────────────────────────────────────────────
  const addToCart = (item: PosMenuItem) => {
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
  const clearCart = () => setCart([]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const discount = Math.min(parseFloat(discountAmount) || 0, subtotal);
  const taxable = subtotal - discount;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);

  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: menuItems.length };
    categories.forEach(cat => { counts[cat.id] = menuItems.filter(i => i.categoryId === cat.id).length; });
    return counts;
  }, [menuItems, categories]);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, catSearch]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

const handlePlaceOrder = async () => {
    if (!customerName.trim()) return;
    const personaId = userData?.venue?.personaId || (currentVenue?.id ? Number(currentVenue.id) : undefined);
    if (!personaId) { setOrderError('No venue persona found.'); return; }
    setProcessingOrder(true);
    setOrderError('');
    try {
      const selectedTable = tables.find(t => t.id === selectedTableId);
      const safeDiscount = Number(discount) || 0;
      const safeTax = Number(tax) || 0;
      const payload: any = {
        persona_id: personaId,
        order_type: 'dine_in',
        customer_name: customerName.trim() || 'Guest',
        table_id: selectedTable ? Number(selectedTable.id) : undefined,
        currency: 'INR',
        tax_amount: safeTax,
        discount_amount: safeDiscount,
        special_instructions: orderNotes.trim() || undefined,
        items: cart.map(c => ({
          item_id: Number(c.id),
          quantity: Number(c.quantity),
        })),
      };
      const response = await orderService.createOrder(payload);
      const safeSubtotal = Number(subtotal) || 0;
      const safeTotal = Number(total) || 0;
      const orderData = {
        orderNumber: (response.data as any)?.order_number || `POS-${Date.now()}`,
        orderId: (response.data as any)?.id,
        items: cart,
        customer: { name: customerName, phone: customerPhone },
        tableNumber: selectedTable?.table_number || (selectedTable as any)?.tableNumber || '',
        paymentMethod,
        notes: orderNotes,
        subtotal: safeSubtotal,
        discount: safeDiscount,
        tax: safeTax,
        total: safeTotal,
        timestamp: new Date().toISOString(),
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
      showSnackbar(`Order #${orderData.orderNumber} placed successfully`, 'success');
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };


  // ── Print receipt ─────────────────────────────────────────────────────────────
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
  <div class="venue-info">${(currentVenue as any)?.location?.address || ''}<br>Tel: ${(currentVenue as any)?.phone || 'N/A'}</div>
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
  <div class="item-row"><span class="item-name">${i + 1}. ${item.name}</span><span class="item-total">&#8377;${(item.price * item.quantity).toFixed(2)}</span></div>
  <div class="item-detail">${item.quantity} x &#8377;${item.price.toFixed(2)}</div>
</div>`).join('')}
<div class="totals">
  <div class="row"><span>Subtotal:</span><span>&#8377;${completedOrder.subtotal.toFixed(2)}</span></div>
  ${completedOrder.discount > 0 ? `<div class="row"><span>Discount:</span><span>-&#8377;${completedOrder.discount.toFixed(2)}</span></div>` : ''}
  <div class="row"><span>Tax (10%):</span><span>&#8377;${completedOrder.tax.toFixed(2)}</span></div>
  <div class="row grand"><span>TOTAL:</span><span>&#8377;${completedOrder.total.toFixed(2)}</span></div>
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#f8fafc' }}>

      {/* LEFT: Category Sidebar */}
      <CategorySidebar
        filteredCategories={filteredCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        catSearch={catSearch}
        onCatSearchChange={setCatSearch}
        categoryItemCounts={categoryItemCounts}
        venueName={currentVenue?.name || 'Unknown Venue'}
        venueIsOpen={currentVenue?.isOpen ?? false}
      />

      {/* CENTER: Items pane */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>

        {/* Toolbar */}
        <POSToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadMenuData}
          totalItems={totalItems}
          total={total}
          filteredCount={filteredItems.length}
          totalCount={menuItems.length}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          formatINR={formatINR}
        />

        {/* Items grid/list — independent scroll */}
        <ItemsGrid
          loading={loading}
          dataError={dataError}
          filteredItems={filteredItems}
          cart={cart}
          viewMode={viewMode}
          onAdd={addToCart}
          onUpdateQty={updateQuantity}
          onRetry={loadMenuData}
          formatINR={formatINR}
        />
      </Box>

      {/* RIGHT: Cart Panel — desktop only */}
      <Box sx={{
        width: 320,
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
      }}>
        <CartPanel
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          totalItems={totalItems}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          onCheckout={() => setPaymentDialogOpen(true)}
          formatINR={formatINR}
        />
      </Box>

      {/* Mobile FAB */}
      {!isLg && cart.length > 0 && !cartOpen && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
          <Badge badgeContent={totalItems} color="error" max={99}>
            <Button
              variant="contained"
              onClick={() => setCartOpen(true)}
              startIcon={<ShoppingCart />}
              sx={{
                bgcolor: '#0f172a', color: '#fff', textTransform: 'none', fontWeight: 700,
                px: 2.5, py: 1.25, borderRadius: 3,
                boxShadow: '0 8px 24px rgba(15,23,42,0.3)',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              {formatINR(total)}
            </Button>
          </Badge>
        </Box>
      )}

      {/* Mobile Cart Drawer */}
      <Drawer
        anchor="bottom"
        open={cartOpen && !isLg}
        onClose={() => setCartOpen(false)}
        PaperProps={{ sx: { height: '85vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, bgcolor: '#f8fafc', overflow: 'hidden' } }}
      >
        <CartPanel
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          totalItems={totalItems}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          onCheckout={() => { setCartOpen(false); setPaymentDialogOpen(true); }}
          inDrawer
          onClose={() => setCartOpen(false)}
          formatINR={formatINR}
        />
      </Drawer>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={paymentDialogOpen}
        onClose={() => { setPaymentDialogOpen(false); setOrderError(''); }}
        cart={cart}
        subtotal={subtotal}
        discount={discount}
        tax={tax}
        total={total}
        totalItems={totalItems}
        tables={tables}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
        orderNotes={orderNotes}
        setOrderNotes={setOrderNotes}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        processingOrder={processingOrder}
        orderError={orderError}
        onPlaceOrder={handlePlaceOrder}
        formatINR={formatINR}
      />

      {/* Order Confirmation */}
      <OrderConfirmation
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        completedOrder={completedOrder}
        onPrintReceipt={handlePrintReceipt}
        formatINR={formatINR}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 1.5, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default POS;
