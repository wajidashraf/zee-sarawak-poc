const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 500

let cachedAntiForgeryToken: string | null = null

export const WebApiErrorCode = {
  readPermissionDenied: '90040120',
  createPermissionDenied: '90040103',
  antiForgeryTokenInvalid: '90040107',
} as const

interface WebApiErrorPayload {
  error?: {
    code?: string
    message?: string
  }
}

export class PowerPagesApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'PowerPagesApiError'
    this.status = status
    this.code = code?.toLowerCase()
  }
}

export interface ODataCollectionResponse<T> {
  value: T[]
  '@odata.count'?: number
  '@odata.nextLink'?: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  nextLink?: string
}

async function fetchAntiForgeryToken() {
  if (cachedAntiForgeryToken) return cachedAntiForgeryToken

  const response = await fetch('/_layout/tokenhtml', {
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new PowerPagesApiError(
      'Unable to start a secure request. Refresh the page and try again.',
      response.status,
    )
  }

  const markup = await response.text()
  const parsed = new DOMParser().parseFromString(markup, 'text/html')
  const tokenInput = parsed.querySelector<HTMLInputElement>(
    'input[name="__RequestVerificationToken"]',
  )

  if (!tokenInput?.value) {
    throw new Error('The Power Pages request verification token was not found.')
  }

  cachedAntiForgeryToken = tokenInput.value
  return cachedAntiForgeryToken
}

function isMutation(method?: string) {
  return Boolean(method && method.toUpperCase() !== 'GET')
}

function isTransient(status: number) {
  return status === 429 || status >= 500
}

function delay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, milliseconds)

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId)
        reject(new DOMException('The request was cancelled.', 'AbortError'))
      },
      { once: true },
    )
  })
}

async function readError(response: Response) {
  let payload: WebApiErrorPayload | null = null

  try {
    payload = (await response.clone().json()) as WebApiErrorPayload
  } catch {
    // Power Pages can return an HTML error response; use a safe generic message.
  }

  const code = payload?.error?.code?.toLowerCase()
  const message =
    payload?.error?.message ??
    (response.status === 401
      ? 'Your session has expired. Please sign in again.'
      : response.status === 403
        ? 'You do not have permission to complete this action.'
        : 'The request could not be completed.')

  return new PowerPagesApiError(message, response.status, code)
}

async function buildHeaders(options?: RequestInit) {
  const headers = new Headers(options?.headers)
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')

  if (!headers.has('Prefer')) {
    headers.set(
      'Prefer',
      'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
    )
  }

  if (isMutation(options?.method)) {
    headers.set('__RequestVerificationToken', await fetchAntiForgeryToken())
  }

  return headers
}

export async function powerPagesFetchResponse(
  url: string,
  options?: RequestInit,
) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers: await buildHeaders(options),
    })

    if (response.ok) return response

    const error = await readError(response)
    const isExpiredToken =
      response.status === 403 &&
      error.code === WebApiErrorCode.antiForgeryTokenInvalid

    if (isExpiredToken && attempt < MAX_RETRIES - 1) {
      cachedAntiForgeryToken = null
      continue
    }

    if (
      isTransient(response.status) &&
      attempt < MAX_RETRIES - 1 &&
      !options?.signal?.aborted
    ) {
      await delay(
        INITIAL_RETRY_DELAY_MS * 2 ** attempt,
        options?.signal ?? undefined,
      )
      continue
    }

    throw error
  }

  throw new Error('The request could not be completed after several attempts.')
}

export async function parseResponseBody<T>(response: Response) {
  if (response.status === 202 || response.status === 204) return null

  const text = await response.text()
  return text.trim() ? (JSON.parse(text) as T) : null
}

export async function powerPagesFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  return parseResponseBody<T>(await powerPagesFetchResponse(url, options))
}

export function buildODataUrl(
  entitySet: string,
  query?: Record<string, string | undefined>,
) {
  if (!query) return `/_api/${entitySet}`

  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value) searchParams.set(key, value)
  })

  const queryString = searchParams.toString()
  return `/_api/${entitySet}${queryString ? `?${queryString}` : ''}`
}

export function getFormattedValue(
  record: Record<string, unknown>,
  logicalName: string,
) {
  const value =
    record[
      `${logicalName}@OData.Community.Display.V1.FormattedValue`
    ]
  return typeof value === 'string' ? value : undefined
}

export function extractRecordId(response: Response) {
  const location =
    response.headers.get('Location') ?? response.headers.get('OData-EntityId')
  return location?.match(/\(([0-9a-f-]{36})\)/i)?.[1] ?? null
}

export function isPermissionError(error: unknown) {
  return (
    error instanceof PowerPagesApiError &&
    (error.status === 401 || error.status === 403)
  )
}
