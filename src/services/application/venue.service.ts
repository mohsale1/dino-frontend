/**
 * Venue Service
 * Handles venue-related API operations
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';

export interface Venue {
  id: string;
  name: string;
  workspaceId: string;
  isActive: boolean;
  isOpen: boolean;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueCreate {
  name: string;
  workspaceId: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface VenueUpdate {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  isActive?: boolean;
  is_open?: boolean;
  status?: string;
}

class VenueService {
  /**
   * Get all venues
   */
  async getVenues(workspaceId?: string): Promise<ApiResponse<Venue[]>> {
    try {
      const params = workspaceId ? { workspace_id: workspaceId } : {};
      const response = await apiService.get<Venue[]>('/application/organizations', { params });
      return {
        success: true,
        data: response.data || [],
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
   * Get venue by ID
   */
  async getVenue(venueId: string): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.get<Venue>(`/application/organizations/${venueId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch venue');
    }
  }

  /**
   * Create a new venue
   */
  async createVenue(data: VenueCreate): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.post<Venue>('/application/organizations', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create venue');
    }
  }

  /**
   * Update venue
   */
  async updateVenue(venueId: string, data: VenueUpdate): Promise<ApiResponse<Venue>> {
    try {
      const response = await apiService.put<Venue>(`/application/organizations/${venueId}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update venue');
    }
  }

  /**
   * Delete venue
   */
  async deleteVenue(venueId: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete(`/application/organizations/${venueId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete venue');
    }
  }

  async openVenue(venueId: string): Promise<ApiResponse<Venue>> {
    return this.updateVenue(venueId, { is_open: true });
  }


  async closeVenue(venueId: string): Promise<ApiResponse<Venue>> {
    return this.updateVenue(venueId, { is_open: false });
  }

}

export const venueService = new VenueService();