import React, { useState, useMemo } from 'react';
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
  Divider,
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
import type { CatalogItem, Category } from '../types';
import type { ViewMode, SortOption } from '../components/CatalogToolbar';

export const CatalogManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
    priceRange: [0, 1000] as [number, number],
    availability: 'all' as 'all' | 'available' | 'unavailable',
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
    },
    tags: [] as string[],
  });

  // Toast notification
  const [toast, setToast] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning' 
  });

  // Mock data
  const catalogItems: CatalogItem[] = [
    {
      id: '1',
      name: 'Premium Widget Pro',
      description: 'High-quality widget for professional use with advanced features',
      basePrice: 99.99,
      categoryId: 'cat1',
      workspaceId: 'ws1',
      isAvailable: true,
      imageUrls: [],
      createdAt: new Date('2024-01-15').toISOString(),
      preparationTime: 15,
      isVegetarian: true,
      tags: ['premium', 'featured'],
    },
    {
      id: '2',
      name: 'Standard Widget',
      description: 'Reliable widget for everyday use',
      basePrice: 49.99,
      categoryId: 'cat1',
      workspaceId: 'ws1',
      isAvailable: true,
      imageUrls: [],
      createdAt: new Date('2024-01-20').toISOString(),
      preparationTime: 10,
      isVegetarian: false,
      tags: ['standard'],
    },
    {
      id: '3',
      name: 'Deluxe Widget Elite',
      description: 'Top-tier widget with all the bells and whistles',
      basePrice: 149.99,
      categoryId: 'cat2',
      workspaceId: 'ws1',
      isAvailable: false,
      imageUrls: [],
      createdAt: new Date('2024-02-01').toISOString(),
      preparationTime: 20,
      isVegetarian: true,
      tags: ['premium', 'deluxe'],
    },
    {
      id: '4',
      name: 'Basic Widget',
      description: 'Entry-level widget for beginners',
      basePrice: 29.99,
      categoryId: 'cat1',
      workspaceId: 'ws1',
      isAvailable: true,
      imageUrls: [],
      createdAt: new Date('2024-01-10').toISOString(),
      preparationTime: 5,
      isVegetarian: true,
      tags: ['basic'],
    },
    {
      id: '5',
      name: 'Enterprise Widget',
      description: 'Enterprise-grade widget with advanced security',
      basePrice: 299.99,
      categoryId: 'cat2',
      workspaceId: 'ws1',
      isAvailable: true,
      imageUrls: [],
      createdAt: new Date('2024-02-10').toISOString(),
      preparationTime: 30,
      isVegetarian: false,
      tags: ['premium', 'enterprise'],
    },
    {
      id: '6',
      name: 'Compact Widget',
      description: 'Small form factor widget',
      basePrice: 39.99,
      categoryId: 'cat3',
      workspaceId: 'ws1',
      isAvailable: true,
      imageUrls: [],
      createdAt: new Date('2024-01-25').toISOString(),
      preparationTime: 8,
      isVegetarian: true,
      tags: ['compact'],
    },
  ];

  const categories: Category[] = [
    {
      id: 'cat1',
      name: 'Electronics',
      description: 'Electronic items and gadgets',
      workspaceId: 'ws1',
      isActive: true,
      createdAt: new Date().toISOString(),
      displayOrder: 1,
    },
    {
      id: 'cat2',
      name: 'Accessories',
      description: 'Various accessories and add-ons',
      workspaceId: 'ws1',
      isActive: true,
      createdAt: new Date().toISOString(),
      displayOrder: 2,
    },
    {
      id: 'cat3',
      name: 'Home & Office',
      description: 'Products for home and office',
      workspaceId: 'ws1',
      isActive: true,
      createdAt: new Date().toISOString(),
      displayOrder: 3,
    },
  ];

  const availableTags = ['premium', 'featured', 'standard', 'deluxe', 'new', 'basic', 'enterprise', 'compact'];

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

  // Handlers
  const handleAddItem = () => {
    setSelectedItem(null);
    setAddDialogOpen(true);
  };

  const handleEditItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setAddDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setAddDialogOpen(true);
  };

  const handleSubmitForm = (data: any) => {
    console.log('Form data:', data);
    setAddDialogOpen(false);
    setSelectedItem(null);
    setSelectedCategory(null);
    setToast({ 
      open: true, 
      message: `${activeTab === 'items' ? 'Item' : 'Category'} saved successfully`, 
      severity: 'success' 
    });
  };

  const handleDeleteItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('Delete:', selectedItem);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    setToast({ open: true, message: 'Item deleted successfully', severity: 'success' });
  };

  const handleToggleAvailability = (itemId: string) => {
    console.log('Toggle availability:', itemId);
    setToast({ open: true, message: 'Availability updated', severity: 'info' });
  };

  const handleImageUpload = (itemId: string, file: File) => {
    console.log('Upload image for:', itemId, file);
    setToast({ open: true, message: 'Image uploaded successfully', severity: 'success' });
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    if (checked) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', Array.from(selectedItems));
    setSelectedItems(new Set());
    setToast({ open: true, message: `${selectedItems.size} items deleted`, severity: 'success' });
  };

  const handleBulkToggleAvailability = (available: boolean) => {
    console.log('Bulk toggle availability:', available, Array.from(selectedItems));
    setSelectedItems(new Set());
    setToast({ open: true, message: `${selectedItems.size} items updated`, severity: 'success' });
  };

  const handleBulkChangeCategory = (categoryId: string) => {
    console.log('Bulk change category:', categoryId, Array.from(selectedItems));
    setSelectedItems(new Set());
    setToast({ open: true, message: `${selectedItems.size} items moved`, severity: 'success' });
  };

  const handleResetFilters = () => {
    setFilters({
      categoryId: undefined,
      priceRange: [0, 1000],
      availability: 'all',
      dietary: { vegetarian: false, vegan: false, glutenFree: false },
      tags: [],
    });
    setSearchQuery('');
  };

  const handleExport = () => {
    setToast({ open: true, message: 'Export started', severity: 'info' });
  };

  const handleImport = () => {
    setToast({ open: true, message: 'Import started', severity: 'info' });
  };

  const handleRefresh = () => {
    setToast({ open: true, message: 'Data refreshed', severity: 'info' });
  };

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
                  {filteredAndSortedItems.length} items â€¢ {categories.length} categories
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