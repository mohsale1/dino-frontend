import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Home as HomeIcon,
  Restaurant as MenuIcon,
  Receipt as OrdersIcon,
} from '@mui/icons-material';
import HomeFragment from './fragments/HomeFragment';
import MenuFragment from './fragments/MenuFragment';
import OrdersFragment from './fragments/OrdersFragment';
import CustomerDetailsBottomSheet from './components/CustomerDetailsBottomSheet';
import CheckoutPage from './components/CheckoutPage';
import SwipeToCheckout from './components/SwipeToCheckout';
import { useCart } from './hooks/useCart';
import { mockMenuData } from './mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

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
      setError('Invalid URL. Please scan the QR code again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      setMenuData(mockMenuData);
    } catch (err: any) {
      console.error('Error loading menu:', err);
      setError(err.message || 'Failed to load menu. Please try again.');
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

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f8fafc"
      >
        <CircularProgress size={48} thickness={4} sx={{ color: '#0f172a' }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading menu...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!menuData) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">No menu data available</Alert>
      </Container>
    );
  }

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

  const cartTotal = cart.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 8 }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container maxWidth="md">
          <Toolbar disableGutters sx={{ py: 1.5, minHeight: 64 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                {menuData.organization.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Table {menuData.table.table_number} â€¢ {menuData.table.capacity} seats
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Content */}
      <Container maxWidth="md">
        <TabPanel value={activeTab} index={0}>
          <HomeFragment menuData={menuData} onViewMenu={() => setActiveTab(1)} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <MenuFragment
            menuData={menuData}
            cart={cart}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <OrdersFragment
            organizationId={organizationId!}
            tableId={tableId!}
            customerPhone={customerInfo?.phone}
          />
        </TabPanel>
      </Container>

      {/* Swipe to Checkout */}
      {getCartItemCount() > 0 && !showCheckout && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: 1200,
            width: '100%',
          }}
        >
          <SwipeToCheckout
            onSwipeComplete={handleCheckoutClick}
            itemCount={getCartItemCount()}
            total={cartTotal}
          />
        </Box>
      )}

      {/* Bottom Navigation */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <BottomNavigation
          value={activeTab}
          onChange={handleTabChange}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: '#64748b',
              minWidth: 'auto',
              '&.Mui-selected': {
                color: '#0f172a',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              '&.Mui-selected': {
                fontSize: '0.75rem',
                fontWeight: 600,
              },
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Menu" icon={<MenuIcon />} />
          <BottomNavigationAction label="Orders" icon={<OrdersIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Customer Details Bottom Sheet */}
      <CustomerDetailsBottomSheet
        open={showCustomerDetails}
        onClose={() => setShowCustomerDetails(false)}
        onSubmit={handleCustomerDetailsSubmit}
      />
    </Box>
  );
};

export default PublicMenu;