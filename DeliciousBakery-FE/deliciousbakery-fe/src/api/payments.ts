import { api } from './client'
import type { Payment } from '../types'

export const fetchPayments = async () => {
  const { data } = await api.get<Payment[]>('/payments')
  return data
}

export const fetchPaymentById = async (id: number) => {
  const { data } = await api.get<Payment>(`/payments/${id}`)
  return data
}

export const fetchPaymentByOrderId = async (orderId: number) => {
  const { data } = await api.get<Payment>(`/payments/order/${orderId}`)
  return data
}

export const createPayment = async (payload: Partial<Payment>) => {
  const { data } = await api.post<Payment>('/payments', payload)
  return data
}

export const updatePayment = async (id: number, payload: Partial<Payment>) => {
  const { data } = await api.put<Payment>(`/payments/${id}`, payload)
  return data
}

export const deletePayment = async (id: number) => {
  await api.delete(`/payments/${id}`)
}

export const updatePaymentStatus = async (id: number, status: string) => {
  const { data } = await api.patch<Payment>(`/payments/${id}/status`, null, {
    params: { status },
  })
  return data
}

export const refundPayment = async (id: number) => {
  const { data } = await api.patch<Payment>(`/payments/${id}/refund`)
  return data
}

export interface StripePaymentIntentRequest {
  orderId: number
  amount: number
  currency?: string
}

export interface StripePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export const createStripePaymentIntent = async (request: StripePaymentIntentRequest) => {
  const { data } = await api.post<StripePaymentIntentResponse>('/payments/stripe/create-payment-intent', request)
  return data
}

