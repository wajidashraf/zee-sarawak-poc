import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { ChevronDownIcon, SignOutIcon } from '../ui/Icons'

export function AuthButton() {
  const { displayName, initials, isAuthenticated, isLoading, logout } =
    useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  if (isLoading || !isAuthenticated) return null

  return (
    <div className="auth-menu" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="auth-menu__trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="auth-menu__avatar">
          {initials}
        </span>
        <span className="auth-menu__name">{displayName}</span>
        <ChevronDownIcon aria-hidden="true" height="16" width="16" />
      </button>

      {isOpen && (
        <div aria-label="Account menu" className="auth-menu__popover" role="menu">
          <div className="auth-menu__identity">
            <span aria-hidden="true" className="auth-menu__avatar">
              {initials}
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>Microsoft Entra ID</small>
            </span>
          </div>
          <button
            className="auth-menu__item"
            onClick={() => logout('/')}
            role="menuitem"
            type="button"
          >
            <SignOutIcon aria-hidden="true" height="18" width="18" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
