
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
  
  async getCategories(workspaceId: string, page: number = 1, pageSize: number = 100): Promise<Category[]> {
    const response = await apiService.get<Category[]>(this.categoriesUrl, {
      params: { 
        workspace_id: workspaceId,
        page,
        page_size: pageSize,
        order_by: 'created_at',
        order_direction: 'desc'
      },
    });
    return (response.data as any) || [];
  }

  async getCategory(id: string): Promise<Category> {
    const response = await apiService.get(`${this.categoriesUrl}/${id}`);
    return response.data as any;
  }

  async createCategory(data: CategoryCreate): Promise<Category> {
    const response = await apiService.post(this.categoriesUrl, {
      name: data.name,
      description: data.description,
      workspace_id: data.workspaceId,
      is_available: data.isActive ?? true,
    });
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
    await apiService.put(`${this.categoriesUrl}/${id}/restore`, {});
  }

  // ==================== Catalog Items ====================
  
  async getCatalogItems(workspaceId: string, categoryId?: string, page: number = 1, pageSize: number = 100): Promise<CatalogItem[]> {
    const params: any = {
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await apiService.get(this.itemsUrl, { params });
    return response.data as any || [];
  }

  async getCatalogItem(id: string): Promise<CatalogItem> {
    const response = await apiService.get(`${this.itemsUrl}/${id}`);
    return response.data as any;
  }

  async createCatalogItem(data: CatalogItemCreate): Promise<CatalogItem> {
    const response = await apiService.post(this.itemsUrl, {
      name: data.name,
      description: data.description,
      category_id: data.categoryId,
      workspace_id: data.workspaceId,
      price: data.basePrice,
      is_available: data.isAvailable ?? true,
      is_vegetarian: data.isVegetarian,
    });
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
    await apiService.put(`${this.itemsUrl}/${id}/restore`, {});
  }

  async toggleItemAvailability(id: string, isAvailable: boolean): Promise<CatalogItem> {
    const response = await apiService.put(`${this.itemsUrl}/${id}`, {
      is_available: isAvailable,
    });
    return response.data as any;
  }

  async uploadItemImage(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiService.post(`${this.itemsUrl}/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return (response.data as any)?.imageUrl || '';
  }
}

export const catalogService = new CatalogService();
export default catalogService;