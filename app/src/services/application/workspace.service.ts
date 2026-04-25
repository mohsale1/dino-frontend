/**
 * Workspace Service (Application Level)
 * Delegates venue/persona operations to personaService.
 * workspace_id is injected from JWT — never sent in request body.
 */

import { apiService } from '../../utils/api';
import { personaService } from './persona.service';
import type { PersonaCreate, PersonaUpdate } from './persona.service';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

// ── Approval status types ─────────────────────────────────────────────────────
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | null;

export interface WorkspaceApprovalData {
  workspace_id: number;
  request_exists: boolean;
  approved: boolean;
  status: ApprovalStatus;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

class WorkspaceService {
  // ── Venue / Persona operations ────────────────────────────────────────────

  async getVenues(_workspaceId: string) {
    // _workspaceId kept for call-site compatibility; JWT provides workspace context server-side
    const personas = await personaService.getPersonas();
    return personas;
  }

  async createVenue(venueData: PersonaCreate) {
    return await personaService.createPersona(venueData);
  }

  async updateVenue(venueId: string, venueData: PersonaUpdate) {
    return await personaService.updatePersona(Number(venueId), venueData);
  }

  async deleteVenue(venueId: string) {
    return await personaService.deletePersona(Number(venueId));
  }

  async toggleVenueStatus(venueId: string, isOpen: boolean) {
    return await personaService.setPersonaOpenStatus(Number(venueId), isOpen);
  }

  // ── Workspace operations ──────────────────────────────────────────────────

  async updateWorkspace(workspaceId: string, data: { name?: string; description?: string }) {
    const response = await apiService.put(`/application/workspaces/${workspaceId}`, data);
    return response.data;
  }

  async getApprovalStatus(workspaceId: string | number): Promise<WorkspaceApprovalData> {
    const url = API_ENDPOINTS.APPLICATION.WORKSPACE_APPROVAL.STATUS(workspaceId);
    const response = await apiService.get<WorkspaceApprovalData>(url);
    // Unwrap — apiService wraps in { success, data }
    const raw = (response as any)?.data ?? response;
    return raw as WorkspaceApprovalData;
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;
