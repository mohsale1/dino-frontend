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
        pb: { xs: 10, sm: 12 },
        width: '100%',
        backgroundColor: '#F8F9FA',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Hero Section */}
      <RestaurantHero restaurant={restaurant} />

      {/* Categories Section */}
      <CategoryGrid categories={categories} onCategoryClick={onCategoryClick} />

      {/* Call to Action */}
      <CallToAction onViewMenu={() => onCategoryClick(categories[0]?.id || '')} />
    </Box>
  );
};

export default HomeFragment;