export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  categoryName?: string;
}

export interface PosMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  image?: string;
}

export const TAX_RATE = 0.1;

export const formatINR = (amount: number) =>
  `₹${(amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
