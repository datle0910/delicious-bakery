import { api } from './client'
import type { Review } from '../types'

export const fetchReviews = async () => {
  const { data } = await api.get<Review[]>('/reviews')
  return data
}

export const fetchReviewById = async (id: number) => {
  const { data } = await api.get<Review>(`/reviews/${id}`)
  return data
}

export const fetchReviewsByProduct = async (productId: number) => {
  const { data } = await api.get<Review[]>(`/reviews/product/${productId}`)
  return data
}

export const fetchReviewsByUser = async (userId: number) => {
  const { data } = await api.get<Review[]>(`/reviews/user/${userId}`)
  return data
}

export const createReview = async (payload: Partial<Review>) => {
  const { data } = await api.post<Review>('/reviews', payload)
  return data
}

export const updateReview = async (id: number, payload: Partial<Review>) => {
  const { data } = await api.put<Review>(`/reviews/${id}`, payload)
  return data
}

export const deleteReview = async (id: number) => {
  if (!id || typeof id !== 'number' || isNaN(id)) {
    throw new Error('Invalid review ID')
  }
  await api.delete(`/reviews/${id}`)
}

export const fetchMyReviewForProduct = async (productId: number) => {
  try {
    const { data } = await api.get<Review>(`/reviews/my-review/product/${productId}`)
    return data
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    // If product doesn't exist (404), return null instead of throwing
    // This is expected when product is deleted or user hasn't reviewed yet
    if (err?.response?.status === 404) {
      return null
    }
    throw error
  }
}

