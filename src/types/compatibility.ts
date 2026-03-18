/**
 * Compatibility Layer for API Types
 * 
 * This file provides compatibility between legacy types and new API types
 * to ensure smooth transition and backward compatibility.
 */

import type {
  UserProfile,
  UserProfile as ApiUserProfile,
  MenuItem as ApiMenuItem,
  MenuCategory as ApiMenuCategory,
  Order as ApiOrder,
  OrderItem as ApiOrderItem,
  Table as ApiTable,
  Venue,
  OrderStatus as ApiOrderStatus,
  PaymentStatus as ApiPaymentStatus,
  UserRole as ApiUserRole
} from './api';

import type {
  UserProfile as LegacyUserProfile,
  MenuItem as LegacyMenuItem,
  MenuCategory as LegacyMenuCategory,
  Order as LegacyOrder,
  OrderItem as LegacyOrderItem,
  Table as LegacyTable,
  LegacyCafe,
  OrderStatus as LegacyOrderStatus,
  PaymentStatus as LegacyPaymentStatus,
  UserRole as LegacyUserRole
} from './index';

// =============================================================================
// TYPE CONVERTERS
// =============================================================================

/**
 * Convert API User Profile to Legacy User Profile
 */
export const convertApiUserToLegacy = (apiUser: ApiUserProfile): UserProfile => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    phone: apiUser.phone,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    name: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
    dateOfBirth: apiUser.dateOfBirth,
    gender: apiUser.gender,
    role: apiUser.role as any,
    permissions: [], // Would need to be fetched separately
    profileImageUrl: undefined, // Not in API response
    isActive: apiUser.isActive,
    isVerified: true, // Assume verified if in system
    addresses: [], // Would need to be fetched separately
    preferences: undefined, // Would need to be fetched separately
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    lastLogin: undefined, // Not in API response
    loginCount: undefined, // Not in API response
    totalOrders: undefined, // Not in API response
    totalSpent: undefined, // Not in API response
    workspaceId: apiUser.workspaceId,
    venueId: apiUser.venueId
  };
};

/**
 * Convert Legacy User Profile to API User Profile
 */
export const convertLegacyUserToApi = (legacyUser: UserProfile): Partial<ApiUserProfile> => {
  return {
    id: legacyUser.id,
    email: legacyUser.email,
    phone: legacyUser.phone,
    firstName: legacyUser.firstName,
    lastName: legacyUser.lastName,
    role: legacyUser.role as ApiUserRole,
    workspaceId: legacyUser.workspaceId,
    venueId: legacyUser.venueId,
    isActive: legacyUser.isActive,
    createdAt: legacyUser.createdAt,
    updatedAt: legacyUser.updatedAt,
    dateOfBirth: legacyUser.dateOfBirth,
    gender: legacyUser.gender
  };
};

/**
 * Convert API Menu Item to Legacy Menu Item
 */
export const convertApiMenuItemToLegacy = (apiItem: ApiMenuItem): LegacyMenuItem => {
  return {
    id: apiItem.id,
    name: apiItem.name,
    description: apiItem.description || '',
    price: apiItem.base_price,
    category: apiItem.category_id,
    isVeg: apiItem.is_vegetarian || false,
    image: apiItem.image_urls?.[0],
    isAvailable: apiItem.is_available,
    preparationTime: apiItem.preparation_time_minutes || 15,
    ingredients: [], // Not in API response
    allergens: [], // Not in API response
    venueId: apiItem.venueId,
    order: 0 // Not in API response
  };
};

/**
 * Convert Legacy Menu Item to API Menu Item
 */
export const convertLegacyMenuItemToApi = (legacyItem: LegacyMenuItem): Partial<ApiMenuItem> => {
  return {
    id: legacyItem.id,
    name: legacyItem.name,
    description: legacyItem.description,
    base_price: legacyItem.price,
    category_id: legacyItem.category,
    venueId: legacyItem.venueId,
    is_vegetarian: legacyItem.isVeg,
    is_available: legacyItem.isAvailable,
    preparation_time_minutes: legacyItem.preparationTime,
    image_urls: legacyItem.image ? [legacyItem.image] : undefined
  };
};

