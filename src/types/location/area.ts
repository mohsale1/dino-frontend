/**
 * Service Area Types
 * 
 * Service area/location types and interfaces.
 */

export interface ServiceArea {
  id: string;
  name: string;
  description?: string;
  venueId: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}