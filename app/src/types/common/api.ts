/**
 * Common API Response Types
 * 
 * Standard API response structures used across all endpoints.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}