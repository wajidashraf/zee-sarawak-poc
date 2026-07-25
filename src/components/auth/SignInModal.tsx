import { useEffect, useRef, useState } from 'react'
import {
  AUTH_PROVIDERS,
  getAuthError,
  getSessionExpiredMessage,
  loginWithProvider,
} from '../../services/authService'
import { MicrosoftMark } from './MicrosoftMark'

interface SignInModalProps {
  returnUrl: string
}

export function SignInModal({ returnUrl }: SignInModalProps) {
  const signInButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const provider = AUTH_PROVIDERS[0]
  const serverMessage = getSessionExpiredMessage() ?? getAuthError()

  useEffect(() => {
    document.title = 'Sign in — Sarawak Project Monitoring Portal'
    signInButtonRef.current?.focus({ preventScroll: true })
  }, [])

  const handleSignIn = async () => {
    setSubmitError(undefined)
    setIsSubmitting(true)
    try {
      await loginWithProvider(provider, { returnUrl })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Microsoft sign-in could not be started. Please try again.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-screen">
      <div aria-hidden="true" className="auth-backdrop">
        <div className="auth-backdrop__header">
          <span className="auth-backdrop__brand">SP</span>
          <span />
          <span />
        </div>
        <div className="auth-backdrop__content">
          <span />
          <span />
          <span />
        </div>
      </div>

      <section
        aria-describedby="sign-in-description sign-in-security"
        aria-labelledby="sign-in-title"
        aria-modal="true"
        className="sign-in-dialog"
        data-testid="sign-in-dialog"
        role="dialog"
      >
        <div className="sign-in-dialog__provider">
          <MicrosoftMark className="microsoft-mark" />
          <span>Microsoft Entra ID</span>
        </div>

        <div className="sign-in-dialog__content">
          <p className="sign-in-dialog__eyebrow">
            Sarawak Project Monitoring Portal
          </p>
          <h1 id="sign-in-title">Sign in to continue</h1>
          <p id="sign-in-description">
            Use your organization account to securely access project,
            contractor, and investment information.
          </p>

          {(serverMessage || submitError) && (
            <div className="auth-alert" role="alert">
              {submitError ?? serverMessage}
            </div>
          )}

          <button
            className="microsoft-sign-in-button"
            disabled={isSubmitting}
            onClick={handleSignIn}
            ref={signInButtonRef}
            type="button"
          >
            {isSubmitting ? (
              <span aria-hidden="true" className="button-spinner" />
            ) : (
              <MicrosoftMark className="microsoft-mark" />
            )}
            <span>
              {isSubmitting
                ? 'Redirecting to Microsoft…'
                : provider.displayName}
            </span>
          </button>

          <p className="sign-in-dialog__security" id="sign-in-security">
            You’ll continue to Microsoft to complete sign-in. This portal
            never receives or stores your password.
          </p>
        </div>

        <div className="sign-in-dialog__footer">
          <span>Protected by Microsoft Entra ID</span>
          <span aria-hidden="true">•</span>
          <span>Authorized users only</span>
        </div>
      </section>
    </main>
  )
}
