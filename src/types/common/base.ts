/**
 * Base Entity Types
 * 
 * Common base interfaces and types used across all domain entities.
 */

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}