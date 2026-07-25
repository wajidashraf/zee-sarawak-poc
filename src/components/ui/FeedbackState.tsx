import type { ReactNode } from 'react'
import { AlertIcon, FolderIcon } from './Icons'

interface FeedbackStateProps {
  variant: 'empty' | 'error'
  title: string
  description: string
  action?: ReactNode
}

export function FeedbackState({
  variant,
  title,
  description,
  action,
}: FeedbackStateProps) {
  const Icon = variant === 'error' ? AlertIcon : FolderIcon

  return (
    <section
      className={`feedback-state feedback-state--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span aria-hidden="true" className="feedback-state__icon">
        <Icon height="28" width="28" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="feedback-state__action">{action}</div> : null}
    </section>
  )
}

export function ProjectsLoadingState() {
  return (
    <section
      aria-label="Loading projects"
      aria-live="polite"
      className="projects-loading"
    >
      <span className="sr-only">Loading projects</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div aria-hidden="true" className="projects-loading__row" key={index}>
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </section>
  )
}
