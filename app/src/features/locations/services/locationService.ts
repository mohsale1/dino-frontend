/*
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
} from '../types';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'out_of_service';

export interface QRCodeResponse {
  qr_code: string;
  qr_code_url?: string;
}

export interface TableSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  out_of_service: number;
}

// Inline request types aligned with the backend API
interface AreaCreatePayload {
  name: string;
  persona_id: number;
  description?: string;
  is_available?: boolean;
}

interface AreaUpdatePayload {
  name?: string;
  description?: string;
  is_available?: boolean;
}

interface TableCreatePayload {
  table_number: string | number;
  area_id: string | number;
  capacity?: number;
  status?: TableStatus;
  display_order?: number;
}

interface TableUpdatePayload {
  table_number?: string | number;
  area_id?: string | number;
  capacity?: number;
  status?: TableStatus;
  display_order?: number;
}

interface GetTablesParams {
  area_id?: string | number;
  status?: TableStatus;
  page?: number;
  page_size?: number;
}

class LocationService {
  private readonly areasBase = API_ENDPOINTS.APPLICATION.AREAS.BASE;
  private readonly tablesBase = API_ENDPOINTS.APPLICATION.TABLES.BASE;

  // ==================== Areas ====================

  async getVenueAreas(personaId: number): Promise<ServiceArea[]> {
    const response = await apiService.get(this.areasBase, {
      params: { persona_id: personaId },
    });
    const raw = response.data as any;
    // apiService returns the full envelope {success, message, data:[...]}
    // interceptor camelCases all keys, so raw.data is the array
    const items: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return items.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      description: item.description,
      workspaceId: String(item.workspaceId ?? item.workspace_id ?? ''),
      isActive: item.isActive ?? item.is_active ?? true,
      createdAt: item.createdAt ?? item.created_at,
      updatedAt: item.updatedAt ?? item.updated_at,
    } as ServiceArea));
  }

  async getArea(areaId: string | number, personaId: number): Promise<ServiceArea> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.AREAS.BY_ID(areaId), {
      params: { persona_id: personaId },
    });
    return (response.data as any)?.data ?? response.data;
  }

  async createArea(data: AreaCreatePayload): Promise<ServiceArea> {
    const response = await apiService.post(this.areasBase, {
      name: data.name,
      persona_id: data.persona_id,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.is_available !== undefined && { is_available: data.is_available }),
    });
    return (response.data as any)?.data ?? response.data;
  }

  async updateArea(
    areaId: string | number,
    personaId: number,
    data: AreaUpdatePayload,
  ): Promise<ServiceArea> {
    const payload: AreaUpdatePayload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.is_available !== undefined) payload.is_available = data.is_available;

    const response = await apiService.put(
      API_ENDPOINTS.APPLICATION.AREAS.BY_ID(areaId),
      payload,
      { params: { persona_id: personaId } },
    );
    return (response.data as any)?.data ?? response.data;
  }

  async deleteArea(areaId: string | number, personaId: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.AREAS.BY_ID(areaId), {
      params: { persona_id: personaId },
    });
  }

  async restoreArea(areaId: string | number, personaId: number): Promise<ServiceArea> {
    const response = await apiService.post(
      API_ENDPOINTS.APPLICATION.AREAS.RESTORE(areaId),
      {},
      { params: { persona_id: personaId } },
    );
    return (response.data as any)?.data ?? response.data;
  }

  // ==================== Tables ====================

  async getTables(personaId: number, params?: GetTablesParams): Promise<ServiceLocation[]> {
    const response = await apiService.get(this.tablesBase, {
      params: { persona_id: personaId, ...params },
    });
    const raw = response.data as any;
    const items: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return items.map((item: any) => ({
      id: String(item.id),
      identifier: item.tableNumber ?? item.table_number ?? String(item.id),
      name: item.name,
      areaId: item.areaId ?? item.area_id ? String(item.areaId ?? item.area_id) : undefined,
      workspaceId: String(item.workspaceId ?? item.workspace_id ?? ''),
      capacity: item.capacity,
      status: item.status ?? 'available',
      isActive: item.isActive ?? item.is_active ?? true,
      description: item.description,
      qrCode: item.qrCode ?? item.qr_code,
      createdAt: item.createdAt ?? item.created_at,
      updatedAt: item.updatedAt ?? item.updated_at,
    } as ServiceLocation));
  }

  async getTableSummary(personaId: number): Promise<TableSummary> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.TABLES.SUMMARY, {
      params: { persona_id: personaId },
    });
    return (response.data as any)?.data ?? response.data;
  }

  async getTable(id: string | number, personaId: number): Promise<ServiceLocation> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.TABLES.BY_ID(id), {
      params: { persona_id: personaId },
    });
    return (response.data as any)?.data ?? response.data;
  }

  async createTable(personaId: number, data: TableCreatePayload): Promise<ServiceLocation> {
    const response = await apiService.post(
      this.tablesBase,
      {
        table_number: data.table_number,
        area_id: data.area_id,
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.display_order !== undefined && { display_order: data.display_order }),
      },
      { params: { persona_id: personaId } },
    );
    return (response.data as any)?.data ?? response.data;
  }

  async updateTable(
    id: string | number,
    personaId: number,
    data: TableUpdatePayload,
  ): Promise<ServiceLocation> {
    const payload: TableUpdatePayload = {};
    if (data.table_number !== undefined) payload.table_number = data.table_number;
    if (data.area_id !== undefined) payload.area_id = data.area_id;
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.status !== undefined) payload.status = data.status;
    if (data.display_order !== undefined) payload.display_order = data.display_order;

    const response = await apiService.put(
      API_ENDPOINTS.APPLICATION.TABLES.BY_ID(id),
      payload,
      { params: { persona_id: personaId } },
    );
    return (response.data as any)?.data ?? response.data;
  }

  async updateTableStatus(
    id: string | number,
    personaId: number,
    status: TableStatus,
  ): Promise<ServiceLocation> {
    const response = await apiService.put(
      API_ENDPOINTS.APPLICATION.TABLES.STATUS(id),
      { status },
      { params: { persona_id: personaId } },
    );
    return (response.data as any)?.data ?? response.data;
  }

  async deleteTable(id: string | number, personaId: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.TABLES.BY_ID(id), {
      params: { persona_id: personaId },
    });
  }

  async restoreTable(id: string | number, personaId: number): Promise<ServiceLocation> {
    const response = await apiService.post(
      API_ENDPOINTS.APPLICATION.TABLES.RESTORE(id),
      {},
      { params: { persona_id: personaId } },
    );
    return (response.data as any)?.data ?? response.data;
  }

  // ==================== QR Codes ====================

  async getQRCode(id: string | number, personaId: number): Promise<QRCodeResponse> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.TABLES.QR_CODE(id), {
      params: { persona_id: personaId },
    });
    return (response.data as any)?.data ?? response.data;
  }
}

export const locationService = new LocationService();
export default locationService;
