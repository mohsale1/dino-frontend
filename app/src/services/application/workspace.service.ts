/**
 * Workspace Service (Application Level)
 * Combines workspace and venue operations for the application context
 */

import { venueService } from './venue.service';
import type { ApiResponse } from '../../types';

class WorkspaceService {
  // Venue operations (delegated to venueService)
  async getVenues(workspaceId: string) {
    const response = await venueService.getVenues(workspaceId);
    return response.data || [];
  }

  async createVenue(venueData: any) {
    return await venueService.createVenue(venueData);
  }

  async updateVenue(venueId: string, venueData: any) {
    return await venueService.updateVenue(venueId, venueData);
  }

  async deleteVenue(venueId: string) {
    return await venueService.deleteVenue(venueId);
  }

  async activateVenue(venueId: string) {
    return await venueService.updateVenue(venueId, { isActive: true });
  }

  async deactivateVenue(venueId: string) {
    return await venueService.updateVenue(venueId, { isActive: false });
  }

  async toggleVenueStatus(venueId: string, isOpen: boolean) {
    return await venueService.updateVenue(venueId, { is_open: isOpen });
  }

  // Workspace operations (placeholder - not implemented in backend yet)
  async createWorkspace(workspaceData: any): Promise<ApiResponse<any>> {
    // This would need a backend endpoint
    throw new Error('Workspace creation not implemented');
  }

  async updateWorkspace(workspaceId: string, workspaceData: any): Promise<ApiResponse<any>> {
    // This would need a backend endpoint
    throw new Error('Workspace update not implemented');
  }

  async deleteWorkspace(workspaceId: string): Promise<ApiResponse<any>> {
    // This would need a backend endpoint
    throw new Error('Workspace deletion not implemented');
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;