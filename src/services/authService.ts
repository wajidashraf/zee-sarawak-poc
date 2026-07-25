import type { PowerPagesUser } from '../types/powerPages'

export type AuthProviderType =
  | 'local'
  | 'oidc'
  | 'entra-id'
  | 'saml2'
  | 'ws-federation'
  | 'social'

export interface AuthProviderConfig {
  id: string
  type: AuthProviderType
  displayName: string
  providerIdentifier?: string
  loginByEmail?: boolean
}

export const AUTH_PROVIDERS: AuthProviderConfig[] = [
  {
    id: 'entra-id',
    type: 'entra-id',
    displayName: 'Sign in with Microsoft',
  },
]

export const LOCAL_PROVIDER = AUTH_PROVIDERS.find(
  (provider) => provider.type === 'local',
)

export const EXTERNAL_PROVIDERS = AUTH_PROVIDERS.filter(
  (provider) => provider.type !== 'local',
)

const DEV_SIGNED_OUT_KEY = '__sarawak_pp_dev_signed_out__'

const MOCK_USER: PowerPagesUser = {
  userName: 'dev.user@pdlz.onmicrosoft.com',
  firstName: 'Dev',
  lastName: 'User',
  email: 'dev.user@pdlz.onmicrosoft.com',
  contactId: '00000000-0000-0000-0000-000000000001',
  userRoles: ['Authenticated Users', 'Administrators'],
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Access was denied. You can try signing in again.',
  external_auth_failed:
    'Microsoft sign-in could not be completed. Please try again.',
}

export const isLocalDevelopment =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')

function isDevelopmentSignedOut() {
  if (!isLocalDevelopment) return false

  const queryMode = new URLSearchParams(window.location.search).get('auth')
  if (queryMode === 'anonymous') return true

  try {
    return window.sessionStorage.getItem(DEV_SIGNED_OUT_KEY) === '1'
  } catch {
    return false
  }
}

export function getCurrentUser(): PowerPagesUser | undefined {
  if (typeof window === 'undefined') return undefined
  if (isLocalDevelopment) {
    return isDevelopmentSignedOut() ? undefined : MOCK_USER
  }

  return window.Microsoft?.Dynamic365?.Portal?.User
}

export function isAuthenticated() {
  return Boolean(getCurrentUser()?.userName)
}

export function getTenantId() {
  if (typeof window === 'undefined') return undefined
  if (isLocalDevelopment) return '00000000-0000-0000-0000-000000000000'
  return window.Microsoft?.Dynamic365?.Portal?.tenant
}

export function getAuthProvider() {
  return LOCAL_PROVIDER ?? AUTH_PROVIDERS[0]
}

export function sanitizeReturnUrl(returnUrl?: string) {
  if (typeof window === 'undefined') return '/'

  const fallback = `${window.location.pathname}${window.location.search}${window.location.hash}`
  try {
    const candidate = new URL(returnUrl || fallback || '/', window.location.origin)
    if (candidate.origin !== window.location.origin) return '/'
    return `${candidate.pathname}${candidate.search}${candidate.hash}`
  } catch {
    return '/'
  }
}

