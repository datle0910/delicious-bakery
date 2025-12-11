import { api } from './client'
import type { Category } from '../types'

export const fetchCategories = async () => {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export const fetchCategory = async (id: number) => {
  const { data } = await api.get<Category>(`/categories/${id}`)
  return data
}

export const createCategory = async (payload: Partial<Category>) => {
  const { data } = await api.post<Category>('/categories', payload)
  return data
}

export const updateCategory = async (id: number, payload: Partial<Category>) => {
  const { data } = await api.put<Category>(`/categories/${id}`, payload)
  return data
}

export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}`)
}

