// IMPORTANT: Client-side authorization is for UX only, not security.
// Server-side Dataverse table permissions enforce actual access control.

import { getCurrentUser, isAuthenticated } from '../services/authService'

export function getUserRoles() {
  return getCurrentUser()?.userRoles ?? []
}

export function hasRole(roleName: string) {
  const expected = roleName.toLocaleLowerCase()
  return getUserRoles().some(
    (role) => role.toLocaleLowerCase() === expected,
  )
}

export function hasAnyRole(roleNames: string[]) {
  return roleNames.some(hasRole)
}

export function hasAllRoles(roleNames: string[]) {
  return roleNames.every(hasRole)
}

export function isAdmin() {
  return hasRole('Administrators')
}

export function hasElevatedAccess(additionalRoles: string[] = []) {
  return isAdmin() || hasAnyRole(additionalRoles)
}

export { isAuthenticated }
