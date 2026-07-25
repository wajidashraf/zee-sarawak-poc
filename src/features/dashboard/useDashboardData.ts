import { useCallback, useEffect, useRef, useState } from 'react'
import { isPermissionError } from '../../shared/powerPagesApi'
import { listProjectLocations } from '../../shared/services/projectLocationService'
import { listAllProjects } from '../../shared/services/projectService'
import type { Project } from '../../types/project'
import type { ProjectLocation } from '../../types/projectLocation'

interface DashboardData {
  projects: Project[]
  locations: ProjectLocation[]
}

function getErrorMessage(error: unknown) {
  if (isPermissionError(error)) {
    return 'You do not have access to the project portfolio dashboard. Contact your portal administrator.'
  }

  return error instanceof Error
    ? error.message
    : 'The portfolio dashboard could not be loaded.'
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    projects: [],
    locations: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)

    try {
      const [projects, locations] = await Promise.all([
        listAllProjects(controller.signal),
        listProjectLocations(controller.signal),
      ])

      if (!controller.signal.aborted) {
        setData({
          projects: projects.items,
          locations: locations.items,
        })
      }
    } catch (requestError) {
      if (
        !controller.signal.aborted &&
        (!(requestError instanceof DOMException) ||
          requestError.name !== 'AbortError')
      ) {
        setError(getErrorMessage(requestError))
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
    return () => activeRequest.current?.abort()
  }, [load])

  return {
    ...data,
    isLoading,
    error,
    refetch: load,
  }
}
