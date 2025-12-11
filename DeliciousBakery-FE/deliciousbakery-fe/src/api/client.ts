import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const api = axios.create({
  baseURL,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      useAuthStore.getState().clearAuth()
      useCartStore.getState().reset()
    }
    return Promise.reject(
      error?.response?.data ?? {
        message: error.message ?? 'Unexpected error',
        status,
      },
    )
  },
)

