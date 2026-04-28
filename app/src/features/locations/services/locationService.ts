/**
 * Location Service
 * Handles API calls for area and table operations.
 * Base URL: /api/v1 (set in apiService) — paths here are relative to that base.
 * Areas: /application/areas/*
 * Tables: /application/tables/*
 */

import { apiService } from '../../../utils/api';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import type {
  ServiceLocation,
  ServiceArea,
  ServiceLocationCreate,
  ServiceLocationUpdate,
  ServiceAreaCreate,
  ServiceAreaUpdate,
} from '../types';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'out_of_service';

export interface QRCodeResponse {
  qr_code: string;
  qr_code_url?: string;
}

class LocationService {
  private readonly areasBase = API_ENDPOINTS.APPLICATION.AREAS.BASE;
  private readonly tablesBase = API_ENDPOINTS.APPLICATION.TABLES.BASE;

  // ==================== Areas ====================

  async getVenueAreas(venueId: string): Promise<ServiceArea[]> {
    const response = await apiService.get(this.areasBase, {
      params: { venue_id: venueId },
    });
    return (response.data as any) ?? [];
  }

  async getArea(areaId: string): Promise<ServiceArea> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.AREAS.BY_ID(areaId));
    return response.data as any;
  }

  async createArea(data: ServiceAreaCreate): Promise<ServiceArea> {
    const response = await apiService.post(this.areasBase, {
      venue_id: data.workspaceId,
      name: data.name,
      description: data.description,
      active: data.isActive ?? true,
    });
    return response.data as any;
  }

  async updateArea(areaId: string, data: ServiceAreaUpdate): Promise<ServiceArea> {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.active = data.isActive;

    const response = await apiService.put(API_ENDPOINTS.APPLICATION.AREAS.BY_ID(areaId), payload);
    return response.data as any;
  }

  async deleteArea(areaId: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.AREAS.BY_ID(areaId));
  }

  // ==================== Tables ====================

  async getTables(params?: {
    venue_id?: string;
    area_id?: string;
    table_status?: TableStatus;
    is_active?: boolean;
  }): Promise<ServiceLocation[]> {
    const response = await apiService.get(this.tablesBase, { params });
    return (response.data as any) ?? [];
  }

  async getVenueTables(venueId: string, status?: TableStatus): Promise<ServiceLocation[]> {
    const response = await apiService.get(this.tablesBase, {
      params: { venue_id: venueId, ...(status ? { status } : {}) },
    });
    return (response.data as any) ?? [];
  }

  async getTable(id: string): Promise<ServiceLocation> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.TABLES.BY_ID(id));
    return response.data as any;
  }

  async createTable(data: ServiceLocationCreate): Promise<ServiceLocation> {
    const payload: Record<string, any> = {
      venue_id: data.workspaceId,
      table_number: data.identifier,
      capacity: data.capacity ?? 4,
    };
    if (data.areaId !== undefined) payload.area_id = data.areaId;

    const response = await apiService.post(this.tablesBase, payload);
    return response.data as any;
  }

  async updateTable(id: string, data: ServiceLocationUpdate): Promise<ServiceLocation> {
    const payload: Record<string, any> = {};
    if (data.identifier !== undefined) payload.table_number = data.identifier;
    if (data.areaId !== undefined) payload.area_id = data.areaId;
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const response = await apiService.put(API_ENDPOINTS.APPLICATION.TABLES.BY_ID(id), payload);
    return response.data as any;
  }

  async deleteTable(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.TABLES.BY_ID(id));
  }

  async updateTableStatus(id: string, newStatus: TableStatus): Promise<ServiceLocation> {
    const response = await apiService.put(API_ENDPOINTS.APPLICATION.TABLES.STATUS(id), {
      new_status: newStatus,
    });
    return response.data as any;
  }

  // ==================== QR Codes ====================

  async getQRCode(id: string): Promise<QRCodeResponse> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.TABLES.QR_CODE(id));
    return response.data as any;
  }
}

export const locationService = new LocationService();
export default locationService;
