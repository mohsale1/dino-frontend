import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Skeleton, Snackbar, Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

import CatalogToolbar from './Catalog/components/CatalogToolbar';
import CatalogItemCard from './Catalog/CatalogItemCard';
import CategoryCard from './Catalog/CategoryCard';
import { CatalogItemFormDialog, CategoryFormDialog } from '../../features/catalog/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import { useCatalog } from '../../features/catalog/hooks';
import type { CatalogItem, Category } from '../../features/catalog/types';

// ── Skeleton cards ────────────────────────────────────────────────────────────
const ItemSkeleton: React.FC = () => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={150} sx={{ bgcolor: '#f1f5f9' }} />
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Skeleton variant="rounded" width={70} height={18} sx={{ borderRadius: 1 }} />
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="text" width="90%" height={16} />
      <Skeleton variant="text" width="60%" height={16} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
        <Skeleton variant="text" width={60} height={24} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  </Box>
);

const CategorySkeleton: React.FC = () => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={90} sx={{ bgcolor: '#f1f5f9' }} />
    <Box sx={{ px: 2.5, pt: 1.5, pb: 1.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Skeleton variant="text" width="55%" height={20} />
      <Skeleton variant="text" width="80%" height={16} />
    </Box>
    <Box sx={{ px: 2, py: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
  </Box>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ tab: string }> = ({ tab }) => (
  <Box sx={{ py: 12, textAlign: 'center' }}>
    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
      {tab === 'items'
        ? <InventoryIcon sx={{ fontSize: 30, color: '#cbd5e1' }} />
        : <CategoryIcon sx={{ fontSize: 30, color: '#cbd5e1' }} />
      }
    </Box>
    <Typography sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>
      No {tab === 'items' ? 'items' : 'categories'} found
    </Typography>
    <Typography sx={{ color: '#cbd5e1', fontSize: '0.8rem', mt: 0.5 }}>
      Try adjusting your search or filters
    </Typography>
  </Box>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CatalogManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const { canCreateCatalogItems, canCreateCategories } = usePermissions();

  const {
    items, categories, loading,
    createItem, updateItem, deleteItem,
    toggleItemAvailability, uploadItemImage,
    createCategory, updateCategory, deleteCategory,
  } = useCatalog({ workspaceId, autoLoad: true });

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showSnack = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  // ── Filtering ───────────────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();

  const filteredItems = useMemo(() => items.filter(item => {
    const matchSearch = !q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchAvail = availFilter === 'all' ? true
      : availFilter === 'available' ? item.isAvailable : !item.isAvailable;
    return matchSearch && matchCat && matchAvail;
  }), [items, q, categoryFilter, availFilter]);

  const filteredCategories = useMemo(() => categories.filter(cat =>
    !q || cat.name?.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q)
  ), [categories, q]);

  const getCategoryItemCount = (catId: string) => items.filter(i => i.categoryId === catId).length;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery('');
    setCategoryFilter('all');
    setAvailFilter('all');
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setSelectedCategory(null);
    setAddDialogOpen(true);
  };

  const handleEditItem = (item: CatalogItem) => { setSelectedItem(item); setAddDialogOpen(true); };
  const handleEditCategory = (cat: Category) => { setSelectedCategory(cat); setAddDialogOpen(true); };
  const handleDeleteItem = (item: CatalogItem) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const handleDeleteCategory = (cat: Category) => { setSelectedCategory(cat); setDeleteDialogOpen(true); };

  const handleSaveItem = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedItem) {
        await updateItem(selectedItem.id, data);
        showSnack('Item updated successfully', 'success');
      } else {
        await createItem({ ...data, workspaceId });
        showSnack('Item created successfully', 'success');
      }
      setAddDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      showSnack(err?.message || 'Failed to save item', 'error');
    } finally { setFormLoading(false); }
  };

  const handleSaveCategory = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
        showSnack('Category updated successfully', 'success');
      } else {
        await createCategory({ ...data, workspaceId });
        showSnack('Category created successfully', 'success');
      }
      setAddDialogOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      showSnack(err?.message || 'Failed to save category', 'error');
    } finally { setFormLoading(false); }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedItem) {
        await deleteItem(selectedItem.id);
        showSnack('Item deleted', 'success');
      } else if (selectedCategory) {
        await deleteCategory(selectedCategory.id);
        showSnack('Category deleted', 'success');
      }
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    } catch (err: any) {
      showSnack(err?.message || 'Failed to delete', 'error');
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    try {
      await toggleItemAvailability(itemId, !item.isAvailable);
      showSnack('Availability updated', 'success');
    } catch (err: any) {
      showSnack(err?.message || 'Failed to update', 'error');
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      await uploadItemImage(itemId, file);
      showSnack('Image uploaded', 'success');
    } catch (err: any) {
      showSnack(err?.message || 'Failed to upload image', 'error');
    }
  };

  const canAdd = activeTab === 'items' ? canCreateCatalogItems : canCreateCategories;
  const filteredCount = activeTab === 'items' ? filteredItems.length : filteredCategories.length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f8fafc' }}>

      {/* Toolbar: title + search + filters + tabs */}
      <CatalogToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        availFilter={availFilter}
        onAvailFilterChange={setAvailFilter}
        categories={categories}
        itemCount={items.length}
        categoryCount={categories.length}
        filteredCount={filteredCount}
        canAdd={canAdd}
        onAdd={handleAdd}
      />

      {/* Card grid */}
      <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        {activeTab === 'items' ? (
          loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <ItemSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : filteredItems.length === 0 ? (
            <EmptyState tab="items" />
          ) : (
            <Grid container spacing={2}>
              {filteredItems.map(item => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <CatalogItemCard
                    item={item}
                    categoryName={categories.find(c => c.id === item.categoryId)?.name}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onToggleAvailability={handleToggleAvailability}
                    onImageUpload={handleImageUpload}
                  />
                </Grid>
              ))}
            </Grid>
          )
        ) : (
          loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <CategorySkeleton />
                </Grid>
              ))}
            </Grid>
          ) : filteredCategories.length === 0 ? (
            <EmptyState tab="categories" />
          ) : (
            <Grid container spacing={2}>
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

      {/* Item form dialog */}
      {activeTab === 'items' && (
        <CatalogItemFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedItem(null); }}
          onSave={handleSaveItem}
          item={selectedItem}
          categories={categories}
          loading={formLoading}
        />
      )}

      {/* Category form dialog */}
      {activeTab === 'categories' && (
        <CategoryFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedCategory(null); }}
          onSave={handleSaveCategory}
          category={selectedCategory}
          loading={formLoading}
        />
      )}

      {/* Delete confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedItem(null); setSelectedCategory(null); }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedItem ? 'Item' : 'Category'}`}
        itemName={selectedItem?.name || selectedCategory?.name || ''}
        itemType={selectedItem ? 'item' : 'category'}
        description={`This will permanently remove this ${selectedItem ? 'item' : 'category'}.`}
        requireTyping={false}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogManagementPage;
