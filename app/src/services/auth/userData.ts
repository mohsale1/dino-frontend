import { apiService } from '../../utils/api';
import { ROLES } from '../../types/auth';
import { isUser, normalizeRole } from '../../types/auth/roles';
import StorageManager from '../../utils/storage';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { SERVICE_TIMEOUTS } from '../../constants/app';

export interface UserData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    venueIds: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
  };
  venue: {
    id: string;
    name: string;
    description?: string;
    location: {
      landmark?: string;
      address: string;
      state: string;
      city: string;
      postalCode: string;
      country: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    isActive: boolean;
    isOpen: boolean;
    orderType?: number; // 0 = online (QR/self-service), 1 = POS (manual/counter)
    theme?: string;
    menuTemplate?: string;
    menuTemplateConfig?: any;
    createdAt: string;
    updatedAt?: string;
    workspaceId?: string;
    ownerId?: string;
    personaId?: number; // raw numeric ID for API calls
  } | null;
  workspace: {
    id: string;
    name: string;
    displayName?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
  } | null;
}


class UserDataService {
  private lastCallTime: number = 0;
  private debounceDelay: number = SERVICE_TIMEOUTS.USER_DATA_DEBOUNCE_MS;
  private currentRequest: Promise<UserData | null> | null = null;

  async getUserData(): Promise<UserData | null> {
    const now = Date.now();

    // If there's already a request in progress, return it
    if (this.currentRequest) {
      return this.currentRequest;
    }

    // Debounce: if called too soon after last call, wait
    if (now - this.lastCallTime < this.debounceDelay) {
      const waitTime = this.debounceDelay - (now - this.lastCallTime);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastCallTime = Date.now();
    this.currentRequest = this._fetchUserData();

    try {
      const result = await this.currentRequest;
      return result;
    } finally {
      this.currentRequest = null;
    }
  }

  private _normalizeVenue(venueAny: any): UserData['venue'] {
    if (!venueAny) return null;

    const isOpen = venueAny.is_open !== undefined
      ? Boolean(venueAny.is_open)
      : venueAny.isOpen !== undefined
        ? Boolean(venueAny.isOpen)
        : venueAny.status
          ? ['active', 'open'].includes(String(venueAny.status).toLowerCase())
          : false;

    const isActive = venueAny.is_active !== undefined
      ? Boolean(venueAny.is_active)
      : venueAny.isActive !== undefined
        ? Boolean(venueAny.isActive)
        : true;

    const location = venueAny.location || {};

    // Raw numeric ID preserved for API calls; string ID for UI
    const rawId: number | undefined = typeof venueAny.id === 'number' ? venueAny.id : undefined;

    return {
      id: String(venueAny.id),
      name: venueAny.name || 'Unknown Venue',
      description: venueAny.description || '',
      location: {
        landmark: venueAny.landmark || location.landmark || '',
        address: venueAny.address || location.address || '',
        state: venueAny.state || location.state || '',
        city: venueAny.city || location.city || '',
        postalCode: venueAny.postal_code || venueAny.postalCode || location.postal_code || location.postalCode || '',
        country: venueAny.country || location.country || ''
      },
      phone: venueAny.phone || '',
      email: venueAny.email || '',
      website: venueAny.website || '',
      isActive,
      isOpen,
      orderType: venueAny.order_type !== undefined
        ? Number(venueAny.order_type)
        : venueAny.orderType !== undefined
          ? Number(venueAny.orderType)
          : undefined,
      theme: venueAny.theme || 'default',
      menuTemplate: venueAny.menu_template || venueAny.menuTemplate || 'default',
      menuTemplateConfig: venueAny.menu_template_config || venueAny.menuTemplateConfig,
      createdAt: venueAny.created_at || venueAny.createdAt || new Date().toISOString(),
      updatedAt: venueAny.updated_at || venueAny.updatedAt || venueAny.createdAt,
      workspaceId: venueAny.workspace_id !== undefined
        ? String(venueAny.workspace_id)
        : venueAny.workspaceId,
      ownerId: venueAny.owner_id !== undefined
        ? String(venueAny.owner_id)
        : venueAny.ownerId,
      personaId: rawId,
    };
  }

  private async _fetchUserData(): Promise<UserData | null> {
    try {
      // NOTE: ME_DATA resolves to '/application/users/me/data' — matches the backend route GET /application/users/me/data
      const response = await apiService.get<{ data: UserData; timestamp: string }>(API_ENDPOINTS.APPLICATION.USERS.ME_DATA);

      if (response.success && response.data) {
        const userData: UserData = (response.data as any).data || response.data;

        // Support both `venue` and `persona` keys from the API response
        const rawVenue = (userData as any).venue || (userData as any).persona || null;
        userData.venue = this._normalizeVenue(rawVenue);

        if (userData.user) {
          const userAny = userData.user as any;
          userData.user = {
            id: String(userAny.id),
            email: userAny.email,
            firstName: userAny.first_name || userAny.firstName || '',
            lastName: userAny.last_name || userAny.lastName || '',
            phone: userAny.phone || '',
            role: userAny.role || '',
            venueIds: (userAny.venue_ids || userAny.venueIds || []).map(String),
            isActive: userAny.is_active !== undefined ? Boolean(userAny.is_active) : Boolean(userAny.isActive),
            createdAt: userAny.created_at || userAny.createdAt || new Date().toISOString(),
            updatedAt: userAny.updated_at || userAny.updatedAt
          };
        }

        if (userData.workspace) {
          const workspaceAny = userData.workspace as any;
          userData.workspace = {
            id: String(workspaceAny.id),
            name: workspaceAny.name,
            displayName: workspaceAny.display_name || workspaceAny.displayName,
            description: workspaceAny.description || '',
            isActive: workspaceAny.is_active !== undefined ? Boolean(workspaceAny.is_active) : Boolean(workspaceAny.isActive),
            createdAt: workspaceAny.created_at || workspaceAny.createdAt || new Date().toISOString(),
            updatedAt: workspaceAny.updated_at || workspaceAny.updatedAt
          };
        }

        return userData;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }

      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this data.');
      }

      if (error.response?.status === 404) {
        throw new Error('No venue assigned to your account. Please contact support.');
      }

      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch user data');
    }
  }

