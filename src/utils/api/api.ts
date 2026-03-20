/**
 * Enhanced API Service with Consistent Data Mapping
 * Handles snake_case to camelCase conversion and proper error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../../config/api';
import { authService } from '../../services/common/auth';

// Data transformation utilities
class DataTransformer {
  /**
   * Convert snake_case to camelCase recursively
   */
  static toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => DataTransformer.toCamelCase(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const camelCaseObj: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const camelKey = DataTransformer.snakeToCamel(key);
        camelCaseObj[camelKey] = DataTransformer.toCamelCase(value);
        
        // Keep original snake_case for API compatibility
        if (key !== camelKey) {
          camelCaseObj[key] = value;
        }
      }
      
      return camelCaseObj;
    }

    return obj;
  }

  /**
   * Convert camelCase to snake_case recursively
   */
  static toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => DataTransformer.toSnakeCase(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const snakeCaseObj: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = DataTransformer.camelToSnake(key);
        snakeCaseObj[snakeKey] = DataTransformer.toSnakeCase(value);
      }
      
      return snakeCaseObj;
    }

    return obj;
  }

  private static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// Enhanced API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();

  debugConfiguration?: () => void;

  constructor() {
    // Use a placeholder baseURL — the request interceptor resolves the real
    // one lazily so window.APP_CONFIG is guaranteed to be loaded by then.
    this.axiosInstance = axios.create({
      baseURL: '/',
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Resolve the correct base URL at request time.
   * Priority: window.APP_CONFIG.API_BASE_URL > API_CONFIG.BASE_URL
   * This ensures the runtime config injected by docker-entrypoint.sh is used
   * instead of the value baked in at build time.
   */
  private resolveBaseUrl(): string {
    if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.API_BASE_URL) {
      return (window as any).APP_CONFIG.API_BASE_URL;
    }
    return API_CONFIG.BASE_URL;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Always resolve base URL at request time so runtime config is respected
        config.baseURL = this.resolveBaseUrl();

        // Skip token refresh for auth endpoints to prevent loops
        const isAuthEndpoint = config.url?.includes('/auth/');

        // Only check token refresh for non-auth endpoints
        if (!isAuthEndpoint && authService.shouldRefreshToken()) {
          try {
            await authService.refreshToken();
          } catch (error) {
            // Error handled silently
          }
        }

        // Add authentication token
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Convert request data to snake_case
        if (config.data && typeof config.data === 'object') {
          config.data = DataTransformer.toSnakeCase(config.data);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Convert response data to camelCase
        if (response.data) {
          response.data = DataTransformer.toCamelCase(response.data);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token refresh)
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip retry for auth endpoints to prevent infinite loops
          const isAuthEndpoint = originalRequest.url?.includes('/auth/');
          if (isAuthEndpoint) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          try {
            const newToken = await authService.refreshToken();
            if (newToken && newToken.access_token) {
              originalRequest.headers.Authorization = `Bearer ${newToken.access_token}`;
              this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken.access_token}`;
              return this.axiosInstance(originalRequest);
            } else {
              authService.logout();
              window.location.href = '/login';
              return Promise.reject(new Error('Token refresh failed'));
            }
          } catch (refreshError) {
            authService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request with caching
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const cacheKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;

      if (this.requestQueue.has(cacheKey)) {
        return await this.requestQueue.get(cacheKey);
      }

      const requestPromise = (async () => {
        const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
        return this.handleResponse(response);
      })();

      this.requestQueue.set(cacheKey, requestPromise);

      try {
        const result = await requestPromise;
        this.requestQueue.delete(cacheKey);
        return result;
      } catch (error) {
        this.requestQueue.delete(cacheKey);
        throw error;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * File upload with progress tracking
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle successful responses
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    const data = response.data;

    if (data && typeof data === 'object') {
      if ('success' in data) {
        return data;
      }
      return {
        success: true,
        data: data as T,
        message: 'Request successful'
      };
    }

    return {
      success: true,
      data: data as T,
      message: 'Request successful'
    };
  }

  /**
   * Handle errors with consistent format and proper Pydantic error parsing
   */
  private handleError(error: any): Error {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      const responseData = error.response.data;

      if (responseData) {
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            const validationErrors = responseData.detail.map((err: any) => {
              const field = err.loc ? err.loc.join('.') : 'field';
              const message = err.msg || 'Invalid value';
              return `${field}: ${message}`;
            }).join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          } else if (typeof responseData.detail === 'object') {
            try {
              errorMessage = JSON.stringify(responseData.detail);
            } catch {
              errorMessage = 'Validation error occurred';
            }
          } else {
            errorMessage = responseData.detail;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (typeof responseData === 'object') {
          try {
            errorMessage = JSON.stringify(responseData);
          } catch {
            errorMessage = 'Server error occurred';
          }
        }

        errorCode = responseData.error_code || `HTTP_${error.response.status}`;
      } else {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        errorCode = `HTTP_${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
      errorCode = 'NETWORK_ERROR';
    } else {
      errorMessage = error.message || errorMessage;
      errorCode = 'CLIENT_ERROR';
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).code = errorCode;
    (enhancedError as any).response = error.response;

    return enhancedError;
  }

  /**
   * Clear request queue (useful for cleanup)
   */
  clearRequestQueue(): void {
    this.requestQueue.clear();
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.resolveBaseUrl();
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Refresh configuration from runtime config
   */
  refreshConfiguration(): void {
    // No-op — base URL is now resolved lazily on every request
  }

  /**
   * Set authorization header manually (useful for app initialization)
   */
  setAuthorizationHeader(token: string | null): void {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }
}


// Export singleton instance
export const apiService = new ApiService();

// Make apiService available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).apiService = apiService;
}

// Add debug method to the instance
apiService.debugConfiguration = function() {};

export default apiService;