import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  useTheme,
  Button,
  alpha,
  Tooltip,
  Badge,
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Category,
  Add,
} from '@mui/icons-material';

interface MenuCategoriesProps {
  categories: any[];
  menuItems: any[];
  onEditCategory: (category: any) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  selectedCategory?: string;
  onCategoryClick?: (categoryId: string) => void;
}

const MenuCategories: React.FC<MenuCategoriesProps> = ({
  categories,
  menuItems,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  selectedCategory,
  onCategoryClick
}) => {
  const theme = useTheme();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter(item => item.category === categoryId).length;
  };

  return (
    <Box sx={{ 
      py: { xs: 2, sm: 2.5 }, 
      px: { xs: 2, sm: 2.5 },
      backgroundColor: 'background.paper', 
      borderRadius: 2.5, 
      border: '1px solid', 
      borderColor: 'grey.100',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      mb: { xs: 2.5, sm: 3 }
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        {/* Left side - Categories title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Category sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="700" color="text.primary" sx={{ fontSize: '0.95rem' }}>
            Categories ({categories.length})
          </Typography>
        </Box>

        {/* Right side - Add Category Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add sx={{ fontSize: 18 }} />}
          onClick={onAddCategory}
          sx={{ 
            borderRadius: 1.5,
            px: 1.5,
            py: 0.5,
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              transform: 'translateY(-1px)',
            }
          }}
        >
          Add
        </Button>
      </Box>
      
      {/* Categories as Chips/Buttons */}
      {categories.length === 0 ? (
        // Empty state when no categories
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          textAlign: 'center'
        }}>
          <Category sx={{ 
            fontSize: 48, 
            color: 'text.disabled', 
            mb: 1.5 
          }} />
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
            No categories yet
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, maxWidth: 300 }}>
            Create categories to organize your menu items
          </Typography>
          <Button
            variant="text"
            size="small"
            startIcon={<Add />}
            onClick={onAddCategory}
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none'
            }}
          >
            Create First Category
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1.5,
          alignItems: 'center'
        }}>
          {categories.map(category => {
            const itemCount = getCategoryItemCount(category.id);
            const isHovered = hoveredCategory === category.id;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Tooltip 
                key={category.id}
                title={category.description || ''}
                placement="top"
                arrow
                enterDelay={500}
              >
                <Box
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  sx={{ position: 'relative' }}
                >
                  <Chip
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: isSelected ? 'primary.contrastText' : 'text.primary',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Badge 
                        badgeContent={itemCount} 
                        color={isSelected ? "default" : "primary"}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            height: 18,
                            minWidth: 18,
                            padding: '0 5px',
                            fontWeight: 700,
                            backgroundColor: isSelected ? alpha(theme.palette.common.white, 0.9) : undefined,
                            color: isSelected ? theme.palette.primary.main : undefined,
                          }
                        }}
                      >
                        <Box sx={{ width: 4 }} />
                      </Badge>
                    </Box>
                  }
                  onClick={() => onCategoryClick?.(category.id)}
                  variant={isSelected ? "filled" : "outlined"}
                  color={isSelected ? "primary" : "default"}
                  sx={{
                    height: 38,
                    borderRadius: 2.5,
                    cursor: onCategoryClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                    borderWidth: '1.5px',
                    backgroundColor: isSelected 
                      ? 'primary.main' 
                      : isHovered 
                        ? alpha(theme.palette.primary.main, 0.08) 
                        : 'transparent',
                    '&:hover': onCategoryClick ? {
                      borderColor: 'primary.main',
                      transform: 'translateY(-1px)',
                      boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
                    } : {},
                    '& .MuiChip-label': {
                      px: 2,
                      py: 0.75,
                    }
                  }}
                />
                
                {/* Action buttons on hover */}
                {isHovered && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      display: 'flex',
                      gap: 0.75,
                      zIndex: 10,
                    }}
                  >
                    <Tooltip title="Edit" placement="top">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(category);
                        }}
                        sx={{
                          width: 28,
                          height: 28,
                          backgroundColor: 'background.paper',
                          border: '1.5px solid',
                          borderColor: 'grey.300',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Edit sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" placement="top">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(category.id);
                        }}
                        sx={{
                          width: 28,
                          height: 28,
                          backgroundColor: 'background.paper',
                          border: '1.5px solid',
                          borderColor: 'grey.300',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            borderColor: 'error.main',
                            color: 'error.main',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default MenuCategories;
