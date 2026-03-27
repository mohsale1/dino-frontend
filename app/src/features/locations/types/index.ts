/**
 * Locations Feature Types
 * Service locations/points (previously tables)
 */

import { BaseEntity } from '../../../types/common';

export type LocationStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface ServiceArea extends BaseEntity {
  name: string;
  description?: string;
  workspaceId: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface ServiceLocation extends BaseEntity {
  identifier: string; // Location number/code
  name?: string;
  areaId?: string;
  workspaceId: string;
  capacity?: number;
  status: LocationStatus;
  isActive: boolean;
  description?: string;
  qrCode?: string;
  metadata?: Record<string, any>;
}

export interface ServiceAreaCreate {
  name: string;
  description?: string;
  workspaceId: string;
  isActive?: boolean;
}

export interface ServiceAreaUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ServiceLocationCreate {
  identifier: string;
  name?: string;
  areaId?: string;
  workspaceId: string;
  capacity?: number;
  status?: LocationStatus;
  description?: string;
}

export interface ServiceLocationUpdate {
  identifier?: string;
  name?: string;
  areaId?: string;
  capacity?: number;
  status?: LocationStatus;
  isActive?: boolean;
  description?: string;
}

export interface LocationFilters {
  workspaceId?: string;
  areaId?: string;
  status?: LocationStatus;
  isActive?: boolean;
}