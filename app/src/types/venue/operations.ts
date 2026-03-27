/**
 * Venue Operations Types
 * 
 * Contains types for venue creation, updates, and filters.
 */

import type { VenueLocation, OperatingHours } from './venue';
import type { PriceRange } from '../common';

export interface VenueCreate {
  name: string;
  description?: string;
  location: VenueLocation;
  phone?: string;
  email?: string;
  cuisine_types: string[];
  price_range: PriceRange;
  operating_hours?: OperatingHours[];
  workspaceId: string;
  is_open?: boolean;
}

export interface VenueUpdate {
  name?: string;
  description?: string;
  location?: Partial<VenueLocation>;
  phone?: string;
  email?: string;
  cuisine_types?: string[];
  price_range?: PriceRange;
  isActive?: boolean;
  is_open?: boolean;
  status?: string;
  theme?: string;
  menu_template?: string;
  menu_template_config?: any;
}

export interface VenueFilters {
  search?: string;
  cuisine_type?: string;
  price_range?: PriceRange;
  subscription_status?: string;
  isActive?: boolean;
  page?: number;
  page_size?: number;
}