/**
 * Category Types
 * 
 * Menu category types and interfaces.
 */

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  venueId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
