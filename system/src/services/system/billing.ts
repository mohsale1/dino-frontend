/**
 * System Billing Service
 *
 * NOTE: The /system/billing/* endpoints are not yet implemented in the backend.
 * All methods return empty/null stubs until the backend provides these routes.
 */

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
  async getAllBilling(_page: number = 1, _pageSize: number = 100): Promise<any[]> {
    return [];
  }

  async getWorkspaceBilling(_workspaceId: string): Promise<BillingInfo | null> {
    return null;
  }

  async updateSubscription(_workspaceId: string, _plan: string, _status: string): Promise<null> {
    return null;
  }


  async getStats(): Promise<null> {
    return null;
  }
}

export const systemBillingService = new SystemBillingService();
export default systemBillingService;
