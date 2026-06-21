import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import {
  Category as CategoryIcon,
} from '@mui/icons-material';
import { Category } from '../types';

export interface CategoryCardProps {
  category: Category;
  itemCount?: number;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  itemCount = 0,
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        border: '1px solid #e0e0e0',
        boxShadow: 'none',
        '&:hover': onClick ? {
          borderColor: '#bdbdbd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            {category.imageUrl ? (
              <Box
                component="img"
                src={category.imageUrl}
                alt={category.name}
                sx={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '4px' }}
              />
            ) : (
              <CategoryIcon fontSize="small" />
            )}
          </Box>
          
          {category.isActive ? (
            <Chip label="Active" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          ) : (
            <Chip label="Inactive" size="small" color="default" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Stack>

        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1rem' }}>
          {category.name}
        </Typography>

        {category.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 40,
            }}
          >
            {category.description}
          </Typography>
        )}

        <Box sx={{ pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
