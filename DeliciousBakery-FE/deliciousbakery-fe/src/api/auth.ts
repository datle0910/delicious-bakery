import { api } from './client'
import type { LoginPayload, LoginResponse, RegisterPayload, User } from '../types'

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload & { otp: string }): Promise<User> => {
  const { data } = await api.post<User>('/auth/register', payload)
  return data
}

export const checkEmail = async (email: string): Promise<boolean> => {
  const { data } = await api.get<boolean>('/auth/check-email', {
    params: { email },
  })
  return data
}

export const sendOtp = async (email: string): Promise<string> => {
  const { data } = await api.post<string>('/auth/send-otp', null, {
    params: { email },
  })
  return data
}

