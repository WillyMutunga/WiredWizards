import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  is_vatable: boolean;
  vat_rate: number;
  vat_status: string;
  quantity: number;
  image?: string | null;
}

interface CartState {
  items: CartItem[];
  selectedLocationId: number;
  addItem: (product: any, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  setSelectedLocationId: (locationId: number) => void;
  clearCart: () => void;
  getTotals: () => {
    vatableSubtotal: number;
    nonVatableSubtotal: number;
    subtotal: number;
    totalVat: number;
    grandTotal: number;
    itemCount: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedLocationId: 2, // Default Machakos Store (MCK-RET)
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product_id === product.id);
        const unitPrice = Number(product.effective_price ?? product.discount_price ?? product.selling_price ?? 0);
        const isVatable = Boolean(product.is_vatable);
        const vatRate = isVatable ? Number(product.vat_rate ?? 16) : 0;
        const vatStatus = product.vat_status || (isVatable ? `VATable (${vatRate}%)` : 'VAT Exempt (Non-VAT)');

        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product_id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: unitPrice,
                is_vatable: isVatable,
                vat_rate: vatRate,
                vat_status: vatStatus,
                quantity,
                image: product.primary_image || product.images?.[0]?.url || null,
              },
            ],
          });
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product_id !== productId) });
        } else {
          set({
            items: get().items.map((i) => (i.product_id === productId ? { ...i, quantity } : i)),
          });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product_id !== productId) });
      },
      setSelectedLocationId: (locationId) => set({ selectedLocationId: locationId }),
      clearCart: () => set({ items: [] }),
      getTotals: () => {
        const items = get().items;
        let vatableSubtotal = 0;
        let nonVatableSubtotal = 0;
        let totalVat = 0;
        let itemCount = 0;

        for (const item of items) {
          const lineTotal = item.price * item.quantity;
          itemCount += item.quantity;
          if (item.is_vatable && item.vat_rate > 0) {
            vatableSubtotal += lineTotal;
            totalVat += Number(((lineTotal * item.vat_rate) / 100).toFixed(2));
          } else {
            nonVatableSubtotal += lineTotal;
          }
        }

        const subtotal = vatableSubtotal + nonVatableSubtotal;
        const grandTotal = subtotal + totalVat;
        return { vatableSubtotal, nonVatableSubtotal, subtotal, totalVat, grandTotal, itemCount };
      },
    }),
    {
      name: 'wired-wizards-cart',
    }
  )
);
