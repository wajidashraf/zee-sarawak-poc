import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { formatCurrency } from '../../utils/formatters'
import type { DashboardMetrics } from './dashboardMetrics'
import { PortfolioChartCard } from './PortfolioChartCard'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
)

const chartColors = {
  primary: '#2563eb',
  secondary: '#60a5fa',
  accent: '#059669',
  green: '#0f766e',
  amber: '#d97706',
  red: '#dc2626',
  slate: '#64748b',
  indigo: '#4f46e5',
} as const

const typeColors = [
  chartColors.primary,
  chartColors.accent,
  chartColors.indigo,
  chartColors.amber,
  chartColors.secondary,
  chartColors.slate,
]

interface PortfolioChartsProps {
  metrics: DashboardMetrics
  reduceMotion: boolean
}

export function PortfolioCharts({
  metrics,
  reduceMotion,
}: PortfolioChartsProps) {
  const healthRows = metrics.healthCounts.map((item) => ({
    label: item.label,
    value: String(item.value),
  }))
  const budgetRows = [
    { label: 'Approved budget', value: formatCurrency(metrics.approvedBudget) },
    { label: 'Actual cost', value: formatCurrency(metrics.actualCost) },
  ]
  const typeRows = metrics.typeCounts.map((item) => ({
    label: item.label,
    value: String(item.value),
  }))

  const healthOptions: ChartOptions<'doughnut'> = {
    animation: reduceMotion ? false : { duration: 350 },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: '#334155',
          usePointStyle: true,
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.formattedValue}`,
        },
      },
    },
  }

  const budgetOptions: ChartOptions<'bar'> = {
    animation: reduceMotion ? false : { duration: 350 },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => formatCurrency(Number(context.raw)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#475569' },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e7eef7' },
        ticks: {
          color: '#475569',
          callback: (value) =>
            new Intl.NumberFormat('en-MY', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(Number(value)),
        },
      },
    },
  }

  const typeOptions: ChartOptions<'bar'> = {
    animation: reduceMotion ? false : { duration: 350 },
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue} projects`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e7eef7' },
        ticks: {
          color: '#475569',
          precision: 0,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          autoSkip: false,
          color: '#475569',
          font: { size: 10 },
        },
      },
    },
  }

  const dominantHealth = [...metrics.healthCounts].sort(
    (a, b) => b.value - a.value,
  )[0]
  const dominantType = metrics.typeCounts[0]

  return (
    <>
      <PortfolioChartCard
        description="Current project health mix"
        id="health-chart"
        insight={
          dominantHealth
            ? `${dominantHealth.label} is the largest health group with ${dominantHealth.value} projects.`
            : 'No project health data is available yet.'
        }
        position={1}
        rows={healthRows}
        title="Health distribution"
      >
        <Doughnut
          aria-label={`Project health distribution. ${healthRows
            .map((row) => `${row.label}: ${row.value}`)
            .join(', ')}.`}
          data={{
            labels: metrics.healthCounts.map((item) => item.label),
            datasets: [
              {
                data: metrics.healthCounts.map((item) => item.value),
                backgroundColor: [
                  chartColors.green,
                  chartColors.amber,
                  chartColors.red,
                ],
                borderColor: '#ffffff',
                borderWidth: 3,
              },
            ],
          }}
          options={healthOptions}
          role="img"
        />
      </PortfolioChartCard>

      <PortfolioChartCard
        description="Approved investment against recorded spend"
        id="budget-chart"
        insight={`${formatCurrency(metrics.actualCost)} of ${formatCurrency(
          metrics.approvedBudget,
        )} is recorded as actual cost.`}
        position={2}
        rows={budgetRows}
        title="Budget position"
      >
        <Bar
          aria-label={`Portfolio budget position. Approved budget ${formatCurrency(
            metrics.approvedBudget,
          )}; actual cost ${formatCurrency(metrics.actualCost)}.`}
          data={{
            labels: ['Approved', 'Actual'],
            datasets: [
              {
                data: [metrics.approvedBudget, metrics.actualCost],
                backgroundColor: [chartColors.primary, chartColors.accent],
                borderRadius: 6,
                maxBarThickness: 44,
              },
            ],
          }}
          options={budgetOptions}
          role="img"
        />
      </PortfolioChartCard>

      <PortfolioChartCard
        description="Largest project categories by record count"
        id="type-chart"
        insight={
          dominantType
            ? `${dominantType.label} is the largest category with ${dominantType.value} projects.`
            : 'No project type data is available yet.'
        }
        position={3}
        rows={typeRows}
        title="Project mix"
      >
        <Bar
          aria-label={`Project mix. ${typeRows
            .map((row) => `${row.label}: ${row.value}`)
            .join(', ')}.`}
          data={{
            labels: metrics.typeCounts.map((item) => item.label),
            datasets: [
              {
                data: metrics.typeCounts.map((item) => item.value),
                backgroundColor: metrics.typeCounts.map(
                  (_, index) => typeColors[index % typeColors.length],
                ),
                borderRadius: 5,
                maxBarThickness: 20,
              },
            ],
          }}
          options={typeOptions}
          role="img"
        />
      </PortfolioChartCard>
    </>
  )
}
