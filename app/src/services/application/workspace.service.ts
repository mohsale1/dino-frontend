/**
 * Workspace Service (Application Level)
 * Delegates venue/persona operations to personaService.
 * workspace_id is injected from JWT — never sent in request body.
 */

import { apiService } from '../../utils/api';
import { personaService } from './persona.service';
import type { PersonaCreate, PersonaUpdate } from './persona.service';

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
}

export const workspaceService = new WorkspaceService();
export default workspaceService;
