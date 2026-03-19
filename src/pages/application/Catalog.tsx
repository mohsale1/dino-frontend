/**
 * Catalog Management Page - Clean Professional Design
 * 
 * Manage menu items and categories
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import CatalogStats from './Catalog/CatalogStats';
import CatalogTabs from './Catalog/CatalogTabs';
import { CatalogItemFormDialog, CategoryFormDialog } from '../../features/catalog/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { catalogService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import type { CatalogItem, Category } from '../../features/catalog/types';

const CatalogManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';

  const [activeTab, setActiveTab] = useState('items');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Data state
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      const data = await catalogService.getCategories(workspaceId);
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to load categories');
    }
  }, [workspaceId]);

  // Fetch catalog items
  const fetchCatalogItems = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      const data = await catalogService.getCatalogItems(workspaceId);
      setCatalogItems(data);
    } catch (err: any) {
      console.error('Failed to fetch catalog items:', err);
      setError(err.message || 'Failed to load catalog items');
    }
  }, [workspaceId]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchCategories(), fetchCatalogItems()]);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [workspaceId, fetchCategories, fetchCatalogItems]);

  const stats = {
    totalItems: catalogItems.length,
    available: catalogItems.filter(i => i.isAvailable).length,
    unavailable: catalogItems.filter(i => !i.isAvailable).length,
    categories: categories.length,
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setSelectedCategory(null);
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

  const handleDeleteItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    try {
      if (selectedItem) {
        await catalogService.updateCatalogItem(selectedItem.id, data);
        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success',
        });
      } else {
        await catalogService.createCatalogItem({ ...data, workspaceId });
        setSnackbar({
          open: true,
          message: 'Item created successfully',
          severity: 'success',
        });
      }
      
      setAddDialogOpen(false);
      setSelectedItem(null);
      await fetchCatalogItems();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save item',
        severity: 'error',
      });
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (selectedCategory) {
        await catalogService.updateCategory(selectedCategory.id, data);
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success',
        });
      } else {
        await catalogService.createCategory({ ...data, workspaceId });
        setSnackbar({
          open: true,
          message: 'Category created successfully',
          severity: 'success',
        });
      }
      
      setAddDialogOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save category',
        severity: 'error',
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (activeTab === 'items' && selectedItem) {
        await catalogService.deleteCatalogItem(selectedItem.id);
        setSnackbar({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success',
        });
        await fetchCatalogItems();
      } else if (activeTab === 'categories' && selectedCategory) {
        await catalogService.deleteCategory(selectedCategory.id);
        setSnackbar({
          open: true,
          message: 'Category deleted successfully',
          severity: 'success',
        });
        await fetchCategories();
      }
      
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete',
        severity: 'error',
      });
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const item = catalogItems.find(i => i.id === itemId);
      if (!item) return;

      await catalogService.toggleItemAvailability(itemId, !item.isAvailable);
      setSnackbar({
        open: true,
        message: 'Availability updated successfully',
        severity: 'success',
      });
      await fetchCatalogItems();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update availability',
        severity: 'error',
      });
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      await catalogService.uploadItemImage(itemId, file);
      setSnackbar({
        open: true,
        message: 'Image uploaded successfully',
        severity: 'success',
      });
      await fetchCatalogItems();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to upload image',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.125rem' },
                }}
              >
                Catalog Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                }}
              >
                Manage your menu items and categories
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                fontWeight: 600,
                backgroundColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: '#374151',
                },
              }}
            >
              Add {activeTab === 'items' ? 'Item' : 'Category'}
            </Button>
          </Box>

          {/* Statistics */}
          <CatalogStats stats={stats} />
        </Box>

        {/* Tabs */}
        <CatalogTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          items={catalogItems}
          categories={categories}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onToggleAvailability={handleToggleAvailability}
          onImageUpload={handleImageUpload}
        />
      </Container>

      {/* Add/Edit Item Dialog */}
      {activeTab === 'items' && (
        <CatalogItemFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedItem(null);
          }}
          onSave={handleSaveItem}
          item={selectedItem}
          categories={categories}
        />
      )}

      {/* Add/Edit Category Dialog */}
      {activeTab === 'categories' && (
        <CategoryFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
          category={selectedCategory}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
          setSelectedCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${activeTab === 'items' ? 'Item' : 'Category'}`}
        itemName={selectedItem?.name || selectedCategory?.name || ''}
        itemType={activeTab === 'items' ? 'item' : 'category'}
        description={`This will remove this ${activeTab === 'items' ? 'item' : 'category'} from the system. This action can be undone later.`}
        requireTyping={false}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 1.5,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogManagementPage;