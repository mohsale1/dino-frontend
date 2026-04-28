import axios from 'axios';
import { AuthToken, UserProfile, ApiResponse } from '../../types';
import { apiService } from '../../utils/api';
import StorageManager from '../../utils/storage';
import { normalizeUserData } from '../../utils/helpers/userDataNormalizer';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { DEFAULTS, SERVICE_TIMEOUTS } from '../../constants/app';

class AuthService {
  // Use StorageManager keys for consistency
  private readonly TOKEN_KEY = StorageManager.KEYS.TOKEN;
  private readonly USER_KEY = StorageManager.KEYS.USER;
  private readonly REFRESH_TOKEN_KEY = StorageManager.KEYS.REFRESH_TOKEN;

  async login(email: string, password: string, rememberMe: boolean = false, isSystemUser: boolean = false): Promise<AuthToken> {
    void rememberMe;
    try {
      // Determine the correct endpoint based on user type
      const endpoint = isSystemUser ? API_ENDPOINTS.SYSTEM.AUTH.LOGIN : API_ENDPOINTS.APPLICATION.AUTH.LOGIN;

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
      StorageManager.setItem(StorageManager.KEYS.USER_TYPE, isSystemUser ? DEFAULTS.USER_TYPE_SYSTEM : DEFAULTS.USER_TYPE_APPLICATION);

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
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  async signup(signupData: any): Promise<ApiResponse<any>> {
    try {
      // Use /application/auth/signup endpoint with new structure
      const response = await apiService.post<any>(API_ENDPOINTS.APPLICATION.AUTH.SIGNUP, signupData);

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
        const storedUserType = StorageManager.getItem<string>(StorageManager.KEYS.USER_TYPE);
        isSystemUser = storedUserType === DEFAULTS.USER_TYPE_SYSTEM;
      }

      // Determine the correct endpoint based on user type
      const endpoint = isSystemUser ? API_ENDPOINTS.SYSTEM.AUTH.ME : API_ENDPOINTS.APPLICATION.AUTH.ME;

      const response = await apiService.get<any>(endpoint);

      if (response.success && response.data) {
        // /application/auth/me returns { user: {...}, workspace: {...} }
        // /system/auth/me returns the user object directly
        const payload = response.data as any;
        const rawUser = payload?.user ?? payload;

        // Attach the raw role object so Auth context can read role.permissions
        const normalized = normalizeUserData(rawUser) as unknown as UserProfile;
        (normalized as any)._rawRole = rawUser.role;

        StorageManager.setUserData(normalized);
        return normalized;
      }

      throw new Error('Failed to get user profile');
    } catch (error: any) {
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
      const storedUserType = StorageManager.getItem<string>(StorageManager.KEYS.USER_TYPE);
      const isSystemUser = storedUserType === DEFAULTS.USER_TYPE_SYSTEM;

      // Determine the correct endpoint based on user type
      const endpoint = isSystemUser ? API_ENDPOINTS.SYSTEM.AUTH.CHANGE_PASSWORD : API_ENDPOINTS.APPLICATION.AUTH.CHANGE_PASSWORD;

      // Send plain passwords to backend - backend handles hashing
      const response = await apiService.post(endpoint, {
        old_password: currentPassword,
        new_password: newPassword
      });

      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to change password');
    }
  }

  private refreshPromise: Promise<AuthToken | null> | null = null;
  private lastRefreshAttempt: number = 0;
  private readonly REFRESH_COOLDOWN = SERVICE_TIMEOUTS.TOKEN_REFRESH_COOLDOWN_MS; // 30 seconds cooldown between refresh attempts

  async refreshToken(): Promise<AuthToken | null> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Check cooldown period to prevent too frequent refresh attempts
    const now = Date.now();
    if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
      return null;
    }

    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.clearTokens();
        return null;
      }

      this.lastRefreshAttempt = now;
      // Create the refresh promise using direct axios to avoid interceptor loops
      this.refreshPromise = (async () => {
        try {
          const baseURL = (apiService as any).axiosInstance.defaults.baseURL;
          const storedUserType = StorageManager.getItem<string>(StorageManager.KEYS.USER_TYPE);
          const refreshEndpoint = storedUserType === DEFAULTS.USER_TYPE_SYSTEM
            ? API_ENDPOINTS.SYSTEM.AUTH.REFRESH
            : API_ENDPOINTS.APPLICATION.AUTH.REFRESH;
          const response = await axios.post(`${baseURL}${refreshEndpoint}`, {
            refresh_token: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.data && response.data.access_token) {
            const tokenData = response.data;
            // Store tokens without user data (refresh doesn't return user)
            StorageManager.setItem(this.TOKEN_KEY, tokenData.access_token);
            if (tokenData.refresh_token) {
              StorageManager.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
            }
            return tokenData;
          }
          this.clearTokens();
          return null;
        } catch (error: any) {
          this.clearTokens();
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

  private clearTokens(): void {
    StorageManager.removeItem(this.TOKEN_KEY);
    StorageManager.removeItem(this.USER_KEY);
    StorageManager.removeItem(this.REFRESH_TOKEN_KEY);
    StorageManager.removeItem(StorageManager.KEYS.USER_TYPE);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired by parsing JWT
    const { isExpired } = this.getTokenExpiryInfo();
    if (isExpired) {
      this.clearTokens();
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
    } catch (error) {
      return { isExpired: true, expiresIn: 0, expiryTime: null };
    }
  }

  /**
   * Check if token needs refresh (expires in less than 5 minutes)
   */
  shouldRefreshToken(): boolean {
    const { expiresIn } = this.getTokenExpiryInfo();
    // Only refresh if token expires in less than 5 minutes but more than 1 minute
    // This prevents constant refreshing while ensuring we refresh before expiry
    return expiresIn > SERVICE_TIMEOUTS.TOKEN_REFRESH_MIN_MS && expiresIn < SERVICE_TIMEOUTS.TOKEN_REFRESH_MAX_MS; // Between 1-5 minutes
  }
}

export const authService = new AuthService();