/**
 * Convert API Menu Category to Legacy Menu Category
 */
export const convertApiMenuCategoryToLegacy = (apiCategory: ApiMenuCategory): LegacyMenuCategory => {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description,
    order: 0, // Not in API response
    venueId: apiCategory.venueId
  };
};

/**
 * Convert API Order to Legacy Order
 */
export const convertApiOrderToLegacy = (apiOrder: ApiOrder): LegacyOrder => {
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.order_number,
    venueId: apiOrder.venueId,
    tableId: apiOrder.table_id || '',
    customerId: apiOrder.customer_id,
    items: apiOrder.items.map(convertApiOrderItemToLegacy),
    status: apiOrder.status as LegacyOrderStatus,
    paymentStatus: apiOrder.payment_status as LegacyPaymentStatus,
    specialInstructions: apiOrder.special_instructions,
    estimatedTime: 30, // Default preparation time
    createdAt: new Date(apiOrder.createdAt),
    updatedAt: new Date(apiOrder.updatedAt || apiOrder.createdAt)
  };
};

/**
 * Convert API Order Item to Legacy Order Item
 */
export const convertApiOrderItemToLegacy = (apiItem: ApiOrderItem): LegacyOrderItem => {
  return {
    menuItemId: apiItem.menu_item_id,
    menuItemName: apiItem.menu_item_name,
    variantName: apiItem.variant_name,
    quantity: apiItem.quantity,
    price: apiItem.unit_price,
    specialInstructions: apiItem.special_instructions
  };
};

/**
 * Convert API Table to Legacy Table
 */
export const convertApiTableToLegacy = (apiTable: ApiTable): LegacyTable => {
  return {
    id: apiTable.id,
    tableNumber: parseInt(apiTable.table_number) || 0,
    qrCode: apiTable.qr_code,
    qrCodeUrl: '', // Would need to be generated
    venueId: apiTable.venueId,
    isActive: apiTable.isActive,
    createdAt: new Date(apiTable.createdAt)
  };
};

/**
 * Convert API Venue to Legacy Cafe
 */
