/**
 * Catalog Service
 * Handles API calls for catalog (menu) operations
 */

import { apiService } from '../../../utils/api';
import type { CatalogItem, Category, CatalogItemCreate, CatalogItemUpdate, CategoryCreate, CategoryUpdate } from '../types';

class CatalogService {
  private categoriesUrl = '/application/categories';
  private itemsUrl = '/application/items';

  // ==================== Categories ====================

  async getCategories(
    workspaceId: string,
    page: number = 1,
    pageSize: number = 100,
    personaId?: number
  ): Promise<Category[]> {
    const params: any = {
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
    };

    if (personaId !== undefined) {
      params.persona_id = personaId;
    }

    const response = await apiService.get<Category[]>(this.categoriesUrl, { params });
    return (response.data as any) || [];
  }

  async getCategory(id: string): Promise<Category> {
    const response = await apiService.get(`${this.categoriesUrl}/${id}`);
    return response.data as any;
  }

  async createCategory(data: CategoryCreate): Promise<Category> {
    const payload: any = {
      name: data.name,
      description: data.description,
      is_available: data.isActive ?? true,
    };

    if ((data as any).personaId !== undefined) {
      payload.persona_id = (data as any).personaId;
    }

    const response = await apiService.post(this.categoriesUrl, payload);
    return response.data as any;
  }

  async updateCategory(id: string, data: CategoryUpdate): Promise<Category> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.is_available = data.isActive;

    const response = await apiService.put(`${this.categoriesUrl}/${id}`, payload);
    return response.data as any;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiService.delete(`${this.categoriesUrl}/${id}`);
  }

  async restoreCategory(id: string): Promise<void> {
    await apiService.post(`${this.categoriesUrl}/${id}/restore`, {});
  }

  // ==================== Catalog Items ====================

  async getCatalogItems(
    workspaceId: string,
    categoryId?: string,
    page: number = 1,
    pageSize: number = 100,
    personaId?: number
  ): Promise<CatalogItem[]> {
    const params: any = {
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
    };

    if (categoryId) {
      params.category_id = categoryId;
    }

    if (personaId !== undefined) {
      params.persona_id = personaId;
    }

    const response = await apiService.get(this.itemsUrl, { params });
    const raw: any[] = (response.data as any) || [];

    // Normalize: backend returns `price` but our type uses `basePrice`
    return raw.map((item: any) => ({
      ...item,
      basePrice: Number(item.basePrice ?? item.base_price ?? item.price ?? 0),
    }));
  }

  async getCatalogItem(id: string): Promise<CatalogItem> {
    const response = await apiService.get(`${this.itemsUrl}/${id}`);
    const item: any = response.data;
    return {
      ...item,
      basePrice: Number(item?.basePrice ?? item?.base_price ?? item?.price ?? 0),
    };
  }

  async createCatalogItem(data: CatalogItemCreate): Promise<CatalogItem> {
    const payload: any = {
      name: data.name,
      description: data.description,
      category_id: data.categoryId,
      price: data.basePrice,
      is_available: data.isAvailable ?? true,
      is_vegetarian: data.isVegetarian,
    };

    if ((data as any).personaId !== undefined) {
      payload.persona_id = (data as any).personaId;
    }

    const response = await apiService.post(this.itemsUrl, payload);
    return response.data as any;
  }

  async updateCatalogItem(id: string, data: CatalogItemUpdate): Promise<CatalogItem> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.categoryId !== undefined) payload.category_id = data.categoryId;
    if (data.basePrice !== undefined) payload.price = data.basePrice;
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;
    if (data.isVegetarian !== undefined) payload.is_vegetarian = data.isVegetarian;

    const response = await apiService.put(`${this.itemsUrl}/${id}`, payload);
    return response.data as any;
  }

  async deleteCatalogItem(id: string): Promise<void> {
    await apiService.delete(`${this.itemsUrl}/${id}`);
  }

  async restoreCatalogItem(id: string): Promise<void> {
    await apiService.post(`${this.itemsUrl}/${id}/restore`, {});
  }

  /**
   * Toggle item availability via the dedicated availability endpoint.
   * Uses PUT /items/{id}/availability with is_available in the request body.
   */
  async toggleItemAvailability(id: string, isAvailable: boolean): Promise<CatalogItem> {
    const response = await apiService.put(
      `${this.itemsUrl}/${id}/availability`,
      { is_available: isAvailable }
    );
    return response.data as any;
  }

  /**
   * Upload an item image.
   * Do NOT set Content-Type manually — the browser must set it automatically
   * with the correct multipart boundary when sending FormData.
   * Backend may return image_url (snake_case) or imageUrl (camelCase).
   */
  async uploadItemImage(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post(`${this.itemsUrl}/${id}/image`, formData);

    return (response.data as any)?.image_url || (response.data as any)?.imageUrl || '';
  }
}

export const catalogService = new CatalogService();
export default catalogService;
