/**
 * Authentication services index
 * Centralized exports for all authentication-related services
 */

export { authService } from './auth';
export { default as PermissionService, default } from './permission';
export { userService } from './user';
export { roleService } from './role';
export { userDataService, type UserData } from './userData';

// Export types for components
export type { User, UserCreate, UserUpdate } from './user';
export type { Role } from './role';
