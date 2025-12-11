import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartLineItem } from '../types'
import { calculateCartTotal } from '../utils/format'
import { createSafeStorage } from '../utils/storage'

type CartMode = 'guest' | 'customer'

interface CartState {
  items: CartLineItem[]
  mode: CartMode
  cartId?: number
  total: number
  setMode: (mode: CartMode) => void
  hydrateFromRemote: (payload: {
    cartId?: number
    items: CartLineItem[]
    total?: number
  }) => void
  addItem: (item: CartLineItem) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  reset: () => void
  clearPersisted: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      mode: 'guest',
      total: 0,
      setMode: (mode) => set({ mode }),
      hydrateFromRemote: ({ cartId, items, total }) =>
        set({
          cartId,
          items,
          total: typeof total === 'number' ? total : calculateCartTotal(items),
          mode: 'customer',
        }),
      addItem: (item) => {
        const existing = get().items.find(
          (line) => line.productId === item.productId,
        )
        let nextItems = []
        if (existing) {
          nextItems = get().items.map((line) =>
            line.productId === item.productId
              ? { ...line, quantity: line.quantity + item.quantity }
              : line,
          )
        } else {
          nextItems = [...get().items, item]
        }
        set({ items: nextItems, total: calculateCartTotal(nextItems) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          const remaining = get().items.filter(
            (line) => line.productId !== productId,
          )
          set({ items: remaining, total: calculateCartTotal(remaining) })
          return
        }
        const nextItems = get().items.map((line) =>
          line.productId === productId ? { ...line, quantity } : line,
        )
        set({ items: nextItems, total: calculateCartTotal(nextItems) })
      },
      removeItem: (productId) => {
        const remaining = get().items.filter(
          (line) => line.productId !== productId,
        )
        set({ items: remaining, total: calculateCartTotal(remaining) })
      },
      reset: () => set({ items: [], total: 0, cartId: undefined, mode: 'guest' }),
      clearPersisted: () => {
        const storage = createSafeStorage()
        try {
          storage.removeItem('delicious-cart')
        } catch {
          // ignore storage failures
        }
        set({ items: [], total: 0, cartId: undefined, mode: 'guest' })
      },
    }),
    {
      name: 'delicious-cart',
      storage: createJSONStorage(() => createSafeStorage()),
      skipHydration: false,
    },
  ),
)

