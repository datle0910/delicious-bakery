import { api } from './client'
import type { Order } from '../types'

export const checkout = async (params: {
  userId: number
  paymentMethod: string
  shippingAddress?: string
  note?: string
}) => {
  const { data } = await api.post<Order>(`/orders/checkout/${params.userId}`, {
    paymentMethod: params.paymentMethod,
    shippingAddress: params.shippingAddress,
    note: params.note,
  })
  return data
}

export const fetchOrders = async () => {
  const { data } = await api.get<Order[]>('/orders')
  return data
}

export const fetchOrderById = async (id: number) => {
  const { data } = await api.get<Order>(`/orders/${id}`)
  return data
}

export const fetchOrdersByUser = async (userId: number) => {
  const { data } = await api.get<Order[]>(`/orders/user/${userId}`)
  return data
}

export const updateOrderStatus = async (params: {
  id: number
  status: string
}) => {
  const { data } = await api.patch<Order>(`/orders/${params.id}/status`, null, {
    params: { status: params.status },
  })
  return data
}

export const updateOrderItemQuantity = async (params: {
  orderId: number
  itemId: number
  quantity: number
}) => {
  const { data } = await api.patch<Order>(
    `/orders/${params.orderId}/items/${params.itemId}`,
    null,
    { params: { quantity: params.quantity } },
  )
  return data
}

export const cancelOrder = async (id: number) => {
  await api.patch(`/orders/${id}/cancel`)
}

