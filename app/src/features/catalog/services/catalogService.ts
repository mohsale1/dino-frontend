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

interface CategoryCreateDTO {
  name: string;
  description?: string;
  persona_id: number;
  image_url?: string;
  is_available?: boolean;
}

interface CategoryUpdateDTO {
  name?: string;
  description?: string;
  image_url?: string;
  is_available?: boolean;
}

interface MenuItemCreateDTO {
  persona_id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image_url?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
}

interface MenuItemUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  image_url?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
}

// ── Query param shapes ────────────────────────────────────────────────────────

interface CategoryQueryParams {
  persona_id: number;
  is_available?: boolean;
  page?: number;
  page_size?: number;
}

interface ItemQueryParams {
  persona_id: number;
  category_id?: number;
  is_available?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

function normalizeCategory(raw: Record<string, unknown>): Category {
  return {
    id: String(raw.id),
    name: raw.name as string,
    description: raw.description as string | undefined,
    imageUrl: (raw.imageUrl ?? raw.image_url) as string | undefined,
    isAvailable: ((raw.isAvailable ?? raw.is_available) ?? true) as boolean,
    isActive: ((raw.isActive ?? raw.is_active) ?? true) as boolean,
    workspaceId: (raw.workspaceId ?? raw.workspace_id) as number,
    personaId: (raw.personaId ?? raw.persona_id) as number,
    createdAt: (raw.createdAt ?? raw.created_at) as string | undefined,
    updatedAt: (raw.updatedAt ?? raw.updated_at) as string | undefined,
  };
}


function normalizeItem(raw: Record<string, unknown>): CatalogItem {
  return {
    id: String(raw.id),
    name: raw.name as string,
    description: raw.description as string | undefined,
    basePrice: (raw.price ?? raw.basePrice) as number,
    categoryId: String(raw.categoryId ?? raw.category_id),
    workspaceId: (raw.workspaceId ?? raw.workspace_id) as number,
    personaId: (raw.personaId ?? raw.persona_id) as number,
    imageUrl: (raw.imageUrl ?? raw.image_url) as string | undefined,
    isAvailable: ((raw.isAvailable ?? raw.is_available) ?? true) as boolean,
    isVegetarian: (raw.isVegetarian ?? raw.is_vegetarian) as boolean | undefined,
    isActive: ((raw.isActive ?? raw.is_active) ?? true) as boolean,
    createdAt: (raw.createdAt ?? raw.created_at) as string | undefined,
    updatedAt: (raw.updatedAt ?? raw.updated_at) as string | undefined,
  };
}


// ── Service ───────────────────────────────────────────────────────────────────

class CatalogService {
  private readonly categoriesBase = API_ENDPOINTS.APPLICATION.CATEGORIES.BASE;
  private readonly itemsBase = API_ENDPOINTS.APPLICATION.ITEMS.BASE;

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories(params: CategoryQueryParams): Promise<Category[]> {
    const response = await apiService.get<unknown>(this.categoriesBase, { params });
    const body = response as unknown as { data: unknown[] };
    const raw: unknown[] = Array.isArray(body.data) ? body.data : [];
    return raw.map((r) => normalizeCategory(r as Record<string, unknown>));
  }

  async getCategory(id: string, personaId: number): Promise<Category> {
    const response = await apiService.get<unknown>(
      API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id),
      { params: { persona_id: personaId } }
    );
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeCategory(body.data);
  }

  async createCategory(data: CategoryCreate): Promise<Category> {
    const payload: CategoryCreateDTO = {
      name: data.name,
      description: data.description,
      persona_id: data.personaId,
      image_url: data.imageUrl,
      is_available: data.isAvailable ?? true,
    };
    const response = await apiService.post<unknown>(this.categoriesBase, payload);
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeCategory(body.data);
  }

  async updateCategory(id: string, personaId: number, data: CategoryUpdate): Promise<void> {
    const payload: CategoryUpdateDTO = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;

    await apiService.put<unknown>(
      API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id),
      payload,
      { params: { persona_id: personaId } }
    );
  }

  async deleteCategory(id: string, personaId: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.CATEGORIES.BY_ID(id), {
      params: { persona_id: personaId },
    });
  }

  async restoreCategory(id: string, personaId: number): Promise<void> {
    await apiService.post<unknown>(
      API_ENDPOINTS.APPLICATION.CATEGORIES.RESTORE(id),
      null,
      { params: { persona_id: personaId } }
    );
  }

  // ── Items ───────────────────────────────────────────────────────────────────

  async getItems(params: ItemQueryParams): Promise<CatalogItem[]> {
    const response = await apiService.get<unknown>(this.itemsBase, { params });
    const body = response as unknown as { data: unknown[] };
    const raw: unknown[] = Array.isArray(body.data) ? body.data : [];
    return raw.map((r) => normalizeItem(r as Record<string, unknown>));
  }

  async getItem(id: string, personaId: number): Promise<CatalogItem> {
    const response = await apiService.get<unknown>(
      API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id),
      { params: { persona_id: personaId } }
    );
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeItem(body.data);
  }

  async createItem(data: CatalogItemCreate): Promise<CatalogItem> {
    const payload: MenuItemCreateDTO = {
      persona_id: data.personaId,
      name: data.name,
      price: data.basePrice,
      category_id: Number(data.categoryId),
    };
    if (data.description !== undefined) payload.description = data.description;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;
    if (data.isVegetarian !== undefined) payload.is_vegetarian = data.isVegetarian;

    const response = await apiService.post<unknown>(this.itemsBase, payload);
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeItem(body.data);
  }

  async updateItem(id: string, personaId: number, data: CatalogItemUpdate): Promise<CatalogItem> {
    const payload: MenuItemUpdateDTO = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.basePrice !== undefined) payload.price = data.basePrice;
    if (data.categoryId !== undefined) payload.category_id = Number(data.categoryId);
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;
    if (data.isVegetarian !== undefined) payload.is_vegetarian = data.isVegetarian;

    const response = await apiService.put<unknown>(
      API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id),
      payload,
      { params: { persona_id: personaId } }
    );
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeItem(body.data);
  }

  async updateItemAvailability(id: string, personaId: number, isAvailable: boolean): Promise<CatalogItem> {
    const response = await apiService.put<unknown>(
      API_ENDPOINTS.APPLICATION.ITEMS.AVAILABILITY(id),
      { is_available: isAvailable },
      { params: { persona_id: personaId } }
    );
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeItem(body.data);
  }

  async deleteItem(id: string, personaId: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.ITEMS.BY_ID(id), {
      params: { persona_id: personaId },
    });
  }

  async restoreItem(id: string, personaId: number): Promise<CatalogItem> {
    const response = await apiService.post<unknown>(
      API_ENDPOINTS.APPLICATION.ITEMS.RESTORE(id),
      null,
      { params: { persona_id: personaId } }
    );
    const body = response as unknown as { data: Record<string, unknown> };
    return normalizeItem(body.data);
  }
}

export const catalogService = new CatalogService();
export default catalogService;