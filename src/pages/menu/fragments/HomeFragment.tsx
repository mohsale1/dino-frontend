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

interface HomeFragmentProps {
  restaurant: Venue | null;
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
  menuItems?: MenuItemType[];
  onAddToCart?: (item: MenuItemType) => void;
  getItemQuantityInCart?: (itemId: string) => number;
  getMenuItemImage?: (item: MenuItemType) => string;
}

const HomeFragment: React.FC<HomeFragmentProps> = ({
  restaurant,
  categories,
  onCategoryClick,
  menuItems = [],
  onAddToCart,
  getItemQuantityInCart,
  getMenuItemImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Get popular/most ordered dishes (top 6)
  const getPopularDishes = () => {
    return menuItems
      .filter(item => {
        const matchesVegFilter = 
          vegFilter === 'all' || 
          (vegFilter === 'veg' && item.isVeg) || 
          (vegFilter === 'non-veg' && !item.isVeg);
        
        const matchesSearch = 
          searchQuery === '' ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesVegFilter && matchesSearch;
      })
      .sort((a, b) => {
        // Sort by rating or popularity (assuming higher rating = more popular)
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 6);
  };

  const popularDishes = getPopularDishes();

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
      {/* Compact Hero Section (30% height) with Search & Filters */}
      <CompactHero 
        restaurant={restaurant}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vegFilter={vegFilter}
        onVegFilterChange={setVegFilter}
      />

      {/* Horizontal Category Strip */}
      <CategoryStrip 
        categories={categories}
        onCategoryClick={onCategoryClick}
      />

      {/* Popular/Most Ordered Dishes */}
      <PopularDishes 
        dishes={popularDishes}
        onAddToCart={onAddToCart}
        getItemQuantityInCart={getItemQuantityInCart}
        getMenuItemImage={getMenuItemImage}
      />

      {/* Call to Action */}
      <CallToAction onViewMenu={() => onCategoryClick(categories[0]?.id || '')} />
    </Box>
  );
};

export default HomeFragment;