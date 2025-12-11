import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../../types'
import { useAuthStore } from '../../store/authStore'

interface Props {
  roles?: Role[]
  redirectTo?: string
}

export const ProtectedRoute = ({ roles, redirectTo = '/login' }: Props) => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

