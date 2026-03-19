/**
 * Catalog Operations Types
 * 
 * Types for catalog CRUD operations and filters.
 */

import type { SpiceLevel } from '../common';

// Category operations
export interface MenuCategoryCreate {
  name: string;
  description?: string;
  venueId: string;
}

export interface MenuCategoryUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Item operations
export interface MenuItemCreate {
  name: string;
  description?: string;
  base_price: number;
  category_id: string;
  venueId: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: SpiceLevel;
  preparation_time_minutes?: number;
  nutritional_info?: Record<string, any>;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  base_price?: number;
  category_id?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: SpiceLevel;
  preparation_time_minutes?: number;
  nutritional_info?: Record<string, any>;
  is_available?: boolean;
}

// Filters
export interface MenuFilters {
  venueId?: string;
  category_id?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  spice_level?: string;
  page?: number;
  page_size?: number;
}