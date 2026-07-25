import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const PortfolioDashboard = lazy(
  () => import('../features/dashboard/PortfolioDashboard'),
)

export function HomePage() {
  useDocumentTitle()

  return (
    <div className="page-container page-container--workspace dashboard-page">
      <PageHeader
        actions={
          <Link className="button button--primary" to="/projects">
            View projects
          </Link>
        }
        description="Monitor delivery health, physical progress, investment position, and project locations across Sarawak."
        eyebrow="Executive portfolio overview"
        title="Project command centre"
      />
      <Suspense fallback={<DashboardModuleLoading />}>
        <PortfolioDashboard />
      </Suspense>
    </div>
  )
}

function DashboardModuleLoading() {
  return (
    <section
      aria-label="Preparing portfolio dashboard"
      aria-live="polite"
      className="dashboard-module-loading"
    >
      <span className="button-spinner" />
      Preparing portfolio dashboard
    </section>
  )
}
