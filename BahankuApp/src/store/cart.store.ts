import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const clampQuantity = (quantity: number, stock?: number) => {
  if (stock === undefined || stock === null) {
    return Math.max(1, quantity);
  }

  if (stock <= 0) {
    return 0;
  }

  if (quantity < 1) {
    return 1;
  }

  return quantity > stock ? stock : quantity;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity) => {
        if (product.stock !== undefined && product.stock <= 0) {
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id,
          );

          if (existingIndex === -1) {
            return {
              items: [
                ...state.items,
                { product, quantity: clampQuantity(quantity, product.stock) },
              ],
            };
          }

          const updatedItems = [...state.items];
          const existingItem = updatedItems[existingIndex];
          const mergedQty = clampQuantity(
            existingItem.quantity + quantity,
            product.stock,
          );

          updatedItems[existingIndex] = { ...existingItem, quantity: mergedQty };
          return { items: updatedItems };
        });
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: clampQuantity(quantity, item.product.stock),
                }
              : item,
          ),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        ),
      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'bahanku-cart-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
