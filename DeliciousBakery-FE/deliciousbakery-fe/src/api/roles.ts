import { api } from './client'
import type { RoleEntity } from '../types'

export const fetchRoles = async () => {
  const { data } = await api.get<RoleEntity[]>('/roles')
  return data
}

export const fetchRoleById = async (id: number) => {
  const { data } = await api.get<RoleEntity>(`/roles/${id}`)
  return data
}

export const createRole = async (payload: Partial<RoleEntity>) => {
  const { data } = await api.post<RoleEntity>('/roles', payload)
  return data
}

export const updateRole = async (id: number, payload: Partial<RoleEntity>) => {
  const { data } = await api.put<RoleEntity>(`/roles/${id}`, payload)
  return data
}

export const deleteRole = async (id: number) => {
  await api.delete(`/roles/${id}`)
}

