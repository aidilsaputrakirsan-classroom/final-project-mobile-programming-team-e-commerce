import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  toggleSelection: (productId: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  clearCart: () => void;
  getTotal: () => number;
  getSelectedTotal: () => number;
  getItemCount: () => number;
  getSelectedItemCount: () => number;
  getSelectedItemsCount: () => number;
  getSelectedItems: () => CartItem[];
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
                { product, quantity: clampQuantity(quantity, product.stock), selected: true },
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
      toggleSelection: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, selected: !item.selected }
              : item
          ),
        }));
      },
      selectAll: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: true })),
        }));
      },
      unselectAll: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: false })),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        ),
      getSelectedTotal: () =>
        get().items.reduce(
          (total, item) =>
            item.selected ? total + item.product.price * item.quantity : total,
          0,
        ),
      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getSelectedItemCount: () =>
        get().items.reduce(
          (total, item) => (item.selected ? total + item.quantity : total),
          0,
        ),
      getSelectedItemsCount: () =>
        get().items.filter((item) => item.selected).length,
      getSelectedItems: () => get().items.filter((item) => item.selected),
    }),
    {
      name: 'bahanku-cart-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Migrasi: set selected = true untuk item yang belum punya property selected
        if (state?.items) {
          state.items = state.items.map((item) => ({
            ...item,
            selected: item.selected ?? true,
          }));
        }
      },
    },
  ),
);