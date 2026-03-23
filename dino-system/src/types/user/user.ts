/**
 * User Types
 * 
 * Contains core user-related types and interfaces.
 */

import type { Gender, SpiceLevel } from '../common';

export type UserProfileRole = 'superadmin' | 'admin' | 'operator' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserProfileRole;
  workspaceId?: string;
  venueId?: string;
  venueIds?: string[];
  isActive: boolean;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt?: Date;
  dateOfBirth?: Date;
  gender?: Gender;
  permissions?: any[];
  name?: string;
  profileImageUrl?: string;
  addresses?: UserAddress[];
  preferences?: UserPreferences;
  lastLogin?: Date;
  loginCount?: number;
  totalOrders?: number;
  totalSpent?: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserProfileRole;
  workspaceId: string;
  venueId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface VenueUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserProfileRole;
  role_display_name: string;
  last_login?: string;
  status?: string;
  isActive: boolean;
  workspaceId: string;
  venueId?: string;
  role_id?: string;
  createdAt: string;
  updatedAt?: string;
  user_name?: string;
  last_logged_in?: string;
}

export interface UserAddress {
  id?: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  spiceLevel: SpiceLevel;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}