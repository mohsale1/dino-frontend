import React from 'react';
import { Box } from '@mui/material';
import { CategoryType } from '../../../hooks/useMenuData';
import { Venue } from '../../../types/api';
import {
  RestaurantHero,
  CategoryGrid,
  CallToAction,
} from '../../../components/menu';

interface HomeFragmentProps {
  restaurant: Venue | null;
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
}

const HomeFragment: React.FC<HomeFragmentProps> = ({
  restaurant,
  categories,
  onCategoryClick,
}) => {
  return (
    <Box 
      sx={{ 
        pb: { xs: 8, sm: 9 },
        width: '100%',
        minHeight: '100vh',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8F9FA',
        overflow: 'auto',
      }}
    >
      {/* Hero Section */}
      <RestaurantHero restaurant={restaurant} />

      {/* Categories Section - Flex grow to fill space */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CategoryGrid categories={categories} onCategoryClick={onCategoryClick} />
      </Box>

      {/* Call to Action - Always at bottom when content is short */}
      <CallToAction onViewMenu={() => onCategoryClick(categories[0]?.id || '')} />
    </Box>
  );
};

export default HomeFragment;