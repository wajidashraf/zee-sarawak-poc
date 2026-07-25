export function AuthLoadingScreen() {
  return (
    <main className="auth-screen auth-screen--loading">
      <div aria-live="polite" className="auth-loading" role="status">
        <span aria-hidden="true" className="auth-loading__spinner" />
        <span>Checking your secure session…</span>
      </div>
    </main>
  )
}
