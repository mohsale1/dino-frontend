import { useState, useCallback } from 'react';

export interface CartItem {
  item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
  description?: string;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity' | 'total_price'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item_id === item.item_id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map((cartItem) =>
          cartItem.item_id === item.item_id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                total_price: (cartItem.quantity + 1) * cartItem.unit_price,
              }
            : cartItem
        );
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            ...item,
            quantity: 1,
            total_price: item.unit_price,
          },
        ];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.item_id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.item_id === itemId
          ? {
              ...item,
              quantity,
              total_price: quantity * item.unit_price,
            }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.total_price, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const getCartItem = useCallback((itemId: string) => {
    return cart.find((item) => item.item_id === itemId);
  }, [cart]);

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