/**
 * Workspace Service (Application Level)
 *
 * Routes (relative to apiService baseURL /api/v1):
 *   GET /application/workspaces/me
 *   GET /application/workspaces/{id}
 *   PUT /application/workspaces/{id}
 *   GET /application/workspaces/{id}/billing
 *   GET /application/workspaces/{id}/billing-detail
 *   GET /application/workspaces/{id}/billing-transactions
 *   GET /application/workspaces/{id}/approval-status
 *
 * Venue / persona operations are delegated to personaService.
 * workspace_id is injected from JWT — never sent in request body.
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { personaService } from './persona.service';
import type { PersonaCreate, PersonaUpdate, PersonaListResponse } from './persona.service';

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

// ── Workspace info ────────────────────────────────────────────────────────────

export interface WorkspaceInfo {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceUpdatePayload {
  name?: string;
  description?: string;
}

// ── Workspace billing ─────────────────────────────────────────────────────────

export interface WorkspaceBilling {
  workspace_id: number;
  plan?: string;
  plan_status?: string;
  billing_cycle?: string;
  billing_email?: string;
  billing_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_postal_code?: string;
  billing_phone?: string;
  next_billing_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ── Billing detail ────────────────────────────────────────────────────────────

export interface BillingDetail {
  id?: number;
  workspace_id?: number;
  legal_name?: string;
  trade_name?: string;
  gstin?: string;
  pan?: string;
  billing_email?: string;
  billing_phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  created_at?: string;
  updated_at?: string;
}

// ── Billing transactions ──────────────────────────────────────────────────────

export interface BillingTransaction {
  id: number;
  workspace_id: number;
  plan: string;
  amount: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_ref?: string;
  invoice_number?: string;
  last_paid_at?: string | null;
  paid_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingTransactionsResponse {
  items: BillingTransaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

class WorkspaceService {
  // ── Workspace methods ───────────────────────────────────────────────────────

  async getMyWorkspace(): Promise<WorkspaceInfo> {
    const response = await apiService.get<WorkspaceInfo>(API_ENDPOINTS.APPLICATION.WORKSPACES.ME);
    const raw = (response as any)?.data ?? response;
    return (raw?.data ?? raw) as WorkspaceInfo;
  }

  async getWorkspace(id: string | number): Promise<WorkspaceInfo> {
    const response = await apiService.get<WorkspaceInfo>(
      API_ENDPOINTS.APPLICATION.WORKSPACES.BY_ID(id),
    );
    const raw = (response as any)?.data ?? response;
    return (raw?.data ?? raw) as WorkspaceInfo;
  }

  async updateWorkspace(
    id: string | number,
    data: WorkspaceUpdatePayload,
  ): Promise<WorkspaceInfo> {
    const response = await apiService.put<WorkspaceInfo>(
      API_ENDPOINTS.APPLICATION.WORKSPACES.BY_ID(id),
      data,
    );
    const raw = (response as any)?.data ?? response;
    return (raw?.data ?? raw) as WorkspaceInfo;
  }

  async getApprovalStatus(id: string | number): Promise<WorkspaceApprovalData> {
    const response = await apiService.get<WorkspaceApprovalData>(
      API_ENDPOINTS.APPLICATION.WORKSPACES.APPROVAL_STATUS(id),
    );
    const raw = (response as any)?.data ?? response;
    return (raw?.data ?? raw) as WorkspaceApprovalData;
  }

  async getWorkspaceBilling(id: string | number): Promise<WorkspaceBilling> {
    const response = await apiService.get<WorkspaceBilling>(
      API_ENDPOINTS.APPLICATION.WORKSPACES.BILLING(id),
    );
    const raw = (response as any)?.data ?? response;
    return (raw?.data ?? raw) as WorkspaceBilling;
  }

  async getBillingDetail(id: string | number): Promise<BillingDetail | null> {
    try {
      const response = await apiService.get<BillingDetail>(
        API_ENDPOINTS.APPLICATION.WORKSPACES.BILLING_DETAIL(id),
      );
      const raw = (response as any)?.data ?? response;
      return (raw?.data ?? raw) as BillingDetail;
    } catch {
      return null;
    }
  }

  async getBillingTransactions(
    id: string | number,
    params?: { page?: number; page_size?: number; payment_status?: string },
  ): Promise<BillingTransactionsResponse> {
    const response = await apiService.get<BillingTransactionsResponse>(
      API_ENDPOINTS.APPLICATION.WORKSPACES.BILLING_TRANSACTIONS(id),
      { params },
    );
    const raw = (response as any)?.data ?? response;
    const data = raw?.data ?? raw;
    return {
      items: data?.items ?? data ?? [],
      total: data?.total ?? 0,
      page: data?.page ?? 1,
      page_size: data?.page_size ?? 20,
      total_pages: data?.total_pages ?? 0,
    };
  }

  // ── Venues (delegated to personaService) ───────────────────────────────────

  async getVenues(): Promise<PersonaListResponse> {
    return personaService.getPersonas();
  }

  async createVenue(venueData: PersonaCreate) {
    return personaService.createPersona(venueData);
  }

  async updateVenue(venueId: string | number, venueData: PersonaUpdate): Promise<void> {
    return personaService.updatePersona(Number(venueId), venueData);
  }

  async deleteVenue(venueId: string | number): Promise<void> {
    return personaService.deletePersona(Number(venueId));
  }

  async toggleVenueStatus(venueId: string | number, isOpen: boolean): Promise<void> {
    return personaService.setPersonaOpenStatus(Number(venueId), isOpen);
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;
