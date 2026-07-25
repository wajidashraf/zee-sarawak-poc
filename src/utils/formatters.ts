const currencyFormatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatCurrency(value: number | null | undefined) {
  return value == null ? 'Not set' : currencyFormatter.format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? 'Not set' : dateFormatter.format(date)
}

export function isPastDate(value: string | null | undefined) {
  if (!value) return false

  const date = new Date(`${value.slice(0, 10)}T23:59:59`)
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now()
}
