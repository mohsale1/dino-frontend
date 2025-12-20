import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { CategoryType } from '../../../hooks/useMenuData';

interface CategoryCardProps {
  category: CategoryType;
  onClick: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <Card
      onClick={() => onClick(category.id)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        minHeight: { xs: 100, sm: 110 },
        backgroundColor: 'white',
        border: '1px solid #E0E0E0',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#1E3A5F',
          boxShadow: '0 2px 8px rgba(30, 58, 95, 0.12)',
          transform: 'translateY(-2px)',
          '& .category-name': {
            color: '#1E3A5F',
          },
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Category Icon */}
        <Box
          sx={{
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            mx: 'auto',
            mb: 1,
            backgroundColor: '#F0F4F8',
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #E0E0E0',
            transition: 'all 0.2s ease',
          }}
        >
          <Typography variant="h5" sx={{ color: '#1E3A5F', fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {category.name.charAt(0)}
          </Typography>
        </Box>

        {/* Category Name */}
        <Typography
          variant="h6"
          className="category-name"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            mb: 0.25,
            color: '#2C3E50',
            transition: 'color 0.2s ease',
          }}
        >
          {category.name}
        </Typography>

        {/* Item Count */}
        <Typography
          variant="caption"
          sx={{
            color: '#6C757D',
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
          }}
        >
          {category.itemCount || 0} items
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;