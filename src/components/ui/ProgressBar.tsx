interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label = 'Physical progress' }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div
      aria-label={`${label}: ${safeValue}%`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className="progress"
      role="progressbar"
    >
      <span className="progress__track">
        <span className="progress__value" style={{ width: `${safeValue}%` }} />
      </span>
      <span className="progress__label">{safeValue}%</span>
    </div>
  )
}
