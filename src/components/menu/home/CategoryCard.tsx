import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  Stack,
} from '@mui/material';
import { Restaurant, ArrowForward } from '@mui/icons-material';
import { CategoryType } from '../../../hooks/useMenuData';

interface CategoryCardProps {
  category: CategoryType;
  onClick: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = category.image && !imageError;

  return (
    <Card
      onClick={() => onClick(category.id)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        minHeight: { xs: 140, sm: 160 },
        backgroundColor: 'white',
        border: '2px solid #E0E0E0',
        borderRadius: 2.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.05) 0%, transparent 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          borderColor: '#1E3A5F',
          boxShadow: '0 8px 24px rgba(30, 58, 95, 0.15)',
          transform: 'translateY(-4px)',
          '&::before': {
            opacity: 1,
          },
          '& .category-name': {
            color: '#1E3A5F',
          },
          '& .category-arrow': {
            opacity: 1,
            transform: 'translateX(4px)',
          },
          '& .category-image-overlay': {
            opacity: 0.15,
          },
        },
        '&:active': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent 
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Category Image or Letter */}
        <Box
          sx={{
            width: '100%',
            height: { xs: 70, sm: 80 },
            mb: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: hasImage ? 'transparent' : alpha('#1E3A5F', 0.08),
            border: hasImage ? 'none' : `2px solid ${alpha('#1E3A5F', 0.15)}`,
          }}
        >
          {hasImage ? (
            <>
              <img
                src={category.image}
                alt={category.name}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <Box
                className="category-image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#1E3A5F',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </>
          ) : (
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#1E3A5F', 
                fontWeight: 800, 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {category.name.charAt(0)}
            </Typography>
          )}
        </Box>

        {/* Category Info */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            {/* Category Name */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography
                variant="h6"
                className="category-name"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  color: '#2C3E50',
                  transition: 'color 0.3s ease',
                  lineHeight: 1.3,
                }}
              >
                {category.name}
              </Typography>
              <ArrowForward 
                className="category-arrow"
                sx={{ 
                  fontSize: 18, 
                  color: '#1E3A5F',
                  opacity: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            </Stack>

            {/* Description (if available) */}
            {category.description && (
              <Typography
                variant="body2"
                sx={{
                  color: '#6C757D',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  mb: 0.75,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {category.description}
              </Typography>
            )}
          </Box>

          {/* Item Count Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: alpha('#1E3A5F', 0.08),
              borderRadius: 1,
              px: 1,
              py: 0.5,
              alignSelf: 'flex-start',
            }}
          >
            <Restaurant sx={{ fontSize: 14, color: '#1E3A5F' }} />
            <Typography
              variant="caption"
              sx={{
                color: '#1E3A5F',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 700,
              }}
            >
              {category.itemCount || 0} items
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;