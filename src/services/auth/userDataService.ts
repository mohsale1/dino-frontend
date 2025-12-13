import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';
import { ROLE_NAMES, isAdminLevel } from '../../constants/roles';
import StorageManager from '../../utils/storage';

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
    theme?: string;
    menuTemplate?: string;
    menuTemplateConfig?: any;
    createdAt: string;
    updatedAt?: string;
    workspaceId?: string;
    ownerId?: string;
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

export interface VenueData {
  venue: any;
  statistics: {
    totalOrders: number;
    totalRevenue: number;
    activeTables: number;
    totalTables: number;
    totalMenuItems: number;
    totalUsers: number;
  };
  menuItems: any[];
  tables: any[];
  recentOrders: any[];
  users: any[];
}

class UserDataService {
  private lastCallTime: number = 0;
  private debounceDelay: number = 2000; // Increased to 2 seconds
  private currentRequest: Promise<UserData | null> | null = null;
  private requestCount: number = 0;

  async getUserData(): Promise<UserData | null> {
    const now = Date.now();
    
    // If there's already a request in progress, return it
    if (this.currentRequest) {
      console.log('[UserDataService] Reusing existing request');
      return this.currentRequest;
    }
    
    // Debounce: if called too soon after last call, wait
    if (now - this.lastCallTime < this.debounceDelay) {
      const waitTime = this.debounceDelay - (now - this.lastCallTime);
      console.log(`[UserDataService] Debouncing request, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestCount++;
    console.log(`[UserDataService] Making API call #${this.requestCount} to /users/me/data`);
    this.lastCallTime = Date.now();
    this.currentRequest = this._fetchUserData();
    
    try {
      const result = await this.currentRequest;
      return result;
    } finally {
      this.currentRequest = null;
    }
  }

  private async _fetchUserData(): Promise<UserData | null> {
    try {
      const response = await apiService.get<{data: UserData, timestamp: string}>('/users/me/data');
      
      if (response.success && response.data) {
        const userData: UserData = (response.data as any).data || response.data;
        
        if (userData.venue) {
          const venueAny = userData.venue as any;
          
          // Normalize isOpen from backend (is_open, isOpen, status)
          const isOpen = venueAny.is_open !== undefined 
            ? Boolean(venueAny.is_open)
            : venueAny.isOpen !== undefined 
              ? Boolean(venueAny.isOpen)
              : venueAny.status 
                ? ['active', 'open'].includes(String(venueAny.status).toLowerCase())
                : false;

          // Normalize isActive from backend (is_active, isActive)
          const isActive = venueAny.is_active !== undefined 
            ? Boolean(venueAny.is_active)
            : venueAny.isActive !== undefined 
              ? Boolean(venueAny.isActive)
              : true;

          // Normalize location
          const location = venueAny.location || {};
          
          // Standardize venue object - camelCase only
          userData.venue = {
            id: venueAny.id,
            name: venueAny.name || 'Unknown Venue',
            description: venueAny.description || '',
            location: {
              landmark: location.landmark || '',
              address: location.address || '',
              state: location.state || '',
              city: location.city || '',
              postalCode: location.postal_code || location.postalCode || '',
              country: location.country || ''
            },
            phone: venueAny.phone || '',
            email: venueAny.email || '',
            website: venueAny.website || '',
            isActive,
            isOpen,
            theme: venueAny.theme || 'pet',
            menuTemplate: venueAny.menu_template || venueAny.menuTemplate || 'classic',
            menuTemplateConfig: venueAny.menu_template_config || venueAny.menuTemplateConfig,
            createdAt: venueAny.created_at || venueAny.createdAt || new Date().toISOString(),
            updatedAt: venueAny.updated_at || venueAny.updatedAt || venueAny.createdAt,
            workspaceId: venueAny.workspace_id || venueAny.workspaceId,
            ownerId: venueAny.owner_id || venueAny.ownerId
          };
        }
        
        if (userData.user) {
          const userAny = userData.user as any;
          userData.user = {
            id: userAny.id,
            email: userAny.email,
            firstName: userAny.first_name || userAny.firstName || '',
            lastName: userAny.last_name || userAny.lastName || '',
            phone: userAny.phone || '',
            role: userAny.role || 'operator',
            venueIds: userAny.venue_ids || userAny.venueIds || [],
            isActive: userAny.is_active !== undefined ? Boolean(userAny.is_active) : Boolean(userAny.isActive),
            createdAt: userAny.created_at || userAny.createdAt || new Date().toISOString(),
            updatedAt: userAny.updated_at || userAny.updatedAt
          };
        }
        
        if (userData.workspace) {
          const workspaceAny = userData.workspace as any;
          userData.workspace = {
            id: workspaceAny.id,
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

  async getVenueData(venueId: string): Promise<VenueData | null> {
    try {
      const response = await apiService.get<VenueData>(`/venues/${venueId}/data`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Only superadmin can switch venues.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Venue not found.');
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue data');
    }
  }

  async refreshUserData(): Promise<UserData | null> {
    this.lastCallTime = 0;
    this.currentRequest = null;
    StorageManager.clearVenueData();
    StorageManager.removeItem(StorageManager.KEYS.USER);
    return this.getUserData();
  }

  clearPendingRequests(): void {
    this.currentRequest = null;
    this.lastCallTime = 0;
  }

  hasPermission(userData: UserData | null, permission: string): boolean {
    if (!userData?.user?.role) return false;
    
    const role = userData.user.role;
    const rolePermissions: Record<string, string[]> = {
      'superadmin': [
        'can_manage_menu', 'can_manage_tables', 'can_manage_orders', 
        'can_manage_users', 'can_view_analytics', 'can_manage_venue',
        'can_manage_workspace', 'can_switch_venues'
      ],
      'admin': [
        'can_manage_menu', 'can_manage_tables', 'can_manage_orders', 
        'can_manage_users', 'can_view_analytics', 'can_manage_venue'
      ],
      'operator': [
        'can_manage_orders', 'can_manage_tables'
      ]
    };
    
    const allowedPermissions = rolePermissions[role] || [];
    return allowedPermissions.includes(permission);
  }

  getUserRole(userData: UserData | null): string {
    return userData?.user?.role || 'operator';
  }

  isSuperAdmin(userData: UserData | null): boolean {
    return this.getUserRole(userData) === ROLE_NAMES.SUPERADMIN;
  }

  isAdmin(userData: UserData | null): boolean {
    const role = this.getUserRole(userData);
    return isAdminLevel(role);
  }

  isOperator(userData: UserData | null): boolean {
    return this.getUserRole(userData) === ROLE_NAMES.OPERATOR;
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN');
  }

  getVenueDisplayName(userData: UserData | null): string {
    return userData?.venue?.name || 'No Venue Assigned';
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