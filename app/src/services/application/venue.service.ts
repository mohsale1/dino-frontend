/**
 * Venue Service
 * Handles venue-related API operations — backed by /application/personas
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';
import type { Persona } from './persona.service';

export interface Venue {
  id: string;
  name: string;
  workspaceId: string;
  isActive: boolean;
  isOpen: boolean;
  orderType?: number;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueCreate {
  name: string;
  description?: string;
  persona_type?: number;
  order_type?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_open?: boolean;
}

export interface VenueUpdate {
  name?: string;
  description?: string;
  persona_type?: number;
  order_type?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}

// ── Mapping helper ────────────────────────────────────────────────────────────

function mapPersonaToVenue(p: Persona): Venue {
  return {
    id: String(p.id),
    name: p.name,
    workspaceId: String(p.workspace_id),
    isActive: p.is_active,
    isOpen: p.is_open,
    orderType: p.order_type,
    address: p.address ?? undefined,
    phone: p.phone ?? undefined,
    email: p.email ?? undefined,
    description: p.description ?? undefined,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

class VenueService {
  /**
   * Get all venues — GET /application/personas
   */
  async getVenues(workspaceId?: string): Promise<ApiResponse<Venue[]>> {
    try {
      const params: Record<string, any> = {};
      if (workspaceId) params.workspace_id = workspaceId;

      const response = await apiService.get<any>('/application/personas', { params });
      const raw = response.data as any;
      const personas: Persona[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

      return {
        success: true,
        data: personas.map(mapPersonaToVenue),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch venues',
      };
    }
  }

  /**
   * Get venue by ID — GET /application/personas/{id}
   */
  async getVenue(venueId: string): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.get<any>(`/application/personas/${venueId}`);
      const raw = response.data as any;
      const persona: Persona = raw?.data ?? raw;
      return {
        success: true,
        data: mapPersonaToVenue(persona),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch venue');
    }
  }

  /**
   * Create a new venue — POST /application/personas
   * workspace_id is injected from JWT — do NOT include in body
   */
  async createVenue(data: VenueCreate): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.post<any>('/application/personas', data);
      const raw = response.data as any;
      const persona: Persona = raw?.data ?? raw;
      return {
        success: true,
        data: mapPersonaToVenue(persona),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create venue');
    }
  }

  /**
   * Update venue — PUT /application/personas/{id}
   */
  async updateVenue(venueId: string, data: VenueUpdate): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.put<any>(`/application/personas/${venueId}`, data);
      const raw = response.data as any;
      const persona: Persona = raw?.data ?? raw;
      return {
        success: true,
        data: mapPersonaToVenue(persona),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update venue');
    }
  }

  /**
   * Delete venue — DELETE /application/personas/{id}
   */
  async deleteVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete(`/application/personas/${venueId}`);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete venue');
    }
  }

  /**
   * Set venue open/closed status — PUT /application/personas/{id}/status
   * workspace_id is NOT sent in body — backend injects from JWT
   */
  async setVenueOpenStatus(venueId: string, isOpen: boolean): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.put<any>(
        `/application/personas/${venueId}/status`,
        { is_open: isOpen }
      );
      const raw = response.data as any;
      const persona: Persona = raw?.data ?? raw;
      return { success: true, data: mapPersonaToVenue(persona) };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update venue status');
    }
  }

  async openVenue(venueId: string): Promise<ApiResponse<Venue>> {
    return this.setVenueOpenStatus(venueId, true);
  }

  async closeVenue(venueId: string): Promise<ApiResponse<Venue>> {
    return this.setVenueOpenStatus(venueId, false);
  }
}

export const venueService = new VenueService();
