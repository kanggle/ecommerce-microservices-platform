'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItem } from './types';
import { calculateTotal, calculateItemCount } from '../lib/calculate-total';

const STORAGE_KEY = 'cart';

interface CartContextValue {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn('Cart load failed', error);
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Cart save failed', error);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCart(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId,
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId && i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, variantId: string) => {
      setItems((prev) =>
        prev.filter((i) => !(i.productId === productId && i.variantId === variantId)),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => !(i.productId === productId && i.variantId === variantId)),
        );
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity }
            : i,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = calculateTotal(items);
  const itemCount = calculateItemCount(items);

  const value = useMemo(
    () => ({ items, totalAmount, itemCount, addItem, removeItem, updateQuantity, clearCart }),
    [items, totalAmount, itemCount, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
