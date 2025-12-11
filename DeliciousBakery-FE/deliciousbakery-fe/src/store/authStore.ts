import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser, LoginResponse } from '../types'
import { createSessionStorage } from '../utils/storage'

interface AuthState {
  user?: AuthUser
  token?: string
  setAuth: (payload: LoginResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: undefined,
      token: undefined,
      setAuth: (payload) =>
        set({
          token: payload.token,
          user: {
            id: payload.userId,
            email: payload.email,
            fullName: payload.fullName,
            role: payload.role,
            enabled: payload.enabled,
            phone: payload.phone,
            address: payload.address,
          },
        }),
      clearAuth: () => set({ user: undefined, token: undefined }),
    }),
    {
      name: 'delicious-auth',
      storage: createJSONStorage(() => createSessionStorage()),
      skipHydration: false,
      // Disable cross-tab synchronization by using sessionStorage
      // Each browser tab will maintain its own independent auth state
    },
  ),
)

