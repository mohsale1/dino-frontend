/**
 * Workspace Operations Types
 * 
 * Types for workspace creation, updates, and filters.
 */

export interface WorkspaceCreate {
  display_name: string;
  description?: string;
  business_type: string;
}

export interface WorkspaceUpdate {
  display_name?: string;
  description?: string;
  isActive?: boolean;
}