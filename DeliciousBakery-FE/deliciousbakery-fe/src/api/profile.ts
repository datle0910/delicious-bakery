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

export const fetchCurrentProfile = async () => {
  const { data } = await api.get<RawUser>('/profile')
  return transformUser(data)
}

export const updateProfile = async (payload: Partial<User>) => {
  const { data } = await api.put<RawUser>('/profile', payload)
  return transformUser(data)
}

