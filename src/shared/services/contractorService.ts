import {
  buildODataUrl,
  powerPagesFetch,
  type ODataCollectionResponse,
  type PaginatedResult,
} from '../powerPagesApi'
import {
  mapContractorEntity,
  type Contractor,
  type ContractorEntity,
} from '../../types/contractor'

const CONTRACTOR_SELECT = ['wa_contractorid', 'wa_contractorname'].join(',')
const PAGE_SIZE = 100
const MAX_PAGE_REQUESTS = 100

export async function listContractors(
  signal?: AbortSignal,
): Promise<PaginatedResult<Contractor>> {
  const items: Contractor[] = []
  const visitedUrls = new Set<string>()
  let totalCount = 0
  let pageRequests = 0
  let nextUrl: string | undefined = buildODataUrl('wa_contractors', {
    $select: CONTRACTOR_SELECT,
    $orderby: 'wa_contractorname asc',
    $count: 'true',
  })

  while (nextUrl && pageRequests < MAX_PAGE_REQUESTS) {
    if (visitedUrls.has(nextUrl)) {
      throw new Error('Contractor pagination returned a repeated page.')
    }

    visitedUrls.add(nextUrl)
    const response: ODataCollectionResponse<ContractorEntity> | null =
      await powerPagesFetch<ODataCollectionResponse<ContractorEntity>>(nextUrl, {
        signal,
        headers: {
          Prefer: `odata.maxpagesize=${PAGE_SIZE}`,
        },
      })

    const entities = response?.value ?? []
    items.push(...entities.map(mapContractorEntity))
    totalCount = response?.['@odata.count'] ?? totalCount
    nextUrl = response?.['@odata.nextLink']
    pageRequests += 1
  }

  if (nextUrl) {
    throw new Error(
      'Contractor records exceeded the safe pagination limit. Refine the lookup query.',
    )
  }

  return {
    items,
    totalCount: Math.max(totalCount, items.length),
  }
}
