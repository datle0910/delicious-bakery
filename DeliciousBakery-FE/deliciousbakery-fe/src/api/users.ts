import { api } from './client'
import type { User } from '../types'

// Transform backend response to match frontend User type
type RawUser = Partial<User> & { roleName?: string; role?: string }
const transformUser = (user: RawUser): User => ({
  id: user.id ?? 0,
  email: user.email ?? '',
  fullName: user.fullName ?? '',
  role: ((user.roleName || user.role) as 'ADMIN' | 'CUSTOMER') ?? 'CUSTOMER',
  enabled: user.enabled ?? true,
  phone: user.phone,
  address: user.address,
  createdAt: user.createdAt,
})

export const fetchUsers = async () => {
  const { data } = await api.get<RawUser[]>('/users')
  return data.map(transformUser)
}

export const fetchUserById = async (id: number) => {
  const { data } = await api.get<RawUser>(`/users/${id}`)
  return transformUser(data)
}

export const createUser = async (payload: Partial<User>) => {
  const { data } = await api.post<RawUser>('/users', payload)
  return transformUser(data)
}

// Type for user update payload that matches backend UserRequestDTO
export interface UserUpdatePayload {
  id?: number
  email?: string
  password?: string
  fullName?: string
  phone?: string
  address?: string
  roleId?: number
  enabled?: boolean
}

export const updateUser = async (id: number, payload: UserUpdatePayload) => {
  const { data } = await api.put<RawUser>(`/users/${id}`, payload)
  return transformUser(data)
}

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`)
}

