import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Snackbar,
  Alert,
  Button,
  Tabs,
  Tab,
  Paper,
  Select,
  MenuItem,
  InputBase,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { CatalogItemCardAdmin } from '../../features/catalog/components';
import CategoryCard from './Catalog/CategoryCard';
import { CatalogItemFormDialog, CategoryFormDialog } from '../../features/catalog/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import { useCatalog } from '../../features/catalog/hooks';
import type { CatalogItem, Category } from '../../features/catalog/types';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary: '#00A6CA',
  primaryHv: '#005F8D',
  primaryBg: 'rgba(0,166,202,0.08)',
  primaryBorder: 'rgba(0,166,202,0.2)',
  textPri: '#1C1C1E',
  textSec: '#666666',
  textMuted: '#999999',
  border: '#e0e0e0',
  surface: '#ffffff',
  bg: '#f8fafc',
  toolbarBg: '#f7f9fa',
  success: '#008A00',
  error: '#EB0000',
  warning: '#FF871F',
};

// ── Skeleton cards ─────────────────────────────────────────────────────────────
const ItemSkeleton: React.FC = () => (
  <Box
    sx={{
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 2,
      overflow: 'hidden',
    }}
  >
    <Skeleton variant="rectangular" height={160} sx={{ bgcolor: T.bg }} />
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Skeleton variant="rounded" width={72} height={18} sx={{ borderRadius: 1 }} />
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="text" width="90%" height={16} />
      <Skeleton variant="text" width="55%" height={16} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
        <Skeleton variant="text" width={56} height={24} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  </Box>
);

