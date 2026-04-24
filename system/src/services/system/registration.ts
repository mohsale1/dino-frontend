/**
 * System Referral Service
 * Handles API calls for workspace request management and referral dashboard stats.
 * Backed by the real /system/workspace-requests and /system/dashboard/referrals endpoints.
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const WR = API_ENDPOINTS.SYSTEM.WORKSPACE_REQUESTS;
const DASHBOARD = API_ENDPOINTS.SYSTEM.DASHBOARD;

// ---------------------------------------------------------------------------
// Types — Workspace Request
// ---------------------------------------------------------------------------

export type WorkspaceRequestStatus = 'pending' | 'approved' | 'rejected';

export interface WorkspaceRequestWorkspace {
  id: number;
  name: string;
  is_verified: boolean;
}

export interface WorkspaceRequestUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WorkspaceRequest {
  id: number;
  email: string;
  userId: number | null;
  workspaceId: number;
  status: WorkspaceRequestStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workspace?: WorkspaceRequestWorkspace;
  user?: WorkspaceRequestUser;
}

export interface WorkspaceRequestCreate {
  email: string;
  workspaceId: number;
}

export interface WorkspaceRequestReject {
  rejection_reason: string;
}

// ---------------------------------------------------------------------------
// Types — Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedWorkspaceRequests {
  items: WorkspaceRequest[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Types — Dashboard Stats
// ---------------------------------------------------------------------------

export interface ReferralDashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// ---------------------------------------------------------------------------
// Types — List Params
// ---------------------------------------------------------------------------

export interface WorkspaceRequestListParams {
  page?: number;
  pageSize?: number;
  status?: WorkspaceRequestStatus;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class SystemReferralService {

  async getRequests(params: WorkspaceRequestListParams = {}): Promise<PaginatedWorkspaceRequests> {
    const { page = 1, pageSize = 20, status } = params;

    const queryParams: Record<string, any> = { page, page_size: pageSize };
    if (status) queryParams.status = status;

    const response: any = await apiService.get(WR.BASE, { params: queryParams });

    // The API interceptor returns { success, data, pagination, ... } at the top level.
    // Items live in response.data, pagination lives in response.pagination.
    const items: WorkspaceRequest[] = Array.isArray(response?.data)
      ? response.data
      : (response?.data?.items ?? []);

    const raw = response?.pagination ?? response?.data?.pagination ?? {};

    const pagination: PaginationMeta = {
      page:       raw.page       ?? page,
      pageSize:   raw.pageSize   ?? raw.page_size   ?? pageSize,
      total:      raw.total      ?? items.length,
      totalPages: raw.totalPages ?? raw.total_pages ?? 1,
    };

    return { items, pagination };
  }


  /**
   * GET /system/workspace-requests/{id}
   * Returns a single workspace request by ID.
   */
  async getRequest(id: number): Promise<WorkspaceRequest> {
    const response = await apiService.get<WorkspaceRequest>(WR.BY_ID(id));
    return response.data as WorkspaceRequest;
  }

  /**
   * POST /system/workspace-requests
   * Creates a new workspace request.
   */
  async createRequest(data: WorkspaceRequestCreate): Promise<WorkspaceRequest> {
    const response = await apiService.post<WorkspaceRequest>(WR.BASE, data);
    return response.data as WorkspaceRequest;
  }

  /**
   * POST /system/workspace-requests/{id}/approve
   * Approves a pending workspace request.
   */
  async approveRequest(id: number): Promise<WorkspaceRequest> {
    const response = await apiService.post<WorkspaceRequest>(WR.APPROVE(id));
    return response.data as WorkspaceRequest;
  }

  /**
   * POST /system/workspace-requests/{id}/reject
   * Rejects a pending workspace request with a mandatory reason.
   */
  async rejectRequest(id: number, rejectionReason: string): Promise<WorkspaceRequest> {
    const body: WorkspaceRequestReject = { rejection_reason: rejectionReason };
    const response = await apiService.post<WorkspaceRequest>(WR.REJECT(id), body);
    return response.data as WorkspaceRequest;
  }

  /**
   * DELETE /system/workspace-requests/{id}
   * Deletes a workspace request.
   */
  async deleteRequest(id: number): Promise<void> {
    await apiService.delete(WR.BY_ID(id));
  }

  async getReferralStats(): Promise<ReferralDashboardStats> {
    const fallback: ReferralDashboardStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    try {
      const response: any = await apiService.get(`${DASHBOARD.BASE}/referrals`);
      const d = response?.data ?? response ?? {};
      return {
        total:    d.total    ?? 0,
        pending:  d.pending  ?? 0,
        approved: d.approved ?? 0,
        rejected: d.rejected ?? 0,
      };
    } catch {
      return fallback;
    }
  }

}

export const systemReferralService = new SystemReferralService();
export default systemReferralService;