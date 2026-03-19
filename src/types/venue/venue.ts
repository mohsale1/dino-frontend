/**
 * Venue Types
 * 
 * Contains core venue-related types and interfaces.
 */

import type { PriceRange, DayOfWeek } from '../common';

export interface VenueLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface OperatingHours {
  day_of_week: DayOfWeek;
  is_open: boolean;
  open_time?: string; // HH:MM:SS format
  close_time?: string; // HH:MM:SS format
  is_24_hours: boolean;
  break_start?: string;
  break_end?: string;
}

export interface Venue {
  id: string;
  name: string;
  description?: string;
  location: VenueLocation;
  phone?: string;
  email?: string;
  cuisine_types: string[];
  price_range: PriceRange;
  rating?: number;
  total_reviews?: number;
  isActive: boolean;
  is_open: boolean;
  status?: string;
  workspaceId: string;
  owner_id?: string;
  operating_hours?: OperatingHours[];
  theme?: string;
  menu_template?: string;
  menu_template_config?: any;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  ownerId?: string;
  isOpen?: boolean;
}

export interface WorkspaceVenue {
  id: string;
  name: string;
  description?: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  phone?: string;
  email?: string;
  isActive: boolean;
  is_open: boolean;
  status: string;
  subscription_status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueAnalytics {
  venueId: string;
  total_menu_items: number;
  total_tables: number;
  recent_orders: number;
  total_customers: number;
  rating: number;
  total_reviews: number;
  subscription_status: string;
  isActive: boolean;
}

export interface VenueStatus {
  venueId: string;
  is_open: boolean;
  current_status: string;
  next_opening?: string;
  next_closing?: string;
  break_time?: {
    start: string;
    end: string;
  };
  message?: string;
}