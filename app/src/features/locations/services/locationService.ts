/**
 * Location Service
 * Handles API calls for service location (table) and area operations
 */

import { apiService } from '../../../utils/api';
import type { ServiceLocation, ServiceArea, ServiceLocationCreate, ServiceLocationUpdate, ServiceAreaCreate, ServiceAreaUpdate } from '../types';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'out_of_service';

class LocationService {
  private tablesUrl = '/application/tables';
  private areasUrl = '/application/areas';

  // ==================== Service Areas ====================

  async getAreas(workspaceId: string, page: number = 1, pageSize: number = 100): Promise<ServiceArea[]> {
    const response = await apiService.get(this.areasUrl, {
      params: {
        workspace_id: workspaceId,
        page,
        page_size: pageSize,
        order_by: 'created_at',
        order_direction: 'desc',
      },
    });
    return (response.data as any) || [];
  }

  async getArea(id: string): Promise<ServiceArea> {
    const response = await apiService.get(`${this.areasUrl}/${id}`);
    return response.data as any;
  }

  async createArea(data: ServiceAreaCreate): Promise<ServiceArea> {
    // workspace_id is injected from JWT — do NOT send in body
    const response = await apiService.post(this.areasUrl, {
      name: data.name,
      description: data.description,
      is_available: data.isActive ?? true,
    });
    return response.data as any;
  }

  async updateArea(id: string, data: ServiceAreaUpdate): Promise<ServiceArea> {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.is_available = data.isActive;

    const response = await apiService.put(`${this.areasUrl}/${id}`, payload);
    return response.data as any;
  }

  async deleteArea(id: string): Promise<void> {
    await apiService.delete(`${this.areasUrl}/${id}`);
  }

  async restoreArea(id: string): Promise<void> {
    // Restore uses POST, not PUT
    await apiService.post(`${this.areasUrl}/${id}/restore`, {});
  }

  // ==================== Service Locations (Tables) ====================

  async getLocations(workspaceId: string, areaId?: string, page: number = 1, pageSize: number = 100): Promise<ServiceLocation[]> {
    const params: Record<string, any> = {
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc',
    };

    if (areaId) {
      params.area_id = areaId;
    }

    const response = await apiService.get(this.tablesUrl, { params });
    return (response.data as any) || [];
  }

  async getLocation(id: string): Promise<ServiceLocation> {
    const response = await apiService.get(`${this.tablesUrl}/${id}`);
    return response.data as any;
  }

  async createLocation(data: ServiceLocationCreate): Promise<ServiceLocation> {
    // workspace_id is injected from JWT — do NOT send in body
    // area_id is required by the backend
    const response = await apiService.post(this.tablesUrl, {
      table_number: data.identifier || data.name,
      area_id: data.areaId,
      capacity: data.capacity ?? 4,
      status: data.status || 'available',
      display_order: 0,
    });
    return response.data as any;
  }

  async updateLocation(id: string, data: ServiceLocationUpdate): Promise<ServiceLocation> {
    const payload: Record<string, any> = {};
    if (data.identifier !== undefined || data.name !== undefined) {
      payload.table_number = data.identifier || data.name;
    }
    if (data.areaId !== undefined) payload.area_id = data.areaId;
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.status !== undefined) payload.status = data.status;

    const response = await apiService.put(`${this.tablesUrl}/${id}`, payload);
    return response.data as any;
  }

  async deleteLocation(id: string): Promise<void> {
    await apiService.delete(`${this.tablesUrl}/${id}`);
  }

  async restoreLocation(id: string): Promise<void> {
    // Restore uses POST, not PUT
    await apiService.post(`${this.tablesUrl}/${id}/restore`, {});
  }

  /**
   * Update table status via the dedicated status endpoint.
   * Backend expects PUT /tables/{id}/status with body { status: string }.
   * Valid values: 'available' | 'occupied' | 'reserved' | 'out_of_service'
   * NOTE: 'maintenance' is NOT a valid backend value — use 'out_of_service' instead.
   */
  async updateLocationStatus(id: string, status: TableStatus): Promise<ServiceLocation> {
    const response = await apiService.put(`${this.tablesUrl}/${id}/status`, { status });
    return response.data as any;
  }

  /**
   * Generate a QR code URL for a table.
   * The backend does not expose a dedicated QR generation endpoint.
   * The public menu URL pattern is: /{workspace_id}/{table_id}/menu
   * We retrieve the table to get its workspace context, then construct the URL.
   */
  async generateQRCode(id: string, workspaceId: string): Promise<string> {
    return `/${workspaceId}/${id}/menu`;
  }

  /**
   * Download and trigger a browser save of the QR code PDF.
   * Revokes the object URL after use to prevent memory leaks.
   */
  async printQRCode(id: string): Promise<void> {
    const response = await apiService.get(`${this.tablesUrl}/${id}/qr-code/print`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data as any]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `qr-code-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const locationService = new LocationService();
export default locationService;
