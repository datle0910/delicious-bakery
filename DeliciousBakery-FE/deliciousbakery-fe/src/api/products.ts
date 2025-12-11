import { api } from './client'
import type { PaginatedQuery, Product } from '../types'

export const fetchProducts = async (params?: PaginatedQuery) => {
  if (params?.search) {
    const { data } = await api.get<Product[]>('/products/search', {
      params: { keyword: params.search },
    })
    return data
  }

  if (params?.categoryId) {
    const { data } = await api.get<Product[]>(
      `/products/category/${params.categoryId}`,
    )
    return data
  }

  const { data } = await api.get<Product[]>('/products')
  return data
}

export const fetchProductById = async (id: number) => {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

export const createProduct = async (payload: Partial<Product>) => {
  const { data } = await api.post<Product>('/products', payload)
  return data
}

export const updateProduct = async (id: number, payload: Partial<Product>) => {
  const { data } = await api.put<Product>(`/products/${id}`, payload)
  return data
}

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`)
}

