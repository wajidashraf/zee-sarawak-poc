import type { ReactNode } from 'react'
import { useAuthorization } from '../../hooks/useAuthorization'

interface RequireRoleProps {
  children: ReactNode
  roles: string[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function RequireRole({
  children,
  roles,
  requireAll = false,
  fallback = null,
}: RequireRoleProps) {
  const authorization = useAuthorization()
  const canView = requireAll
    ? authorization.hasAllRoles(roles)
    : authorization.hasAnyRole(roles)

  return canView ? children : fallback
}