const CategorySkeleton: React.FC = () => (
  <Box
    sx={{
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 2,
      overflow: 'hidden',
    }}
  >
    <Skeleton variant="rectangular" height={80} sx={{ bgcolor: T.bg }} />
    <Box sx={{ px: 2.5, pt: 1.5, pb: 1.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Skeleton variant="text" width="55%" height={20} />
      <Skeleton variant="text" width="80%" height={16} />
    </Box>
    <Box
      sx={{
        px: 2,
        py: 1,
        borderTop: `1px solid ${T.bg}`,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 0.5,
      }}
    >
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
  </Box>
);

// ── Empty state ────────────────────────────────────────────────────────────────
interface EmptyStateProps {
  tab: 'items' | 'categories';
  hasFilters: boolean;
  onAdd?: () => void;
  canAdd?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab, hasFilters, onAdd, canAdd }) => {
  const isItems = tab === 'items';
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        bgcolor: T.surface,
        mt: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: T.bg,
          border: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        {isItems
          ? <InventoryIcon sx={{ fontSize: 28, color: T.textMuted }} />
          : <CategoryIcon sx={{ fontSize: 28, color: T.textMuted }} />
        }
      </Box>
      <Typography sx={{ fontWeight: 600, color: T.textSec, fontSize: '0.95rem', mb: 0.5 }}>
        {hasFilters
          ? `No ${isItems ? 'items' : 'categories'} match your filters`
          : `No ${isItems ? 'items' : 'categories'} yet`
        }
      </Typography>
      <Typography sx={{ color: T.textMuted, fontSize: '0.82rem' }}>
        {hasFilters
          ? 'Try adjusting your search or filter criteria'
          : `Get started by adding your first ${isItems ? 'catalog item' : 'category'}`
        }
      </Typography>
      {!hasFilters && canAdd && onAdd && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disableElevation
          sx={{
            mt: 3,
            bgcolor: T.primary,
            color: T.surface,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontSize: '0.875rem',
            '&:hover': { bgcolor: T.primaryHv },
          }}
        >
          {isItems ? 'Add Item' : 'Add Category'}
        </Button>
      )}
    </Paper>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <Box
    sx={{
      flex: '1 1 140px',
      bgcolor: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: 2,
      px: 2.5,
      py: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: T.primaryBg,
        color: T.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.1, color: T.textPri }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: T.textSec, mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ── Main page ──────────────────────────────────────────────────────────────────
const CatalogManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const personaId = userData?.venue?.personaId;
  const { canCreateCatalogItems, canCreateCategories } = usePermissions();

  const {
    items,
    categories,
    loading,
    createItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCatalog({ workspaceId, personaId, autoLoad: true });

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');

  // ── Dialog state ──────────────────────────────────────────────────────────────
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnack = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const availableCount = useMemo(() => items.filter(i => i.isAvailable).length, [items]);
  const unavailableCount = useMemo(() => items.filter(i => !i.isAvailable).length, [items]);

  // ── Filtering ─────────────────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase().trim();

  const filteredItems = useMemo(() => items.filter(item => {
    const matchSearch = !q
      || item.name?.toLowerCase().includes(q)
      || item.description?.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchAvail = availFilter === 'all'
      ? true
      : availFilter === 'available'
        ? item.isAvailable
        : !item.isAvailable;
    return matchSearch && matchCat && matchAvail;
  }), [items, q, categoryFilter, availFilter]);

  const filteredCategories = useMemo(() => categories.filter(cat =>
    !q
    || cat.name?.toLowerCase().includes(q)
    || cat.description?.toLowerCase().includes(q)
  ), [categories, q]);

  const getCategoryItemCount = (catId: string) =>
    items.filter(i => i.categoryId === catId).length;

  const hasFilters = searchQuery !== '' || categoryFilter !== 'all' || availFilter !== 'all';
  const filteredCount = activeTab === 'items' ? filteredItems.length : filteredCategories.length;

  // ── Permissions ───────────────────────────────────────────────────────────────
  const canAddItem = canCreateCatalogItems;
  const canAddCategory = canCreateCategories;

  // ── Tab change ────────────────────────────────────────────────────────────────
  const handleTabChange = (_: React.SyntheticEvent, value: 'items' | 'categories') => {
    setActiveTab(value);
    setSearchQuery('');
    setCategoryFilter('all');
    setAvailFilter('all');
  };

  // ── Item handlers ─────────────────────────────────────────────────────────────
  const handleAddItem = () => {
    setSelectedItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setSelectedCategory(null);
    setDeleteDialogOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedItem) {
        await updateItem(selectedItem.id, data);
        showSnack('Item updated successfully', 'success');
      } else {
        await createItem({ ...data, personaId });
        showSnack('Item created successfully', 'success');
      }
      setItemDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      showSnack(err?.message || 'Failed to save item', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    try {
      await toggleItemAvailability(itemId, !item.isAvailable);
      showSnack('Availability updated', 'success');
    } catch (err: any) {
      showSnack(err?.message || 'Failed to update availability', 'error');
    }
  };

  // ── Category handlers ─────────────────────────────────────────────────────────
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedItem(null);
    setDeleteDialogOpen(true);
  };

  const handleSaveCategory = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
        showSnack('Category updated successfully', 'success');
      } else {
        await createCategory({ ...data, personaId });
        showSnack('Category created successfully', 'success');
      }
      setCategoryDialogOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      showSnack(err?.message || 'Failed to save category', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    try {
      if (selectedItem) {
        await deleteItem(selectedItem.id);
        showSnack('Item deleted successfully', 'success');
      } else if (selectedCategory) {
        await deleteCategory(selectedCategory.id);
        showSnack('Category deleted successfully', 'success');
      }
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    } catch (err: any) {
      showSnack(err?.message || 'Failed to delete', 'error');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setAvailFilter('all');
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100%', bgcolor: T.bg }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: T.surface,
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 3,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.3px',
              color: T.textPri,
              lineHeight: 1.2,
            }}
          >
            Catalog Management
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSec, mt: 0.5 }}>
            Manage your menu items and categories
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0 }}>
          {canAddCategory && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
              sx={{
                borderColor: T.primary,
                color: T.primary,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                py: 0.875,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: T.primaryHv,
                  color: T.primaryHv,
                  bgcolor: T.primaryBg,
                },
              }}
            >
              Add Category
            </Button>
          )}
          {canAddItem && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disableElevation
              sx={{
                bgcolor: T.primary,
                color: T.surface,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                py: 0.875,
                fontSize: '0.875rem',
                '&:hover': { bgcolor: T.primaryHv },
              }}
            >
              Add Item
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: T.surface,
          px: { xs: 3, sm: 4, md: 5 },
          py: 2.5,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <StatCard
          icon={<InventoryIcon sx={{ fontSize: 18 }} />}
          value={items.length}
          label="Total Items"
        />
        <StatCard
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
          value={availableCount}
          label="Available Items"
        />
        <StatCard
          icon={<CategoryIcon sx={{ fontSize: 18 }} />}
          value={categories.length}
          label="Categories"
        />
        <StatCard
          icon={<RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />}
          value={unavailableCount}
          label="Unavailable Items"
        />
      </Box>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: 'none',
          borderBottom: `1px solid ${T.border}`,
          bgcolor: T.surface,
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <Box
            sx={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              bgcolor: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              gap: 1,
              '&:focus-within': {
                borderColor: T.primary,
                boxShadow: `0 0 0 2px ${T.primaryBorder}`,
              },
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            <SearchIcon sx={{ fontSize: 17, color: T.textMuted, flexShrink: 0 }} />
            <InputBase
              placeholder={activeTab === 'items' ? 'Search items...' : 'Search categories...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                fontSize: '0.875rem',
                color: T.textPri,
                '& input::placeholder': { color: T.textMuted },
              }}
            />
            {searchQuery && (
              <Box
                component="span"
                onClick={() => setSearchQuery('')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: T.textMuted,
                  '&:hover': { color: T.textSec },
                }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </Box>
            )}
          </Box>

          {/* Category filter — items tab only */}
          {activeTab === 'items' && (
            <Select
              size="small"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              displayEmpty
              sx={{
                minWidth: 140,
                borderRadius: 2,
                fontSize: '0.875rem',
                bgcolor: T.bg,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c0c0c0' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: T.primary },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '0.875rem' }}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          )}

          {/* Availability filter — items tab only */}
          {activeTab === 'items' && (
            <Select
              size="small"
              value={availFilter}
              onChange={e => setAvailFilter(e.target.value)}
              displayEmpty
              sx={{
                minWidth: 120,
                borderRadius: 2,
                fontSize: '0.875rem',
                bgcolor: T.bg,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c0c0c0' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: T.primary },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
              <MenuItem value="available" sx={{ fontSize: '0.875rem' }}>Available</MenuItem>
              <MenuItem value="unavailable" sx={{ fontSize: '0.875rem' }}>Unavailable</MenuItem>
            </Select>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <Button
              size="small"
              startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
              onClick={handleClearFilters}
              sx={{
                textTransform: 'none',
                color: T.textSec,
                fontWeight: 500,
                fontSize: '0.875rem',
                borderRadius: 2,
                px: 1.5,
                '&:hover': { bgcolor: T.bg, color: T.textPri },
              }}
            >
              Clear
            </Button>
          )}

          {/* Result count */}
          <Typography sx={{ fontSize: '0.875rem', color: T.textMuted, ml: 'auto', flexShrink: 0 }}>
            {filteredCount}{' '}
            {activeTab === 'items'
              ? filteredCount === 1 ? 'item' : 'items'
              : filteredCount === 1 ? 'category' : 'categories'
            }
          </Typography>
        </Box>
      </Paper>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: 'none',
          borderBottom: `1px solid ${T.border}`,
          bgcolor: T.surface,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            px: 2,
            minHeight: 44,
            '& .MuiTabs-indicator': {
              bgcolor: T.primary,
              height: 2,
            },
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: T.textSec,
              px: 2,
              '&.Mui-selected': { color: T.textPri },
            },
          }}
        >
          <Tab
            value="items"
            label={`Items (${items.length})`}
          />
          <Tab
            value="categories"
            label={`Categories (${categories.length})`}
          />
        </Tabs>
      </Paper>

      {/* ── Content area ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: T.bg,
          pb: 6,
          px: { xs: 2, sm: 3, md: 5 },
          pt: 3,
        }}
      >
        {activeTab === 'items' ? (
          loading ? (
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <ItemSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              tab="items"
              hasFilters={hasFilters}
              onAdd={handleAddItem}
              canAdd={canAddItem}
            />
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              {filteredItems.map(item => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <CatalogItemCardAdmin
                    item={item}
                    categoryName={categories.find(c => c.id === item.categoryId)?.name}
                    onEdit={handleEditItem}
                    onDelete={(itemId) => {
                      const found = items.find(i => i.id === itemId);
                      if (found) handleDeleteItem(found);
                    }}
                    onToggleAvailability={handleToggleAvailability}
                    showActions
                  />
                </Grid>
              ))}
            </Grid>
          )
        ) : (
          loading ? (
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <CategorySkeleton />
                </Grid>
              ))}
            </Grid>
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              tab="categories"
              hasFilters={hasFilters}
              onAdd={handleAddCategory}
              canAdd={canAddCategory}
            />
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              {filteredCategories.map(cat => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                  <CategoryCard
                    category={cat}
                    itemCount={getCategoryItemCount(cat.id)}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>

      {/* ── Item form dialog ─────────────────────────────────────────────────── */}
      <CatalogItemFormDialog
        open={itemDialogOpen}
        onClose={() => { setItemDialogOpen(false); setSelectedItem(null); }}
        onSave={handleSaveItem}
        item={selectedItem}
        categories={categories}
        loading={formLoading}
      />

      {/* ── Category form dialog ─────────────────────────────────────────────── */}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onClose={() => { setCategoryDialogOpen(false); setSelectedCategory(null); }}
        onSave={handleSaveCategory}
        category={selectedCategory}
        loading={formLoading}
      />

      {/* ── Delete confirmation ──────────────────────────────────────────────── */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
          setSelectedCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedItem ? 'Item' : 'Category'}`}
        itemName={selectedItem?.name || selectedCategory?.name || ''}
        itemType={selectedItem ? 'item' : 'category'}
        description={`This will permanently remove this ${selectedItem ? 'item' : 'category'}.`}
        requireTyping={false}
      />

      {/* ── Snackbar ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{
            borderRadius: 1.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogManagementPage;