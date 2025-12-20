import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  useMediaQuery,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '@mui/material/styles';
import { useVenueTheme } from '../../contexts/VenueThemeContext';

import CustomerNavbar from '../../components/CustomerNavbar';
import { VenueNotAcceptingOrdersPage, GenericErrorPage } from '../../components/errors';
import { SmartLoading } from '../../components/ui/LoadingStates';
import { useMenuData as useMenuData, type MenuItemType } from '../../hooks/useMenuData';

// Fragment Components
import HomeFragment from './fragments/HomeFragment';
import MenuFragment from './fragments/MenuFragment';
import OrderFragment from './fragments/OrderFragment';
import FloatingCartCard from '../../components/menu/FloatingCartCard';
import FragmentNavigation, { FragmentType } from '../../components/ui/FragmentNavigation';
import { DesktopRestrictionOverlay } from '../../components/menu';

const MenuPage: React.FC = () => {
  const { venueId, tableId } = useParams<{ venueId: string; tableId: string }>();
  const theme = useTheme();
  const { theme: venueTheme, setTheme: setVenueTheme } = useVenueTheme();
  const { addItem, items: cartItems, getTotalItems, getTotalAmount } = useCart();

  // Use the new menu data hook
  const {
    menuItems,
    categories,
    restaurant,
    tableName,
    loading,
    error,
    venueNotAcceptingOrders,
    refetch,
  } = useMenuData({
    venueId,
    tableId,
    enableAutoRefresh: false,
    refreshInterval: 60000,
  });

  // UI state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('');
  
  // Fragment state
  const [activeFragment, setActiveFragment] = useState<FragmentType>('home');

  // Refs
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // When restaurant data is available, set the theme from the backend.
  useEffect(() => {
    if (restaurant?.theme) {
      setVenueTheme(restaurant.theme);
    }
  }, [restaurant, setVenueTheme]);

  // Desktop restriction check - more lenient for tablets
  const isDesktopRestricted = useMediaQuery(theme.breakpoints.up('xl'));

  // Group menu items by category
  const groupedMenuItems = categories
    .map(category => ({
      ...category,
      items: menuItems.filter(item => item.category === category.id && item.isAvailable)
    }))
    .filter(group => group.items.length > 0);

  // Set initial active category
  useEffect(() => {
    if (groupedMenuItems.length > 0 && !activeCategory) {
      setActiveCategory(groupedMenuItems[0].id);
    }
  }, [groupedMenuItems, activeCategory]);

  // Cart operations
  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cartItems.find(item => item.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: MenuItemType) => {
    // Convert MenuItemType to the cart's expected MenuItem format
    const cartItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isVeg: item.isVeg || false,
      image: item.image || '',
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
      venueId: venueId || 'venue',
      ingredients: [],
      allergens: [],
      order: 0,
    };
    addItem(cartItem, 1);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveFragment('menu');
    setTimeout(() => {
      const element = categoryRefs.current[categoryId];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        pt: { xs: '56px', sm: '64px' },
      }}>
        <CustomerNavbar 
          restaurantName="Loading..."
          tableId={tableId}
          showBackButton={false}
          showCart={false}
        />
        
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <SmartLoading 
            type="menu" 
            message="Loading delicious menu items for you..."
          />
        </Container>
      </Box>
    );
  }

  // Venue not accepting orders state
  if (venueNotAcceptingOrders.show) {
    return (
      <VenueNotAcceptingOrdersPage
        venueName={venueNotAcceptingOrders.venueName}
        venueStatus={venueNotAcceptingOrders.venueStatus}
        message={venueNotAcceptingOrders.message}
        onRetry={() => {
          refetch();
        }}
        showRetry={true}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        pt: { xs: '56px', sm: '64px' },
      }}>
        <CustomerNavbar 
          restaurantName="Menu Error"
          tableId={tableId}
          showBackButton={false}
          showCart={false}
        />
        
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}>
            <GenericErrorPage
              type="no-venue"
              message={error || 'Unable to load menu. Please try again.'}
              onRetry={refetch}
              showRetry={true}
              showGoHome={true}
            />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      ref={menuContainerRef}
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        pb: { xs: 9, sm: 10 },
        position: 'relative',
        width: '100%',
        overflowX: 'hidden',
        maxWidth: '100vw',
      }}>
      {/* Fragment Content */}
      {activeFragment === 'home' && (
        <HomeFragment
          restaurant={restaurant}
          categories={categories}
          onCategoryClick={handleCategoryClick}
          menuItems={menuItems}
          onAddToCart={handleAddToCart}
          getItemQuantityInCart={getItemQuantityInCart}
          getMenuItemImage={(item) => item.image || ''}
        />
      )}

      {activeFragment === 'menu' && (
        <MenuFragment
          groupedMenuItems={groupedMenuItems}
          allCategories={categories}
          categoryRefs={categoryRefs}
          onAddToCart={handleAddToCart}
          getItemQuantityInCart={getItemQuantityInCart}
          getMenuItemImage={(item) => item.image || ''}
        />
      )}

      {activeFragment === 'orders' && (
        <OrderFragment venueId={venueId} tableId={tableId} />
      )}

      {/* Floating Cart Card */}
      <FloatingCartCard
        totalItems={getTotalItems()}
        totalAmount={getTotalAmount()}
        venueId={venueId}
        tableId={tableId}
        show={getTotalItems() > 0}
      />

      {/* Fragment Navigation */}
      <FragmentNavigation
        activeFragment={activeFragment}
        onFragmentChange={setActiveFragment}
        orderCount={0}
      />

      {/* Desktop Restriction Overlay */}
      {isDesktopRestricted && <DesktopRestrictionOverlay />}
    </Box>
  );
};

export default MenuPage;