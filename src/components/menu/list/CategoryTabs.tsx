import React from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import { CategoryType } from '../../../hooks/useMenuData';

interface CategoryTabsProps {
  categories: CategoryType[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E0E0E0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Tabs
          value={activeCategory}
          onChange={(e, newValue) => onCategoryChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: { xs: 42, sm: 48 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: '#6C757D',
              minHeight: { xs: 42, sm: 48 },
              py: 1,
              px: { xs: 1.5, sm: 2 },
              '&.Mui-selected': {
                color: '#1E3A5F',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1E3A5F',
              height: 2,
            },
          }}
        >
          <Tab label="All" value="all" />
          {categories.map((category) => (
            <Tab
              key={category.id}
              label={`${category.name} (${category.itemCount || 0})`}
              value={category.id}
            />
          ))}
        </Tabs>
      </Container>
    </Box>
  );
};

export default CategoryTabs;