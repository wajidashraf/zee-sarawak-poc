import type { ReactNode } from 'react'

export interface ChartDataRow {
  label: string
  value: string
}

interface PortfolioChartCardProps {
  id: string
  title: string
  description: string
  insight: string
  position: 1 | 2 | 3
  rows: ChartDataRow[]
  children: ReactNode
}

export function PortfolioChartCard({
  id,
  title,
  description,
  insight,
  position,
  rows,
  children,
}: PortfolioChartCardProps) {
  return (
    <article
      aria-labelledby={`${id}-heading`}
      className={`dashboard-chart-card dashboard-chart-card--row-${position}`}
    >
      <header className="dashboard-chart-card__heading">
        <div>
          <p className="dashboard-panel__eyebrow">Portfolio analysis</p>
          <h2 id={`${id}-heading`}>{title}</h2>
        </div>
        <p>{description}</p>
      </header>
      <div className="dashboard-chart-card__plot">{children}</div>
      <p className="dashboard-chart-card__insight">{insight}</p>
      <details className="dashboard-chart-card__data">
        <summary>View chart data</summary>
        <div className="dashboard-chart-card__table-shell">
          <table>
            <caption className="sr-only">{title} data</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  )
}
