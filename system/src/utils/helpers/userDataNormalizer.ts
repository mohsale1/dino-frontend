/**
 * User Data Normalizer
 * Converts API response to standardized UserProfile format
 * Backend sends camelCase - no conversion needed
 */

import { UserProfile } from '../../types';

/**
 * Normalize user data from API response
 * Handles both snake_case (backend) and camelCase formats
 */
export function normalizeUserData(apiUser: any): UserProfile {
  // Handle venue_id from multiple sources
  const venueId = apiUser.venueId || apiUser.venue_id || apiUser.venue?.id || null;
  const venueIds = apiUser.venueIds || apiUser.venue_ids || (venueId ? [venueId] : []);
  
  return {
    id: apiUser.id,
    email: apiUser.email,
    phone: apiUser.phone || '',
    firstName: apiUser.firstName || apiUser.first_name || '',
    lastName: apiUser.lastName || apiUser.last_name || '',
    role: (typeof apiUser.role === 'object' ? apiUser.role?.name : apiUser.role) || '',
    workspaceId: apiUser.workspaceId || apiUser.workspace_id || null,
    venueId: venueId,
    venueIds: venueIds,
    isActive: apiUser.isActive ?? apiUser.is_active ?? true,
    isVerified: apiUser.isVerified ?? apiUser.is_verified ?? false,
    createdAt: apiUser.createdAt || apiUser.created_at ? new Date(apiUser.createdAt || apiUser.created_at) : new Date(),
    updatedAt: apiUser.updatedAt || apiUser.updated_at ? new Date(apiUser.updatedAt || apiUser.updated_at) : new Date(),
    dateOfBirth: apiUser.dateOfBirth || apiUser.date_of_birth ? new Date(apiUser.dateOfBirth || apiUser.date_of_birth) : undefined,
    gender: apiUser.gender,
    permissions: apiUser.permissions || [],
  };
}

/**
 * Get display name from user data
 */
export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return 'Guest';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

/**
 * Get user's active venue ID
 */
export function getActiveVenueId(user: UserProfile | null): string | null {
  if (!user) return null;
  return user.venueId || null;
}

/**
 * Get all venue IDs for user
 */
export function getAllVenueIds(user: UserProfile | null): string[] {
  if (!user) return [];
  return user.venueIds || [];
}

/**
 * Check if user has multiple venues
 */
export function hasMultipleVenues(user: UserProfile | null): boolean {
  return getAllVenueIds(user).length > 1;
}