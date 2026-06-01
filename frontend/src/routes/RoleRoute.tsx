import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppSelector } from '@/redux/hooks'
import type { UserRole } from '@/types'

/**
 * Gates a workspace to a single role. If the visitor isn't signed in as that
 * role, they're sent to that role's dedicated login (preserving the intended
 * destination so login can return them there).
 */
export default function RoleRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const status = useAppSelector((s) => s.auth.status)
  const userRole = useAppSelector((s) => s.auth.user?.role)
  const location = useLocation()

  if (status !== 'authenticated' || userRole !== role) {
    return <Navigate to={`/${role}/login`} state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}
