import { Link } from 'react-router-dom'
import { EyeIcon, SortIcon } from '../../components/ui/Icons'
import { ProgressBar } from '../../components/ui/ProgressBar'
import {
  StatusBadge,
  type StatusTone,
} from '../../components/ui/StatusBadge'
import type { Project } from '../../types/project'
import { formatCurrency, formatDate, isPastDate } from '../../utils/formatters'

export type ProjectSortKey =
  | 'name'
  | 'health'
  | 'type'
  | 'progress'
  | 'plannedCompletionDate'
  | 'approvedBudget'

export type SortDirection = 'ascending' | 'descending'

interface ProjectsTableProps {
  projects: Project[]
  sortKey: ProjectSortKey
  sortDirection: SortDirection
  onSort: (key: ProjectSortKey) => void
}

const healthTone: Record<Project['health'], StatusTone> = {
  green: 'positive',
  amber: 'warning',
  red: 'critical',
}

function getDelivery(project: Project) {
  if (project.progress >= 100) {
    return { label: 'Complete', tone: 'positive' as const }
  }
  if (isPastDate(project.plannedCompletionDate)) {
    return { label: 'Past target', tone: 'critical' as const }
  }
  return { label: 'In delivery', tone: 'neutral' as const }
}

interface SortableHeadingProps {
  column: ProjectSortKey
  label: string
  activeColumn: ProjectSortKey
  direction: SortDirection
  onSort: (key: ProjectSortKey) => void
}

function SortableHeading({
  column,
  label,
  activeColumn,
  direction,
  onSort,
}: SortableHeadingProps) {
  const isActive = column === activeColumn

  return (
    <th
      aria-sort={isActive ? direction : 'none'}
      scope="col"
    >
      <button
        aria-label={`Sort by ${label}${isActive ? `, currently ${direction}` : ''}`}
        className="table-sort"
        onClick={() => onSort(column)}
        type="button"
      >
        <span>{label}</span>
        <SortIcon aria-hidden="true" height="16" width="16" />
      </button>
    </th>
  )
}

function ProjectViewLink({ project }: { project: Project }) {
  return (
    <Link
      aria-label={`View ${project.name}`}
      className="button button--table"
      to={`/projects/${project.id}`}
    >
      <EyeIcon aria-hidden="true" height="17" width="17" />
      View
    </Link>
  )
}

export function ProjectsTable({
  projects,
  sortKey,
  sortDirection,
  onSort,
}: ProjectsTableProps) {
  return (
    <>
      <div className="data-table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <SortableHeading
                activeColumn={sortKey}
                column="name"
                direction={sortDirection}
                label="Project"
                onSort={onSort}
              />
              <SortableHeading
                activeColumn={sortKey}
                column="type"
                direction={sortDirection}
                label="Type"
                onSort={onSort}
              />
              <SortableHeading
                activeColumn={sortKey}
                column="health"
                direction={sortDirection}
                label="Health"
                onSort={onSort}
              />
              <SortableHeading
                activeColumn={sortKey}
                column="progress"
                direction={sortDirection}
                label="Progress"
                onSort={onSort}
              />
              <SortableHeading
                activeColumn={sortKey}
                column="plannedCompletionDate"
                direction={sortDirection}
                label="Target date"
                onSort={onSort}
              />
              <SortableHeading
                activeColumn={sortKey}
                column="approvedBudget"
                direction={sortDirection}
                label="Budget"
                onSort={onSort}
              />
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const delivery = getDelivery(project)

              return (
                <tr key={project.id}>
                  <td>
                    <span className="project-name">{project.name}</span>
                    <span className="project-meta">
                      {project.primaryContractorName}
                    </span>
                  </td>
                  <td>{project.typeLabel}</td>
                  <td>
                    <StatusBadge tone={healthTone[project.health]}>
                      {project.healthLabel}
                    </StatusBadge>
                  </td>
                  <td>
                    <ProgressBar value={project.progress} />
                  </td>
                  <td>
                    <span className="table-date">
                      {formatDate(project.plannedCompletionDate)}
                    </span>
                    <StatusBadge tone={delivery.tone}>
                      {delivery.label}
                    </StatusBadge>
                  </td>
                  <td className="numeric-value">
                    {formatCurrency(project.approvedBudget)}
                  </td>
                  <td className="table-action">
                    <ProjectViewLink project={project} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="project-card-list">
        {projects.map((project) => {
          const delivery = getDelivery(project)

          return (
            <article className="project-card" key={project.id}>
              <div className="project-card__topline">
                <StatusBadge tone={healthTone[project.health]}>
                  {project.healthLabel}
                </StatusBadge>
                <StatusBadge tone={delivery.tone}>{delivery.label}</StatusBadge>
              </div>
              <div>
                <h2>{project.name}</h2>
                <p>{project.typeLabel}</p>
              </div>
              <ProgressBar value={project.progress} />
              <dl className="project-card__facts">
                <div>
                  <dt>Primary contractor</dt>
                  <dd>{project.primaryContractorName}</dd>
                </div>
                <div>
                  <dt>Target date</dt>
                  <dd>{formatDate(project.plannedCompletionDate)}</dd>
                </div>
                <div>
                  <dt>Approved budget</dt>
                  <dd>{formatCurrency(project.approvedBudget)}</dd>
                </div>
              </dl>
              <ProjectViewLink project={project} />
            </article>
          )
        })}
      </div>
    </>
  )
}
