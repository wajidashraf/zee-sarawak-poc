import { useEffect, useMemo, useState } from 'react'
import { AlertIcon, BudgetIcon, PortfolioIcon, ProgressIcon, RefreshIcon } from '../../components/ui/Icons'
import { FeedbackState } from '../../components/ui/FeedbackState'
import { formatCompactCurrency } from '../../utils/formatters'
import { buildDashboardMetrics } from './dashboardMetrics'
import { KpiCard } from './KpiCard'
import { PortfolioCharts } from './PortfolioCharts'
import { ProjectMap } from './ProjectMap'
import { useDashboardData } from './useDashboardData'

export default function PortfolioDashboard() {
  const { projects, locations, isLoading, error, refetch } = useDashboardData()
  const reduceMotion = useReducedMotion()
  const metrics = useMemo(
    () => buildDashboardMetrics(projects, locations),
    [locations, projects],
  )

  if (isLoading) return <DashboardLoadingState />

  if (error) {
    return (
      <FeedbackState
        action={
          <button
            className="button button--secondary"
            onClick={() => void refetch()}
            type="button"
          >
            <RefreshIcon aria-hidden="true" height="18" width="18" />
            Retry
          </button>
        }
        description={error}
        title="Dashboard could not be loaded"
        variant="error"
      />
    )
  }

  if (projects.length === 0) {
    return (
      <FeedbackState
        description="Create a project to populate portfolio KPIs, charts, and map pins."
        title="No project data yet"
        variant="empty"
      />
    )
  }

  return (
    <div className="portfolio-dashboard">
      <section aria-label="Portfolio key performance indicators" className="kpi-grid">
        <KpiCard
          description={`${metrics.mappedProjects.length} mapped across Sarawak`}
          icon={<PortfolioIcon height="22" width="22" />}
          label="Total projects"
          value={String(metrics.totalProjects)}
        />
        <KpiCard
          description="Approved portfolio allocation"
          icon={<BudgetIcon height="22" width="22" />}
          label="Approved budget"
          tone="positive"
          value={formatCompactCurrency(metrics.approvedBudget)}
        />
        <KpiCard
          description="Mean physical completion"
          icon={<ProgressIcon height="22" width="22" />}
          label="Average progress"
          tone="neutral"
          value={`${metrics.averageProgress}%`}
        />
        <KpiCard
          description="Amber and red health status"
          icon={<AlertIcon height="22" width="22" />}
          label="Projects at risk"
          tone="warning"
          value={String(metrics.atRiskProjects)}
        />
      </section>

      <section aria-label="Portfolio charts and project map" className="dashboard-analytics-grid">
        <ProjectMap
          projects={metrics.mappedProjects}
          unmappedProjects={metrics.unmappedProjects}
        />
        <PortfolioCharts metrics={metrics} reduceMotion={reduceMotion} />
      </section>
    </div>
  )
}

function DashboardLoadingState() {
  return (
    <section
      aria-label="Loading portfolio dashboard"
      aria-live="polite"
      className="dashboard-loading"
    >
      <span className="sr-only">Loading portfolio dashboard</span>
      <div aria-hidden="true" className="dashboard-loading__kpis">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div aria-hidden="true" className="dashboard-loading__analytics">
        <span />
        <span />
      </div>
    </section>
  )
}

function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReduceMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return reduceMotion
}
