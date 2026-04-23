import { AuthToken, UserProfile, WorkspaceRegistration, ApiResponse } from '../../types';
import { apiService } from '../../utils/api';
import StorageManager from '../../utils/storage';

class AuthService {
  // Use StorageManager keys for consistency
  private readonly TOKEN_KEY = StorageManager.KEYS.TOKEN;
  private readonly USER_KEY = StorageManager.KEYS.USER;
  private readonly REFRESH_TOKEN_KEY = StorageManager.KEYS.REFRESH_TOKEN;

  async login(email: string, password: string, rememberMe: boolean = false, isSystemUser: boolean = false): Promise<AuthToken> {
    try {      
      // Determine the correct endpoint based on user type
      const endpoint = isSystemUser ? '/system/auth/login' : '/application/auth/login';
      
      // Send plain password to backend - backend handles hashing
      const response = await apiService.post<AuthToken>(endpoint, {
        email,
        password
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }
      
      const authToken = response.data;
      
      // Store only tokens (no user data in login response anymore)
      StorageManager.setItem(this.TOKEN_KEY, authToken.access_token);
      if (authToken.refresh_token) {
        StorageManager.setItem(this.REFRESH_TOKEN_KEY, authToken.refresh_token);
      }
      
      // Store user type for future API calls
      StorageManager.setItem('user_type', isSystemUser ? 'system' : 'application');
      
      // Fetch user data separately after login
      try {
        const userProfile = await this.getCurrentUser(isSystemUser);
        authToken.user = userProfile; // Add user to token response for compatibility
      } catch (error) {
        // If fetching user fails, clear tokens and throw error
        this.clearTokens();
        throw new Error('Failed to fetch user data after login');
      }
      
      return authToken;
    } catch (error: any) {      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  async signup(signupData: any): Promise<ApiResponse<any>> {
    try {
      // Use /application/auth/signup endpoint with new structure
      const response = await apiService.post<any>('/application/auth/signup', signupData);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Registration successful'
      };
    } catch (error: any) {      
      // Re-throw the original error to preserve the response structure
      throw error;
    }
  }

  async registerWorkspace(workspaceData: WorkspaceRegistration): Promise<ApiResponse<any>> {
    try {
      // Transform flat structure to nested structure for /auth/signup endpoint
      const signupPayload = {
        workspace_name: workspaceData.workspace_name,
        workspace_description: workspaceData.workspace_description || '',
        organization: {
          name: workspaceData.venue_name,
          description: workspaceData.venue_description || '',
          email: workspaceData.venue_email || '',
          phone: workspaceData.venue_phone || '',
          address: workspaceData.venue_location?.address || '',
          city: workspaceData.venue_location?.city || '',
          state: workspaceData.venue_location?.state || '',
          country: workspaceData.venue_location?.country || 'USA',
          postal_code: workspaceData.venue_location?.postal_code || '',
          organization_type: 0, // Default to FOOD (0)
          order_type: 0 // Default to Online (0)
        },
        admin_user: {
          email: workspaceData.owner_email,
          password: workspaceData.owner_password,
          first_name: workspaceData.owner_firstName,
          last_name: workspaceData.owner_lastName,
          phone: workspaceData.owner_phone || '',
          address: workspaceData.venue_location?.address || '',
          city: workspaceData.venue_location?.city || '',
          state: workspaceData.venue_location?.state || '',
          country: workspaceData.venue_location?.country || 'USA',
          postal_code: workspaceData.venue_location?.postal_code || ''
        }
      };
      
      // Use /auth/signup endpoint with proper nested structure
      const response = await apiService.post<any>('/application/auth/signup', signupPayload);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Registration successful'
      };
    } catch (error: any) {      
      // Re-throw the original error to preserve the response structure
      throw error;
    }
  }

  async getCurrentUser(isSystemUser?: boolean): Promise<UserProfile> {
    try {
      // Ensure authorization header is set before making request
      const token = this.getToken();
      if (token) {
        apiService.setAuthorizationHeader(token);
      }
      
      // If isSystemUser is not provided, check stored user type
      if (isSystemUser === undefined) {
        const storedUserType = StorageManager.getItem<string>('user_type');
        isSystemUser = storedUserType === 'system';
      }
      
      // Determine the correct endpoint based on user type
      const endpoint = isSystemUser ? '/system/auth/me' : '/application/auth/me';
      
      const response = await apiService.get<UserProfile>(endpoint);
      
      if (response.success && response.data) {
        // Update stored user data
        StorageManager.setUserData(response.data);
        return response.data;
      }
      
      throw new Error('Failed to get user profile');
    } catch (error: any) {
      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        // Temporarily disable automatic logout to debug the issue
        // this.clearTokens();
      }
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get user profile');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {      
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if user is system or application user
      const storedUserType = StorageManager.getItem<string>('user_type');
      const isSystemUser = storedUserType === 'system';
      
      // Determine the correct endpoint based on user type
      const endpoint = isSystemUser ? '/system/auth/change-password' : '/application/auth/change-password';
      
      // Send plain passwords to backend - backend handles hashing
      const response = await apiService.post(endpoint, {
        old_password: currentPassword,
        new_password: newPassword
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {      throw new Error(error.response?.data?.detail || error.message || 'Failed to change password');
    }
  }

  private refreshPromise: Promise<AuthToken | null> | null = null;
  private lastRefreshAttempt: number = 0;
  private readonly REFRESH_COOLDOWN = 30000; // 30 seconds cooldown between refresh attempts

  async refreshToken(): Promise<AuthToken | null> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {      return this.refreshPromise;
    }

    // Check cooldown period to prevent too frequent refresh attempts
    const now = Date.now();
    if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {      return null;
    }

    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {        this.clearTokens();
        return null;
      }

      this.lastRefreshAttempt = now;      
      // Create the refresh promise using direct axios to avoid interceptor loops
      this.refreshPromise = (async () => {
        try {
          // Import axios directly to bypass interceptors
          const axios = (await import('axios')).default;
          const baseURL = (apiService as any).axiosInstance.defaults.baseURL;
          const storedUserType = StorageManager.getItem<string>('user_type');
          const refreshEndpoint = storedUserType === 'system'
            ? '/system/auth/refresh'
            : '/application/auth/refresh';
          const response = await axios.post(`${baseURL}${refreshEndpoint}`, {
            refresh_token: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data && response.data.access_token) {            const tokenData = response.data;
            // Store tokens without user data (refresh doesn't return user)
            StorageManager.setItem(this.TOKEN_KEY, tokenData.access_token);
            if (tokenData.refresh_token) {
              StorageManager.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
            }
            return tokenData;
          }          this.clearTokens();
          return null;
        } catch (error: any) {          this.clearTokens();
          return null;
        }
      })();

      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done
      this.refreshPromise = null;
    }
  }

  private setTokens(tokenData: AuthToken): void {    
    // Use StorageManager for consistent storage
    StorageManager.setItem(this.TOKEN_KEY, tokenData.access_token);
    
    // Only store user data if it exists (for backward compatibility)
    if (tokenData.user) {
      StorageManager.setUserData(tokenData.user);
    }
    
    if (tokenData.refresh_token) {
      StorageManager.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);    } else {    }
    
    // No need to store separate expiry - JWT contains expiry in payload
  }

  private clearTokens(): void {    StorageManager.removeItem(this.TOKEN_KEY);
    StorageManager.removeItem(this.USER_KEY);
    StorageManager.removeItem(this.REFRESH_TOKEN_KEY);
    StorageManager.removeItem('user_type');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired by parsing JWT
    const { isExpired } = this.getTokenExpiryInfo();
    if (isExpired) {      this.clearTokens();
      return false;
    }
    
    return true;
  }

  getToken(): string | null {
    return StorageManager.getItem<string>(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return StorageManager.getItem<string>(this.REFRESH_TOKEN_KEY);
  }

  getStoredUser(): UserProfile | null {
    return StorageManager.getUserData();
  }

  logout(): void {
    this.clearTokens();
  }

  /**
   * Get token expiry information by parsing JWT
   */
  getTokenExpiryInfo(): { isExpired: boolean; expiresIn: number; expiryTime: number | null } {
    const token = this.getToken();
    if (!token) {
      return { isExpired: true, expiresIn: 0, expiryTime: null };
    }
    
    try {
      // Parse JWT payload to get expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const expiresIn = expiryTime - now;
      
      return {
        isExpired: expiresIn <= 0,
        expiresIn: Math.max(0, expiresIn),
        expiryTime: expiryTime
      };
    } catch (error) {      return { isExpired: true, expiresIn: 0, expiryTime: null };
    }
  }

  /**
   * Check if token needs refresh (expires in less than 5 minutes)
   */
  shouldRefreshToken(): boolean {
    const { expiresIn } = this.getTokenExpiryInfo();
    // Only refresh if token expires in less than 5 minutes but more than 1 minute
    // This prevents constant refreshing while ensuring we refresh before expiry
    return expiresIn > 60 * 1000 && expiresIn < 5 * 60 * 1000; // Between 1-5 minutes
  }

  /**
   * Debug method to check authentication state
   */
  debugAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    this.getRefreshToken();
    this.getTokenExpiryInfo();    if (user) {    }
    if (token) {
      try {
        JSON.parse(atob(token.split('.')[1]));      } catch (e) {      }
    }  }

  /**
   * Force clear refresh state (for debugging)
   */
  clearRefreshState(): void {
    this.refreshPromise = null;
    this.lastRefreshAttempt = 0;  }
}

export const authService = new AuthService();

// Make authService available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).authService = authService;
}
