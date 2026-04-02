/**
 * CatalogTabs Component - Blue System Palette
 *
 * Tabs for items and categories
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
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
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#1976d2',
  },
};

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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
    const matchesAvailability = filterAvailability === 'all' ||
                               (filterAvailability === 'available' && item.isAvailable) ||
                               (filterAvailability === 'unavailable' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
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
                color: '#1976d2',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
            },
          }}
        >
          <Tab label="Items" value="items" />
          <Tab label="Categories" value="categories" />
        </Tabs>
      </Box>

      {/* Filter bar */}
      <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
          <TextField
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: { xs: '100%', sm: 250 },
              ...textFieldSx,
            }}
          />
          {activeTab === 'items' && (
            <>
              <TextField
                select
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{
                  minWidth: { xs: '100%', sm: 150 },
                  ...textFieldSx,
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Availability"
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                sx={{
                  minWidth: { xs: '100%', sm: 150 },
                  ...textFieldSx,
                }}
              >
                <MenuItem value="all">All Items</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </TextField>
            </>
          )}
        </Box>
      </Box>

      {/* Content area */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
                      bgcolor: 'rgba(25,118,210,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto',
                      mb: 2,
                    }}
                  >
                    <InventoryIcon sx={{ color: '#1976d2', fontSize: 28 }} />
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
                      bgcolor: 'rgba(25,118,210,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto',
                      mb: 2,
                    }}
                  >
                    <CategoryIcon sx={{ color: '#1976d2', fontSize: 28 }} />
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
    </Paper>
  );
};

export default CatalogTabs;