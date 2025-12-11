import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import * as authApi from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import type { LoginPayload, RegisterPayload } from '../types'
import { sendRegistrationEmail } from '../services/email'

export const useAuthActions = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const resetCart = useCartStore((state) => state.reset)
  const clearCartPersisted = useCartStore((state) => state.clearPersisted)

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data)
      toast.success(`Xin chào, ${data.fullName}`)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Đăng nhập thất bại')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload & { otp: string }) => authApi.register(payload),
    onSuccess: async (data) => {
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email.')
      await sendRegistrationEmail({
        email: data.email,
        fullName: data.fullName,
      })
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể đăng ký')
    },
  })

  return {
    login: loginMutation.mutateAsync,
    loginStatus: loginMutation.status,
    register: registerMutation.mutateAsync,
    registerStatus: registerMutation.status,
    logout: () => {
      clearAuth()
      resetCart() // Clear cart state
      clearCartPersisted() // Remove persisted cart (guest/local)
      toast.success('Đã đăng xuất')
    },
  }
}

