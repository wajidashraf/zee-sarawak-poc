import { useCallback, useEffect, useRef, useState } from 'react'
import { isPermissionError } from '../powerPagesApi'
import { listContractors } from '../services/contractorService'
import type { Contractor } from '../../types/contractor'

function getContractorErrorMessage(error: unknown) {
  if (isPermissionError(error)) {
    return 'You do not have access to contractor records. Contact your portal administrator.'
  }

  return error instanceof Error
    ? error.message
    : 'Contractor records could not be loaded.'
}

export function useContractors() {
  const [items, setItems] = useState<Contractor[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const request = useCallback(async (controller: AbortController) => {
    try {
      const result = await listContractors(controller.signal)
      setItems(result.items)
      setTotalCount(result.totalCount)
    } catch (requestError) {
      if (
        !(requestError instanceof DOMException) ||
        requestError.name !== 'AbortError'
      ) {
        setError(getContractorErrorMessage(requestError))
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false)
    }
  }, [])

  const load = useCallback(() => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)
    return request(controller)
  }, [request])

  useEffect(() => {
    const controller = new AbortController()
    activeRequest.current = controller
    void listContractors(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setItems(result.items)
        setTotalCount(result.totalCount)
      })
      .catch((requestError: unknown) => {
        if (
          !controller.signal.aborted &&
          (!(requestError instanceof DOMException) ||
            requestError.name !== 'AbortError')
        ) {
          setError(getContractorErrorMessage(requestError))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  return {
    items,
    totalCount,
    isLoading,
    error,
    refetch: load,
  }
}
