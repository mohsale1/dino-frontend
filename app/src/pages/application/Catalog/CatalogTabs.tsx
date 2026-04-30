import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Tabs, Tab, Chip, Skeleton,
  Paper, InputBase, IconButton, FormControl, Select, MenuItem, Button,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterAltOutlined,
} from '@mui/icons-material';
import CatalogItemCard from './CatalogItemCard';
import CategoryCard from './CategoryCard';
import type { CatalogItem, Category } from '../../../features/catalog/types';

interface CatalogTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  items: CatalogItem[];
  categories: Category[];
  searchQuery?: string;
  loading?: boolean;
  onEditItem: (item: CatalogItem) => void;
  onDeleteItem: (item: CatalogItem) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onToggleAvailability: (itemId: string) => void;
  onImageUpload: (itemId: string, file: File) => void;
}

const GRID_SX = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(4, 1fr)',
  },
  gap: 2,
  px: { xs: 1.5, sm: 2 },
};

const ItemSkeleton: React.FC = () => (
  <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
    <Skeleton variant="rectangular" height={160} sx={{ bgcolor: '#f8fafc' }} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={14} />
      <Skeleton variant="text" width="60%" height={14} sx={{ mb: 1.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={60} height={24} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  </Box>
);

const CatSkeleton: React.FC = () => (
  <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
    <Skeleton variant="rectangular" height={80} sx={{ bgcolor: '#f8fafc' }} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="70%" height={14} />
    </Box>
  </Box>
);

const CatalogTabs: React.FC<CatalogTabsProps> = ({
  activeTab, onTabChange, items, categories,
  searchQuery: externalSearch = '', loading = false,
  onEditItem, onDeleteItem, onEditCategory, onDeleteCategory,
  onToggleAvailability, onImageUpload,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');

  // Use external search (debounced from parent) merged with local search
  const q = (externalSearch || localSearch).toLowerCase();
  const hasFilters = categoryFilter !== 'all' || availFilter !== 'all' || !!localSearch;

  const filteredItems = useMemo(() => items.filter(item => {
    const matchSearch = !q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchAvail = availFilter === 'all'
      ? true
      : availFilter === 'available' ? item.isAvailable : !item.isAvailable;
    return matchSearch && matchCat && matchAvail;
  }), [items, q, categoryFilter, availFilter]);

  const filteredCategories = useMemo(() => categories.filter(cat =>
    !q || cat.name?.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q)
  ), [categories, q]);

  const getCategoryItemCount = (catId: string) => items.filter(i => i.categoryId === catId).length;

  const handleTabChange = (_: React.SyntheticEvent, v: string) => {
    onTabChange(v);
    setCategoryFilter('all');
    setAvailFilter('all');
    setLocalSearch('');
  };

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setAvailFilter('all');
    setLocalSearch('');
  };

  return (
    <Box>
      {/* ── Row 1: Filter toolbar (items tab only) ── */}
      {activeTab === 'items' && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: 'none',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #f8fafc',
            bgcolor: '#fff',
          }}
        >
          <Box
            sx={{
              px: 2.5,
              pt: 2,
              pb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            {/* Search */}
            <Box
              sx={{
                flex: '1 1 200px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f8fafc',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
              }}
            >
              <SearchIcon sx={{ fontSize: 17, color: '#999999', flexShrink: 0 }} />
              <InputBase
                placeholder="Search items..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem', color: '#00A6CA' }}
              />
              {localSearch && (
                <IconButton size="small" onClick={() => setLocalSearch('')} sx={{ p: 0.25, color: '#999999' }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Category dropdown */}
            <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
              <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ color: '#999999' }}>All Categories</Typography>
                </MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Typography variant="body2">{cat.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Availability dropdown */}
            <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
              <Select
                value={availFilter}
                onChange={e => setAvailFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ color: '#999999' }}>All Status</Typography>
                </MenuItem>
                <MenuItem value="available">
                  <Typography variant="body2">Available</Typography>
                </MenuItem>
                <MenuItem value="unavailable">
                  <Typography variant="body2">Unavailable</Typography>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Clear filters */}
            {hasFilters && (
              <Button
                size="small"
                startIcon={<FilterAltOutlined sx={{ fontSize: 14 }} />}
                onClick={handleClearFilters}
                sx={{
                  textTransform: 'none', color: '#666666', fontWeight: 600,
                  fontSize: '0.8125rem', borderRadius: 2, px: 1.5,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
                }}
              >
                Clear
              </Button>
            )}

            {/* Result count */}
            <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="caption" sx={{ color: '#999999', fontWeight: 500 }}>
                {filteredItems.length} of {items.length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* ── Row 2: Items / Categories full-width tabs ── */}
      <Box sx={{ bgcolor: '#fff', borderTop: activeTab === 'items' ? 'none' : '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.85rem',
              textTransform: 'none',
              fontWeight: 600,
              py: 0,
            },
            '& .MuiTabs-indicator': { height: 2, bgcolor: '#00A6CA' },
          }}
        >
          <Tab
            value="items"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ fontSize: 16 }} />
                Items
                <Chip
                  label={items.length}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.68rem', fontWeight: 700,
                    bgcolor: activeTab === 'items' ? '#00A6CA' : '#f8fafc',
                    color: activeTab === 'items' ? '#fff' : '#666666',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Box>
            }
          />
          <Tab
            value="categories"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ fontSize: 16 }} />
                Categories
                <Chip
                  label={categories.length}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.68rem', fontWeight: 700,
                    bgcolor: activeTab === 'categories' ? '#00A6CA' : '#f8fafc',
                    color: activeTab === 'categories' ? '#fff' : '#666666',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ pt: 2 }}>
        {activeTab === 'items' ? (
          loading ? (
            <Box sx={GRID_SX}>
              {Array.from({ length: 6 }).map((_, i) => <ItemSkeleton key={i} />)}
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <InventoryIcon sx={{ fontSize: 48, color: '#999999', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#666666', mb: 0.5 }}>No items found</Typography>
              <Typography variant="body2" sx={{ color: '#999999' }}>Try adjusting your search or filters</Typography>
            </Box>
          ) : (
            <Box sx={GRID_SX}>
              {filteredItems.map(item => (
                <CatalogItemCard
                  key={item.id}
                  item={item}
                  categoryName={categories.find(c => c.id === item.categoryId)?.name}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onToggleAvailability={onToggleAvailability}
                  onImageUpload={onImageUpload}
                />
              ))}
            </Box>
          )
        ) : (
          loading ? (
            <Box sx={GRID_SX}>
              {Array.from({ length: 4 }).map((_, i) => <CatSkeleton key={i} />)}
            </Box>
          ) : filteredCategories.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CategoryIcon sx={{ fontSize: 48, color: '#999999', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#666666', mb: 0.5 }}>No categories found</Typography>
              <Typography variant="body2" sx={{ color: '#999999' }}>Try adjusting your search</Typography>
            </Box>
          ) : (
            <Box sx={GRID_SX}>
              {filteredCategories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  itemCount={getCategoryItemCount(cat.id)}
                  onEdit={onEditCategory}
                  onDelete={onDeleteCategory}
                />
              ))}
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default CatalogTabs;