import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  description: string
  icon: ReactNode
  tone?: 'primary' | 'positive' | 'warning' | 'neutral'
}

export function KpiCard({
  label,
  value,
  description,
  icon,
  tone = 'primary',
}: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <div className="kpi-card__heading">
        <p>{label}</p>
        <span aria-hidden="true" className="kpi-card__icon">
          {icon}
        </span>
      </div>
      <strong className="kpi-card__value">{value}</strong>
      <p className="kpi-card__description">{description}</p>
    </article>
  )
}
