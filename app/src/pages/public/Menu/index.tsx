import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Chip,
  Badge,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
  Restaurant as MenuIcon,
  Receipt as OrdersIcon,
  ShoppingCart as CartIcon,
  Refresh as RefreshIcon,
  WifiOff as OfflineIcon,
} from '@mui/icons-material';

import HomeFragment from './fragments/HomeFragment';
import MenuFragment from './fragments/MenuFragment';
import OrdersFragment from './fragments/OrdersFragment';
import CustomerDetailsBottomSheet from './components/CustomerDetailsBottomSheet';
import CheckoutPage from './components/CheckoutPage';
import CartDrawer from './components/CartDrawer';
import UnavailableView from './components/UnavailableView';
import { useCart } from './hooks/useCart';
import { useOrderStorage } from './hooks/useOrderStorage';
import { publicMenuService, PublicOrder } from '../../../services/application/publicMenuService';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#0f172a',
  accent: '#f97316',
  bg: '#fafafa',
  card: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  inactive: '#94a3b8',
};

// ─── Shimmer keyframes ────────────────────────────────────────────────────────
const shimmerSx = {
  background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 1,
};

// ─── Skeleton UI ──────────────────────────────────────────────────────────────
const SkeletonUI: React.FC = () => (
  <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: C.bg, overflow: 'hidden' }}>
    <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>

    {/* Header */}
    <Box sx={{ height: 56, bgcolor: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', px: 2, gap: 1.5, flexShrink: 0 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ ...shimmerSx, height: 15, width: '50%', mb: 0.75 }} />
        <Box sx={{ ...shimmerSx, height: 10, width: '30%' }} />
      </Box>
      <Box sx={{ ...shimmerSx, height: 36, width: 36, borderRadius: '50%' }} />
    </Box>

    {/* Content */}
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pb: '60px' }}>
      <Box sx={{ ...shimmerSx, height: 180, width: '100%', borderRadius: 2.5, mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {[80, 100, 70, 90, 60].map((w, i) => (
          <Box key={i} sx={{ ...shimmerSx, height: 32, width: w, borderRadius: '10px' }} />
        ))}
      </Box>
      {[1, 2, 3, 4].map((i) => (
        <Box key={i} sx={{ bgcolor: C.card, borderRadius: 2.5, border: `1px solid ${C.border}`, p: 1.5, mb: 1.5, display: 'flex', gap: 1.5 }}>
          <Box sx={{ ...shimmerSx, height: 88, width: 88, borderRadius: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ ...shimmerSx, height: 14, width: '65%', mb: 0.75 }} />
            <Box sx={{ ...shimmerSx, height: 11, width: '90%', mb: 0.5 }} />
            <Box sx={{ ...shimmerSx, height: 11, width: '55%', mb: 1 }} />
            <Box sx={{ ...shimmerSx, height: 14, width: '28%' }} />
          </Box>
        </Box>
      ))}
    </Box>

    {/* Bottom nav */}
    <Box sx={{ height: 60, bgcolor: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ ...shimmerSx, height: 22, width: 22, borderRadius: 1 }} />
          <Box sx={{ ...shimmerSx, height: 9, width: 30 }} />
        </Box>
      ))}
    </Box>
  </Box>
);

