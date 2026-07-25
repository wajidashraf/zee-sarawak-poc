import {
  buildODataUrl,
  powerPagesFetch,
  type ODataCollectionResponse,
  type PaginatedResult,
} from '../powerPagesApi'
import {
  mapProjectLocationEntity,
  type ProjectLocation,
  type ProjectLocationEntity,
} from '../../types/projectLocation'

const PROJECT_LOCATION_SELECT =
  'wa_projectlocationid,wa_locationname'
const MAX_PAGE_SIZE = 100
const MAX_PAGES = 20

export async function listProjectLocations(
  signal?: AbortSignal,
): Promise<PaginatedResult<ProjectLocation>> {
  const items: ProjectLocation[] = []
  const visitedUrls = new Set<string>()
  let totalCount: number | undefined
  let nextLink: string | undefined = buildODataUrl('wa_projectlocations', {
    $select: PROJECT_LOCATION_SELECT,
    $orderby: 'wa_locationname asc',
    $count: 'true',
  })
  let pagesRead = 0

  while (nextLink && pagesRead < MAX_PAGES) {
    if (visitedUrls.has(nextLink)) {
      throw new Error(
        'Project locations could not be loaded because the server returned a repeated page link.',
      )
    }

    visitedUrls.add(nextLink)
    const response: ODataCollectionResponse<ProjectLocationEntity> | null =
      await powerPagesFetch<ODataCollectionResponse<ProjectLocationEntity>>(
        nextLink,
        {
          signal,
          headers: {
            Prefer: `odata.maxpagesize=${MAX_PAGE_SIZE}`,
          },
        },
      )

    if (!response) break

    items.push(...response.value.map(mapProjectLocationEntity))
    totalCount ??= response['@odata.count']
    nextLink = response['@odata.nextLink']
    pagesRead += 1
  }

  if (nextLink) {
    throw new Error(
      `Project locations exceeded the supported ${MAX_PAGES}-page lookup limit.`,
    )
  }

  return {
    items,
    totalCount: totalCount ?? items.length,
  }
}
