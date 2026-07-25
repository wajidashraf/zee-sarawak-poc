import { useMemo } from 'react'
import { useAuth } from './useAuth'

export function useAuthorization() {
  const { isAuthenticated, user } = useAuth()
  const roles = useMemo(() => user?.userRoles ?? [], [user?.userRoles])
  const normalizedRoles = useMemo(
    () => new Set(roles.map((role) => role.toLocaleLowerCase())),
    [roles],
  )

  const hasRole = (roleName: string) =>
    normalizedRoles.has(roleName.toLocaleLowerCase())
  const hasAnyRole = (roleNames: string[]) => roleNames.some(hasRole)
  const hasAllRoles = (roleNames: string[]) => roleNames.every(hasRole)

  return {
    roles,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin: hasRole('Administrators'),
  }
}
