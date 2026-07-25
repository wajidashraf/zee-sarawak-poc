/**
 * Power Pages portal user snapshot.
 * This object is injected by Power Pages when the site is rendered.
 */
export interface PowerPagesUser {
  userName: string
  firstName: string
  lastName: string
  email: string
  contactId: string
  userRoles: string[]
}

export interface PowerPagesPortal {
  User?: PowerPagesUser
  version?: string
  type?: string
  id?: string
  geo?: string
  tenant?: string
  correlationId?: string
  orgEnvironmentId?: string
  orgId?: string
  isClientApiEnabled?: boolean
}

interface MicrosoftNamespace {
  Dynamic365?: {
    Portal?: PowerPagesPortal
  }
}

declare global {
  interface Window {
    Microsoft?: MicrosoftNamespace
  }
}

export {}
