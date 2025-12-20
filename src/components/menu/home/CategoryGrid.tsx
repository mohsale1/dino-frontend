import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import { CategoryType } from '../../../hooks/useMenuData';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, mt: 2.5 }}>
      {/* Section Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#1E3A5F',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            mb: 0.5,
          }}
        >
          Browse Categories
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
        >
          Explore our menu by category
        </Typography>
      </Box>

      {/* Categories Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {categories.map((category) => (
          <Grid item xs={6} sm={4} md={3} key={category.id}>
            <CategoryCard category={category} onClick={onCategoryClick} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoryGrid;