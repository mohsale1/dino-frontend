/**
 * Location Service
 * Handles API calls for service location (table) operations
 */

import { apiService } from '../../../utils/api';
import type { ServiceLocation, ServiceArea, ServiceLocationCreate, ServiceLocationUpdate, ServiceAreaCreate, ServiceAreaUpdate } from '../types';

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
        order_direction: 'desc'
      },
    });
    return response.data as any || [];
  }

  async getArea(id: string): Promise<ServiceArea> {
    const response = await apiService.get(`${this.areasUrl}/${id}`);
    return response.data as any;
  }

  async createArea(data: ServiceAreaCreate): Promise<ServiceArea> {
    const response = await apiService.post(this.areasUrl, {
      name: data.name,
      description: data.description,
      workspace_id: data.workspaceId,
      is_available: data.isActive ?? true,
    });
    return response.data as any;
  }

  async updateArea(id: string, data: ServiceAreaUpdate): Promise<ServiceArea> {
    const payload: any = {};
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
    await apiService.put(`${this.areasUrl}/${id}/restore`, {});
  }

  // ==================== Service Locations (Tables) ====================
  
  async getLocations(workspaceId: string, areaId?: string, page: number = 1, pageSize: number = 100): Promise<ServiceLocation[]> {
    const params: any = {
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc'
    };
    
    if (areaId) {
      params.area_id = areaId;
    }
    
    const response = await apiService.get(this.tablesUrl, { params });
    return response.data as any || [];
  }

  async getLocation(id: string): Promise<ServiceLocation> {
    const response = await apiService.get(`${this.tablesUrl}/${id}`);
    return response.data as any;
  }

  async createLocation(data: ServiceLocationCreate): Promise<ServiceLocation> {
    const response = await apiService.post(this.tablesUrl, {
      table_number: data.identifier || data.name,
      area_id: data.areaId,
      workspace_id: data.workspaceId,
      capacity: data.capacity || 4,
      status: data.status || 'available',
    });
    return response.data as any;
  }

  async updateLocation(id: string, data: ServiceLocationUpdate): Promise<ServiceLocation> {
    const payload: any = {};
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
    await apiService.put(`${this.tablesUrl}/${id}/restore`, {});
  }

  /**
   * Update table status via the dedicated status endpoint.
   * Passes table_status as a query param as expected by the backend.
   */
  async updateLocationStatus(id: string, status: string): Promise<ServiceLocation> {
    const response = await apiService.put(
      `${this.tablesUrl}/${id}/status`,
      {},
      { params: { table_status: status } }
    );
    return response.data as any;
  }

  /**
   * Generate a QR code for a table.
   * Backend may return qr_code_url (snake_case) or qrCodeUrl (camelCase).
   */
  async generateQRCode(id: string): Promise<string> {
    const response = await apiService.post(`${this.tablesUrl}/${id}/qr-code`);
    return (response.data as any)?.qr_code_url || (response.data as any)?.qrCodeUrl || '';
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