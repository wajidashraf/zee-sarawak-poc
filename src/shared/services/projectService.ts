import {
  buildODataUrl,
  extractRecordId,
  parseResponseBody,
  powerPagesFetch,
  powerPagesFetchResponse,
  type ODataCollectionResponse,
  type PaginatedResult,
} from '../powerPagesApi'
import {
  PROJECT_HEALTH,
  PROJECT_TYPE,
  mapProjectEntity,
  type CreateProjectInput,
  type Project,
  type ProjectEntity,
} from '../../types/project'

const PROJECT_SELECT = [
  'wa_projectid',
  'wa_projectname',
  'wa_projecttype',
  'wa_projecthealth',
  'wa_plannedcompletiondate',
  'wa_approvedbudget',
  'wa_actualcost',
  'wa_currentphysicalprogresspercentage',
  '_wa_contractor_value',
  '_wa_primarycontractor_value',
  '_wa_projectlocationid_value',
].join(',')

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_PAGE_SIZE = 100
const MAX_PAGES = 20

export interface ListProjectsParams {
  pageSize?: number
  nextLink?: string
  signal?: AbortSignal
}

export async function listProjects({
  pageSize = 50,
  nextLink,
  signal,
}: ListProjectsParams = {}): Promise<PaginatedResult<Project>> {
  const url =
    nextLink ??
    buildODataUrl('wa_projects', {
      $select: PROJECT_SELECT,
      $orderby: 'wa_projectname asc',
      $count: 'true',
    })

  const response = await powerPagesFetch<ODataCollectionResponse<ProjectEntity>>(
    url,
    {
      signal,
      headers: {
        Prefer: `odata.include-annotations="OData.Community.Display.V1.FormattedValue",odata.maxpagesize=${pageSize}`,
      },
    },
  )

  return {
    items: (response?.value ?? []).map(mapProjectEntity),
    totalCount: response?.['@odata.count'] ?? response?.value.length ?? 0,
    nextLink: response?.['@odata.nextLink'],
  }
}

export async function listAllProjects(
  signal?: AbortSignal,
): Promise<PaginatedResult<Project>> {
  const items: Project[] = []
  const visitedUrls = new Set<string>()
  let totalCount: number | undefined
  let nextLink: string | undefined
  let pagesRead = 0

  do {
    if (nextLink && visitedUrls.has(nextLink)) {
      throw new Error(
        'Projects could not be loaded because the server returned a repeated page link.',
      )
    }

    if (nextLink) visitedUrls.add(nextLink)
    const result = await listProjects({
      pageSize: MAX_PAGE_SIZE,
      nextLink,
      signal,
    })

    items.push(...result.items)
    totalCount ??= result.totalCount
    nextLink = result.nextLink
    pagesRead += 1
  } while (nextLink && pagesRead < MAX_PAGES)

  if (nextLink) {
    throw new Error(
      `Projects exceeded the supported ${MAX_PAGES}-page dashboard limit.`,
    )
  }

  return {
    items,
    totalCount: totalCount ?? items.length,
  }
}

export async function getProjectById(id: string, signal?: AbortSignal) {
  if (!GUID_PATTERN.test(id)) return null

  const url = buildODataUrl(`wa_projects(${id})`, {
    $select: PROJECT_SELECT,
  })
  const entity = await powerPagesFetch<ProjectEntity>(url, { signal })
  return entity ? mapProjectEntity(entity) : null
}

export async function createProject(payload: CreateProjectInput) {
  const body: Record<string, unknown> = {
    wa_projectname: payload.name.trim(),
    wa_projecttype: PROJECT_TYPE[payload.type],
    wa_projecthealth: PROJECT_HEALTH[payload.health],
    wa_plannedcompletiondate: payload.plannedCompletionDate,
    wa_currentphysicalprogresspercentage: 0,
    'wa_Contractor@odata.bind': `/wa_contractors(${payload.contractorId})`,
  }

  if (payload.approvedBudget !== undefined) {
    body.wa_approvedbudget = payload.approvedBudget
  }
  if (payload.primaryContractorId) {
    body['wa_PrimaryContractor@odata.bind'] =
      `/wa_contractors(${payload.primaryContractorId})`
  }
  if (payload.locationId) {
    body['wa_ProjectLocationID@odata.bind'] =
      `/wa_projectlocations(${payload.locationId})`
  }

  const response = await powerPagesFetchResponse('/_api/wa_projects', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })

  const entity = await parseResponseBody<ProjectEntity>(response)
  if (entity) return mapProjectEntity(entity)

  const projectId = extractRecordId(response)
  if (projectId) {
    const project = await getProjectById(projectId)
    if (project) return project
  }

  throw new Error('The project was created, but its details could not be loaded.')
}
