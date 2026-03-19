/**
 * Location Operations Types
 * 
 * Types for location CRUD operations and filters.
 */

import type { TableStatus } from './table';

// Table operations
export interface TableCreate {
  table_number: string;
  capacity: number;
  location?: string;
  venueId: string;
}

export interface TableUpdate {
  table_number?: string;
  capacity?: number;
  location?: string;
  table_status?: TableStatus;
  isActive?: boolean;
}

export interface TableFilters {
  venueId?: string;
  table_status?: TableStatus;
  isActive?: boolean;
  page?: number;
  page_size?: number;
}

// Service area operations
export interface ServiceAreaCreate {
  name: string;
  description?: string;
  venueId: string;
  capacity?: number;
}

export interface ServiceAreaUpdate {
  name?: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface ServiceAreaFilters {
  venueId?: string;
  isActive?: boolean;
  page?: number;
  page_size?: number;
}