/**
 * CatalogTabs Component - System Dark Palette
 *
 * Tabs for items and categories
 */

import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import CatalogItemCard from './CatalogItemCard';
import CategoryCard from './CategoryCard';
import type { CatalogItem, Category } from '../../../features/catalog/types';

interface CatalogTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  items: CatalogItem[];
  categories: Category[];
  onEditItem: (item: CatalogItem) => void;
  onDeleteItem: (item: CatalogItem) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onToggleAvailability: (itemId: string) => void;
  onImageUpload: (itemId: string, file: File) => void;
  searchQuery?: string;
  filterCategory?: string;
  filterAvailability?: string;
}

const CatalogTabs: React.FC<CatalogTabsProps> = ({
  activeTab,
  onTabChange,
  items,
  categories,
  onEditItem,
  onDeleteItem,
  onEditCategory,
  onDeleteCategory,
  onToggleAvailability,
  onImageUpload,
  searchQuery = '',
  filterCategory = 'all',
  filterAvailability = 'all',
}) => {
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
    const matchesAvailability =
      filterAvailability === 'all' ||
      (filterAvailability === 'available' && item.isAvailable) ||
      (filterAvailability === 'unavailable' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const filteredCategories = categories.filter(
    category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      {/* Tab bar */}
      <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            px: { xs: 2, sm: 3 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#64748b',
              px: { xs: 2, sm: 3 },
              '&.Mui-selected': {
                color: '#0f172a',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#0f172a',
              height: 3,
            },
          }}
        >
          <Tab
            icon={<InventoryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Items"
            value="items"
          />
          <Tab
            icon={<CategoryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Categories"
            value="categories"
          />
        </Tabs>
      </Box>

      {/* Content area */}
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f1f5f9' }}>
        {activeTab === 'items' && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
            {filteredItems.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(15,23,42,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto',
                      mb: 2,
                    }}
                  >
                    <InventoryIcon sx={{ color: '#0f172a', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mb: 0.5 }}>
                    No items found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} sx={{ display: 'flex' }}>
                  <CatalogItemCard
                    item={item}
                    categoryName={categories.find(c => c.id === item.categoryId)?.name}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    onToggleAvailability={onToggleAvailability}
                    onImageUpload={onImageUpload}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {activeTab === 'categories' && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
            {filteredCategories.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(15,23,42,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto',
                      mb: 2,
                    }}
                  >
                    <CategoryIcon sx={{ color: '#0f172a', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mb: 0.5 }}>
                    No categories found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filteredCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={category.id} sx={{ display: 'flex' }}>
                  <CategoryCard
                    category={category}
                    itemCount={items.filter(i => i.categoryId === category.id).length}
                    onEdit={onEditCategory}
                    onDelete={onDeleteCategory}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default CatalogTabs;