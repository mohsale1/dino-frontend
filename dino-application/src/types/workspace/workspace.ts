/**
 * Workspace Types
 * 
 * Contains core workspace-related types and interfaces.
 */

import type { VenueLocation } from '../venue';
import type { PriceRange } from '../common';

export interface Workspace {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  business_type: string;
  owner_id: string;
  venueIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkspaceStatistics {
  workspaceId: string;
  workspace_name: string;
  total_venues: number;
  active_venues: number;
  total_users: number;
  active_users: number;
  total_orders: number;
  total_menu_items: number;
  createdAt: string;
  isActive: boolean;
}

export interface WorkspaceRegistration {
  workspace_name: string;
  workspace_description?: string;
  venue_name: string;
  venue_description?: string;
  venue_location: VenueLocation;
  venue_phone?: string;
  venue_email?: string;
  price_range: PriceRange;
  venue_type?: string;
  owner_email: string;
  owner_phone?: string;
  owner_firstName: string;
  owner_lastName: string;
  owner_password: string;
  confirm_password: string;
}

export interface WorkspaceSignupRequest {
  workspace_name: string;
  workspace_description?: string;
  organization: {
    name: string;
    description?: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    organization_type: number;
    order_type: number;
  };
  admin_user: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
}

export interface WorkspaceSignupResponse {
  workspace: {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    [key: string]: any;
  };
  organization: {
    id: string;
    name: string;
    workspace_id: string;
    [key: string]: any;
  };
  admin_user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    [key: string]: any;
  };
  message: string;
}

export interface WorkspaceValidation {
  workspace_name: string;
  owner_email: string;
}

// Re-export types needed by workspace
export type { VenueLocation, PriceRange };