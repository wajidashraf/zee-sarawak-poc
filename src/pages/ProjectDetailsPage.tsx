import { Link, useParams } from 'react-router-dom'
import { FeedbackState, ProjectsLoadingState } from '../components/ui/FeedbackState'
import { ArrowLeftIcon, RefreshIcon } from '../components/ui/Icons'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatusBadge, type StatusTone } from '../components/ui/StatusBadge'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useProject } from '../shared/hooks/useProjects'
import { formatCurrency, formatDate, isPastDate } from '../utils/formatters'

const healthTone = {
  green: 'positive',
  amber: 'warning',
  red: 'critical',
} satisfies Record<string, StatusTone>

export function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { project, isLoading, error, refetch } = useProject(projectId)
  useDocumentTitle(project ? project.name : 'Project details')

  if (isLoading) {
    return (
      <div className="page-container page-container--workspace">
        <ProjectsLoadingState />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="page-container page-container--workspace">
        <FeedbackState
          action={
            <div className="feedback-actions">
              <button className="button button--secondary" onClick={refetch} type="button">
                <RefreshIcon aria-hidden="true" height="18" width="18" />
                Try again
              </button>
              <Link className="button button--quiet" to="/projects">
                Back to projects
              </Link>
            </div>
          }
          description={error ?? 'The requested project could not be found.'}
          title="Project details are unavailable"
          variant="error"
        />
      </div>
    )
  }

  const expenditure =
    project.approvedBudget && project.actualCost != null
      ? Math.min(100, (project.actualCost / project.approvedBudget) * 100)
      : null
  const deliveryLabel =
    project.progress >= 100
      ? 'Complete'
      : isPastDate(project.plannedCompletionDate)
        ? 'Past target'
        : 'In delivery'
  const deliveryTone: StatusTone =
    deliveryLabel === 'Complete'
      ? 'positive'
      : deliveryLabel === 'Past target'
        ? 'critical'
        : 'neutral'

  return (
    <div className="page-container page-container--workspace">
      <Link className="back-link" to="/projects">
        <ArrowLeftIcon aria-hidden="true" height="18" width="18" />
        Back to projects
      </Link>

      <PageHeader
        actions={
          <div className="project-status-cluster">
            <StatusBadge tone={healthTone[project.health]}>
              Health: {project.healthLabel}
            </StatusBadge>
            <StatusBadge tone={deliveryTone}>{deliveryLabel}</StatusBadge>
          </div>
        }
        description={`${project.typeLabel} · ${project.locationName}`}
        eyebrow="Project record"
        title={project.name}
      />

      <section
        aria-labelledby="project-overview-heading"
        className="detail-grid"
      >
        <article className="detail-card detail-card--wide">
          <div className="detail-card__heading">
            <div>
              <p className="eyebrow">Delivery overview</p>
              <h2 id="project-overview-heading">Physical progress</h2>
            </div>
            <strong className="detail-card__metric">{project.progress}%</strong>
          </div>
          <ProgressBar value={project.progress} />
          <dl className="detail-list detail-list--three">
            <div>
              <dt>Planned completion</dt>
              <dd>{formatDate(project.plannedCompletionDate)}</dd>
            </div>
            <div>
              <dt>Primary contractor</dt>
              <dd>{project.primaryContractorName}</dd>
            </div>
            <div>
              <dt>Project location</dt>
              <dd>{project.locationName}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <p className="eyebrow">Investment</p>
          <h2>Financial position</h2>
          <dl className="detail-list">
            <div>
              <dt>Approved budget</dt>
              <dd className="numeric-value">
                {formatCurrency(project.approvedBudget)}
              </dd>
            </div>
            <div>
              <dt>Actual cost</dt>
              <dd className="numeric-value">
                {formatCurrency(project.actualCost)}
              </dd>
            </div>
            <div>
              <dt>Budget utilised</dt>
              <dd>
                {expenditure == null ? 'Not available' : `${Math.round(expenditure)}%`}
              </dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <p className="eyebrow">Accountability</p>
          <h2>Delivery partners</h2>
          <dl className="detail-list">
            <div>
              <dt>Contractor</dt>
              <dd>{project.contractorName}</dd>
            </div>
            <div>
              <dt>Primary contractor</dt>
              <dd>{project.primaryContractorName}</dd>
            </div>
            <div>
              <dt>Record reference</dt>
              <dd className="record-reference">{project.id}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  )
}
