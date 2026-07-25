import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  getUserDisplayName,
  getUserInitials,
  login,
  logout,
} from '../services/authService'
import type { PowerPagesUser } from '../types/powerPages'

export function useAuth() {
  const [user, setUser] = useState<PowerPagesUser | undefined>(() => {
    const currentUser = getCurrentUser()
    return currentUser ? { ...currentUser } : undefined
  })
  const [isLoading] = useState(false)

  const refresh = useCallback(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser ? { ...currentUser } : undefined)
  }, [])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [refresh])

  return {
    user,
    isAuthenticated: Boolean(user?.userName),
    isLoading,
    displayName: getUserDisplayName(user),
    initials: getUserInitials(user),
    login,
    logout,
    refresh,
  }
}
