/**
 * Venue Utilities - Centralized venue validation and access logic
 * 
 * This utility helps resolve venue assignment issues by providing
 * a single source of truth for venue validation across different contexts.
 */

import { UserProfile } from '../../types';
import { UserData } from '../../services/auth/userData';
import { isOwner, normalizeRole } from '../../types/auth/roles';

export interface VenueValidationResult {
  hasVenue: boolean;
  venueId: string | null;
  source: 'userData' | 'authUser' | 'none';
  canAccessVenue: (targetVenueId: string) => boolean;
}

/**
 * Comprehensive venue validation that checks multiple sources
 */
export const validateVenueAccess = (
  userData: UserData | null,
  authUser: UserProfile | null,
  targetVenueId?: string
): VenueValidationResult => {
  
  // Priority 1: Check userData context (most reliable)
  if (userData?.venue?.id) {
    const venueId = userData.venue.id;
    return {
      hasVenue: true,
      venueId,
      source: 'userData',
      canAccessVenue: (targetId: string) => targetId === venueId
    };
  }
  
  // Priority 2: Check auth user context (fallback)
  if (authUser?.venueId) {
    const venueId = authUser.venueId;
    return {
      hasVenue: true,
      venueId,
      source: 'authUser',
      canAccessVenue: (targetId: string) => targetId === venueId
    };
  }
  
  // Priority 3: Check if user has venueIds array
  if (authUser?.venueIds && authUser.venueIds.length > 0) {
    const venueId = authUser.venueIds[0]; // Use first venue as default
    return {
      hasVenue: true,
      venueId,
      source: 'authUser',
      canAccessVenue: (targetId: string) => authUser.venueIds?.includes(targetId) || false
    };
  }
  
  // Priority 4: Check if user is Owner (can access any venue)
  const userRole = (authUser as any)?.role;
  const roleName = typeof userRole === 'string' ? userRole : userRole?.name;
  
  if (isOwner(roleName)) {
    return {
      hasVenue: true,
      venueId: targetVenueId || null,
      source: 'authUser',
      canAccessVenue: () => true // Owner can access any venue
    };
  }
  
  // No venue access found
  return {
    hasVenue: false,
    venueId: null,
    source: 'none',
    canAccessVenue: () => false
  };
};

/**
 * Check if user can access a specific venue
 */
export const canUserAccessVenue = (
  userData: UserData | null,
  authUser: UserProfile | null,
  venueId: string
): boolean => {
  const validation = validateVenueAccess(userData, authUser, venueId);
  return validation.canAccessVenue(venueId);
};

/**
 * Get the primary venue ID for a user from multiple sources
 */
export const getPrimaryVenueId = (
  userData: UserData | null,
  authUser: UserProfile | null
): string | null => {
  const validation = validateVenueAccess(userData, authUser);
  return validation.venueId;
};

/**
 * Check if user requires venue assignment
 */
export const requiresVenueAssignment = (
  userData: UserData | null,
  authUser: UserProfile | null
): boolean => {
  const validation = validateVenueAccess(userData, authUser);
  
  // Owner doesn't require venue assignment
  const userRole = (authUser as any)?.role;
  const roleName = typeof userRole === 'string' ? userRole : userRole?.name;
  
  if (isOwner(roleName)) {
    return false;
  }
  
  // Other users require venue assignment
  return !validation.hasVenue;
};

/**
 * Debug venue assignment status
 */
export const debugVenueAssignment = (
  userData: UserData | null,
  authUser: UserProfile | null,
  context: string = 'unknown'
): void => {
  // Debug logging removed for production
};

/**
 * Format venue display name
 */
export const getVenueDisplayName = (
  userData: UserData | null,
  authUser: UserProfile | null
): string => {
  const validation = validateVenueAccess(userData, authUser);
  
  if (validation.source === 'userData' && userData?.venue?.name) {
    return userData.venue.name;
  }
  
  if (validation.hasVenue) {
    return `Venue ${validation.venueId}`;
  }
  
  return 'No Venue Assigned';
};
