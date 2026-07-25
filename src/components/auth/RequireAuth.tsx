import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthLoadingScreen } from './AuthLoadingScreen'
import { SignInModal } from './SignInModal'

export function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <AuthLoadingScreen />
  if (!isAuthenticated) {
    return (
      <SignInModal
        returnUrl={`${location.pathname}${location.search}${location.hash}`}
      />
    )
  }

  return <Outlet />
}
