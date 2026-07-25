import { useDeferredValue, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FeedbackState, ProjectsLoadingState } from '../components/ui/FeedbackState'
import { SearchField, SelectFilter } from '../components/ui/FilterBar'
import { PlusIcon, RefreshIcon } from '../components/ui/Icons'
import { PageHeader } from '../components/ui/PageHeader'
import {
  ProjectsTable,
  type ProjectSortKey,
  type SortDirection,
} from '../features/projects/ProjectsTable'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useProjects } from '../shared/hooks/useProjects'
import {
  PROJECT_HEALTH_LABELS,
  PROJECT_TYPE_LABELS,
  type Project,
} from '../types/project'
import { isPastDate } from '../utils/formatters'

type DeliveryFilter = 'all' | 'inDelivery' | 'pastTarget' | 'complete'

const validSortKeys: ProjectSortKey[] = [
  'name',
  'health',
  'type',
  'progress',
  'plannedCompletionDate',
  'approvedBudget',
]

function compareProjects(a: Project, b: Project, key: ProjectSortKey) {
  if (key === 'progress' || key === 'approvedBudget') {
    return (a[key] ?? -1) - (b[key] ?? -1)
  }

  const left = a[key] ?? ''
  const right = b[key] ?? ''
  return String(left).localeCompare(String(right), 'en-MY', {
    numeric: true,
    sensitivity: 'base',
  })
}

function matchesDelivery(project: Project, delivery: DeliveryFilter) {
  if (delivery === 'complete') return project.progress >= 100
  if (delivery === 'pastTarget') {
    return project.progress < 100 && isPastDate(project.plannedCompletionDate)
  }
  if (delivery === 'inDelivery') {
    return project.progress < 100 && !isPastDate(project.plannedCompletionDate)
  }
  return true
}

export function ProjectsPage() {
  useDocumentTitle('Projects')

  const { items, totalCount, nextLink, isLoading, isLoadingMore, error, refetch, loadMore } =
    useProjects({ pageSize: 50 })
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase())
  const health = searchParams.get('health') ?? 'all'
  const type = searchParams.get('type') ?? 'all'
  const delivery = (searchParams.get('delivery') ??
    'all') as DeliveryFilter
  const requestedSort = searchParams.get('sort') as ProjectSortKey | null
  const sortKey = requestedSort && validSortKeys.includes(requestedSort)
    ? requestedSort
    : 'name'
  const sortDirection: SortDirection =
    searchParams.get('direction') === 'descending'
      ? 'descending'
      : 'ascending'

  const updateParam = (name: string, value: string, defaultValue = 'all') => {
    const nextParams = new URLSearchParams(searchParams)
    if (!value || value === defaultValue) nextParams.delete(name)
    else nextParams.set(name, value)
    setSearchParams(nextParams, { replace: true })
  }

  const visibleProjects = useMemo(() => {
    const filtered = items.filter((project) => {
      const searchableText = [
        project.name,
        project.typeLabel,
        project.contractorName,
        project.primaryContractorName,
        project.locationName,
      ]
        .join(' ')
        .toLocaleLowerCase()

      return (
        (!deferredSearch || searchableText.includes(deferredSearch)) &&
        (health === 'all' || project.health === health) &&
        (type === 'all' || project.type === type) &&
        matchesDelivery(project, delivery)
      )
    })

    return filtered.sort((a, b) => {
      const result = compareProjects(a, b, sortKey)
      return sortDirection === 'ascending' ? result : -result
    })
  }, [deferredSearch, delivery, health, items, sortDirection, sortKey, type])

  const handleSort = (nextSortKey: ProjectSortKey) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextDirection =
      sortKey === nextSortKey && sortDirection === 'ascending'
        ? 'descending'
        : 'ascending'
    nextParams.set('sort', nextSortKey)
    nextParams.set('direction', nextDirection)
    setSearchParams(nextParams, { replace: true })
  }

  const hasFilters = Boolean(
    search || health !== 'all' || type !== 'all' || delivery !== 'all',
  )

  return (
    <div className="page-container page-container--workspace">
      <PageHeader
        actions={
          <Link className="button button--primary" to="/projects/new">
            <PlusIcon aria-hidden="true" height="19" width="19" />
            Create new project
          </Link>
        }
        description="Review delivery health, physical progress, target dates, and investment position across the portfolio."
        eyebrow="Portfolio management"
        title="Projects"
      />

      <section aria-label="Project filters" className="filter-panel">
        <SearchField
          onChange={(event) => updateParam('q', event.target.value, '')}
          value={search}
        />
        <SelectFilter
          label="Health"
          onChange={(event) => updateParam('health', event.target.value)}
          value={health}
        >
          <option value="all">All health</option>
          {Object.entries(PROJECT_HEALTH_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter
          label="Project type"
          onChange={(event) => updateParam('type', event.target.value)}
          value={type}
        >
          <option value="all">All types</option>
          {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter
          label="Delivery"
          onChange={(event) => updateParam('delivery', event.target.value)}
          value={delivery}
        >
          <option value="all">All delivery</option>
          <option value="inDelivery">In delivery</option>
          <option value="pastTarget">Past target</option>
          <option value="complete">Complete</option>
        </SelectFilter>
        {hasFilters ? (
          <button
            className="button button--quiet filter-panel__reset"
            onClick={() => setSearchParams({}, { replace: true })}
            type="button"
          >
            Clear filters
          </button>
        ) : null}
      </section>

      {isLoading ? <ProjectsLoadingState /> : null}

      {!isLoading && error ? (
        <FeedbackState
          action={
            <button className="button button--secondary" onClick={refetch} type="button">
              <RefreshIcon aria-hidden="true" height="18" width="18" />
              Try again
            </button>
          }
          description={`${error} If you are previewing locally, the Power Pages Web API is available only on the deployed site.`}
          title="Projects could not be loaded"
          variant="error"
        />
      ) : null}

      {!isLoading && !error ? (
        <section aria-labelledby="project-results-heading" className="portfolio-panel">
          <div className="portfolio-panel__heading">
            <div>
              <p className="eyebrow">Project register</p>
              <h2 id="project-results-heading">
                {visibleProjects.length} project
                {visibleProjects.length === 1 ? '' : 's'}
              </h2>
            </div>
            <p aria-live="polite">
              {items.length < totalCount
                ? `${items.length} of ${totalCount} records loaded`
                : `${totalCount} total records`}
            </p>
          </div>

          {visibleProjects.length > 0 ? (
            <ProjectsTable
              onSort={handleSort}
              projects={visibleProjects}
              sortDirection={sortDirection}
              sortKey={sortKey}
            />
          ) : (
            <FeedbackState
              action={
                hasFilters ? (
                  <button
                    className="button button--secondary"
                    onClick={() => setSearchParams({}, { replace: true })}
                    type="button"
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link className="button button--primary" to="/projects/new">
                    Create first project
                  </Link>
                )
              }
              description={
                hasFilters
                  ? 'Adjust the search or filters to broaden your results.'
                  : 'Create a project to begin building the portfolio register.'
              }
              title={hasFilters ? 'No projects match these filters' : 'No projects yet'}
              variant="empty"
            />
          )}

          {nextLink ? (
            <div className="portfolio-panel__load-more">
              <button
                className="button button--secondary"
                disabled={isLoadingMore}
                onClick={loadMore}
                type="button"
              >
                {isLoadingMore ? 'Loading more…' : 'Load more projects'}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
