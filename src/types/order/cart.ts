/**
 * Cart Types
 * 
 * Shopping cart types and interfaces.
 */

import type { MenuItem } from '../catalog';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}