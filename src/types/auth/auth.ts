/**
 * Core Authentication Types
 * 
 * Contains fundamental auth-related interfaces for login, registration,
 * and user authentication state.
 */

import type { Permission } from './permissions';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: Permission[];
  workspaceId?: string;
  venueId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: AuthUser | any; // Allow any for compatibility with UserProfile
}

export interface UserRoleObject {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
}