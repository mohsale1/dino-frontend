import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
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
} from '@mui/icons-material';
import HomeFragment from './fragments/HomeFragment';
import MenuFragment from './fragments/MenuFragment';
import OrdersFragment from './fragments/OrdersFragment';
import CustomerDetailsBottomSheet from './components/CustomerDetailsBottomSheet';
import CheckoutPage from './components/CheckoutPage';
import SwipeToCheckout from './components/SwipeToCheckout';
import { useCart } from './hooks/useCart';
import { publicMenuService } from '../../../services/application/publicMenuService';

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1a1a1a',
  accent: '#f97316',
  bg: '#fafafa',
  cardBg: '#ffffff',
  border: '#e8e8e8',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  inactive: '#9ca3af',
};

// ─── Shimmer keyframe injected via dangerouslySetInnerHTML ────────────────────
const SHIMMER_CSS = '@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }';
const ShimmerStyle: React.FC = () => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }} />
);

const shimmerSx = {
  background: `linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 1,
};

// ─── Skeleton loading UI ───────────────────────────────────────────────────────
const SkeletonUI: React.FC = () => (
  <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: COLORS.bg, overflow: 'hidden' }}>
    {/* inject keyframes */}
    <ShimmerStyle />

    {/* Fake header */}
    <Box
      sx={{
        height: 56,
        bgcolor: COLORS.cardBg,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ ...shimmerSx, height: 16, width: '55%', mb: 0.75 }} />
        <Box sx={{ ...shimmerSx, height: 11, width: '35%' }} />
      </Box>
      <Box sx={{ ...shimmerSx, height: 32, width: 32, borderRadius: '50%' }} />
    </Box>

    {/* Fake content */}
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pb: '60px' }}>
      {/* Hero card */}
      <Box sx={{ ...shimmerSx, height: 160, width: '100%', borderRadius: 2, mb: 2 }} />

      {/* Category chips row */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {[80, 100, 70, 90].map((w, i) => (
          <Box key={i} sx={{ ...shimmerSx, height: 30, width: w, borderRadius: 4 }} />
        ))}
      </Box>

      {/* Item cards */}
      {[1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          sx={{
            bgcolor: COLORS.cardBg,
            borderRadius: 2,
            border: `1px solid ${COLORS.border}`,
            p: 1.5,
            mb: 1.5,
            display: 'flex',
            gap: 1.5,
          }}
        >
          <Box sx={{ ...shimmerSx, height: 72, width: 72, borderRadius: 1.5, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ ...shimmerSx, height: 14, width: '70%', mb: 0.75 }} />
            <Box sx={{ ...shimmerSx, height: 11, width: '90%', mb: 0.5 }} />
            <Box sx={{ ...shimmerSx, height: 11, width: '60%', mb: 1 }} />
            <Box sx={{ ...shimmerSx, height: 14, width: '30%' }} />
          </Box>
        </Box>
      ))}
    </Box>

    {/* Fake bottom nav */}
    <Box
      sx={{
        height: 60,
        bgcolor: COLORS.cardBg,
        borderTop: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexShrink: 0,
      }}
    >
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ ...shimmerSx, height: 22, width: 22, borderRadius: 1 }} />
          <Box sx={{ ...shimmerSx, height: 9, width: 32 }} />
        </Box>
      ))}
    </Box>
  </Box>
);

// ─── Main component ────────────────────────────────────────────────────────────
const PublicMenu: React.FC = () => {
  const { organizationId, tableId } = useParams<{ organizationId: string; tableId: string }>();

  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string } | null>(null);

  const { cart, addToCart, updateQuantity, clearCart, getCartItemCount } = useCart();

  useEffect(() => {
    loadMenuData();
  }, [organizationId, tableId]);

  const loadMenuData = async () => {
    if (!organizationId || !tableId) {
      setError('Invalid QR code URL. Please scan the QR code again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await publicMenuService.getMenuData(organizationId, tableId);
      setMenuData(data);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.message;
      const msg =
        status === 404
          ? 'Menu not found. Please check the QR code and try again.'
          : status === 401 || status === 403
          ? 'Please log in to your Dino account and scan the QR code again to view the menu.'
          : detail || err?.message || 'Failed to load menu. Please try again.';
      console.error('[PublicMenu] load error:', status, detail, err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCheckoutClick = () => {
    if (getCartItemCount() === 0) return;
    if (customerInfo) {
      setShowCheckout(true);
    } else {
      setShowCustomerDetails(true);
    }
  };

  const handleCustomerDetailsSubmit = (name: string, phone: string) => {
    setCustomerInfo({ name, phone });
    setShowCustomerDetails(false);
    setShowCheckout(true);
  };

  const handleOrderPlaced = () => {
    clearCart();
    setShowCheckout(false);
    setActiveTab(2);
  };

  // ── Loading state: shimmer skeleton ─────────────────────────────────────────
  if (loading) return <SkeletonUI />;

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: '100dvh', bgcolor: COLORS.bg, px: 3 }}
      >
        <Container maxWidth="sm">
          <Alert
            severity="error"
            sx={{ borderRadius: 2, mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadMenuData} sx={{ fontWeight: 600 }}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            If the problem persists, please ask restaurant staff for assistance.
          </Typography>
        </Container>
      </Box>
    );
  }

  // ── No data state ────────────────────────────────────────────────────────────
  if (!menuData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: '100dvh', bgcolor: COLORS.bg, px: 3 }}
      >
        <Container maxWidth="sm">
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            No menu data available. Please scan the QR code again.
          </Alert>
        </Container>
      </Box>
    );
  }

  // ── Checkout page (full-screen takeover) ─────────────────────────────────────
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
      />
    );
  }

  const cartItemCount = getCartItemCount();
  const cartTotal = cart.reduce((sum, item) => sum + item.total_price, 0);

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: COLORS.bg,
        overflow: 'hidden',
      }}
    >
      {/* inject shimmer keyframes (used by child fragments if needed) */}
      <ShimmerStyle />

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: COLORS.cardBg,
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            px: 2,
            minHeight: '56px !important',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* Restaurant name + table badge */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color={COLORS.textPrimary}
              noWrap
              sx={{ lineHeight: 1.2, fontSize: '1rem' }}
            >
              {menuData.organization.name}
            </Typography>
            <Chip
              label={`Table ${menuData.table.table_number}`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#fff7ed',
                color: COLORS.accent,
                border: `1px solid #fed7aa`,
                borderRadius: '6px',
                mt: 0.25,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          </Box>

          {/* Cart icon with badge */}
          {cartItemCount > 0 && (
            <IconButton
              size="small"
              onClick={handleCheckoutClick}
              sx={{
                bgcolor: COLORS.accent,
                color: '#fff',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: '#ea6c0a' },
              }}
            >
              <Badge
                badgeContent={cartItemCount}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: COLORS.primary,
                    color: '#fff',
                    fontSize: '0.6rem',
                    minWidth: 16,
                    height: 16,
                    top: -4,
                    right: -4,
                  },
                }}
              >
                <CartIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Scrollable Content Area (THE KEY FIX) ──────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          // bottom padding: bottom-nav (60px) + swipe bar when visible (~72px)
          pb: cartItemCount > 0 ? '132px' : '60px',
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
          />
        )}
      </Box>

      {/* ── Swipe to Checkout (sits above bottom nav) ──────────────────────── */}
      {cartItemCount > 0 && !showCheckout && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            zIndex: 1200,
            // allow touch-scroll to pass through the wrapper; only the slider
            // handle inside SwipeToCheckout should have touchAction: 'none'
            pointerEvents: 'none',
            '& > *': { pointerEvents: 'auto' },
          }}
        >
          <SwipeToCheckout
            onSwipeComplete={handleCheckoutClick}
            itemCount={cartItemCount}
            total={cartTotal}
          />
        </Box>
      )}

      {/* ── Bottom Navigation ───────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 60,
          flexShrink: 0,
          bgcolor: COLORS.cardBg,
          borderTop: `1px solid ${COLORS.border}`,
          zIndex: 1100,
        }}
      >
        <BottomNavigation
          value={activeTab}
          onChange={handleTabChange}
          showLabels
          sx={{
            height: 60,
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: COLORS.inactive,
              minWidth: 'auto',
              py: 0.75,
              gap: 0.25,
              '&.Mui-selected': {
                color: COLORS.primary,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              fontWeight: 500,
              '&.Mui-selected': {
                fontSize: '0.7rem',
                fontWeight: 700,
              },
            },
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={
              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <HomeIcon sx={{ fontSize: 22 }} />
                {activeTab === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: COLORS.primary,
                    }}
                  />
                )}
              </Box>
            }
          />
          <BottomNavigationAction
            label="Menu"
            icon={
              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MenuIcon sx={{ fontSize: 22 }} />
                {activeTab === 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: COLORS.primary,
                    }}
                  />
                )}
              </Box>
            }
          />
          <BottomNavigationAction
            label="Orders"
            icon={
              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <OrdersIcon sx={{ fontSize: 22 }} />
                {activeTab === 2 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: COLORS.primary,
                    }}
                  />
                )}
              </Box>
            }
          />
        </BottomNavigation>
      </Box>

      {/* ── Customer Details Bottom Sheet ───────────────────────────────────── */}
      <CustomerDetailsBottomSheet
        open={showCustomerDetails}
        onClose={() => setShowCustomerDetails(false)}
        onSubmit={handleCustomerDetailsSubmit}
      />
    </Box>
  );
};

export default PublicMenu;