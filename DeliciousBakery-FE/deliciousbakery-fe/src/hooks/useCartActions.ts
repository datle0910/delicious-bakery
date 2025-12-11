import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import {
  addCartItem,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '../api/cart'
import type { CartLineItem, CartSummary, Product } from '../types'
import { formatCurrency } from '../utils/format'

const mapCartItems = (cart: CartSummary): CartLineItem[] =>
  cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName,
    image: item.productImage,
    price: item.unitPrice ?? item.price,
    quantity: item.quantity,
  }))

export const useCartActions = () => {
  const getCurrentUser = () => useAuthStore.getState().user
  const { reset, hydrateFromRemote, items } = useCartStore()

  const syncRemoteCart = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    
    // Get current guest cart items before syncing (items without IDs)
    const guestItems = items.filter(item => !item.id)
    
    // Fetch remote cart
    const cart = await fetchCart(user.id)
    const remoteItems = mapCartItems(cart)
    
    // Merge guest items into remote cart
    if (guestItems.length > 0) {
      // Add each guest item to the backend cart
      for (const guestItem of guestItems) {
        try {
          await addCartItem({
            userId: user.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          })
        } catch (error) {
          console.error('Failed to merge guest cart item:', error)
        }
      }
      // Fetch updated cart after merging
      const updatedCart = await fetchCart(user.id)
      hydrateFromRemote({
        cartId: updatedCart.id,
        items: mapCartItems(updatedCart),
        total: updatedCart.totalAmount,
      })
    } else {
      // No guest items, just sync remote cart
      hydrateFromRemote({
        cartId: cart.id,
        items: remoteItems,
        total: cart.totalAmount,
      })
    }
  }, [hydrateFromRemote, items])

  const addToCart = useCallback(
    async (product: Product, quantity: number) => {
      const user = getCurrentUser()
      if (!product) return
      if (!user) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
        // Redirect to login page with return URL
        window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`
        return
      }

      // Stock guard: prevent exceeding available quantity when adding the same product
      const existingQty =
        useCartStore
          .getState()
          .items.find((i) => i.productId === product.id)?.quantity ?? 0
      const desiredQty = existingQty + quantity
      if (typeof product.stock === 'number' && desiredQty > product.stock) {
        toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`)
        return
      }

      const cart = await addCartItem({
        userId: user.id,
        productId: product.id,
        quantity,
      })
      hydrateFromRemote({
        cartId: cart.id,
        items: mapCartItems(cart),
        total: cart.totalAmount,
      })
      toast.success('Đã thêm vào giỏ hàng')
    },
    [hydrateFromRemote],
  )

  const changeQuantity = useCallback(
    async (item: CartLineItem, quantity: number) => {
      const user = getCurrentUser()
      if (!user) {
        toast.error('Vui lòng đăng nhập để chỉnh sửa giỏ hàng')
        return
      }
      if (!item.id) {
        // Item doesn't have ID, try to sync cart first
        await syncRemoteCart()
        toast.error('Vui lòng thử lại')
        return
      }
      const cart = await updateCartItem({
        userId: user.id,
        itemId: item.id,
        quantity,
      })
      hydrateFromRemote({
        cartId: cart.id,
        items: mapCartItems(cart),
        total: cart.totalAmount,
      })
    },
    [hydrateFromRemote, syncRemoteCart],
  )

  const removeFromCart = useCallback(
    async (item: CartLineItem) => {
      const user = getCurrentUser()
      if (!user) {
        toast.error('Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng')
        return
      }
      if (!item.id) {
        // Item doesn't have ID, try to sync cart first
        await syncRemoteCart()
        toast.error('Vui lòng thử lại')
        return
      }
      const cart = await removeCartItem({
        userId: user.id,
        itemId: item.id,
      })
      hydrateFromRemote({
        cartId: cart.id,
        items: mapCartItems(cart),
        total: cart.totalAmount,
      })
    },
    [hydrateFromRemote, syncRemoteCart],
  )

  const clear = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) {
      reset()
      return
    }
    await clearCart(user.id)
    reset()
  }, [reset])

  const checkoutSummary = useCallback(
    (items: CartLineItem[]) => {
      if (!items.length) return ''
      const total = items.reduce(
        (acc, curr) => acc + curr.price * curr.quantity,
        0,
      )
      return formatCurrency(total)
    },
    [],
  )

  return {
    addToCart,
    changeQuantity,
    removeFromCart,
    clear,
    syncRemoteCart,
    checkoutSummary,
  }
}

