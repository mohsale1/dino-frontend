import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
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
} from '@mui/material';
import {
  Add,
  Inventory,
  Category as CategoryIcon,
  FilterList,
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
import { CircularProgress } from '@mui/material';

export const CatalogManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userData } = useUserData();
  const workspaceId = userData?.workspace?.id || '';

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
    uploadItemImage,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh,
  } = useCatalog({ workspaceId, autoLoad: true });

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
    dietary: { vegetarian: false, vegan: false, glutenFree: false },
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
    catalogItems.forEach(item => item.tags?.forEach(t => tagSet.add(t)));
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
      if (filters.dietary.vegan && !item.isVegan) {
        return false;
      }
      if (filters.dietary.glutenFree && !item.isGlutenFree) {
        return false;
      }
      if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags?.includes(tag))) {
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
    filters.dietary.vegan,
    filters.dietary.glutenFree,
    filters.tags.length > 0,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000,
  ].filter(Boolean).length;

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleAddItem = () => { setSelectedItem(null); setAddDialogOpen(true); };
  const handleEditItem = (item: CatalogItem) => { setSelectedItem(item); setAddDialogOpen(true); };
  const handleEditCategory = (category: Category) => { setSelectedCategory(category); setAddDialogOpen(true); };

  const handleSubmitForm = useCallback(async (data: any) => {
    try {
      if (activeTab === 'items') {
        if (selectedItem) {
          await updateItem(selectedItem.id, data as CatalogItemUpdate);
          showToast('Item updated successfully');
        } else {
          await createItem({ ...data, workspaceId } as CatalogItemCreate);
          showToast('Item created successfully');
        }
      } else {
        if (selectedCategory) {
          await updateCategory(selectedCategory.id, data as CategoryUpdate);
          showToast('Category updated successfully');
        } else {
          await createCategory({ ...data, workspaceId } as CategoryCreate);
          showToast('Category created successfully');
        }
      }
      setAddDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save. Please try again.', 'error');
    }
  }, [activeTab, selectedItem, selectedCategory, workspaceId, createItem, updateItem, createCategory, updateCategory]);

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

  const handleImageUpload = useCallback(async (itemId: string, file: File) => {
    try {
      await uploadItemImage(itemId, file);
      showToast('Image uploaded successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image.', 'error');
    }
  }, [uploadItemImage]);

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
      dietary: { vegetarian: false, vegan: false, glutenFree: false },
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
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>Filters</Typography>
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading catalog...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ py: 2.5 }}>
            <Breadcrumbs items={breadcrumbItems} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
              <Box>
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  Catalog Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {catalogItems.length} items • {categories.length} categories
                  {catalogError && <Box component="span" sx={{ color: 'error.main', ml: 1 }}>— {catalogError}</Box>}
                </Typography>
              </Box>
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  sx={{ textTransform: 'none' }}
                >
                  Add {activeTab === 'items' ? 'Item' : 'Category'}
                </Button>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab}>
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
                          sx={{ textTransform: 'none' }}
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
                          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Checkbox
                                  checked={selectedItems.size === filteredAndSortedItems.length}
                                  indeterminate={selectedItems.size > 0 && selectedItems.size < filteredAndSortedItems.length}
                                  onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {selectedItems.size > 0 
                                    ? `${selectedItems.size} selected`
                                    : `${filteredAndSortedItems.length} items`
                                  }
                                </Typography>
                              </Stack>
                              {selectedItems.size > 0 && (
                                <Button size="small" onClick={() => setSelectedItems(new Set())}>
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
                                  onImageUpload={handleImageUpload}
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
                    {categories.length === 0 ? (
                      <CatalogEmptyState
                        icon={<CategoryIcon />}
                        title="No categories yet"
                        description="Create your first category to organize items"
                        actionLabel="Add Category"
                        onAction={handleAddItem}
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
        </Paper>
      </Container>

      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
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
