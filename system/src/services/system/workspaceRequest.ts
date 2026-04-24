/**
 * System Workspace Request Service
 * Handles all API calls for workspace access request management (Approvals page).
 *
 * Backend base: /api/v1/system/workspace-requests
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const EP = API_ENDPOINTS.SYSTEM.WORKSPACE_REQUESTS;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkspaceRequestStatus = 'pending' | 'approved' | 'rejected';

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
}

export interface WorkspaceRequestPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface WorkspaceRequestListResult {
  items: WorkspaceRequest[];
  pagination: WorkspaceRequestPagination;
}

export interface WorkspaceRequestCreate {
  email: string;
  workspaceId: number;
}

export interface WorkspaceRequestReject {
  rejectionReason?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class WorkspaceRequestService {
  /**
   * GET /system/workspace-requests
   * Returns paginated workspace requests, optionally filtered by status.
   */
  async getRequests(
    page: number = 1,
    pageSize: number = 20,
    status?: WorkspaceRequestStatus | '',
  ): Promise<WorkspaceRequestListResult> {
    const params: Record<string, any> = { page, page_size: pageSize };
    if (status) params.status = status;

    const response: any = await apiService.get(EP.BASE, { params });
    const items: WorkspaceRequest[] = response?.data ?? [];
    const raw = response?.pagination ?? {};

    const pagination: WorkspaceRequestPagination = {
      page: raw.page ?? page,
      pageSize: raw.pageSize ?? pageSize,
      total: raw.total ?? items.length,
      totalPages: raw.totalPages ?? 1,
      hasNext: raw.hasNext ?? false,
      hasPrev: raw.hasPrev ?? false,
    };

    return { items, pagination };
  }

  /**
   * GET /system/workspace-requests/{id}
   * Returns a single workspace request by ID.
   */
  async getRequest(id: number): Promise<WorkspaceRequest> {
    const response: any = await apiService.get(EP.BY_ID(id));
    return response?.data;
  }

  /**
   * POST /system/workspace-requests
   * Submit a new workspace join request.
   */
  async submitRequest(data: WorkspaceRequestCreate): Promise<{ id: number }> {
    const response: any = await apiService.post(EP.BASE, {
      email: data.email,
      workspace_id: data.workspaceId,
    });
    return response?.data;
  }

  /**
   * POST /system/workspace-requests/{id}/approve
   * Approve a pending workspace request.
   */
  async approveRequest(id: number): Promise<WorkspaceRequest> {
    const response: any = await apiService.post(EP.APPROVE(id), {});
    return response?.data;
  }

  /**
   * POST /system/workspace-requests/{id}/reject
   * Reject a pending workspace request with an optional reason.
   */
  async rejectRequest(id: number, rejectionReason?: string): Promise<WorkspaceRequest> {
    const response: any = await apiService.post(EP.REJECT(id), {
      rejection_reason: rejectionReason ?? null,
    });
    return response?.data;
  }

  /**
   * DELETE /system/workspace-requests/{id}
   * Soft-delete a workspace request.
   */
  async deleteRequest(id: number): Promise<boolean> {
    const response: any = await apiService.delete(EP.BY_ID(id));
    return response?.success ?? false;
  }
}

export const workspaceRequestService = new WorkspaceRequestService();
export default workspaceRequestService;