/**
 * System Registration / Referral Service
 *
 * Backward-compatibility shim. All workspace-request types and the canonical
 * service implementation live in workspaceRequest.ts.
 *
 * Consumers that previously imported from this module continue to work without
 * any changes to their import paths.
 */

export type {
  WorkspaceRequestStatus,
  WorkspaceRequest,
  WorkspaceRequestPagination,
  WorkspaceRequestListResult,
  WorkspaceRequestCreate,
  WorkspaceRequestReject,
} from './workspaceRequest';

// ---------------------------------------------------------------------------
// Legacy type aliases
// ---------------------------------------------------------------------------

import type { WorkspaceRequestListResult, WorkspaceRequestStatus } from './workspaceRequest';
import { workspaceRequestService } from './workspaceRequest';

export interface WorkspaceRequestListParams {
  page?: number;
  pageSize?: number;
  status?: WorkspaceRequestStatus;
}

// ---------------------------------------------------------------------------
// systemReferralService — adapter over workspaceRequestService
// Preserves the object-param API that Referrals.tsx depends on.
// ---------------------------------------------------------------------------

const systemReferralServiceImpl = {
  async getRequests(params: WorkspaceRequestListParams = {}): Promise<WorkspaceRequestListResult> {
    const { page = 1, pageSize = 20, status } = params;
    return workspaceRequestService.getRequests(page, pageSize, status);
  },

  getRequest: workspaceRequestService.getRequest.bind(workspaceRequestService),
  approveRequest: workspaceRequestService.approveRequest.bind(workspaceRequestService),

  async rejectRequest(
    id: number,
    rejectionReason: string,
  ): Promise<import('./workspaceRequest').WorkspaceRequest> {
    return workspaceRequestService.rejectRequest(id, rejectionReason);
  },

  async deleteRequest(id: number): Promise<void> {
    await workspaceRequestService.deleteRequest(id);
  },
};

export const systemReferralService = systemReferralServiceImpl;
export default systemReferralService;
