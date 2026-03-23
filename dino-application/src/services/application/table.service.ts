/**
 * Table Service
 * Handles table-related API operations
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';

export interface Table {
  id: string;
  table_number: string;
  tableNumber?: string;
  table_status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity: number;
  area_id?: string;
  areaId?: string;
  current_order_id?: string;
  currentOrderId?: string;
  occupancy_time?: number;
  occupancyTime?: number;
  venueId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TableFilters {
  venueId?: string;
  areaId?: string;
  status?: string;
  isActive?: boolean;
}

class TableService {
  /**
   * Get all tables
   */
  async getTables(filters?: TableFilters): Promise<ApiResponse<Table[]>> {
    try {
      const params: any = {};
      if (filters?.venueId) params.venueId = filters.venueId;
      if (filters?.areaId) params.area_id = filters.areaId;
      if (filters?.status) params.status = filters.status;
      if (filters?.isActive !== undefined) params.is_active = filters.isActive;

      const response = await apiService.get<Table[]>('/application/tables', { params });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch tables',
      };
    }
  }

  /**
   * Get table by ID
   */
  async getTable(tableId: string): Promise<ApiResponse<Table>> {
    try {
      const response = await apiService.get<Table>(`/application/tables/${tableId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch table');
    }
  }

  /**
   * Create a new table
   */
  async createTable(data: Partial<Table>): Promise<ApiResponse<Table>> {
    try {
      const response = await apiService.post<Table>('/application/tables', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create table');
    }
  }

  /**
   * Update table
   */
  async updateTable(tableId: string, data: Partial<Table>): Promise<ApiResponse<Table>> {
    try {
      const response = await apiService.put<Table>(`/application/tables/${tableId}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update table');
    }
  }

  /**
   * Update table status
   */
  async updateTableStatus(
    tableId: string, 
    status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  ): Promise<ApiResponse<Table>> {
    try {
      const response = await apiService.put<Table>(`/application/tables/${tableId}/table-status`, {
        table_status: status,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update table status');
    }
  }

  /**
   * Delete table
   */
  async deleteTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete(`/application/tables/${tableId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete table');
    }
  }

  /**
   * Get table statistics
   */
  async getTableStatistics(venueId: string): Promise<any> {
    try {
      const response = await apiService.get(`/application/tables/statistics`, {
        params: { venueId },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching table statistics:', error);
      return null;
    }
  }
}

export const tableService = new TableService();