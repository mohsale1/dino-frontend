/**
 * User Data Normalizer
 * Converts API response to standardized UserProfile format
 * Backend sends camelCase - no conversion needed
 */

import { UserProfile } from '../types/api';

/**
 * Normalize user data from API response
 * Backend already sends camelCase format
 */
export function normalizeUserData(apiUser: any): UserProfile {
  return {
    id: apiUser.id,
    email: apiUser.email,
    phone: apiUser.phone || '',
    firstName: apiUser.firstName || '',
    lastName: apiUser.lastName || '',
    role: apiUser.role || 'operator',
    workspaceId: apiUser.workspaceId || null,
    venueId: apiUser.venueId || null,
    venueIds: apiUser.venueIds || [],
    isActive: apiUser.isActive ?? true,
    isVerified: apiUser.isVerified ?? false,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
    updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : new Date(),
    dateOfBirth: apiUser.dateOfBirth ? new Date(apiUser.dateOfBirth) : undefined,
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
