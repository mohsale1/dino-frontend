import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  keyframes,
  Paper,
  Tabs,
  Tab,
  Badge,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha,
  List,
  ListItem,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Category,
  Restaurant,
  Refresh,
  Store,
  CachedOutlined,
  FilterList,
  Edit,
  Delete,
} from '@mui/icons-material';
import { menuService } from '../../services/business';
import { useUserData } from '../../contexts/UserDataContext';
import { DeleteConfirmationModal } from '../../components/modals';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useMenuFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Menu Components
import MenuStats from '../../components/menu/MenuStats';
import MenuFilters from '../../components/menu/MenuFilters';
import MenuItemsGrid from '../../components/menu/MenuItemsGrid';
import MenuItemDialog from '../../components/menu/MenuItemDialog';
import CategoryDialog from '../../components/menu/CategoryDialog';

// Animation for refresh icon
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  available?: boolean;
  isAvailable?: boolean;
  preparationTime: number;
  image?: string;
  featured?: boolean;
  image_urls?: string[];
  // API fields
  base_price?: number;
  category_id?: string;
  venue_id?: string;
  is_vegetarian?: boolean;
  is_available?: boolean;
  preparation_time_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

interface CategoryType {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  order?: number;
  venueId?: string;
  // API fields
  venue_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const MenuManagement: React.FC = () => {
  const { getVenue, getVenueDisplayName, userData, loading: userDataLoading } = useUserData();
  const menuFlags = useMenuFlags();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vegFilter, setVegFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: '' as 'item' | 'category',
    id: '',
    name: '',
    loading: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load data on mount
  useEffect(() => {
    const loadMenuData = async () => {
      if (userDataLoading) return;

      const venue = getVenue();
      if (!venue?.id) {
        setMenuItems([]);
        setCategories([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        const [categoriesData, menuItemsData] = await Promise.all([
          menuService.getMenuCategories({ venueId: venue.id }),
          menuService.getMenuItems({ venueId: venue.id })
        ]);

        // Process categories
        const processedCategories = (categoriesData.data || []).map((cat: any) => ({
          ...cat,
          active: true,
          order: 0,
          venueId: cat.venueId
        }));

        // Process menu items
        const processedMenuItems = (menuItemsData.data || []).map((item: any) => ({
          ...item,
          price: item.base_price,
          category: item.category_id,
          isVeg: item.is_vegetarian || false,
          available: item.is_available,
          isAvailable: item.is_available,
          preparationTime: item.preparation_time_minutes || 15,
          image: item.image_urls?.[0],
          image_urls: item.image_urls || []
        }));

        setCategories(processedCategories);
        setMenuItems(processedMenuItems);
        
      } catch (error) {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadMenuData, 100);
    return () => clearTimeout(timeoutId);
  }, [userDataLoading, userData, getVenue]);

  // Event handlers
  const handleAddItem = () => {
    setEditingItem(null);
    setOpenItemDialog(true);
  };

  const handleEditItem = (item: MenuItemType) => {
    setEditingItem(item);
    setOpenItemDialog(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;
    
    setDeleteModal({
      open: true,
      type: 'item',
      id: itemId,
      name: item.name,
      loading: false
    });
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const itemsInCategory = menuItems.filter(item => item.category === categoryId);
    if (itemsInCategory.length > 0) {
      setSnackbar({ 
        open: true, 
        message: `Cannot delete category "${category.name}": ${itemsInCategory.length} menu items are assigned to this category.`, 
        severity: 'error' 
      });
      return;
    }
    
    setDeleteModal({
      open: true,
      type: 'category',
      id: categoryId,
      name: category.name,
      loading: false
    });
  };

  const confirmDeleteItem = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const item = menuItems.find(item => item.id === deleteModal.id);
      await menuService.deleteMenuItem(deleteModal.id);
      setMenuItems(prev => prev.filter(item => item.id !== deleteModal.id));
      setSnackbar({ open: true, message: `${item?.name} deleted successfully`, severity: 'success' });
      setDeleteModal({ open: false, type: 'item', id: '', name: '', loading: false });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete menu item', severity: 'error' });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const confirmDeleteCategory = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const category = categories.find(cat => cat.id === deleteModal.id);
      await menuService.deleteMenuCategory(deleteModal.id);
      setCategories(prev => prev.filter(cat => cat.id !== deleteModal.id));
      setSnackbar({ open: true, message: `Category "${category?.name}" deleted successfully`, severity: 'success' });
      setDeleteModal({ open: false, type: 'category', id: '', name: '', loading: false });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete category', severity: 'error' });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveItem = async (itemData: any, imageFile?: File) => {
    try {
      if (editingItem) {
        const updateData = {
          name: itemData.name,
          description: itemData.description,
          base_price: itemData.price,
          category_id: itemData.category,
          is_vegetarian: itemData.isVeg,
          is_available: itemData.available,
          preparation_time_minutes: itemData.preparationTime,
        };
        
        const response = await menuService.updateMenuItem(editingItem.id, updateData);
        
        if (response.success && response.data) {
          setMenuItems(prev => prev.map(item => 
            item.id === editingItem.id ? { 
              ...item,
              name: response.data!.name,
              description: response.data!.description,
              price: response.data!.base_price,
              category: response.data!.category_id,
              isVeg: response.data!.is_vegetarian || false,
              available: response.data!.is_available || false,
              isAvailable: response.data!.is_available || false,
              preparationTime: response.data!.preparation_time_minutes || 15,
              image: response.data!.image_urls?.[0] || item.image,
              image_urls: response.data!.image_urls || item.image_urls
            } as MenuItemType : item
          ));
          setSnackbar({ open: true, message: 'Menu item updated successfully', severity: 'success' });
        } else {
          throw new Error(response.message || 'Update failed');
        }
      } else {
        const venue = getVenue();
        if (!venue?.id) {
          throw new Error('No venue available');
        }
        
        const createData = {
          name: itemData.name || '',
          description: itemData.description || '',
          base_price: itemData.price || 0,
          category_id: itemData.category || '',
          venueId: venue.id,
          is_vegetarian: itemData.isVeg ?? true,
          preparation_time_minutes: itemData.preparationTime || 15,
        };
        
        const response = await menuService.createMenuItem(createData);
        
        if (response.success && response.data) {
          let newItem = {
            ...response.data!,
            price: response.data!.base_price,
            category: response.data!.category_id,
            isVeg: response.data!.is_vegetarian || false,
            available: response.data!.is_available || false,
            isAvailable: response.data!.is_available || false,
            preparationTime: response.data!.preparation_time_minutes || 15,
            image: response.data!.image_urls?.[0],
            image_urls: response.data!.image_urls || []
          } as MenuItemType;

          if (imageFile) {
            try {
              const uploadResponse = await menuService.uploadMenuItemImage(response.data!.id, imageFile);
              if (uploadResponse.success && uploadResponse.data) {
                newItem = {
                  ...newItem,
                  image: uploadResponse.data.image_url,
                  image_urls: [uploadResponse.data.image_url]
                };
                setSnackbar({ open: true, message: 'Menu item and image added successfully', severity: 'success' });
              } else {
                setSnackbar({ open: true, message: 'Menu item added, but image upload failed', severity: 'warning' });
              }
            } catch (uploadError) {
              setSnackbar({ open: true, message: 'Menu item added, but image upload failed', severity: 'warning' });
            }
          } else {
            setSnackbar({ open: true, message: 'Menu item added successfully', severity: 'success' });
          }

          setMenuItems(prev => [...prev, newItem]);
        } else {
          throw new Error(response.message || 'Creation failed');
        }
      }
      setOpenItemDialog(false);
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save menu item', 
        severity: 'error' 
      });
    }
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (editingCategory) {
        const response = await menuService.updateMenuCategory(editingCategory.id, {
          name: categoryData.name,
          description: categoryData.description,
        });
        if (response.data) {
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? { 
              ...cat,
              ...response.data!,
              active: true,
              order: cat.order || 0,
              venueId: response.data!.venueId
            } as CategoryType : cat
          ));
        }
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        const venue = getVenue();
        if (!venue?.id) {
          throw new Error('No venue available');
        }
        
        const response = await menuService.createMenuCategory({
          name: categoryData.name || '',
          description: categoryData.description || '',
          venueId: venue.id,
        });
        if (response.data) {
          const newCategory = {
            ...response.data!,
            active: true,
            order: 0,
            venueId: response.data!.venueId
          } as CategoryType;
          setCategories(prev => [...prev, newCategory]);
        }
        setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
      }
      setOpenCategoryDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save category', severity: 'error' });
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;

      const response = await menuService.updateMenuItem(itemId, {
        is_available: !(item.available ?? item.isAvailable),
      });

      if (response.data) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item,
            available: response.data!.is_available,
            isAvailable: response.data!.is_available,
          } as MenuItemType : item
        ));
        setSnackbar({ 
          open: true, 
          message: `${item.name} marked as ${response.data.is_available ? 'available' : 'unavailable'}`, 
          severity: 'success' 
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update availability', severity: 'error' });
    }
  };

  const handleQuickImageUpload = async (itemId: string, file: File) => {
    try {
      const response = await menuService.uploadMenuItemImage(itemId, file);
      
      if (response.success && response.data) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item,
            image: response.data!.image_url,
            image_urls: [...(item.image_urls || []), response.data!.image_url]
          } : item
        ));
        
        setSnackbar({
          open: true,
          message: 'Image uploaded successfully!',
          severity: 'success'
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to upload image',
        severity: 'error'
      });
    }
  };

  const handleRefreshMenu = async () => {
    const venue = getVenue();
    if (!venue?.id) {
      setSnackbar({
        open: true,
        message: 'No venue available to refresh menu data',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [categoriesData, menuItemsData] = await Promise.all([
        menuService.getMenuCategories({ venueId: venue.id }),
        menuService.getMenuItems({ venueId: venue.id })
      ]);

      const processedCategories = (categoriesData.data || []).map((cat: any) => ({
        ...cat,
        active: true,
        order: 0,
        venueId: cat.venueId
      }));

      const processedMenuItems = (menuItemsData.data || []).map((item: any) => ({
        ...item,
        price: item.base_price,
        category: item.category_id,
        isVeg: item.is_vegetarian || false,
        available: item.is_available,
        isAvailable: item.is_available,
        preparationTime: item.preparation_time_minutes || 15,
        image: item.image_urls?.[0],
        image_urls: item.image_urls || []
      }));

      setCategories(processedCategories);
      setMenuItems(processedMenuItems);
      
      setSnackbar({
        open: true,
        message: 'Menu data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh menu data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setVegFilter('all');
    setAvailabilityFilter('all');
  };

  // Filter menu items
  const filteredItems = menuItems.filter((item: MenuItemType) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVeg = vegFilter === 'all' || 
                      (vegFilter === 'veg' && item.isVeg) || 
                      (vegFilter === 'non-veg' && !item.isVeg);
    const matchesAvailability = availabilityFilter === 'all' ||
                               (availabilityFilter === 'available' && (item.available ?? item.isAvailable)) ||
                               (availabilityFilter === 'unavailable' && !(item.available ?? item.isAvailable));
    
    return matchesCategory && matchesSearch && matchesVeg && matchesAvailability;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailableItems = () => {
    return menuItems.filter(item => item.available ?? item.isAvailable);
  };

  const getUnavailableItems = () => {
    return menuItems.filter(item => !(item.available ?? item.isAvailable));
  };

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Restaurant sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Menu Management
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Manage your restaurant's menu items and categories for {getVenueDisplayName()}
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Store sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {getVenueDisplayName()}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={handleRefreshMenu}
                disabled={loading}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={loading ? 'Refreshing...' : 'Refresh menu'}
              >
                {loading ? (
                  <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 1 }}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Menu Statistics */}
        <FlagGate flag="menu.showMenuStats">
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>
            <MenuStats menuItems={menuItems} categories={categories} />
          </Box>
        </FlagGate>

        {/* Menu Items Section with Tabs */}
        <Paper sx={{ 
          border: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          mx: { xs: 3, sm: 4 },
          mb: 4
        }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 48 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: 160 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab 
              icon={
                <Badge badgeContent={filteredItems.length} color="primary">
                  <Restaurant fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "All Items" : "All Menu Items"}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              icon={
                <Badge badgeContent={categories.length} color="secondary">
                  <Category fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Categories" : "Manage Categories"}
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>

          {/* All Menu Items Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <MenuItemsGrid
                filteredItems={filteredItems}
                menuItems={menuItems}
                categories={categories}
                getCategoryName={getCategoryName}
                formatCurrency={formatCurrency}
                onToggleAvailability={handleToggleAvailability}
                onQuickImageUpload={handleQuickImageUpload}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
                onClearFilters={handleClearFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                vegFilter={vegFilter}
                setVegFilter={setVegFilter}
                availabilityFilter={availabilityFilter}
                setAvailabilityFilter={setAvailabilityFilter}
              />
            </Box>
          </TabPanel>

          {/* Manage Categories Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Categories List - Similar to Tables */}
              <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <Box sx={{ 
                  p: 3,
                  borderBottom: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Category sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                          Categories ({categories.length})
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          Organize your menu items into categories
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddCategory}
                      size="medium"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Add Category
                    </Button>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>
                  {categories.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3
                        }}
                      >
                        <Category sx={{ fontSize: 40, color: 'text.secondary' }} />
                      </Box>
                      
                      <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
                        No Categories Yet
                      </Typography>
                      
                      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: '500px', mx: 'auto' }}>
                        Start organizing your menu by creating your first category. Categories help customers navigate your menu more easily.
                      </Typography>

                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddCategory}
                        size="large"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Create Your First Category
                      </Button>
                    </Box>
                  ) : (
                    <List sx={{ p: 0, m: 0 }}>
                      {categories.map((category, index) => {
                        const itemCount = menuItems.filter(item => item.category === category.id).length;
                        
                        return (
                          <React.Fragment key={category.id}>
                            <ListItem
                              sx={{
                                py: 2.5,
                                px: 0,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: 'grey.50',
                                  transform: 'translateX(4px)',
                                  borderRadius: 2
                                }
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={3} sx={{ width: '100%' }}>
                                {/* Category Icon */}
                                <Box sx={{ position: 'relative' }}>
                                  <Avatar
                                    sx={{
                                      width: 64,
                                      height: 64,
                                      backgroundColor: 'primary.main',
                                      border: '3px solid',
                                      borderColor: 'grey.100',
                                      fontSize: '1.5rem',
                                      fontWeight: 700,
                                      color: 'white'
                                    }}
                                  >
                                    <Restaurant />
                                  </Avatar>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: -2,
                                      right: -2,
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      backgroundColor: 'success.main',
                                      border: '2px solid white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      color: 'white'
                                    }}
                                  >
                                    {itemCount}
                                  </Box>
                                </Box>

                                {/* Category Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="h6" 
                                    fontWeight="700" 
                                    sx={{ color: 'text.primary', mb: 0.5 }}
                                  >
                                    {category.name}
                                  </Typography>
                                  
                                  {category.description && (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.85rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        mb: 1
                                      }}
                                    >
                                      {category.description}
                                    </Typography>
                                  )}

                                  <Chip
                                    label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                </Box>

                                {/* Actions */}
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Edit Category">
                                    <IconButton 
                                      size="medium" 
                                      onClick={() => handleEditCategory(category)}
                                      sx={{ 
                                        backgroundColor: 'grey.100',
                                        color: 'text.secondary',
                                        '&:hover': { 
                                          backgroundColor: 'warning.50',
                                          color: 'warning.main',
                                          transform: 'scale(1.05)'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                      }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="Delete Category">
                                    <IconButton 
                                      size="medium" 
                                      onClick={() => handleDeleteCategory(category.id)}
                                      sx={{ 
                                        backgroundColor: 'grey.100',
                                        color: 'text.secondary',
                                        '&:hover': { 
                                          backgroundColor: 'error.50',
                                          color: 'error.main',
                                          transform: 'scale(1.05)'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            </ListItem>
                            {index < categories.length - 1 && (
                              <Divider sx={{ 
                                borderColor: 'grey.200',
                                mx: 0
                              }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Dialogs */}
        <MenuItemDialog
          open={openItemDialog}
          onClose={() => setOpenItemDialog(false)}
          onSave={handleSaveItem}
          item={editingItem}
          categories={categories}
          isMobile={isMobile}
        />

        <CategoryDialog
          open={openCategoryDialog}
          onClose={() => setOpenCategoryDialog(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
          isMobile={isMobile}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, type: 'item', id: '', name: '', loading: false })}
          onConfirm={deleteModal.type === 'item' ? confirmDeleteItem : confirmDeleteCategory}
          title={`Delete ${deleteModal.type === 'item' ? 'Menu Item' : 'Category'}`}
          itemName={deleteModal.name}
          itemType={deleteModal.type === 'item' ? 'menu item' : 'category'}
          description={
            deleteModal.type === 'item' 
              ? 'This menu item will be permanently removed from your restaurant\'s menu and will no longer be available for customers to order.'
              : 'This category will be permanently removed. Make sure no menu items are assigned to this category before deleting.'
          }
          loading={deleteModal.loading}
          additionalWarnings={
            deleteModal.type === 'item' 
              ? ['Any ongoing orders with this item may be affected', 'Item-specific analytics will be lost', 'Customer favorites may be impacted']
              : ['All menu items must be reassigned before deletion', 'Category-specific analytics will be lost', 'Menu organization will be affected']
          }
        />
      </Box>
    </Box>
  );
};

export default MenuManagement;