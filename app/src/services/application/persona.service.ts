/**
 * Persona Service
 * Handles API calls for persona (business location) operations.
 * Backend resource: /application/personas
 * All IDs are integers. workspace_id is injected from JWT — never sent in body.
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { DEFAULTS } from '../../constants/app';

export type PersonaType = 0 | 1; // 0=Food, 1=NonFood
export type OrderType   = 0 | 1; // 0=Online/QR, 1=Manual/POS

export interface Persona {
  id: number;
  name: string;
  description?: string;
  persona_type: PersonaType;
  order_type: OrderType;
  is_open: boolean;
  is_active: boolean;
  is_deactivated?: boolean;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  workspace_id: number;
  created_at: string;
  updated_at: string;
}

export interface PersonaCreate {
  name: string;
  description?: string;
  persona_type?: PersonaType;
  order_type?: OrderType;
  is_open?: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}

export interface PersonaUpdate {
  name?: string;
  description?: string;
  persona_type?: PersonaType;
  order_type?: OrderType;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}

export interface PersonaListParams {
  workspace_id?: number;
  include_deleted?: boolean;
  page?: number;
  page_size?: number;
}

export interface PersonaListResponse {
  success: boolean;
  message: string;
  data: Persona[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

class PersonaService {
  private readonly baseUrl = API_ENDPOINTS.APPLICATION.PERSONAS.BASE;

  async getPersonas(params: PersonaListParams = {}): Promise<PersonaListResponse> {
    const response = await apiService.get(this.baseUrl, {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? DEFAULTS.LARGE_PAGE_SIZE,
        ...(params.workspace_id !== undefined && { workspace_id: params.workspace_id }),
        ...(params.include_deleted !== undefined && { include_deleted: params.include_deleted }),
      },
    });
    const raw = response.data as any;
    // Normalise: backend returns { success, data: [...], pagination: {...} }
    if (raw && Array.isArray(raw.data)) return raw as PersonaListResponse;
    // Fallback: plain array
    const list: Persona[] = Array.isArray(raw) ? raw : [];
    return {
      success: true,
      message: '',
      data: list,
      pagination: { page: 1, page_size: list.length, total: list.length, total_pages: 1, has_next: false, has_prev: false },
    };
  }

  async getPersona(id: number): Promise<Persona> {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    const raw = response.data as any;
    return raw?.data ?? raw;
  }

  async createPersona(payload: PersonaCreate): Promise<Persona> {
    const response = await apiService.post(this.baseUrl, {
      name: payload.name,
      ...(payload.description !== undefined && { description: payload.description }),
      persona_type: payload.persona_type ?? 0,
      order_type: payload.order_type ?? 0,
      is_open: payload.is_open ?? false,
      ...(payload.address     && { address:     payload.address }),
      ...(payload.city        && { city:        payload.city }),
      ...(payload.state       && { state:       payload.state }),
      ...(payload.country     && { country:     payload.country }),
      ...(payload.postal_code && { postal_code: payload.postal_code }),
      ...(payload.phone       && { phone:       payload.phone }),
      ...(payload.email       && { email:       payload.email }),
    });
    const raw = response.data as any;
    return raw?.data ?? raw;
  }

  async updatePersona(id: number, payload: PersonaUpdate): Promise<void> {
    const body: Record<string, any> = {};
    if (payload.name        !== undefined) body.name        = payload.name;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.persona_type !== undefined) body.persona_type = payload.persona_type;
    if (payload.order_type  !== undefined) body.order_type  = payload.order_type;
    if (payload.address     !== undefined) body.address     = payload.address;
    if (payload.city        !== undefined) body.city        = payload.city;
    if (payload.state       !== undefined) body.state       = payload.state;
    if (payload.country     !== undefined) body.country     = payload.country;
    if (payload.postal_code !== undefined) body.postal_code = payload.postal_code;
    if (payload.phone       !== undefined) body.phone       = payload.phone;
    if (payload.email       !== undefined) body.email       = payload.email;
    await apiService.put(`${this.baseUrl}/${id}`, body);
  }

  /** Toggle open/closed status via dedicated endpoint */
  async setPersonaOpenStatus(id: number, isOpen: boolean): Promise<void> {
    await apiService.put(`${this.baseUrl}/${id}/status`, { is_open: isOpen });
  }

  async deletePersona(id: number): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restorePersona(id: number): Promise<void> {
    await apiService.post(`${this.baseUrl}/${id}/restore`, {});
  }
}

export const personaService = new PersonaService();
export default personaService;
