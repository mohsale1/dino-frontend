/**
 * useCatalog Hook
 * Manages catalog items and categories state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '../services';
import type { CatalogItem, Category, CatalogItemCreate, CatalogItemUpdate, CategoryCreate, CategoryUpdate } from '../types';

export interface UseCatalogOptions {
  workspaceId: string;
  personaId?: number;
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

  // Category operations
  loadCategories: () => Promise<void>;
  createCategory: (data: CategoryCreate) => Promise<void>;
  updateCategory: (id: string, data: CategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Utility
  getCategoryName: (categoryId: string) => string;
  refresh: () => Promise<void>;
}

export function useCatalog({ personaId, autoLoad = true }: UseCatalogOptions): UseCatalogResult {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories — requires personaId
  const loadCategories = useCallback(async () => {
    if (!personaId) return;

    setCategoriesLoading(true);
    setError(null);

    try {
      const data = await catalogService.getCategories({ persona_id: personaId });
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, [personaId]);

  // Load items — requires personaId
  const loadItems = useCallback(async (categoryId?: string) => {
    if (!personaId) return;

    setItemsLoading(true);
    setError(null);

    try {
      const params: { persona_id: number; category_id?: number } = { persona_id: personaId };
      if (categoryId) params.category_id = Number(categoryId);
      const data = await catalogService.getItems(params);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
    } finally {
      setItemsLoading(false);
    }
  }, [personaId]);

  // Create item
  const createItem = useCallback(async (data: CatalogItemCreate) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.createItem({ ...data, personaId });
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
      throw err;
    }
  }, [personaId, loadItems]);

  // Update item
  const updateItem = useCallback(async (id: string, data: CatalogItemUpdate) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.updateItem(id, personaId, data);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
      throw err;
    }
  }, [personaId, loadItems]);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.deleteItem(id, personaId);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      throw err;
    }
  }, [personaId, loadItems]);

  // Toggle item availability
  const toggleItemAvailability = useCallback(async (id: string, isAvailable: boolean) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.updateItemAvailability(id, personaId, isAvailable);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle availability');
      throw err;
    }
  }, [personaId, loadItems]);

  // Create category — requires personaId
  const createCategory = useCallback(async (data: CategoryCreate) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.createCategory({ ...data, personaId });
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      throw err;
    }
  }, [personaId, loadCategories]);

  // Update category — requires personaId
  const updateCategory = useCallback(async (id: string, data: CategoryUpdate) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.updateCategory(id, personaId, data);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      throw err;
    }
  }, [personaId, loadCategories]);

  // Delete category — requires personaId
  const deleteCategory = useCallback(async (id: string) => {
    if (!personaId) return;
    setError(null);

    try {
      await catalogService.deleteCategory(id, personaId);
      await loadCategories();
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      throw err;
    }
  }, [personaId, loadCategories, loadItems]);

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

  // Auto-load on mount or when personaId changes
  useEffect(() => {
    if (autoLoad && personaId) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, personaId]);

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