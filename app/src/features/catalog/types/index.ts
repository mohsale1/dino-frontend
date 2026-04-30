/**
 * Catalog Feature Types
 * Generic product/item catalog (previously menu)
 */

import { BaseEntity } from '../../../types/common';

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  workspaceId: number;
  personaId: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface CatalogItem extends BaseEntity {
  name: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  workspaceId: number;
  personaId: number;
  imageUrl?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface CategoryCreate {
  name: string;
  description?: string;
  personaId: number;
  imageUrl?: string;
  isAvailable?: boolean;
}


export interface CategoryUpdate {
  name?: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}


export interface CatalogItemCreate {
  personaId: number;
  name: string;
  description?: string;
  basePrice: number;
  categoryId: string | number;
  imageUrl?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
}


export interface CatalogItemUpdate {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string | number;
  imageUrl?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
}


export interface CatalogFilterParams {
  personaId?: number;
  categoryId?: string;
  isAvailable?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}