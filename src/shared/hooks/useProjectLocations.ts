import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProjectLocation } from '../../types/projectLocation'
import { isPermissionError } from '../powerPagesApi'
import { listProjectLocations } from '../services/projectLocationService'

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function getErrorMessage(error: unknown) {
  if (isPermissionError(error)) {
    return 'You do not have access to project locations. Contact your portal administrator.'
  }

  return error instanceof Error
    ? error.message
    : 'Project locations could not be loaded.'
}

export function useProjectLocations() {
  const [items, setItems] = useState<ProjectLocation[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const requestLocations = useCallback(async (controller: AbortController) => {
    try {
      const result = await listProjectLocations(controller.signal)
      if (activeRequest.current === controller) {
        setItems(result.items)
        setTotalCount(result.totalCount)
      }
    } catch (requestError) {
      if (
        activeRequest.current === controller &&
        !isAbortError(requestError)
      ) {
        setError(getErrorMessage(requestError))
      }
    } finally {
      if (activeRequest.current === controller) {
        setIsLoading(false)
      }
    }
  }, [])

  const refetch = useCallback(() => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)
    return requestLocations(controller)
  }, [requestLocations])

  useEffect(() => {
    const controller = new AbortController()
    activeRequest.current = controller
    queueMicrotask(() => {
      void requestLocations(controller)
    })
    return () => controller.abort()
  }, [requestLocations])

  return {
    items,
    totalCount,
    isLoading,
    error,
    refetch,
  }
}
