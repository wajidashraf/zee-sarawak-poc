import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MicrosoftMark } from '../components/auth/MicrosoftMark'
import {
  confirmExternalLogin,
  ExternalLoginCookieExpiredError,
  fetchExternalLoginDetails,
  type ExternalLoginDetails,
} from '../services/authService'

export function ExternalLoginConfirmationPage() {
  const [details, setDetails] = useState<ExternalLoginDetails>()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    document.title = 'Complete sign in — Sarawak Project Monitoring Portal'
    fetchExternalLoginDetails()
      .then((result) => {
        setDetails(result)
        setEmail(result.email)
      })
      .catch((reason: unknown) => {
        if (reason instanceof ExternalLoginCookieExpiredError) {
          setIsExpired(true)
        } else {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Your Microsoft sign-in details could not be loaded.',
          )
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!details || !email.trim()) return

    setError(undefined)
    setIsSubmitting(true)
    try {
      await confirmExternalLogin({ ...details, email: email.trim() })
    } catch (reason) {
      if (reason instanceof ExternalLoginCookieExpiredError) {
        setIsExpired(true)
      } else {
        setError(
          reason instanceof Error
            ? reason.message
            : 'Your Microsoft sign-in could not be completed.',
        )
      }
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-screen auth-screen--confirmation">
      <section
        aria-labelledby="confirmation-title"
        className="sign-in-dialog sign-in-dialog--confirmation"
      >
        <div className="sign-in-dialog__provider">
          <MicrosoftMark className="microsoft-mark" />
          <span>Microsoft Entra ID</span>
        </div>
        <div className="sign-in-dialog__content">
          {isLoading ? (
            <div aria-live="polite" className="auth-loading" role="status">
              <span aria-hidden="true" className="auth-loading__spinner" />
              <span>Completing your secure sign-in…</span>
            </div>
          ) : isExpired ? (
            <>
              <p className="sign-in-dialog__eyebrow">Session expired</p>
              <h1 id="confirmation-title">Sign in again</h1>
              <p>
                The Microsoft sign-in window was open for too long. Start a new
                sign-in to continue.
              </p>
              <Link className="button button--primary" to="/login">
                Back to sign in
              </Link>
            </>
          ) : details ? (
            <form onSubmit={handleSubmit}>
              <p className="sign-in-dialog__eyebrow">One final step</p>
              <h1 id="confirmation-title">Confirm your account</h1>
              <p>
                Review the email Microsoft provided before we create your
                portal profile.
              </p>

              <div className="account-preview">
                <span className="account-preview__label">Name</span>
                <strong>
                  {[details.firstName, details.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Microsoft Entra ID user'}
                </strong>
              </div>

              <label className="auth-field" htmlFor="external-email">
                <span>Email address</span>
                <input
                  autoComplete="email"
                  id="external-email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              {error && (
                <div className="auth-alert" role="alert">
                  {error}
                </div>
              )}

              <button
                className="microsoft-sign-in-button"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && (
                  <span aria-hidden="true" className="button-spinner" />
                )}
                {isSubmitting ? 'Creating secure profile…' : 'Continue'}
              </button>
            </form>
          ) : (
            <>
              <p className="sign-in-dialog__eyebrow">Sign-in error</p>
              <h1 id="confirmation-title">We couldn’t complete sign-in</h1>
              <div className="auth-alert" role="alert">
                {error}
              </div>
              <Link className="button button--primary" to="/login">
                Try again
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
