/**
 * System Billing Service
 * Handles API calls for billing management
 */

import { apiService } from '../../utils/api';

export interface BillingInfo {
  workspaceId: string;
  workspaceName?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  nextBillingDate?: string;
  amount?: number;
  currency?: string;
}

class SystemBillingService {
  private baseUrl = '/system/billing';

  async getAllBilling(page: number = 1, pageSize: number = 100) {
    const response = await apiService.get(`${this.baseUrl}/workspaces`, {
      params: {
        page,
        page_size: pageSize,
        order_by: 'created_at',
        order_direction: 'desc',
      },
    });
    return response.data as any || [];
  }

  async getWorkspaceBilling(workspaceId: string) {
    const response = await apiService.get(`${this.baseUrl}/workspaces/${workspaceId}`);
    return response.data as any;
  }

  async updateSubscription(workspaceId: string, plan: string, status: string) {
    const response = await apiService.put(`${this.baseUrl}/workspaces/${workspaceId}/subscription`, {
      plan,
      status,
    });
    return response.data as any;
  }

  async updateBillingInfo(workspaceId: string, billingInfo: any) {
    const response = await apiService.put(`${this.baseUrl}/workspaces/${workspaceId}/billing-info`, billingInfo);
    return response.data as any;
  }

  async getStats() {
    const response = await apiService.get(`${this.baseUrl}/stats`);
    return response.data as any;
  }
}

export const systemBillingService = new SystemBillingService();
export default systemBillingService;