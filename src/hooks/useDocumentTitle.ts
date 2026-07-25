import { useEffect } from 'react'

const SITE_NAME = 'Sarawak Project Monitoring Portal'

export function useDocumentTitle(pageName?: string) {
  useEffect(() => {
    document.title = pageName ? `${pageName} — ${SITE_NAME}` : SITE_NAME
  }, [pageName])
}
