import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  alpha,
} from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import { CategoryType } from '../../../hooks/useMenuData';

interface CategoryStripProps {
  categories: CategoryType[];
  onCategoryClick: (categoryId: string) => void;
}

const CategoryStrip: React.FC<CategoryStripProps> = ({ categories, onCategoryClick }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderBottom: '2px solid #E0E0E0',
        py: 2,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 6,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#F8F9FA',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#1E3A5F',
          borderRadius: 3,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          px: { xs: 2, sm: 3 },
          minWidth: 'max-content',
        }}
      >
        {categories.map((category) => {
          const hasImage = category.image && !imageErrors[category.id];

          return (
            <Box
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              sx={{
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: { xs: 80, sm: 100 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  '& .category-image': {
                    borderColor: '#1E3A5F',
                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
                  },
                  '& .category-name': {
                    color: '#1E3A5F',
                  },
                },
              }}
            >
              {/* Category Image/Icon */}
              <Box
                className="category-image"
                sx={{
                  width: { xs: 70, sm: 85 },
                  height: { xs: 70, sm: 85 },
                  borderRadius: '50%',
                  border: '3px solid #E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                  overflow: 'hidden',
                  backgroundColor: hasImage ? 'transparent' : alpha('#1E3A5F', 0.08),
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                {hasImage ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    onError={() => handleImageError(category.id)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 800,
                      color: '#1E3A5F',
                    }}
                  >
                    {category.name.charAt(0)}
                  </Typography>
                )}
              </Box>

              {/* Category Name */}
              <Typography
                className="category-name"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  fontWeight: 700,
                  color: '#2C3E50',
                  transition: 'color 0.3s ease',
                  lineHeight: 1.2,
                }}
              >
                {category.name}
              </Typography>

              {/* Item Count */}
              <Typography
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  color: '#6C757D',
                  fontWeight: 500,
                }}
              >
                {category.itemCount || 0} items
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default CategoryStrip;