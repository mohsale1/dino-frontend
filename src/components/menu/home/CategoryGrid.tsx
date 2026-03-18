import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  alpha,
} from '@mui/material';
import { GridView } from '@mui/icons-material';
import { CategoryType } from '../../../hooks/useMenuData';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 3.5 } }}>
      {/* Section Header */}
      <Box 
        sx={{ 
          mb: 3,
          pb: 2,
          borderBottom: `2px solid ${alpha('#1E3A5F', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: alpha('#1E3A5F', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GridView sx={{ fontSize: 24, color: '#1E3A5F' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#1E3A5F',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              letterSpacing: '-0.5px',
            }}
          >
            Browse Categories
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            ml: { xs: 0, sm: 7 },
            fontWeight: 500,
          }}
        >
          Explore our delicious menu organized by category
        </Typography>
      </Box>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category.id}>
              <CategoryCard category={category} onClick={onCategoryClick} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            No Categories Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Categories will appear here once they are added
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default CategoryGrid;