// ─── Menu Not Found UI ────────────────────────────────────────────────────────
const MenuNotFoundUI: React.FC = () => (
  <Box
    sx={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#ffffff',
      overflow: 'hidden',
    }}
  >
    {/* Top accent bar */}
    <Box sx={{ height: 4, background: 'linear-gradient(90deg, #f97316, #fb923c, #fdba74)' }} />

    {/* Main content */}
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        textAlign: 'center',
      }}
    >
      {/* Bouncing 404 */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', mb: 4, lineHeight: 1 }}>
        {['4', '0', '4'].map((char, i) => (
          <Typography
            key={i}
            component="span"
            sx={{
              fontSize: '6rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: i === 1 ? C.accent : '#0f172a',
              display: 'inline-block',
              animation: `mnfBounce 0.65s ease-in-out ${i * 0.13}s infinite alternate`,
              '@keyframes mnfBounce': {
                '0%':   { transform: 'translateY(0px)' },
                '100%': { transform: 'translateY(-16px)' },
              },
            }}
          >
            {char}
          </Typography>
        ))}
      </Box>

      {/* QR icon illustration */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 3,
          bgcolor: '#fff7ed',
          border: '1.5px solid #fed7aa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 4px 20px rgba(249,115,22,0.12)',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* QR code pattern */}
          <rect x="2"  y="2"  width="16" height="16" rx="2" fill="none" stroke="#f97316" strokeWidth="2.5" />
          <rect x="6"  y="6"  width="8"  height="8"  rx="1" fill="#f97316" />
          <rect x="22" y="2"  width="16" height="16" rx="2" fill="none" stroke="#f97316" strokeWidth="2.5" />
          <rect x="26" y="6"  width="8"  height="8"  rx="1" fill="#f97316" />
          <rect x="2"  y="22" width="16" height="16" rx="2" fill="none" stroke="#f97316" strokeWidth="2.5" />
          <rect x="6"  y="26" width="8"  height="8"  rx="1" fill="#f97316" />
          {/* Dots bottom right */}
          <rect x="22" y="22" width="5" height="5" rx="1" fill="#f97316" />
          <rect x="29" y="22" width="5" height="5" rx="1" fill="#f97316" />
          <rect x="22" y="29" width="5" height="5" rx="1" fill="#f97316" />
          <rect x="29" y="29" width="5" height="5" rx="1" fill="#f97316" />
          {/* X mark overlay */}
          <line x1="24" y1="24" x2="36" y2="36" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="24" x2="24" y2="36" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Box>

      {/* Heading */}
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0f172a',
          mb: 1,
          letterSpacing: '-0.3px',
        }}
      >
        Menu not found
      </Typography>

      {/* Subtext */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#64748b',
          lineHeight: 1.7,
          maxWidth: 260,
          mb: 4,
        }}
      >
        This link is invalid or no longer available. Please scan the QR code on your table to try again.
      </Typography>

      {/* Divider */}
      <Box sx={{ width: 40, height: 2, borderRadius: 1, bgcolor: '#f1f5f9', mb: 4 }} />

      {/* Steps card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 300,
          bgcolor: '#fafafa',
          border: '1px solid #f1f5f9',
          borderRadius: 3,
          p: 2.5,
          textAlign: 'left',
        }}
      >
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
          What to do
        </Typography>
        {[
          'Look for the QR code on your table',
          'Open your camera and scan it',
          'The menu will load automatically',
        ].map((step, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: i < 2 ? 1.5 : 0 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: '1px',
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>{i + 1}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{step}</Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Footer */}
    <Box
      sx={{
        px: 3,
        py: 2.5,
        textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
        Still having trouble? Ask a staff member for assistance.
      </Typography>
    </Box>
  </Box>
);

// ─── Error UI ─────────────────────────────────────────────────────────────────
const ErrorUI: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: C.bg, px: 3, textAlign: 'center' }}>
    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#fee2e2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
      <OfflineIcon sx={{ fontSize: 28, color: '#ef4444' }} />
    </Box>
    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: C.primary, mb: 0.75 }}>Something went wrong</Typography>
    <Typography sx={{ fontSize: '0.85rem', color: C.textSecondary, lineHeight: 1.6, mb: 3, maxWidth: 300 }}>{message}</Typography>
    <Button
      variant="contained"
      startIcon={<RefreshIcon />}
      onClick={onRetry}
      sx={{ bgcolor: C.primary, color: '#fff', textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, py: 1.1, boxShadow: 'none', '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' } }}
    >
      Try Again
    </Button>
    <Typography sx={{ fontSize: '0.72rem', color: C.inactive, mt: 2 }}>
      If the problem persists, please ask staff for assistance.
    </Typography>
  </Box>
);

// ─── Tab indicator dot ────────────────────────────────────────────────────────
const TabDot: React.FC<{ active: boolean }> = ({ active }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: -5,
      width: 4,
      height: 4,
      borderRadius: '50%',
      bgcolor: C.primary,
      opacity: active ? 1 : 0,
      transition: 'opacity 0.2s',
    }}
  />
);

