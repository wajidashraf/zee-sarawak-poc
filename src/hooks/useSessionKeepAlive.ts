import { useEffect, useRef } from 'react'
import {
  fetchAntiForgeryToken,
  isAuthenticated,
  isLocalDevelopment,
} from '../services/authService'

const SESSION_EXPIRE_MS = 24 * 60 * 60 * 1000

export function useSessionKeepAlive({
  intervalMs = Math.min(SESSION_EXPIRE_MS / 3, 15 * 60 * 1000),
  idleTimeoutMs = Math.min(SESSION_EXPIRE_MS * 0.9, 30 * 60 * 1000),
  onSessionExpired,
}: {
  intervalMs?: number
  idleTimeoutMs?: number
  onSessionExpired?: () => void
} = {}) {
  const lastActivityRef = useRef(0)

  useEffect(() => {
    if (isLocalDevelopment) return
    lastActivityRef.current = Date.now()

    const onActivity = () => {
      lastActivityRef.current = Date.now()
    }
    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'scroll'] as const

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true })
    })

    const timer = window.setInterval(async () => {
      if (!isAuthenticated()) return
      if (document.visibilityState === 'hidden') return
      if (Date.now() - lastActivityRef.current > idleTimeoutMs) return

      try {
        await fetchAntiForgeryToken()
      } catch {
        onSessionExpired?.()
      }
    }, intervalMs)

    return () => {
      window.clearInterval(timer)
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity)
      })
    }
  }, [idleTimeoutMs, intervalMs, onSessionExpired])
}
