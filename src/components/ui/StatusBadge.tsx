import type { ReactNode } from 'react'

export type StatusTone = 'positive' | 'warning' | 'critical' | 'neutral'

interface StatusBadgeProps {
  tone: StatusTone
  children: ReactNode
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>
}
