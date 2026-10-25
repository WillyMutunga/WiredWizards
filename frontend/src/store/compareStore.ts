import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareProductSummary {
  id: number;
  name: string;
  sku: string;
  price: number;
}

interface CompareState {
  items: CompareProductSummary[];
  toggleCompare: (product: any) => void;
  removeCompare: (id: number) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleCompare: (product) => {
        const current = get().items;
        const exists = current.some((i) => i.id === product.id);
        if (exists) {
          set({ items: current.filter((i) => i.id !== product.id) });
        } else {
          if (current.length >= 4) {
            alert('You can compare a maximum of 4 solar products simultaneously.');
            return;
          }
          set({
            items: [
              ...current,
              {
                id: product.id,
                name: product.name,
                sku: product.sku,
                price: Number(product.effective_price ?? product.discount_price ?? product.selling_price ?? 0),
              },
            ],
          });
        }
      },
      removeCompare: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'wired-wizards-compare',
    }
  )
);
