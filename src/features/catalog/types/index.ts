

/**
 * Catalog Feature Types
 * Generic product/item catalog (previously menu)
 */

import { BaseEntity, Location } from '../../../types/common';

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  workspaceId: string;
  isActive: boolean;
  displayOrder?: number;
  icon?: string;
  color?: string;
}

export interface CatalogItem extends BaseEntity {
  name: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  workspaceId: string;
  imageUrls?: string[];
  isAvailable: boolean;
  preparationTime?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  // Food-specific (optional)
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  nutritionalInfo?: Record<string, any>;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  workspaceId: string;
  isActive?: boolean;
  displayOrder?: number;
  icon?: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
  icon?: string;
  color?: string;
}

export interface CatalogItemCreate {
  name: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  workspaceId: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  preparationTime?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CatalogItemUpdate {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  preparationTime?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CatalogFilterParams {
  workspaceId?: string;
  categoryId?: string;
  isAvailable?: boolean;
  searchQuery?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}