  async refreshUserData(): Promise<UserData | null> {
    // Reset all debounce / in-flight state so the next call goes straight to the API
    this.lastCallTime = 0;
    this.currentRequest = null;
    StorageManager.clearVenueData();
    StorageManager.removeItem(StorageManager.KEYS.USER);

    // Also clear the HTTP-layer request queue so the GET isn't deduped
    const { apiService } = await import('../../utils/api');
    apiService.clearRequestQueue();

    return this._fetchUserData();
  }

  hasPermission(userData: UserData | null, permission: string): boolean {
    if (!userData?.user?.role) return false;

    const role = normalizeRole(userData.user.role);
    if (!role) return false;

    const rolePermissions: Record<string, string[]> = {
      [ROLES.OWNER]: [
        'can_manage_menu', 'can_manage_tables', 'can_manage_orders',
        'can_manage_users', 'can_view_analytics', 'can_manage_venue',
        'can_manage_workspace', 'can_switch_venues'
      ],
      [ROLES.MANAGER]: [
        'can_manage_menu', 'can_manage_tables', 'can_manage_orders',
        'can_manage_users', 'can_view_analytics', 'can_manage_venue'
      ],
      [ROLES.USER]: [
        'can_manage_orders', 'can_manage_tables'
      ]
    };

    const allowedPermissions = rolePermissions[role] || [];
    return allowedPermissions.includes(permission);
  }

  getUserRole(userData: UserData | null): string {
    const role = userData?.user?.role;
    const normalized = normalizeRole(role);
    return normalized || ROLES.USER;
  }

  isUser(userData: UserData | null): boolean {
    return isUser(this.getUserRole(userData));
  }

  getWorkspaceDisplayName(userData: UserData | null): string {
    return userData?.workspace?.displayName || userData?.workspace?.name || 'Unknown Workspace';
  }

  getUserDisplayName(userData: UserData | null): string {
    if (!userData?.user) return 'Unknown User';
    return `${userData.user.firstName} ${userData.user.lastName}`.trim();
  }

  getVenueStatsSummary(userData: UserData | null): string {
    if (!userData?.venue) return 'No venue assigned';
    return `Venue: ${userData.venue.name}`;
  }
}

export const userDataService = new UserDataService();
