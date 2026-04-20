import React, { useState } from 'react';
import {
  Box, Typography, Button,
  Snackbar, Alert, Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon, CalendarToday,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import CatalogTabs from './Catalog/CatalogTabs';
import { CatalogItemFormDialog, CategoryFormDialog } from '../../features/catalog/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { useUserData } from '../../contexts/application/UserData';
import { useAuth } from '../../contexts/common/Auth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_COLORS } from '../../constants/app';
import { useCatalog } from '../../features/catalog/hooks';
import type { CatalogItem, Category } from '../../features/catalog/types';

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

const HeroStat: React.FC<{
  label: string; value: number; icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS]; loading?: boolean;
}> = ({ label, value, icon, rc, loading }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{
      width: '100%', px: { xs: 1.5, sm: 2 }, py: 1.75,
      borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: 1.5,
          bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: alpha(rc.chipText, 0.9), flexShrink: 0,
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          {loading ? (
            <Skeleton variant="text" width={40} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
          ) : (
            <Typography sx={{ fontWeight: 700, color: rc.statValue, fontSize: { xs: '1.2rem', sm: '1.5rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {animated}
            </Typography>
          )}
          <Typography sx={{ color: rc.statLabel, fontSize: '0.72rem', fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const CatalogManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const { canCreateCatalogItems, canCreateCategories } = usePermissions();
  const { user, userPermissions } = useAuth();

  const rawRole = (
    userPermissions?.role?.name ||
    (user as any)?.role?.name ||
    (user as any)?.role || ''
  ).toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' =
    rawRole.includes('owner') || rawRole.includes('super') ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin') ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

  const {
    items, categories, loading,
    createItem, updateItem, deleteItem,
    toggleItemAvailability, uploadItemImage,
    createCategory, updateCategory, deleteCategory,
  } = useCatalog({ workspaceId, autoLoad: true });

  const [activeTab, setActiveTab] = useState('items');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const stats = {
    totalItems: items.length,
    available: items.filter(i => i.isAvailable).length,
    unavailable: items.filter(i => !i.isAvailable).length,
    categories: categories.length,
  };

  const showSnack = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const handleAddNew = () => {
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
    } finally {
      setFormLoading(false);
    }
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
    } finally {
      setFormLoading(false);
    }
  };

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

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      await uploadItemImage(itemId, file);
      showSnack('Image uploaded successfully', 'success');
    } catch (err: any) {
      showSnack(err?.message || 'Failed to upload image', 'error');
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f1f5f9' }}>

      {/* Hero */}
      <Box sx={{
        background: rc.gradient,
        px: { xs: 2, sm: 4, md: 6 },
        pt: { xs: 2.5, md: 4 },
        pb: { xs: 2.5, md: 4 },
        position: 'relative',
        '&::before': {
          content: '""', position: 'absolute', top: -80, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""', position: 'absolute', bottom: -60, left: '25%',
          width: 280, height: 280, borderRadius: '50%',
          background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ color: alpha(rc.chipText, 0.75), fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem', textTransform: 'uppercase', mb: 1 }}>
            APPLICATION CONTROL CENTER
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, fontSize: { xs: '1.4rem', md: '2rem' } }}>
                Catalog
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha(rc.chipText, 0.6) }} />
                <Typography variant="caption" sx={{ color: alpha(rc.chipText, 0.6), fontWeight: 500, fontSize: '0.75rem' }}>
                  {today}
                </Typography>
              </Box>
            </Box>
            {(canCreateCatalogItems || canCreateCategories) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{
                  bgcolor: alpha('#fff', 0.15), color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                  boxShadow: 'none', fontWeight: 600, borderRadius: 2,
                  textTransform: 'none', px: 2.5, py: 1,
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: alpha('#fff', 0.25), boxShadow: 'none' },
                }}
              >
                Add {activeTab === 'items' ? 'Item' : 'Category'}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, sm: 2 } }}>
            <HeroStat label="Total Items" value={stats.totalItems} icon={<InventoryIcon />} rc={rc} loading={loading} />
            <HeroStat label="Available" value={stats.available} icon={<CheckCircleIcon />} rc={rc} loading={loading} />
            <HeroStat label="Unavailable" value={stats.unavailable} icon={<CancelIcon />} rc={rc} loading={loading} />
            <HeroStat label="Categories" value={stats.categories} icon={<CategoryIcon />} rc={rc} loading={loading} />
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box>
        <CatalogTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          items={items}
          categories={categories}
          loading={loading}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onToggleAvailability={handleToggleAvailability}
          onImageUpload={handleImageUpload}
        />
      </Box>

      {/* Item Form Dialog */}
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

      {/* Category Form Dialog */}
      {activeTab === 'categories' && (
        <CategoryFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedCategory(null); }}
          onSave={handleSaveCategory}
          category={selectedCategory}
          loading={formLoading}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedItem(null); setSelectedCategory(null); }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedItem ? 'Item' : 'Category'}`}
        itemName={selectedItem?.name || selectedCategory?.name || ''}
        itemType={selectedItem ? 'item' : 'category'}
        description={`This will remove this ${selectedItem ? 'item' : 'category'} from the system.`}
        requireTyping={false}
      />

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogManagementPage;