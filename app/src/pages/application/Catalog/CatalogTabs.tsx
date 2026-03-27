/**
 * CatalogTabs Component - Clean Professional Design
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
} from '@mui/material';
import {
  Search as SearchIcon,
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
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#1a1a1a',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1a1a1a',
              height: 3,
            },
          }}
        >
          <Tab label="Items" value="items" />
          <Tab label="Categories" value="categories" />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#9ca3af',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a1a1a',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
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
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a1a1a',
                  },
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
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1a1a1a',
                  },
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

      <Box sx={{ p: 3 }}>
        {activeTab === 'items' && (
          <Grid container spacing={2}>
            {filteredItems.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                    No items found
                  </Box>
                </Box>
              </Grid>
            ) : (
              filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
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
          <Grid container spacing={2}>
            {filteredCategories.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                    No categories found
                  </Box>
                </Box>
              </Grid>
            ) : (
              filteredCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
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