export async function fetchAntiForgeryToken() {
  const response = await fetch('/_layout/tokenhtml', {
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error(
      'The secure sign-in request could not be started. Refresh the page and try again.',
    )
  }

  const html = await response.text()
  const documentFragment = new DOMParser().parseFromString(html, 'text/html')
  const tokenInput = documentFragment.querySelector<HTMLInputElement>(
    'input[name="__RequestVerificationToken"]',
  )

  if (!tokenInput?.value) {
    throw new Error(
      'The secure sign-in token was not available. Refresh the page and try again.',
    )
  }

  return tokenInput.value
}

export function resolveProviderIdentifier(provider: AuthProviderConfig) {
  if (provider.providerIdentifier) return provider.providerIdentifier

  if (provider.type === 'entra-id') {
    const tenantId = getTenantId()
    if (!tenantId) {
      throw new Error(
        'Microsoft Entra ID is not available in the Power Pages runtime.',
      )
    }
    return `https://login.windows.net/${tenantId}/`
  }

  throw new Error(
    `Provider identifier is required for authentication provider "${provider.id}".`,
  )
}

function createHiddenInput(name: string, value: string) {
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = name
  input.value = value
  return input
}

function completeDevelopmentSignIn(returnUrl?: string) {
  try {
    window.sessionStorage.removeItem(DEV_SIGNED_OUT_KEY)
  } catch {
    // Storage can be disabled; navigation still clears the query-string mock.
  }

  const target = new URL(sanitizeReturnUrl(returnUrl), window.location.origin)
  target.searchParams.delete('auth')
  window.location.assign(`${target.pathname}${target.search}${target.hash}`)
}

export async function loginExternal(
  providerIdentifier: string,
  returnUrl?: string,
  invitationCode?: string,
) {
  if (isLocalDevelopment) {
    completeDevelopmentSignIn(returnUrl)
    return
  }

  const antiForgeryToken = await fetchAntiForgeryToken()
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = invitationCode
    ? `/Account/Login/ExternalLogin?InvitationCode=${encodeURIComponent(invitationCode)}`
    : '/Account/Login/ExternalLogin'
  form.hidden = true
  form.append(
    createHiddenInput('__RequestVerificationToken', antiForgeryToken),
    createHiddenInput('provider', providerIdentifier),
    createHiddenInput('returnUrl', sanitizeReturnUrl(returnUrl)),
  )
  document.body.appendChild(form)
  form.submit()
}

export async function loginWithProvider(
  provider: AuthProviderConfig,
  options: { returnUrl?: string; invitationCode?: string } = {},
) {
  if (provider.type === 'local') {
    throw new Error('Local authentication is not exposed by this application.')
  }

  await loginExternal(
    resolveProviderIdentifier(provider),
    options.returnUrl,
    options.invitationCode,
  )
}

export async function login(returnUrl?: string) {
  await loginWithProvider(getAuthProvider(), { returnUrl })
}

export function logout(returnUrl = '/') {
  if (isLocalDevelopment) {
    try {
      window.sessionStorage.setItem(DEV_SIGNED_OUT_KEY, '1')
    } catch {
      // Storage can be disabled; the query-string fallback still supports tests.
    }
    window.location.assign('/?auth=anonymous')
    return
  }

  window.location.assign(
    `/Account/Login/LogOff?returnUrl=${encodeURIComponent(
      sanitizeReturnUrl(returnUrl),
    )}`,
  )
}

export function getAuthError() {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  const code = params.get('message') ?? params.get('error')
  return code ? (AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.external_auth_failed) : undefined
}

export function getSessionExpiredMessage() {
  if (typeof window === 'undefined') return undefined
  return new URLSearchParams(window.location.search).get('sessionExpired') ===
    'true'
    ? 'Your session has expired. Sign in again to continue.'
    : undefined
}

export function getUserDisplayName(user = getCurrentUser()) {
  if (!user) return 'User'
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.email || user.userName || 'User'
}

export function getUserInitials(user = getCurrentUser()) {
  if (!user) return 'U'
  const nameParts = [user.firstName, user.lastName].filter(Boolean)
  if (nameParts.length > 0) {
    return nameParts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }
  return (user.email || user.userName || 'U').charAt(0).toUpperCase()
}

export function parseServerErrors(html: string) {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const messages = [
    ...parsed.querySelectorAll(
      '.validation-summary-errors li, .alert-danger li, .field-validation-error',
    ),
  ]
    .map((element) => element.textContent?.trim())
    .filter((message): message is string => Boolean(message))
  return [...new Set(messages)]
}

export interface ExternalLoginDetails {
  email: string
  firstName: string
  lastName: string
  username: string
  invitationCode: string
  returnUrl: string
  antiForgeryToken: string
}

export class ExternalLoginCookieExpiredError extends Error {
  constructor() {
    super('The Microsoft sign-in session has expired. Please sign in again.')
    this.name = 'ExternalLoginCookieExpiredError'
  }
}

export async function fetchExternalLoginDetails(): Promise<ExternalLoginDetails> {
  if (isLocalDevelopment) {
    return {
      email: MOCK_USER.email,
      firstName: MOCK_USER.firstName,
      lastName: MOCK_USER.lastName,
      username: MOCK_USER.userName,
      invitationCode: '',
      returnUrl: '/',
      antiForgeryToken: 'development-token',
    }
  }

  const response = await fetch('/Account/Login/ExternalLoginCallback', {
    credentials: 'same-origin',
  })
  if (!response.ok) {
    throw new Error('Your Microsoft sign-in details could not be loaded.')
  }

  const html = await response.text()
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const getValue = (selector: string) =>
    parsed.querySelector<HTMLInputElement>(selector)?.value ?? ''

  if (!parsed.querySelector('input[name="Email"]')) {
    throw new ExternalLoginCookieExpiredError()
  }

  const formAction = parsed.querySelector('form')?.getAttribute('action') ?? ''
  const actionQuery = formAction.includes('?')
    ? formAction.slice(formAction.indexOf('?') + 1)
    : ''
  const actionParams = new URLSearchParams(actionQuery)

  return {
    email: getValue('input[name="Email"]'),
    firstName: getValue('input[name="FirstName"]'),
    lastName: getValue('input[name="LastName"]'),
    username: getValue('input[name="Username"]'),
    invitationCode:
      getValue('input[name="InvitationCode"]') ||
      actionParams.get('InvitationCode') ||
      '',
    returnUrl: sanitizeReturnUrl(actionParams.get('ReturnUrl') || '/'),
    antiForgeryToken: getValue('input[name="__RequestVerificationToken"]'),
  }
}

export async function confirmExternalLogin(details: ExternalLoginDetails) {
  if (isLocalDevelopment) {
    completeDevelopmentSignIn(details.returnUrl)
    return
  }

  const query = new URLSearchParams()
  if (details.returnUrl) query.set('ReturnUrl', details.returnUrl)
  if (details.invitationCode) {
    query.set('InvitationCode', details.invitationCode)
  }

  const body = new URLSearchParams({
    __RequestVerificationToken: details.antiForgeryToken,
    Email: details.email,
    FirstName: details.firstName,
    LastName: details.lastName,
    Username: details.username,
  })

  const response = await fetch(
    `/Account/Login/ExternalLoginConfirmation${
      query.size > 0 ? `?${query.toString()}` : ''
    }`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      credentials: 'same-origin',
      redirect: 'manual',
    },
  )

  if (response.type === 'opaqueredirect') {
    window.location.assign(details.returnUrl || '/')
    return
  }

  if (response.ok) {
    const html = await response.text()
    const errors = parseServerErrors(html)
    if (errors.length > 0) throw new Error(errors.join(' '))
    throw new Error('Your Microsoft sign-in could not be completed.')
  }

  throw new Error('Your Microsoft sign-in could not be completed.')
}
