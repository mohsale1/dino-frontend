/**
 * Catalog Service
 * Handles API calls for category and item operations.
 * Base URL is /api/v1 — all paths here are relative to that.
 */

import { apiService } from '../../../utils/api';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import type {
  CatalogItem,
  Category,
  CatalogItemCreate,
  CatalogItemUpdate,
  CategoryCreate,
  CategoryUpdate,
} from '../types';

// ── DTOs sent to the backend ──────────────────────────────────────────────────

interface MenuCategoryCreateDTO {
  name: string;
  description?: string;
  venue_id?: string;
  is_active?: boolean;
  display_order?: number;
  icon?: string;
  color?: string;
}

interface MenuCategoryUpdateDTO {
  name?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
  icon?: string;
  color?: string;
}

interface MenuItemCreateDTO {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  venue_id?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: string;
  preparation_time?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

interface MenuItemUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: string;
  preparation_time?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ── Query param shapes ────────────────────────────────────────────────────────

interface CategoryQueryParams {
  venue_id?: string;
  is_active?: boolean;
}

interface ItemQueryParams {
  venue_id?: string;
  category_id?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  spice_level?: string;
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeCategory(raw: Record<string, unknown>): Category {
  return {
    ...(raw as unknown as Category),
    isActive: (raw.is_active ?? raw.isActive ?? true) as boolean,
    workspaceId: (raw.venue_id ?? raw.workspaceId ?? '') as string,
    displayOrder: (raw.display_order ?? raw.displayOrder) as number | undefined,
  };
}

function normalizeItem(raw: Record<string, unknown>): CatalogItem {
  return {
    ...(raw as unknown as CatalogItem),
    basePrice: Number(raw.price ?? raw.base_price ?? raw.basePrice ?? 0),
    categoryId: (raw.category_id ?? raw.categoryId ?? '') as string,
    workspaceId: (raw.venue_id ?? raw.workspaceId ?? '') as string,
    isAvailable: (raw.is_available ?? raw.isAvailable ?? true) as boolean,
    isVegetarian: (raw.is_vegetarian ?? raw.isVegetarian) as boolean | undefined,
    isVegan: (raw.is_vegan ?? raw.isVegan) as boolean | undefined,
    isGlutenFree: (raw.is_gluten_free ?? raw.isGlutenFree) as boolean | undefined,
    spiceLevel: (raw.spice_level ?? raw.spiceLevel) as CatalogItem['spiceLevel'],
    preparationTime: (raw.preparation_time ?? raw.preparationTime) as number | undefined,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

class CatalogService {
  private readonly categoriesBase = API_ENDPOINTS.APPLICATION.CATEGORIES.BASE;
  private readonly itemsBase = API_ENDPOINTS.APPLICATION.ITEMS.BASE;

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories(params?: CategoryQueryParams): Promise<Category[]> {
    const response = await apiService.get<unknown[]>(this.categoriesBase, { params });
    const raw: unknown[] = (response.data as unknown[]) ?? [];
    return raw.map((r) => normalizeCategory(r as Record<string, unknown>));
  }

  async getCategory(id: string): Promise<Category> {
    const response = await apiService.get<unknown>(API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id));
    return normalizeCategory(response.data as Record<string, unknown>);
  }

  async createCategory(data: CategoryCreate): Promise<Category> {
    const payload: MenuCategoryCreateDTO = {
      name: data.name,
      description: data.description,
      venue_id: data.workspaceId,
      is_active: data.isActive ?? true,
      display_order: data.displayOrder,
      icon: data.icon,
      color: data.color,
    };
    const response = await apiService.post<unknown>(this.categoriesBase, payload);
    return normalizeCategory(response.data as Record<string, unknown>);
  }

  async updateCategory(id: string, data: CategoryUpdate): Promise<Category> {
    const payload: MenuCategoryUpdateDTO = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    if (data.displayOrder !== undefined) payload.display_order = data.displayOrder;
    if (data.icon !== undefined) payload.icon = data.icon;
    if (data.color !== undefined) payload.color = data.color;

    const response = await apiService.put<unknown>(API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id), payload);
    return normalizeCategory(response.data as Record<string, unknown>);
  }

  async deleteCategory(id: string, force: boolean = false): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id), {
      params: force ? { force: true } : undefined,
    });
  }

  async restoreCategory(id: string): Promise<Category> {
    const response = await apiService.post<unknown>(API_ENDPOINTS.APPLICATION.CATEGORIES.RESTORE(id), null);
    return normalizeCategory(response.data as Record<string, unknown>);
  }

  async uploadCategoryImage(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiService.post<unknown>(
      `${API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id)}/image`,
      formData
    );
    const data = response.data as Record<string, unknown>;
    return (data?.image_url ?? data?.imageUrl ?? '') as string;
  }

  async toggleCategoryItemsAvailability(categoryId: string, isAvailable: boolean): Promise<void> {
    await apiService.put(
      API_ENDPOINTS.APPLICATION.CATEGORIES.AVAILABILITY(categoryId),
      null,
      { params: { is_available: isAvailable } }
    );
  }

  // ── Items ───────────────────────────────────────────────────────────────────

  async getItems(params?: ItemQueryParams): Promise<CatalogItem[]> {
    const response = await apiService.get<unknown[]>(this.itemsBase, { params });
    const raw: unknown[] = (response.data as unknown[]) ?? [];
    return raw.map((r) => normalizeItem(r as Record<string, unknown>));
  }

  async getItem(id: string): Promise<CatalogItem> {
    const response = await apiService.get<unknown>(API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id));
    return normalizeItem(response.data as Record<string, unknown>);
  }

  async createItem(data: CatalogItemCreate): Promise<CatalogItem> {
    const payload: MenuItemCreateDTO = {
      name: data.name,
      description: data.description,
      price: data.basePrice,
      category_id: data.categoryId,
      venue_id: data.workspaceId,
      is_available: data.isAvailable ?? true,
      is_vegetarian: data.isVegetarian,
      is_vegan: data.isVegan,
      is_gluten_free: data.isGlutenFree,
      spice_level: data.spiceLevel,
      preparation_time: data.preparationTime,
      tags: data.tags,
      metadata: data.metadata,
    };
    const response = await apiService.post<unknown>(this.itemsBase, payload);
    return normalizeItem(response.data as Record<string, unknown>);
  }

  async updateItem(id: string, data: CatalogItemUpdate): Promise<CatalogItem> {
    const payload: MenuItemUpdateDTO = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.basePrice !== undefined) payload.price = data.basePrice;
    if (data.categoryId !== undefined) payload.category_id = data.categoryId;
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;
    if (data.isVegetarian !== undefined) payload.is_vegetarian = data.isVegetarian;
    if (data.isVegan !== undefined) payload.is_vegan = data.isVegan;
    if (data.isGlutenFree !== undefined) payload.is_gluten_free = data.isGlutenFree;
    if (data.spiceLevel !== undefined) payload.spice_level = data.spiceLevel;
    if (data.preparationTime !== undefined) payload.preparation_time = data.preparationTime;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.metadata !== undefined) payload.metadata = data.metadata;

    const response = await apiService.put<unknown>(API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id), payload);
    return normalizeItem(response.data as Record<string, unknown>);
  }

  async deleteItem(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id));
  }

  async restoreItem(id: string): Promise<CatalogItem> {
    const response = await apiService.post<unknown>(API_ENDPOINTS.APPLICATION.ITEMS.RESTORE(id), null);
    return normalizeItem(response.data as Record<string, unknown>);
  }

  async uploadItemImage(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiService.post<unknown>(
      `${API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id)}/image`,
      formData
    );
    const data = response.data as Record<string, unknown>;
    return (data?.image_url ?? data?.imageUrl ?? '') as string;
  }

  async updateItemAvailability(id: string, isAvailable: boolean): Promise<CatalogItem> {
    const response = await apiService.put<unknown>(
      API_ENDPOINTS.APPLICATION.ITEMS.AVAILABILITY(id),
      null,
      { params: { is_available: isAvailable } }
    );
    return normalizeItem(response.data as Record<string, unknown>);
  }

  async bulkUpdateItemAvailability(itemIds: string[], isAvailable: boolean): Promise<void> {
    await apiService.post(
      API_ENDPOINTS.APPLICATION.ITEMS.BULK_AVAILABILITY,
      itemIds,
      { params: { is_available: isAvailable } }
    );
  }

  // ── Venue-scoped helpers (delegate to base endpoints with venue_id filter) ───

  async getVenueCategories(venueId: string): Promise<Category[]> {
    return this.getCategories({ venue_id: venueId });
  }

  async getVenueItems(venueId: string, categoryId?: string): Promise<CatalogItem[]> {
    return this.getItems({ venue_id: venueId, category_id: categoryId });
  }
}

export const catalogService = new CatalogService();
export default catalogService;
