import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import {
  LocalPizza,
  Restaurant,
  Cake,
  Fastfood,
  LocalDining,
} from '@mui/icons-material';
import { MenuTemplateConfig } from '../../config/menuTemplates';

interface TemplateCategoryFilterProps {
  template: MenuTemplateConfig;
  categories?: string[];
  selectedCategory?: string;
}

const TemplateCategoryFilter: React.FC<TemplateCategoryFilterProps> = ({
  template,
  categories = ['All', 'Pizza', 'Main Course', 'Salads', 'Desserts'],
  selectedCategory = 'All',
}) => {

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactElement> = {
    All: <Fastfood sx={{ fontSize: 14 }} />,
    Pizza: <LocalPizza sx={{ fontSize: 14 }} />,
    'Main Course': <Restaurant sx={{ fontSize: 14 }} />,
    Salads: <LocalDining sx={{ fontSize: 14 }} />,
    Desserts: <Cake sx={{ fontSize: 14 }} />,
  };

  // Category images (placeholder URLs for demo)
  const categoryImages: Record<string, string> = {
    All: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop',
    Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
    'Main Course': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop',
    Salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop',
    Desserts: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100&h=100&fit=crop',
  };

  // Classic: Standard chips with icons
  if (template.id === 'classic') {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: `1px solid ${alpha(template.colors.primary, 0.1)}`,
          px: 2,
          py: 0.75,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <Chip
              key={category}
              icon={categoryIcons[category]}
              label={category}
              size="small"
              sx={{
                backgroundColor: isSelected
                  ? alpha(template.colors.primary, 0.1)
                  : 'transparent',
                border: `1px solid ${
                  isSelected ? template.colors.primary : alpha(template.colors.primary, 0.2)
                }`,
                color: isSelected ? template.colors.primary : template.colors.textSecondary,
                fontWeight: isSelected ? 600 : 400,
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-icon': {
                  color: isSelected ? template.colors.primary : template.colors.textSecondary,
                },
              }}
            />
          );
        })}
      </Box>
    );
  }

  // Modern: Icon-only filters (minimal text)
  if (template.id === 'modern') {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: `1px solid ${alpha(template.colors.primary, 0.1)}`,
          px: 2,
          py: 0.75,
          display: 'flex',
          gap: 1.5,
          justifyContent: 'center',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <Box
              key={category}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25,
                minWidth: 48,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: isSelected
                    ? template.colors.primary
                    : alpha(template.colors.primary, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#fff' : template.colors.textSecondary,
                  transition: 'all 0.2s',
                }}
              >
                {categoryIcons[category]}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? template.colors.primary : template.colors.textSecondary,
                }}
              >
                {category.length > 8 ? category.substring(0, 7) + '...' : category}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Minimal: Simple text-only filters (no icons, no images)
  if (template.id === 'minimal') {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: `1px solid ${alpha(template.colors.primary, 0.1)}`,
          px: 2,
          py: 0.75,
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <Box
              key={category}
              sx={{
                pb: 0.5,
                borderBottom: isSelected ? `2px solid ${template.colors.primary}` : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? template.colors.primary : template.colors.textSecondary,
                  fontFamily: template.typography.bodyFont,
                }}
              >
                {category}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Elegant: Chips with category images + text
  if (template.id === 'elegant') {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: `1px solid ${alpha(template.colors.primary, 0.1)}`,
          px: 2,
          py: 1,
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <Box
              key={category}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: 3,
                backgroundColor: isSelected
                  ? alpha(template.colors.primary, 0.1)
                  : alpha(template.colors.primary, 0.03),
                border: `1px solid ${
                  isSelected ? template.colors.primary : alpha(template.colors.primary, 0.15)
                }`,
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? `0 2px 8px ${alpha(template.colors.primary, 0.2)}` : 'none',
              }}
            >
              {/* Category Image */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: alpha(template.colors.primary, 0.1),
                }}
              >
                <img
                  src={categoryImages[category]}
                  alt={category}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? template.colors.primary : template.colors.textSecondary,
                  fontFamily: template.typography.bodyFont,
                }}
              >
                {category}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Fallback (shouldn't happen)
  return null;
};

export default TemplateCategoryFilter;