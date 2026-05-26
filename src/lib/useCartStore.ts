'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  variantId: number
  name: string
  slug: string
  price: number
  priceText: string
  image: string | null
  quantity: number
  options: { attribute: string; value: string; displayValue: string }[]
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: number) => void
  updateQty: (variantId: number, qty: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const qty = item.quantity ?? 1
        set((s) => {
          const idx = s.items.findIndex(i => i.variantId === item.variantId)
          if (idx >= 0) {
            const updated = [...s.items]
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty }
            return { items: updated, isOpen: true }
          }
          return { items: [...s.items, { ...item, quantity: qty }], isOpen: true }
        })
      },
      removeItem: (variantId) =>
        set((s) => ({ items: s.items.filter(i => i.variantId !== variantId) })),
      updateQty: (variantId, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter(i => i.variantId !== variantId)
            : s.items.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i),
        })),
      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
    }),
    {
      name: 'phoneshop_cart',
      partialize: (s) => ({ items: s.items }),
    },
  ),
)

export const selectTotalItems = (s: CartStore) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectTotalPrice = (s: CartStore) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
