/**
 * Menu Item Types
 * 
 * Menu item types and interfaces.
 */

import type { SpiceLevel } from '../common';

export interface MenuItem {
  id: string;
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
  image_urls?: string[];
  is_available: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicMenuData {
  venue: any; // Will be typed from venue domain
  table: any; // Will be typed from location domain
  categories: any[]; // Will be typed from category
  items: MenuItem[];
}