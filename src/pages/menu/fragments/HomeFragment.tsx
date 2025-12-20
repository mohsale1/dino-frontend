import React, { useState } from 'react';
import { Box } from '@mui/material';
import { CategoryType, MenuItemType } from '../../../hooks/useMenuData';
import { Venue } from '../../../types/api';
import {
  CallToAction,
} from '../../../components/menu';
import CompactHero from '../../../components/menu/home/CompactHero';
import CategoryStrip from '../../../components/menu/home/CategoryStrip';
import PopularDishes from '../../../components/menu/home/PopularDishes';
import PromotionalBanner from '../../../components/menu/home/PromotionalBanner';
import ProgressiveSection from '../../../components/menu/home/ProgressiveSection';
import DecisionCard from '../../../components/menu/home/DecisionCard';

interface HomeFragmentProps {
  restaurant: Venue | null;
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
  menuItems?: MenuItemType[];
  onAddToCart?: (item: MenuItemType) => void;
  onRemoveFromCart?: (item: MenuItemType) => void;
  getItemQuantityInCart?: (itemId: string) => number;
  getMenuItemImage?: (item: MenuItemType) => string;
}

const HomeFragment: React.FC<HomeFragmentProps> = ({
  restaurant,
  categories,
  onCategoryClick,
  menuItems = [],
  onAddToCart,
  onRemoveFromCart,
  getItemQuantityInCart,
  getMenuItemImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Filter items based on search and veg filter
  const getFilteredItems = () => {
    return menuItems.filter(item => {
      const matchesVegFilter = 
        vegFilter === 'all' || 
        (vegFilter === 'veg' && item.isVeg) || 
        (vegFilter === 'non-veg' && !item.isVeg);
      
      const matchesSearch = 
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesVegFilter && matchesSearch;
    });
  };

  // Get popular/most ordered dishes (top 8 for carousel)
  const getPopularDishes = () => {
    return getFilteredItems()
      .sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 8);
  };

  // Get new arrivals (items added recently - mock logic)
  const getNewArrivals = () => {
    return getFilteredItems()
      .slice(0, 6);
  };

  // Get trending items (high rating items)
  const getTrendingItems = () => {
    return getFilteredItems()
      .filter(item => item.rating && item.rating >= 4.0)
      .slice(0, 6);
  };

  // Get chef's specials (premium items - mock logic)
  const getChefsSpecials = () => {
    return getFilteredItems()
      .filter(item => item.originalPrice) // Items with discount
      .slice(0, 6);
  };

  // Get all items for vertical feed (excluding popular ones)
  const getVerticalFeedItems = () => {
    const popularIds = new Set(getPopularDishes().map(item => item.id));
    return getFilteredItems()
      .filter(item => !popularIds.has(item.id))
      .slice(0, 10); // Show first 10 items
  };

  const popularDishes = getPopularDishes();
  const newArrivals = getNewArrivals();
  const trendingItems = getTrendingItems();
  const chefsSpecials = getChefsSpecials();
  const verticalFeedItems = getVerticalFeedItems();

  return (
    <Box 
      sx={{ 
        pb: { xs: 8, sm: 9 },
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Top Context Area - Brand & Location */}
      <CompactHero 
        restaurant={restaurant}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vegFilter={vegFilter}
        onVegFilterChange={setVegFilter}
      />

      {/* 2. Horizontal Discovery - Category Shortcuts */}
      <CategoryStrip 
        categories={categories}
        onCategoryClick={onCategoryClick}
      />

      {/* 3. Promotional Banners - Attention-grabbing, Skippable */}
      {showPromoBanner && (
        <PromotionalBanner onDismiss={() => setShowPromoBanner(false)} />
      )}

      {/* 4. Personalized Recommendations - Horizontal Carousel */}
      <PopularDishes 
        dishes={popularDishes}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        getItemQuantityInCart={getItemQuantityInCart}
        getMenuItemImage={getMenuItemImage}
      />

      {/* 5. Vertical Feed of Decision Cards - Core Browsing */}
      {verticalFeedItems.length > 0 && (
        <Box sx={{ py: { xs: 3, sm: 4 }, backgroundColor: 'white' }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, maxWidth: 'lg', mx: 'auto' }}>
            <Box sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  fontSize: { xs: '1.15rem', sm: '1.4rem' },
                  fontWeight: 800,
                  color: '#1E3A5F',
                  letterSpacing: '-0.5px',
                  mb: 0.5,
                }}
              >
                Browse Our Menu
              </Box>
              <Box
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  color: '#6C757D',
                  fontWeight: 500,
                }}
              >
                Explore our full selection of delicious dishes
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {verticalFeedItems.map((item) => (
                <DecisionCard
                  key={item.id}
                  item={item}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  getItemQuantityInCart={getItemQuantityInCart}
                  getMenuItemImage={getMenuItemImage}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* 6. Progressive Sections - Additional Discovery */}
      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <ProgressiveSection
          title="New Arrivals"
          subtitle="Fresh additions to our menu"
          items={newArrivals}
          icon="new"
          variant="carousel"
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          getItemQuantityInCart={getItemQuantityInCart}
          getMenuItemImage={getMenuItemImage}
        />
      )}

      {/* Trending Now Section */}
      {trendingItems.length > 0 && (
        <ProgressiveSection
          title="Trending Now"
          subtitle="What everyone's ordering"
          items={trendingItems}
          icon="trending"
          variant="carousel"
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          getItemQuantityInCart={getItemQuantityInCart}
          getMenuItemImage={getMenuItemImage}
        />
      )}

      {/* Chef's Specials Section */}
      {chefsSpecials.length > 0 && (
        <ProgressiveSection
          title="Chef's Specials"
          subtitle="Handpicked recommendations"
          items={chefsSpecials}
          icon="chef"
          variant="carousel"
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          getItemQuantityInCart={getItemQuantityInCart}
          getMenuItemImage={getMenuItemImage}
        />
      )}

      {/* 7. Call to Action - View Full Menu */}
      <CallToAction onViewMenu={() => onCategoryClick(categories[0]?.id || '')} />
    </Box>
  );
};

export default HomeFragment;
