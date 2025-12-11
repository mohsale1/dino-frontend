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
    updated_at?: string;
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
      postal_code: string;
      country: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    isActive: boolean;
    is_open: boolean;
    theme?: string;
    menu_template?: string;
    menu_template_config?: any;
    createdAt: string;
    updated_at?: string;
    workspaceId?: string;
    ownerId?: string;
    isOpen?: boolean;
    updatedAt?: string;
    address?: string;
  } | null;
  workspace: {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updated_at?: string;
  } | null;
}

export interface VenueData {
  venue: any;
  statistics: {
    total_orders: number;
    total_revenue: number;
    active_tables: number;
    total_tables: number;
    total_menu_items: number;
    total_users: number;
  };
  menu_items: any[];
  tables: any[];
  recent_orders: any[];
  users: any[];
}

class UserDataService {
  private lastCallTime: number = 0;
  private debounceDelay: number = 1000;
  private currentRequest: Promise<UserData | null> | null = null;

  async getUserData(): Promise<UserData | null> {
    const now = Date.now();
    
    if (this.currentRequest) {
      return this.currentRequest;
    }
    
    if (now - this.lastCallTime < this.debounceDelay) {
      await new Promise(resolve => setTimeout(resolve, this.debounceDelay - (now - this.lastCallTime)));
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

  private async _fetchUserData(): Promise<UserData | null> {
    try {
      const response = await apiService.get<{data: UserData, timestamp: string}>('/users/me/data');
      
      if (response.success && response.data) {
        const userData: UserData = (response.data as any).data || response.data;
        
        if (userData.venue) {
          let isOpen = false;
          let statusField = (userData.venue as any).status;
          
          if (userData.venue.is_open !== undefined && userData.venue.is_open !== null) {
            isOpen = Boolean(userData.venue.is_open);
          } else if (statusField !== undefined && statusField !== null) {
            const statusStr = String(statusField).toLowerCase();
            isOpen = statusStr === 'active' || statusStr === 'open';
          } else if ((userData.venue as any).isOpen !== undefined) {
            isOpen = Boolean((userData.venue as any).isOpen);
          } else {
            isOpen = false;
          }
          
          const finalStatus = isOpen ? 'active' : 'closed';
          
          userData.venue = {
            ...userData.venue,
            isActive: userData.venue.isActive !== undefined ? userData.venue.isActive : (userData.venue as any).isActive,
            isOpen: isOpen,
            is_open: isOpen,
            createdAt: userData.venue.createdAt || (userData.venue as any).createdAt,
            updatedAt: userData.venue.updatedAt || (userData.venue as any).updatedAt,
            location: userData.venue.location || {
              landmark: '',
              address: '',
              state: '',
              city: '',
              postal_code: '',
              country: ''
            },
            name: userData.venue.name || 'Unknown Venue',
            description: userData.venue.description || '',
            phone: userData.venue.phone || '',
            email: userData.venue.email || '',
            theme: userData.venue.theme || (userData.venue as any).theme || 'pet',
            menu_template: userData.venue.menu_template || (userData.venue as any).menu_template || 'classic'
          };
          
          (userData.venue as any).status = finalStatus;
        }
        
        if (userData.user) {
          userData.user = {
            ...userData.user,
            firstName: userData.user.firstName || (userData.user as any).firstName,
            lastName: userData.user.lastName || (userData.user as any).lastName,
            isActive: userData.user.isActive !== undefined ? userData.user.isActive : (userData.user as any).isActive,
            createdAt: userData.user.createdAt || (userData.user as any).createdAt
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
    return userData?.workspace?.display_name || userData?.workspace?.name || 'Unknown Workspace';
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