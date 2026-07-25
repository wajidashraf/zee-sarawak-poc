import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getProjectById,
  listProjects,
  type ListProjectsParams,
} from '../services/projectService'
import { isPermissionError } from '../powerPagesApi'
import type { Project } from '../../types/project'

function getErrorMessage(error: unknown, fallback: string) {
  if (isPermissionError(error)) {
    return 'You do not have access to project records. Contact your portal administrator.'
  }

  return error instanceof Error ? error.message : fallback
}

export function useProjects(
  params: Pick<ListProjectsParams, 'pageSize'> = {},
) {
  const [items, setItems] = useState<Project[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [nextLink, setNextLink] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const load = useCallback(
    async (cursor?: string) => {
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller
      setError(null)
      if (cursor) setIsLoadingMore(true)
      else setIsLoading(true)

      try {
        const result = await listProjects({
          pageSize: params.pageSize,
          nextLink: cursor,
          signal: controller.signal,
        })
        setItems((current) =>
          cursor ? [...current, ...result.items] : result.items,
        )
        setTotalCount(result.totalCount)
        setNextLink(result.nextLink)
      } catch (requestError) {
        if (
          !(requestError instanceof DOMException) ||
          requestError.name !== 'AbortError'
        ) {
          setError(
            getErrorMessage(requestError, 'Project records could not be loaded.'),
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [params.pageSize],
  )

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
    return () => activeRequest.current?.abort()
  }, [load])

  return {
    items,
    totalCount,
    nextLink,
    isLoading,
    isLoadingMore,
    error,
    refetch: () => load(),
    loadMore: () => (nextLink ? load(nextLink) : Promise.resolve()),
  }
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!projectId) {
        setIsLoading(false)
        setError('A project identifier is required.')
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const result = await getProjectById(projectId, signal)
        setProject(result)
        if (!result) setError('The requested project could not be found.')
      } catch (requestError) {
        if (
          !(requestError instanceof DOMException) ||
          requestError.name !== 'AbortError'
        ) {
          setError(
            getErrorMessage(requestError, 'Project details could not be loaded.'),
          )
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [projectId],
  )

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => {
      void load(controller.signal)
    })
    return () => controller.abort()
  }, [load])

  return { project, isLoading, error, refetch: () => load() }
}
