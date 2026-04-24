/**
 * System services index
 * Business logic services for system operations
 */

export * from './user';
export * from './workspace';
// workspaceRequest — export service only, types are superseded by registration.ts
export { workspaceRequestService } from './workspaceRequest';
export * from './role';
export * from './permission';
// registration owns all WorkspaceRequest types (richer shape with nested user/workspace)
export * from './registration';
export * from './billing';
export * from './dashboard';
export * from './settings';

// Alias exports for backward compatibility
export { systemWorkspaceService as workspaceService } from './workspace';