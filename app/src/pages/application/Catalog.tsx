import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  InputBase,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  CalendarToday,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import CatalogTabs from './Catalog/CatalogTabs';
import { CatalogItemFormDialog, CategoryFormDialog } from '../../features/catalog/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { catalogService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import { useAuth } from '../../contexts/common/Auth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_COLORS } from '../../constants/app';
import type { CatalogItem, Category } from '../../features/catalog/types';

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------

const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------

const HeroStat: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}> = ({ label, value, icon, rc }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alpha(rc.chipText, 0.9),
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: rc.statValue,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {animated}
          </Typography>
          <Typography sx={{ color: rc.statLabel, fontSize: '0.72rem', fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const CatalogManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const { canCreateCatalogItems, canCreateCategories } = usePermissions();

  // Role detection
  const { userPermissions } = useAuth();
  const rawRole = (userPermissions?.role?.name || '').toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' = rawRole.includes('owner') || rawRole.includes('super')
    ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin')
    ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

  const [activeTab, setActiveTab] = useState('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX: show a proper UI error when workspaceId is missing instead of silently returning
  const fetchCategories = useCallback(async () => {
    if (!workspaceId) {
      setError('Workspace not found. Please ensure you are assigned to a workspace.');
      return;
    }
    try {
      const data = await catalogService.getCategories(workspaceId);
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to load categories');
    }
  }, [workspaceId]);

  const fetchCatalogItems = useCallback(async () => {
    if (!workspaceId) {
      setError('Workspace not found. Please ensure you are assigned to a workspace.');
      return;
    }
    try {
      const data = await catalogService.getCatalogItems(workspaceId);
      setCatalogItems(data);
    } catch (err: any) {
      console.error('Failed to fetch catalog items:', err);
      setError(err.message || 'Failed to load catalog items');
    }
  }, [workspaceId]);

  useEffect(() => {
    const loadData = async () => {
      // FIX: show a proper error in the UI when workspaceId is empty
      if (!workspaceId) {
        setError('Workspace not found. Please ensure you are assigned to a workspace.');
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

  const q = searchQuery.toLowerCase();
  const filteredCount = activeTab === 'items'
    ? catalogItems.filter(i => !q || i.name?.toLowerCase().includes(q)).length
    : categories.filter(c => !q || c.name?.toLowerCase().includes(q)).length;
  const total = activeTab === 'items' ? catalogItems.length : categories.length;

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
        setSnackbar({ open: true, message: 'Item updated successfully', severity: 'success' });
      } else {
        await catalogService.createCatalogItem({ ...data, workspaceId });
        setSnackbar({ open: true, message: 'Item created successfully', severity: 'success' });
      }
      setAddDialogOpen(false);
      setSelectedItem(null);
      // FIX: reset error before re-fetching after mutation
      setError(null);
      await fetchCatalogItems();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save item', severity: 'error' });
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (selectedCategory) {
        await catalogService.updateCategory(selectedCategory.id, data);
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        await catalogService.createCategory({ ...data, workspaceId });
        setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
      }
      setAddDialogOpen(false);
      setSelectedCategory(null);
      // FIX: reset error before re-fetching after mutation
      setError(null);
      await fetchCategories();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save category', severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      // FIX: check selectedItem and selectedCategory independently of activeTab
      // so the correct entity is always deleted regardless of which tab is active
      if (selectedItem) {
        await catalogService.deleteCatalogItem(selectedItem.id);
        setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
        // FIX: reset error before re-fetching after mutation
        setError(null);
        await fetchCatalogItems();
      } else if (selectedCategory) {
        await catalogService.deleteCategory(selectedCategory.id);
        setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
        // FIX: reset error before re-fetching after mutation
        setError(null);
        await fetchCategories();
      }
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setSelectedCategory(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete', severity: 'error' });
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const item = catalogItems.find(i => i.id === itemId);
      if (!item) return;
      await catalogService.toggleItemAvailability(itemId, !item.isAvailable);
      setSnackbar({ open: true, message: 'Availability updated successfully', severity: 'success' });
      await fetchCatalogItems();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update availability', severity: 'error' });
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      await catalogService.uploadItemImage(itemId, file);
      setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' });
      await fetchCatalogItems();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to upload image', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f1f5f9' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: rc.gradient,
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 2.5, md: 4 },
          pb: { xs: 2.5, md: 4 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            sx={{
              color: alpha(rc.chipText, 0.75),
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            APPLICATION CONTROL CENTER
          </Typography>

          {/* Title row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  fontSize: { xs: '1.4rem', md: '2rem' },
                }}
              >
                Catalog
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha(rc.chipText, 0.6) }} />
                <Typography
                  variant="caption"
                  sx={{ color: alpha(rc.chipText, 0.6), fontWeight: 500, fontSize: '0.75rem' }}
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>

            {(canCreateCatalogItems || canCreateCategories) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{
                  bgcolor: alpha('#fff', 0.15),
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                    boxShadow: 'none',
                  },
                }}
              >
                Add {activeTab === 'items' ? 'Item' : 'Category'}
              </Button>
            )}
          </Box>

          {/* Hero stat tiles — CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <HeroStat label="Total Items" value={stats.totalItems} icon={<InventoryIcon />} rc={rc} />
            <HeroStat label="Available" value={stats.available} icon={<CheckCircleIcon />} rc={rc} />
            <HeroStat label="Unavailable" value={stats.unavailable} icon={<CancelIcon />} rc={rc} />
            <HeroStat label="Categories" value={stats.categories} icon={<CategoryIcon />} rc={rc} />
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ pb: 6 }}>
        {/* Full-width toolbar */}
        <Box sx={{ pt: 0, pb: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
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
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {/* Search */}
              <Box
                sx={{
                  flex: '1 1 220px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <SearchIcon sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
                <InputBase
                  placeholder={`Search ${activeTab === 'items' ? 'items' : 'categories'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.25, color: '#94a3b8' }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>

              {/* Result count */}
              <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                  {filteredCount} of {total}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Content */}
        <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 0, pb: 4 }}>
          <CatalogTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            items={catalogItems}
            categories={categories}
            searchQuery={searchQuery}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleAvailability={handleToggleAvailability}
            onImageUpload={handleImageUpload}
          />
        </Box>
      </Box>

      {activeTab === 'items' && (
        <CatalogItemFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedItem(null); }}
          onSave={handleSaveItem}
          item={selectedItem}
          categories={categories}
        />
      )}

      {activeTab === 'categories' && (
        <CategoryFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedCategory(null); }}
          onSave={handleSaveCategory}
          category={selectedCategory}
        />
      )}

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
        description={`This will remove this ${selectedItem ? 'item' : 'category'} from the system. This action can be undone later.`}
        requireTyping={false}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogManagementPage;