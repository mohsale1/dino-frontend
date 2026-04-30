import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Checkbox,
  Alert,
  Snackbar,
  Paper,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
  Fab,
  Stack,
  CircularProgress,
} from '@mui/material';
// Alert is used in Snackbar below
import {
  Add,
  Inventory,
  Category as CategoryIcon,
  FilterList,
  CheckCircleOutline,
} from '@mui/icons-material';
import {
  Breadcrumbs,
  Button,
  Tabs,
  DataGrid,
  ConfirmDialog,
} from '../../../components';
import {
  CatalogItemCardAdmin,
  CategoryCard,
  CategoryFormDialog,
  CatalogItemFormDialog,
  CatalogFilters,
  CatalogToolbar,
  BulkActionsBar,
  CatalogEmptyState,
} from '../components';
import type { CatalogItem, Category, CatalogItemCreate, CatalogItemUpdate, CategoryCreate, CategoryUpdate } from '../types';
import type { ViewMode, SortOption } from '../components/CatalogToolbar';
import { useCatalog } from '../hooks';
import { useUserData } from '../../../contexts/application/UserData';

export const CatalogManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userData } = useUserData();
  const workspaceId = String(userData?.workspace?.id || '');
  const personaId = userData?.venue?.personaId as number | undefined;

  // Real data via useCatalog hook
  const {
    items: catalogItems,
    categories,
    loading,
    error: catalogError,
    createItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh,
  } = useCatalog({ workspaceId, personaId, autoLoad: true });

  // Tab state
  const [activeTab, setActiveTab] = useState('items');

  // View and filter states
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filters
  const [filters, setFilters] = useState({
    categoryId: undefined as string | undefined,
    priceRange: [0, 10000] as [number, number],
    availability: 'all' as 'all' | 'available' | 'unavailable',
    dietary: { vegetarian: false },
    tags: [] as string[],
  });

  // Toast notification
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const showToast = (message: string, severity: typeof toast.severity = 'success') =>
    setToast({ open: true, message, severity });

  // Derive available tags from real items
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    catalogItems.forEach(item => (item as any).tags?.forEach((t: string) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [catalogItems]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Catalog' },
  ];

  const tabs = [
    { label: 'Items', value: 'items', icon: <Inventory fontSize="small" /> },
    { label: 'Categories', value: 'categories', icon: <CategoryIcon fontSize="small" /> },
  ];

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = catalogItems.filter((item) => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.categoryId && item.categoryId !== filters.categoryId) {
        return false;
      }
      if (item.basePrice < filters.priceRange[0] || item.basePrice > filters.priceRange[1]) {
        return false;
      }
      if (filters.availability === 'available' && !item.isAvailable) {
        return false;
      }
      if (filters.availability === 'unavailable' && item.isAvailable) {
        return false;
      }
      if (filters.dietary.vegetarian && !item.isVegetarian) {
        return false;
      }
      if (filters.tags.length > 0 && !filters.tags.some(tag => (item as any).tags?.includes(tag))) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.basePrice - b.basePrice;
        case 'price-desc':
          return b.basePrice - a.basePrice;
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'date-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [catalogItems, searchQuery, filters, sortBy]);

  const activeFiltersCount = [
    filters.categoryId,
    filters.availability !== 'all',
    filters.dietary.vegetarian,
    filters.tags.length > 0,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000,
  ].filter(Boolean).length;

  const availableItemsCount = useMemo(
    () => catalogItems.filter(i => i.isAvailable).length,
    [catalogItems],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleAddItem = () => { setSelectedItem(null); setAddDialogOpen(true); };
  const handleAddCategory = () => { setSelectedCategory(null); setAddDialogOpen(true); };
  const handleEditItem = (item: CatalogItem) => { setSelectedItem(item); setAddDialogOpen(true); };
  const handleEditCategory = (category: Category) => { setSelectedCategory(category); setAddDialogOpen(true); };

  const handleSubmitForm = useCallback(async (data: any) => {
    try {
      if (activeTab === 'items') {
        if (!personaId) {
          showToast('No active persona selected. Cannot save item.', 'error');
          return;
        }
        if (selectedItem) {
          await updateItem(selectedItem.id, data as CatalogItemUpdate);
          showToast('Item updated successfully');
        } else {
          await createItem({ ...(data as CatalogItemCreate), personaId });
          showToast('Item created successfully');
        }
      } else {
        if (!personaId) {
          showToast('No active persona selected. Cannot save category.', 'error');
          return;
        }
        if (selectedCategory) {
          await updateCategory(selectedCategory.id, data as CategoryUpdate);
          showToast('Category updated successfully');
        } else {
          await createCategory({ ...(data as CategoryCreate), personaId });
          showToast('Category created successfully');
        }
      }
      setAddDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save. Please try again.', 'error');
    }
  }, [activeTab, selectedItem, selectedCategory, personaId, createItem, updateItem, createCategory, updateCategory]);

  const handleDeleteItem = (item: CatalogItem) => { setSelectedItem(item); setDeleteDialogOpen(true); };

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (activeTab === 'items' && selectedItem) {
        await deleteItem(selectedItem.id);
        showToast('Item deleted successfully');
      } else if (activeTab === 'categories' && selectedCategory) {
        await deleteCategory(selectedCategory.id);
        showToast('Category deleted successfully');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    }
  }, [activeTab, selectedItem, selectedCategory, deleteItem, deleteCategory]);

  const handleToggleAvailability = useCallback(async (itemId: string) => {
    const item = catalogItems.find(i => i.id === itemId);
    if (!item) return;
    try {
      await toggleItemAvailability(itemId, !item.isAvailable);
      showToast(`Item marked as ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update availability.', 'error');
    }
  }, [catalogItems, toggleItemAvailability]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    checked ? newSelection.add(itemId) : newSelection.delete(itemId);
    setSelectedItems(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? new Set(filteredAndSortedItems.map(i => i.id)) : new Set());
  };

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedItems);
    try {
      await Promise.all(ids.map(id => deleteItem(id)));
      showToast(`${ids.length} items deleted`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete some items.', 'error');
    } finally {
      setSelectedItems(new Set());
    }
  }, [selectedItems, deleteItem]);

  const handleBulkToggleAvailability = useCallback(async (available: boolean) => {
    const ids = Array.from(selectedItems);
    try {
      await Promise.all(ids.map(id => toggleItemAvailability(id, available)));
      showToast(`${ids.length} items updated`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update some items.', 'error');
    } finally {
      setSelectedItems(new Set());
    }
  }, [selectedItems, toggleItemAvailability]);

  const handleBulkChangeCategory = useCallback(async (categoryId: string) => {
    const ids = Array.from(selectedItems);
    try {
      await Promise.all(ids.map(id => updateItem(id, { categoryId })));
      showToast(`${ids.length} items moved`);
    } catch (err: any) {
      showToast(err.message || 'Failed to move some items.', 'error');
    } finally {
      setSelectedItems(new Set());
    }
  }, [selectedItems, updateItem]);

  const handleResetFilters = () => {
    setFilters({
      categoryId: undefined,
      priceRange: [0, 10000],
      availability: 'all',
      dietary: { vegetarian: false },
      tags: [],
    });
    setSearchQuery('');
  };

  const handleRefresh = () => { refresh(); showToast('Data refreshed', 'info'); };
  const handleExport = () => showToast('Export started', 'info');
  const handleImport = () => showToast('Import started', 'info');

  const getGridColumns = () => {
    switch (viewMode) {
      case 'grid':
        return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 };
      case 'compact':
        return { xs: 12, sm: 6, md: 3, lg: 2.4, xl: 2 };
      case 'list':
        return { xs: 12 };
      default:
        return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 };
    }
  };

  const FilterDrawer = (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 360 } } }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1C1C1E' }}>Filters</Typography>
          <Button size="small" onClick={() => setFilterDrawerOpen(false)}>Close</Button>
        </Stack>
      </Box>
      <Box sx={{ p: 2, overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
        <CatalogFilters
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          availableTags={availableTags}
        />
      </Box>
    </Drawer>
  );

  // Loading state
  if (loading && catalogItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8fafc', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
        <Typography variant="body2" sx={{ color: '#666666' }}>Loading catalog...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* Page Header */}
      <Box sx={{
        bgcolor: '#ffffff',
        px: { xs: 2, sm: '32px' },
        pt: '24px',
        pb: '20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Breadcrumbs items={breadcrumbItems} />
          <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: 20, lineHeight: 1.3, mt: 0.5 }}>
            Catalog Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
            {catalogItems.length} items · {categories.length} categories
            {catalogError && (
              <Box component="span" sx={{ color: 'error.main', ml: 1 }}>— {catalogError}</Box>
            )}
          </Typography>
        </Box>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddItem}
            disableElevation
            sx={{
              bgcolor: '#1976D2',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            Add {activeTab === 'items' ? 'Item' : 'Category'}
          </Button>
        )}
      </Box>

      {/* Content Area */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 6 }}>

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Total Items */}
          <Grid item xs={12} sm={4}>
            <Box sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              p: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              height: '100%',
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                flexShrink: 0,
                bgcolor: 'rgba(25,118,210,0.08)',
                border: '1px solid rgba(25,118,210,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1976D2',
                '& svg': { fontSize: 20 },
              }}>
                <Inventory />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 24, color: '#1C1C1E', lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {catalogItems.length}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#666666', mt: 0.25, fontWeight: 500 }}>
                  Total Items
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={4}>
            <Box sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              p: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              height: '100%',
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                flexShrink: 0,
                bgcolor: 'rgba(25,118,210,0.08)',
                border: '1px solid rgba(25,118,210,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1976D2',
                '& svg': { fontSize: 20 },
              }}>
                <CategoryIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 24, color: '#1C1C1E', lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {categories.length}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#666666', mt: 0.25, fontWeight: 500 }}>
                  Categories
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Available Items */}
          <Grid item xs={12} sm={4}>
            <Box sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              p: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              height: '100%',
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                flexShrink: 0,
                bgcolor: 'rgba(25,118,210,0.08)',
                border: '1px solid rgba(25,118,210,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1976D2',
                '& svg': { fontSize: 20 },
              }}>
                <CheckCircleOutline />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 24, color: '#1C1C1E', lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {availableItemsCount}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#666666', mt: 0.25, fontWeight: 500 }}>
                  Available Items
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Tab Bar */}
        <Paper elevation={0} sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Tabs header */}
          <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Tabs
              tabs={tabs}
              value={activeTab}
              onChange={setActiveTab}
            >
              {(value) => (
                <Box sx={{ p: 3 }}>
                  {value === 'items' && (
                    <Box>
                      {/* Toolbar */}
                      <Box mb={2}>
                        <CatalogToolbar
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                          viewMode={viewMode}
                          onViewModeChange={setViewMode}
                          sortBy={sortBy}
                          onSortChange={setSortBy}
                          onExport={handleExport}
                          onImport={handleImport}
                          onRefresh={handleRefresh}
                        />
                      </Box>

                      {isMobile && activeFiltersCount > 0 && (
                        <Box mb={2}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => setFilterDrawerOpen(true)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '8px',
                              borderColor: '#e0e0e0',
                              color: '#1C1C1E',
                            }}
                          >
                            Filters ({activeFiltersCount})
                          </Button>
                        </Box>
                      )}

                      <Grid container spacing={2}>
                        {!isMobile && (
                          <Grid item xs={12} lg={3}>
                            <CatalogFilters
                              categories={categories}
                              filters={filters}
                              onFilterChange={setFilters}
                              onReset={handleResetFilters}
                              availableTags={availableTags}
                            />
                          </Grid>
                        )}

                        <Grid item xs={12} lg={isMobile ? 12 : 9}>
                          {filteredAndSortedItems.length > 0 && (
                            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: '8px', borderColor: '#e0e0e0' }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Checkbox
                                    checked={selectedItems.size === filteredAndSortedItems.length}
                                    indeterminate={selectedItems.size > 0 && selectedItems.size < filteredAndSortedItems.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    sx={{ color: '#1976D2', '&.Mui-checked': { color: '#1976D2' } }}
                                  />
                                  <Typography variant="body2" sx={{ color: '#666666' }}>
                                    {selectedItems.size > 0
                                      ? `${selectedItems.size} selected`
                                      : `${filteredAndSortedItems.length} items`
                                    }
                                  </Typography>
                                </Stack>
                                {selectedItems.size > 0 && (
                                  <Button
                                    size="small"
                                    onClick={() => setSelectedItems(new Set())}
                                    sx={{ textTransform: 'none', color: '#666666' }}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </Stack>
                            </Paper>
                          )}

                          {filteredAndSortedItems.length === 0 ? (
                            <CatalogEmptyState
                              icon={<Inventory />}
                              title="No items found"
                              description="Try adjusting your filters or add a new item"
                              actionLabel="Add Item"
                              onAction={handleAddItem}
                            />
                          ) : (
                            <DataGrid
                              data={filteredAndSortedItems}
                              columns={getGridColumns()}
                              renderItem={(item) => (
                                <Box position="relative">
                                  <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      left: 8,
                                      zIndex: 2,
                                      backgroundColor: 'white',
                                      borderRadius: 0.5,
                                      '&:hover': { backgroundColor: 'white' },
                                    }}
                                  />
                                  <CatalogItemCardAdmin
                                    item={item}
                                    categoryName={categories.find(c => c.id === item.categoryId)?.name}
                                    onEdit={handleEditItem}
                                    onDelete={() => handleDeleteItem(item)}
                                    onToggleAvailability={handleToggleAvailability}
                                  />
                                </Box>
                              )}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {value === 'categories' && (
                    <Box>
                      {!personaId ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                          <CategoryIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 2 }} />
                          <Typography sx={{ fontWeight: 600, color: '#1C1C1E', mb: 0.5 }}>
                            No persona selected
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666' }}>
                            Select an active persona to view and manage categories.
                          </Typography>
                        </Box>
                      ) : categories.length === 0 ? (
                        <CatalogEmptyState
                          icon={<CategoryIcon />}
                          title="No categories yet"
                          description="Create your first category to organize items"
                          actionLabel="Add Category"
                          onAction={handleAddCategory}
                        />
                      ) : (
                        <DataGrid
                          data={categories}
                          columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                          renderItem={(category) => (
                            <CategoryCard
                              category={category}
                              itemCount={catalogItems.filter(i => i.categoryId === category.id).length}
                              onClick={() => handleEditCategory(category)}
                            />
                          )}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Tabs>
          </Box>
        </Paper>
      </Box>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: '#1976D2',
            color: '#ffffff',
            '&:hover': { bgcolor: '#1565C0' },
          }}
          onClick={handleAddItem}
        >
          <Add />
        </Fab>
      )}

      {FilterDrawer}

      {activeTab === 'items' && (
        <CatalogItemFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedItem(null);
          }}
          onSave={handleSubmitForm}
          item={selectedItem}
          categories={categories}
        />
      )}

      {activeTab === 'categories' && (
        <CategoryFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleSubmitForm}
          category={selectedCategory}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.name || selectedCategory?.name}"?`}
        variant="danger"
        confirmText="Delete"
      />

      <BulkActionsBar
        selectedCount={selectedItems.size}
        onClearSelection={() => setSelectedItems(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkToggleAvailability={handleBulkToggleAvailability}
        onBulkChangeCategory={handleBulkChangeCategory}
        categories={categories}
        show={selectedItems.size > 0}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogManagementPage;