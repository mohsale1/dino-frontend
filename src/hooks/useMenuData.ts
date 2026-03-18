import { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/business';
import { venueService } from '../services/business';
import { tableService } from '../services/business';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { canUserAccessVenue, debugVenueAssignment } from '../utils/venueUtils';
import { Venue } from '../types/api';

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  calories?: number;
  spicyLevel?: number;
  isVeg?: boolean;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
  preparationTime: number;
  isAvailable: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  nutritionInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  allergens?: string[];
  customizations?: string[];
}

export interface CategoryType {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  icon?: string;
  color?: string;
  image?: string;
  itemCount?: number;
}

interface UseMenuDataOptions {
  venueId?: string;
  tableId?: string;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseMenuDataResult {
  // Data
  menuItems: MenuItemType[];
  categories: CategoryType[];
  restaurant: Venue | null;
  tableName: string;
  
  // Loading states
  loading: boolean;
  menuLoading: boolean;
  categoriesLoading: boolean;
  restaurantLoading: boolean;
  
  // Error states
  error: string | null;
  venueNotAcceptingOrders: {
    show: boolean;
    venueName?: string;
    venueStatus?: string;
    message?: string;
  };
  
  // Actions
  refetch: () => Promise<void>;
  refreshMenu: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshRestaurant: () => Promise<void>;
}

export function useMenuData(options: UseMenuDataOptions = {}): UseMenuDataResult {
  const {
    venueId,
    tableId,
    enableAutoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const { user } = useAuth();
  const { userData } = useUserData();

  // Local state
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [restaurant, setRestaurant] = useState<Venue | null>(null);
  const [tableName, setTableName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venueNotAcceptingOrders, setVenueNotAcceptingOrders] = useState<{
    show: boolean;
    venueName?: string;
    venueStatus?: string;
    message?: string;
  }>({ show: false });
  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('starter') || name.includes('appetizer')) return '🥗';
    if (name.includes('main') || name.includes('curry')) return '🍛';
    if (name.includes('dessert') || name.includes('sweet')) return '🍰';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('noodle') || name.includes('pasta')) return '🍜';
    if (name.includes('rice')) return '🍚';
    if (name.includes('bread') || name.includes('roti')) return '🍞';
    return '🍽️';
  };

  // Handle menu loading errors
  const handleMenuError = useCallback((err: any) => {
    console.error('Menu loading error:', err);
    setError(err?.message || 'Failed to load menu data');
  }, []);

  // Load restaurant data and check venue status
  // Returns true if venue is accepting orders, false otherwise
  const loadRestaurant = useCallback(async (): Promise<boolean> => {
    if (!venueId) return false;
    setRestaurantLoading(true);
    
    try {
      const venueData = await venueService.getPublicVenue(venueId);
      
      if (venueData) {
        setRestaurant(venueData);
        
        console.log('[useMenuData] Venue data loaded:', {
          name: venueData.name,
          isActive: venueData.isActive,
          is_open: (venueData as any).is_open,
          isOpen: (venueData as any).isOpen,
        });
        
        // Check if venue is active first (required field)
        if (venueData.isActive === false) {
          console.log('[useMenuData] Venue is inactive');
          setVenueNotAcceptingOrders({
            show: true,
            venueName: venueData.name,
            venueStatus: 'inactive',
            message: 'This venue is currently not accepting orders. Please try again later.'
          });
          setRestaurantLoading(false);
          return false;
        }
        
        // Check if venue is open for orders (optional field - default to true if not set)
        // Handle both is_open (from API) and isOpen (normalized)
        const isOpen = (venueData as any).is_open ?? (venueData as any).isOpen ?? true;
        console.log('[useMenuData] Venue is_open status:', isOpen);
        
        if (isOpen === false) {
          console.log('[useMenuData] Venue is closed for orders');
          setVenueNotAcceptingOrders({
            show: true,
            venueName: venueData.name,
            venueStatus: 'closed',
            message: 'This venue is not serving at the moment. Please check back during operating hours.'
          });
          setRestaurantLoading(false);
          return false;
        }
        
        console.log('[useMenuData] Venue is available for orders');
        setRestaurantLoading(false);
        return true;
      } else {
        setError('Restaurant not found. Please check the QR code or link.');
        setRestaurantLoading(false);
        return false;
      }
    } catch (err: any) {
      setError('Restaurant not found. Please check the QR code or link.');
      setRestaurantLoading(false);
      return false;
    }
  }, [venueId]);

  // Load categories data
  const loadCategories = useCallback(async () => {
    if (!venueId) return;
    
    setCategoriesLoading(true);
    
    try {
      const categoriesData = await menuService.getVenueCategories(venueId, tableId);
      
      const mappedCategories: CategoryType[] = categoriesData.map((cat: any, index: number) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        order: index + 1,
        active: cat.isActive,
        icon: getCategoryIcon(cat.name),
        itemCount: 0, // Will be calculated after menu items are loaded
      }));
      
      setCategories(mappedCategories);
    } catch (err: any) {
      // Handle specific error types
      if (err.type === 'venue_not_accepting_orders') {
        setVenueNotAcceptingOrders({
          show: true,
          venueName: err.venueName,
          message: err.message
        });
      } else {
        handleMenuError(err);
      }
    } finally {
      setCategoriesLoading(false);
    }
  }, [venueId, tableId, handleMenuError]);

  // Load menu items data
  const loadMenuItems = useCallback(async () => {
    if (!venueId) return;
    
    setMenuLoading(true);
    
    try {
      const menuData = await menuService.getVenueMenuItems(venueId, undefined, tableId);
      
      const mappedMenuItems: MenuItemType[] = menuData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.base_price,
        category: item.category_id, // This maps to the category ID
        image: item.image_urls?.[0] || '',
        isAvailable: item.is_available,
        preparationTime: item.preparation_time_minutes || 15,
        calories: item.calories || undefined,
        spicyLevel: item.spice_level === 'mild' ? 1 : item.spice_level === 'medium' ? 2 : item.spice_level === 'hot' ? 3 : 0,
        isVeg: item.is_vegetarian || false,
        rating: item.average_rating || undefined,
        reviewCount: item.rating_count || 0,
        isPopular: item.is_popular || false,
        isNew: item.is_new || false,
        isTrending: item.is_trending || false,
        originalPrice: item.original_price || undefined,
        discount: item.discount_percentage || undefined,
        nutritionInfo: item.nutrition_info ? {
          protein: item.nutrition_info.protein || undefined,
          carbs: item.nutrition_info.carbs || undefined,
          fat: item.nutrition_info.fat || undefined,
        } : undefined,
        allergens: item.allergens || [],
        customizations: item.customizations || [],
      }));
      
      setMenuItems(mappedMenuItems);
      
      // Update category item counts
      setCategories(prev => prev.map(category => ({
        ...category,
        itemCount: mappedMenuItems.filter(item => item.category === category.id).length,
      })));
    } catch (err: any) {
      // Handle specific error types
      if (err.type === 'venue_not_accepting_orders') {
        setVenueNotAcceptingOrders({
          show: true,
          venueName: err.venueName,
          message: err.message
        });
      } else {
        handleMenuError(err);
      }
    } finally {
      setMenuLoading(false);
    }
  }, [venueId, tableId, handleMenuError]);

  // Load table information
  const loadTable = useCallback(async () => {
    if (!tableId) return;
    
    try {
      const tableData = await tableService.getTable(tableId);
      if (tableData) {
        setTableName(tableData.table_number || tableData.id);
      } else {
        setTableName(tableId);
      }
    } catch (tableError) {
      console.error('Error loading table:', tableError);
      setTableName(tableId);
    }
  }, [tableId]);

  // Load all data - check venue status first
  const loadAllData = useCallback(async () => {
    if (!venueId) return;
    
    setLoading(true);
    setError(null);
    setVenueNotAcceptingOrders({ show: false });
    
    try {
      // First, load restaurant and check status
      const isVenueAcceptingOrders = await loadRestaurant();
      
      // If venue is not accepting orders, stop loading other data
      if (!isVenueAcceptingOrders) {
        console.log('[useMenuData] Venue not accepting orders, stopping data load');
        setLoading(false);
        return;
      }
      
      // Load other data in parallel
      await Promise.all([
        loadCategories(),
        loadMenuItems(),
        loadTable(),
      ]);
    } catch (err) {
      // Error handling is done in individual load functions
      console.error('Error loading menu data:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, loadRestaurant, loadCategories, loadMenuItems, loadTable]);

  // Initial load - only trigger on venueId change
  useEffect(() => {
    if (venueId) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]); // Only re-run when venueId changes

  // Validate venue access
  useEffect(() => {
    if (venueId && user && userData) {
      debugVenueAssignment(userData, user, 'useMenuDataSimple');
      
      if (!canUserAccessVenue(userData, user, venueId)) {
        console.warn('User does not have access to this venue');
      }
    }
  }, [venueId, user, userData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!enableAutoRefresh || !venueId) return;

    const interval = setInterval(() => {
      loadMenuItems();
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableAutoRefresh, venueId, refreshInterval]); // Don't include loadMenuItems to prevent re-creating interval

  // Update overall loading state
  useEffect(() => {
    const isLoading = restaurantLoading || categoriesLoading || menuLoading;
    setLoading(isLoading);
  }, [restaurantLoading, categoriesLoading, menuLoading]); // Only depend on loading states

  // Refetch functions
  const refetch = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshMenu = useCallback(async () => {
    await loadMenuItems();
  }, [loadMenuItems]);

  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  const refreshRestaurant = useCallback(async () => {
    await loadRestaurant();
  }, [loadRestaurant]);

  return {
    // Data
    menuItems,
    categories,
    restaurant,
    tableName,
    
    // Loading states
    loading,
    menuLoading,
    categoriesLoading,
    restaurantLoading,
    
    // Error states
    error,
    venueNotAcceptingOrders,
    
    // Actions
    refetch,
    refreshMenu,
    refreshCategories,
    refreshRestaurant,
  };
}

export default useMenuData;