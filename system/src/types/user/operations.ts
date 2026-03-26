/**
 * User Operations Types
 * 
 * Contains types for user creation, updates, registration, and filters.
 */

import type { UserProfileRole } from './user';
import type { Gender } from '../common';

export interface UserRegistration {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirm_password: string;
  role_id?: string;
  workspaceId: string;
  venueId?: string;
  date_of_birth?: string;
  gender?: Gender;
}

export interface UserCreate {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirm_password: string;
  role_id?: string;
  workspaceId: string;
  venue_ids?: string[];
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  date_of_birth?: string;
  isActive?: boolean;
}

export interface UserFilters {
  workspaceId?: string;
  venueId?: string;
  role?: UserProfileRole;
  isActive?: boolean;
  page?: number;
  page_size?: number;
}