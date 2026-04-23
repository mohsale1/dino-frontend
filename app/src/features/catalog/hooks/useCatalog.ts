/**
 * useCatalog Hook
 * Manages catalog items and categories state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '../services';
import type { CatalogItem, Category, CatalogItemCreate, CatalogItemUpdate, CategoryCreate, CategoryUpdate } from '../types';

export interface UseCatalogOptions {
  workspaceId: string;
  autoLoad?: boolean;
}

export interface UseCatalogResult {
  // Data
  items: CatalogItem[];
  categories: Category[];
  
  // Loading states
  loading: boolean;
  itemsLoading: boolean;
  categoriesLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Item operations
  loadItems: (categoryId?: string) => Promise<void>;
  createItem: (data: CatalogItemCreate) => Promise<void>;
  updateItem: (id: string, data: CatalogItemUpdate) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  uploadItemImage: (id: string, file: File) => Promise<void>;
  
  // Category operations
  loadCategories: () => Promise<void>;
  createCategory: (data: CategoryCreate) => Promise<void>;
  updateCategory: (id: string, data: CategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Utility
  getCategoryName: (categoryId: string) => string;
  refresh: () => Promise<void>;
}

export function useCatalog({ workspaceId, autoLoad = true }: UseCatalogOptions): UseCatalogResult {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!workspaceId) return;
    
    setCategoriesLoading(true);
    setError(null);
    
    try {
      const data = await catalogService.getCategories(workspaceId);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [workspaceId]);

  // Load items
  const loadItems = useCallback(async (categoryId?: string) => {
    if (!workspaceId) return;
    
    setItemsLoading(true);
    setError(null);
    
    try {
      const data = await catalogService.getCatalogItems(workspaceId, categoryId);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setItemsLoading(false);
    }
  }, [workspaceId]);

  // Create item
  const createItem = useCallback(async (data: CatalogItemCreate) => {
    setError(null);
    
    try {
      await catalogService.createCatalogItem(data);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
      throw err;
    }
  }, [loadItems]);

  // Update item
  const updateItem = useCallback(async (id: string, data: CatalogItemUpdate) => {
    setError(null);
    
    try {
      await catalogService.updateCatalogItem(id, data);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
      throw err;
    }
  }, [loadItems]);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await catalogService.deleteCatalogItem(id);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      throw err;
    }
  }, [loadItems]);

  // Toggle item availability
  const toggleItemAvailability = useCallback(async (id: string, isAvailable: boolean) => {
    setError(null);
    
    try {
      await catalogService.toggleItemAvailability(id, isAvailable);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle availability');
      throw err;
    }
  }, [loadItems]);

  // Upload item image
  const uploadItemImage = useCallback(async (id: string, file: File) => {
    setError(null);
    
    try {
      await catalogService.uploadItemImage(id, file);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      throw err;
    }
  }, [loadItems]);

  // Create category
  const createCategory = useCallback(async (data: CategoryCreate) => {
    setError(null);
    
    try {
      await catalogService.createCategory(data);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      throw err;
    }
  }, [loadCategories]);

  // Update category
  const updateCategory = useCallback(async (id: string, data: CategoryUpdate) => {
    setError(null);
    
    try {
      await catalogService.updateCategory(id, data);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      throw err;
    }
  }, [loadCategories]);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await catalogService.deleteCategory(id);
      await loadCategories();
      await loadItems(); // Reload items as they might be affected
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      throw err;
    }
  }, [loadCategories, loadItems]);

  // Get category name by ID
  const getCategoryName = useCallback((categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }, [categories]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadCategories(), loadItems()]);
    setLoading(false);
  }, [loadCategories, loadItems]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && workspaceId) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, workspaceId]); // Only run on mount or workspaceId change

  return {
    // Data
    items,
    categories,
    
    // Loading states
    loading: loading || itemsLoading || categoriesLoading,
    itemsLoading,
    categoriesLoading,
    
    // Error state
    error,
    
    // Item operations
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    uploadItemImage,
    
    // Category operations
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Utility
    getCategoryName,
    refresh,
  };
}

export default useCatalog;
