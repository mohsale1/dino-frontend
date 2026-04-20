import { useState, useCallback, useEffect } from 'react';

const CART_STORAGE_KEY = 'dino_cart';

export interface CartItem {
  item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
  description?: string;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]): void => {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // sessionStorage may be unavailable (e.g. private browsing quota exceeded)
  }
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.item_id === item.item_id);
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        return prevCart.map((c) =>
          c.item_id === item.item_id
            ? { ...c, quantity: newQty, total_price: newQty * c.unit_price }
            : c
        );
      }
      return [
        ...prevCart,
        { ...item, total_price: item.quantity * item.unit_price },
      ];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((c) => c.item_id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((c) =>
          c.item_id === itemId
            ? { ...c, quantity, total_price: quantity * c.unit_price }
            : c
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(
    () => cart.reduce((sum, c) => sum + c.total_price, 0),
    [cart]
  );

  const getCartItemCount = useCallback(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart]
  );

  const getCartItem = useCallback(
    (itemId: string): CartItem | undefined =>
      cart.find((c) => c.item_id === itemId),
    [cart]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getCartItem,
  };
};