export const convertApiVenueToLegacyCafe = (apiVenue: Venue): LegacyCafe => {
  return {
    id: apiVenue.id,
    name: apiVenue.name,
    description: apiVenue.description || '',
    address: formatVenueAddress(apiVenue),
    phone: apiVenue.phone || '',
    email: apiVenue.email || '',
    ownerId: '', // Not in API response
    logo: undefined, // Not in API response
    isActive: apiVenue.isActive,
    createdAt: new Date(apiVenue.createdAt),
    updatedAt: new Date(apiVenue.updatedAt || apiVenue.createdAt)
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format venue address from location object
 */
export const formatVenueAddress = (venue: Venue): string => {
  const { location } = venue;
  const parts = [
    location.address,
    location.city,
    location.state,
    location.postal_code || '',
    location.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Check if a value is a legacy type or API type
 */
export const isLegacyUser = (user: any): user is LegacyUserProfile => {
  return user && typeof user.firstName === 'string';
};

export const isApiUser = (user: any): user is ApiUserProfile => {
  return user && typeof user.firstName === 'string';
};

export const isLegacyMenuItem = (item: any): item is LegacyMenuItem => {
  return item && typeof item.price === 'number' && typeof item.isVeg === 'boolean';
};

export const isApiMenuItem = (item: any): item is ApiMenuItem => {
  return item && typeof item.base_price === 'number' && typeof item.is_vegetarian === 'boolean';
};

// =============================================================================
// ADAPTER CLASSES
// =============================================================================

/**
 * User Adapter - provides a unified interface for both legacy and API users
 */
export class UserAdapter {
  private user: LegacyUserProfile | ApiUserProfile;

  constructor(user: LegacyUserProfile | ApiUserProfile) {
    this.user = user;
  }

  get id(): string {
    return this.user.id;
  }

  get email(): string {
    return this.user.email;
  }

  get firstName(): string {
    return this.user.firstName || this.user.firstName || '';
  }

  get lastName(): string {
    return this.user.lastName || this.user.lastName || '';
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get role(): string {
    return this.user.role;
  }

  get isActive(): boolean {
    return this.user.isActive ?? this.user.isActive ?? false;
  }

  get workspaceId(): string | undefined {
    return this.user.workspaceId || this.user.workspaceId;
  }

  get venueId(): string | undefined {
    return this.user.venueId || this.user.venueId;
  }

  toLegacy(): LegacyUserProfile {
    return isLegacyUser(this.user) ? this.user : convertApiUserToLegacy(this.user);
  }

  toApi(): Partial<ApiUserProfile> {
    return isApiUser(this.user) ? this.user : convertLegacyUserToApi(this.user);
  }
}

/**
 * Menu Item Adapter - provides a unified interface for both legacy and API menu items
 */
export class MenuItemAdapter {
  private item: LegacyMenuItem | ApiMenuItem;

  constructor(item: LegacyMenuItem | ApiMenuItem) {
    this.item = item;
  }

  get id(): string {
    return this.item.id;
  }

  get name(): string {
    return this.item.name;
  }

  get description(): string {
    return this.item.description || '';
  }

  get price(): number {
    return isLegacyMenuItem(this.item) ? this.item.price : this.item.base_price;
  }

  get isVegetarian(): boolean {
    return isLegacyMenuItem(this.item) ? this.item.isVeg : (this.item.is_vegetarian || false);
  }

  get isAvailable(): boolean {
    return isLegacyMenuItem(this.item) ? this.item.isAvailable : this.item.is_available;
  }

  get preparationTime(): number {
    return isLegacyMenuItem(this.item) ? this.item.preparationTime : (this.item.preparation_time_minutes || 15);
  }

  get venueId(): string {
    return isLegacyMenuItem(this.item) ? this.item.venueId : this.item.venueId;
  }

  toLegacy(): LegacyMenuItem {
    return isLegacyMenuItem(this.item) ? this.item : convertApiMenuItemToLegacy(this.item);
  }

  toApi(): Partial<ApiMenuItem> {
    return isApiMenuItem(this.item) ? this.item : convertLegacyMenuItemToApi(this.item);
  }
}

// =============================================================================
// MIGRATION HELPERS
// =============================================================================

/**
 * Migrate legacy data to API format
 */
export const migrateLegacyData = {
  users: (legacyUsers: LegacyUserProfile[]): Partial<ApiUserProfile>[] => {
    return legacyUsers.map(convertLegacyUserToApi);
  },

  menuItems: (legacyItems: LegacyMenuItem[]): Partial<ApiMenuItem>[] => {
    return legacyItems.map(convertLegacyMenuItemToApi);
  },

  // Add more migration functions as needed
};

/**
 * Validate compatibility between legacy and API types
 */
export const validateCompatibility = {
  user: (legacyUser: LegacyUserProfile, apiUser: ApiUserProfile): boolean => {
    return legacyUser.id === apiUser.id && 
           legacyUser.email === apiUser.email &&
           (legacyUser.firstName || legacyUser.firstName) === apiUser.firstName &&
           (legacyUser.lastName || legacyUser.lastName) === apiUser.lastName;
  },

  menuItem: (legacyItem: LegacyMenuItem, apiItem: ApiMenuItem): boolean => {
    return legacyItem.id === apiItem.id &&
           legacyItem.name === apiItem.name &&
           legacyItem.price === apiItem.base_price;
  }
};

export default {
  // Converters
  convertApiUserToLegacy,
  convertLegacyUserToApi,
  convertApiMenuItemToLegacy,
  convertLegacyMenuItemToApi,
  convertApiMenuCategoryToLegacy,
  convertApiOrderToLegacy,
  convertApiOrderItemToLegacy,
  convertApiTableToLegacy,
  convertApiVenueToLegacyCafe,

  // Type guards
  isLegacyUser,
  isApiUser,
  isLegacyMenuItem,
  isApiMenuItem,

  // Adapters
  UserAdapter,
  MenuItemAdapter,

  // Migration helpers
  migrateLegacyData,
  validateCompatibility,

  // Utilities
  formatVenueAddress
};