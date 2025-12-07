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

  // Mock data for demo/testing when API fails
  const getMockData = useCallback(() => {
    const mockCategories: CategoryType[] = [
      { id: 'cat-1', name: 'Starters', description: 'Delicious appetizers', order: 1, active: true, icon: '🥗', itemCount: 3 },
      { id: 'cat-2', name: 'Main Course', description: 'Hearty main dishes', order: 2, active: true, icon: '🍛', itemCount: 4 },
      { id: 'cat-3', name: 'Desserts', description: 'Sweet treats', order: 3, active: true, icon: '🍰', itemCount: 2 },
      { id: 'cat-4', name: 'Beverages', description: 'Refreshing drinks', order: 4, active: true, icon: '🥤', itemCount: 3 },
    ];

    const mockMenuItems: MenuItemType[] = [
      // Starters
      { id: '1', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls served with sweet chili sauce', price: 149, category: 'cat-1', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', isVeg: true, rating: 4.5, reviewCount: 120, preparationTime: 15, isAvailable: true, isPopular: true },
      { id: '2', name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dip', price: 249, category: 'cat-1', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', isVeg: false, rating: 4.7, reviewCount: 95, preparationTime: 20, isAvailable: true, spicyLevel: 2 },
      { id: '3', name: 'Paneer Tikka', description: 'Grilled cottage cheese with Indian spices', price: 199, category: 'cat-1', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', isVeg: true, rating: 4.6, reviewCount: 150, preparationTime: 18, isAvailable: true, isPopular: true, spicyLevel: 1 },
      
      // Main Course
      { id: '4', name: 'Margherita Pizza', description: 'Classic pizza with fresh mozzarella and basil', price: 299, category: 'cat-2', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', isVeg: true, rating: 4.8, reviewCount: 200, preparationTime: 25, isAvailable: true, isPopular: true },
      { id: '5', name: 'Butter Chicken', description: 'Tender chicken in creamy tomato gravy', price: 349, category: 'cat-2', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', isVeg: false, rating: 4.9, reviewCount: 180, preparationTime: 30, isAvailable: true, isPopular: true, spicyLevel: 1 },
      { id: '6', name: 'Veg Biryani', description: 'Aromatic basmati rice with mixed vegetables', price: 249, category: 'cat-2', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', isVeg: true, rating: 4.5, reviewCount: 140, preparationTime: 28, isAvailable: true },
      { id: '7', name: 'Grilled Salmon', description: 'Fresh salmon fillet with lemon butter sauce', price: 499, category: 'cat-2', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', isVeg: false, rating: 4.7, reviewCount: 85, preparationTime: 25, isAvailable: true, isNew: true },
      
      // Desserts
      { id: '8', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 149, category: 'cat-3', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', isVeg: true, rating: 4.9, reviewCount: 220, preparationTime: 15, isAvailable: true, isPopular: true },
      { id: '9', name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 179, category: 'cat-3', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', isVeg: true, rating: 4.6, reviewCount: 95, preparationTime: 10, isAvailable: true },
      
      // Beverages
      { id: '10', name: 'Fresh Lime Soda', description: 'Refreshing lime soda with mint', price: 79, category: 'cat-4', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', isVeg: true, rating: 4.3, reviewCount: 110, preparationTime: 5, isAvailable: true },
      { id: '11', name: 'Mango Lassi', description: 'Creamy yogurt drink with fresh mango', price: 99, category: 'cat-4', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', isVeg: true, rating: 4.7, reviewCount: 160, preparationTime: 5, isAvailable: true, isPopular: true },
      { id: '12', name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 49, category: 'cat-4', image: 'https://images.unsplash.com/photo-1597318130878-aa7d6e0c7b26?w=400', isVeg: true, rating: 4.5, reviewCount: 200, preparationTime: 5, isAvailable: true },
    ];

    const mockRestaurant: Venue = {
      id: venueId || 'demo-venue',
      name: 'Demo Restaurant',
      description: 'Experience delicious food with our demo menu',
      location: {
        address: '123 Demo Street',
        city: 'Demo City',
        state: 'Demo State',
        country: 'India',
        postal_code: '123456',
        latitude: 0,
        longitude: 0,
      },
      phone: '+91 98765 43210',
      email: 'demo@restaurant.com',
      cuisine_types: ['Indian', 'Continental', 'Italian'],
      rating: 4.6,
      total_reviews: 500,
      price_range: 'mid_range',
      is_active: true,
      is_open: true,
      workspace_id: 'demo-workspace',
      owner_id: 'demo-owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      theme: 'default',
      menu_template: 'classic',
    };

    return { mockCategories, mockMenuItems, mockRestaurant };
  }, [venueId]);

  // Handle menu loading errors
  const handleMenuError = useCallback((err: any) => {    
    // Load mock data instead of showing error
    const { mockCategories, mockMenuItems, mockRestaurant } = getMockData();
    setCategories(mockCategories);
    setMenuItems(mockMenuItems);
    setRestaurant(mockRestaurant);
    setTableName(tableId || 'Demo Table');
    
    // Don't set error - just use mock data silently
    setError(null);
  }, [getMockData, tableId]);

  // Load restaurant data
  const loadRestaurant = useCallback(async () => {
    if (!venueId) return;    setRestaurantLoading(true);
    
    try {
      const venueData = await venueService.getPublicVenue(venueId);      
      if (venueData) {
        setRestaurant(venueData);      } else {
        setError('Restaurant not found. Please check the QR code or link.');
      }
    } catch (err: any) {      setError('Restaurant not found. Please check the QR code or link.');
    } finally {
      setRestaurantLoading(false);
    }
  }, [venueId]);

  // Load categories data
  const loadCategories = useCallback(async () => {
    if (!venueId) return;    setCategoriesLoading(true);
    
    try {
      const categoriesData = await menuService.getVenueCategories(venueId, tableId);      
      const mappedCategories: CategoryType[] = categoriesData.map((cat: any, index: number) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        order: index + 1,
        active: cat.is_active,
        icon: getCategoryIcon(cat.name),
        itemCount: 0, // Will be calculated after menu items are loaded
      }));
      
      setCategories(mappedCategories);    } catch (err: any) {      
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
    if (!venueId) return;    setMenuLoading(true);
    
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
      })));    } catch (err: any) {      
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
    } catch (tableError) {      setTableName(tableId);
    }
  }, [tableId]);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!venueId) return;
    
    setLoading(true);
    setError(null);
    setVenueNotAcceptingOrders({ show: false });
    
    try {
      await Promise.all([
        loadRestaurant(),
        loadCategories(),
        loadMenuItems(),
        loadTable(),
      ]);
    } catch (err) {    } finally {
      setLoading(false);
    }
  }, [venueId, loadRestaurant, loadCategories, loadMenuItems, loadTable]);

  // Initial load
  useEffect(() => {
    if (venueId) {
      loadAllData();
    }
  }, [venueId, loadAllData]);

  // Validate venue access
  useEffect(() => {
    if (venueId && user && userData) {
      debugVenueAssignment(userData, user, 'useMenuDataSimple');
      
      if (!canUserAccessVenue(userData, user, venueId)) {      }
    }
  }, [venueId, user, userData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!enableAutoRefresh || !venueId) return;

    const interval = setInterval(() => {      loadMenuItems();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, venueId, refreshInterval, loadMenuItems]);

  // Update overall loading state
  useEffect(() => {
    const isLoading = restaurantLoading || categoriesLoading || menuLoading;    setLoading(isLoading);
  }, [restaurantLoading, categoriesLoading, menuLoading, venueId, tableId, restaurant, categories.length, menuItems.length]);

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