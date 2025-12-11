import { api } from './client'
import type { CartSummary } from '../types'

export const fetchCart = async (userId: number) => {
  const { data } = await api.get<CartSummary>(`/cart/${userId}`)
  return data
}

export const addCartItem = async (params: {
  userId: number
  productId: number
  quantity: number
}) => {
  const { data } = await api.post<CartSummary>(
    `/cart/${params.userId}/items`,
    null,
    { params: { productId: params.productId, quantity: params.quantity } },
  )
  return data
}

export const updateCartItem = async (params: {
  userId: number
  itemId: number
  quantity: number
}) => {
  const { data } = await api.patch<CartSummary>(
    `/cart/${params.userId}/items/${params.itemId}`,
    null,
    { params: { quantity: params.quantity } },
  )
  return data
}

export const removeCartItem = async (params: {
  userId: number
  itemId: number
}) => {
  const { data } = await api.delete<CartSummary>(
    `/cart/${params.userId}/items/${params.itemId}`,
  )
  return data
}

export const clearCart = async (userId: number) => {
  const { data } = await api.delete<CartSummary>(`/cart/${userId}/clear`)
  return data
}