// ─── Main component ───────────────────────────────────────────────────────────
const PublicMenu: React.FC = () => {
  const { organizationId, tableId } = useParams<{ organizationId: string; tableId: string }>();

  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const [orgUnavailable, setOrgUnavailable] = useState(false);
  const [menuNotFound, setMenuNotFound] = useState(false);

  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string } | null>(() => {
    try {
      const raw = sessionStorage.getItem('dino_customer_info');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [recentOrderId, setRecentOrderId] = useState<string | undefined>(() => {
    return sessionStorage.getItem('dino_recent_order_id') || undefined;
  });

  const { cart, addToCart, updateQuantity, clearCart, getCartItemCount, getCartTotal } = useCart();
  const { storeOrder } = useOrderStorage();

  const loadMenuData = useCallback(async () => {
    if (!organizationId || !tableId) {
      setError('Invalid QR code. Please scan the QR code again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOrgUnavailable(false);
      setMenuNotFound(false);
      const data = await publicMenuService.getMenuWithValidation(organizationId, tableId);
      setMenuData(data);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.message || '';

      // Network error (no response) or not found / server error → show not-found page
      const isNetworkError = !err?.response;
      if (isNetworkError || status === 404 || (status >= 500 && status <= 599)) {
        setMenuNotFound(true);
        return;
      }

      // Org inactive / unavailable
      if (
        status === 403 ||
        detail.toLowerCase().includes('inactive') ||
        detail.toLowerCase().includes('not active') ||
        detail.toLowerCase().includes('not available') ||
        detail.toLowerCase().includes('closed')
      ) {
        setOrgUnavailable(true);
        return;
      }

      const msg =
        status === 401
          ? 'Access denied. Please scan the QR code again.'
          : detail || err?.message || 'Failed to load menu. Please check your connection and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organizationId, tableId]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  const handleCheckoutClick = () => {
    if (getCartItemCount() === 0) return;
    setShowCart(false);
    if (customerInfo) {
      setShowCheckout(true);
    } else {
      setShowCustomerDetails(true);
    }
  };

  const handleCustomerDetailsSubmit = (name: string, phone: string) => {
    const info = { name, phone };
    setCustomerInfo(info);
    try { sessionStorage.setItem('dino_customer_info', JSON.stringify(info)); } catch {}
    setShowCustomerDetails(false);
    setShowCheckout(true);
  };

  const handleOrderPlaced = (order: PublicOrder) => {
    // Store in localStorage for 24h
    storeOrder(order);
    setRecentOrderId(order.id);
    try { sessionStorage.setItem('dino_recent_order_id', order.id); } catch {}
    clearCart();
    setShowCheckout(false);
    setActiveTab(2);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return <SkeletonUI />;

  // ── Not found / server error ─────────────────────────────────────────────────
  if (menuNotFound) return <MenuNotFoundUI />;

  // ── Org unavailable ──────────────────────────────────────────────────────────
  if (orgUnavailable) {
    return <UnavailableView orgName={menuData?.venue?.name} />;
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) return <ErrorUI message={error} onRetry={loadMenuData} />;

  // ── No data ──────────────────────────────────────────────────────────────────
  if (!menuData) return <ErrorUI message="No menu data available. Please scan the QR code again." onRetry={loadMenuData} />;

  // ── Checkout (full-screen takeover) ──────────────────────────────────────────
  if (showCheckout && customerInfo) {
    return (
      <CheckoutPage
        cart={cart}
        customerInfo={customerInfo}
        organizationId={organizationId!}
        tableId={tableId!}
        menuData={menuData}
        onBack={() => setShowCheckout(false)}
        onOrderPlaced={handleOrderPlaced}
        onUpdateQuantity={updateQuantity}
      />
    );
  }

  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: C.bg, overflow: 'hidden' }}>

      {/* ── Header — hidden on Home tab ─────────────────────────────────────── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0, zIndex: 10, display: activeTab === 0 ? 'none' : 'block' }}
      >
        <Toolbar
          disableGutters
          sx={{ px: 2, minHeight: '56px !important', height: 56, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontSize: '1rem', fontWeight: 800, color: C.textPrimary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {menuData.venue.name}
            </Typography>
            <Chip
              label={`Table ${menuData.table.table_number}`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: '#fff7ed',
                color: C.accent,
                border: '1px solid #fed7aa',
                borderRadius: '6px',
                mt: 0.25,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          </Box>

          {/* Cart button */}
          <IconButton
            size="small"
            onClick={() => setShowCart(true)}
            sx={{
              bgcolor: cartItemCount > 0 ? C.accent : '#f1f5f9',
              color: cartItemCount > 0 ? '#fff' : C.inactive,
              width: 38,
              height: 38,
              border: cartItemCount > 0 ? 'none' : `1px solid ${C.border}`,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: cartItemCount > 0 ? '#ea6c0a' : '#e2e8f0' },
            }}
          >
            <Badge
              badgeContent={cartItemCount > 0 ? cartItemCount : undefined}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: C.primary,
                  color: '#fff',
                  fontSize: '0.58rem',
                  minWidth: 16,
                  height: 16,
                  top: -3,
                  right: -3,
                },
              }}
            >
              <CartIcon sx={{ fontSize: 19 }} />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ── Scrollable content ───────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          pb: cartItemCount > 0 ? '128px' : '60px',
        }}
      >
        {activeTab === 0 && (
          <HomeFragment menuData={menuData} onViewMenu={() => setActiveTab(1)} />
        )}
        {activeTab === 1 && (
          <MenuFragment
            menuData={menuData}
            cart={cart}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
          />
        )}
        {activeTab === 2 && (
          <OrdersFragment
            organizationId={organizationId!}
            tableId={tableId!}
            customerPhone={customerInfo?.phone}
            recentOrderId={recentOrderId}
          />
        )}
      </Box>

      {/* ── Cart summary bar (above bottom nav, when cart has items) ─────────── */}
      {cartItemCount > 0 && (
        <Box
          onClick={handleCheckoutClick}
          sx={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            zIndex: 1200,
            mx: 2,
            mb: 1,
            bgcolor: C.primary,
            borderRadius: 2.5,
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(15,23,42,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 28px rgba(15,23,42,0.3)' },
            '&:active': { transform: 'translateY(0)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                bgcolor: C.accent,
                borderRadius: 1,
                px: 0.75,
                py: 0.2,
                minWidth: 24,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{cartItemCount}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
              {cartItemCount === 1 ? '1 item' : `${cartItemCount} items`} in cart
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff' }}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </Typography>
            <Box sx={{ bgcolor: C.accent, borderRadius: 1.5, px: 1.25, py: 0.4 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Checkout</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 60,
          flexShrink: 0,
          bgcolor: C.card,
          borderTop: `1px solid ${C.border}`,
          zIndex: 1100,
        }}
      >
        <BottomNavigation
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          showLabels
          sx={{
            height: 60,
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: C.inactive,
              minWidth: 'auto',
              py: 0.75,
              '&.Mui-selected': { color: C.primary },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.68rem',
              fontWeight: 500,
              '&.Mui-selected': { fontSize: '0.68rem', fontWeight: 700 },
            },
          }}
        >
          {[
            { label: 'Home', icon: <HomeIcon sx={{ fontSize: 22 }} /> },
            { label: 'Menu', icon: <MenuIcon sx={{ fontSize: 22 }} /> },
            { label: 'Orders', icon: <OrdersIcon sx={{ fontSize: 22 }} /> },
          ].map((tab, idx) => (
            <BottomNavigationAction
              key={tab.label}
              label={tab.label}
              icon={
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {tab.icon}
                  <TabDot active={activeTab === idx} />
                </Box>
              }
            />
          ))}
        </BottomNavigation>
      </Box>

      {/* ── Cart Drawer ──────────────────────────────────────────────────────── */}
      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckoutClick}
      />

      {/* ── Customer Details Bottom Sheet ────────────────────────────────────── */}
      <CustomerDetailsBottomSheet
        open={showCustomerDetails}
        onClose={() => setShowCustomerDetails(false)}
        onSubmit={handleCustomerDetailsSubmit}
      />
    </Box>
  );
};

export default PublicMenu;
