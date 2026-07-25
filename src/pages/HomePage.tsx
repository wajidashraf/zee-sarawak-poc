import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const portalHighlights = [
  {
    title: 'Portfolio visibility',
    description:
      'Bring project health, delivery milestones, and financial progress into one consistent view.',
  },
  {
    title: 'Operational clarity',
    description:
      'Help project teams move from updates and issues to clear, accountable next actions.',
  },
  {
    title: 'Trusted oversight',
    description:
      'Support decisions with structured project information and role-aware access.',
  },
] as const

export function HomePage() {
  useDocumentTitle()

  return (
    <div className="page-container">
      <section className="hero" aria-labelledby="home-heading">
        <div className="hero__content">
          <p className="eyebrow">Project intelligence for Sarawak</p>
          <h1 id="home-heading">Monitor every project with clarity.</h1>
          <p className="hero__summary">
            A single operational portal for understanding progress, identifying
            risks, and keeping construction and property projects moving.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/projects">
              View projects
            </Link>
            <a className="button button--secondary" href="#portal-overview">
              Explore the portal
            </a>
          </div>
        </div>
        <aside className="hero__context" aria-label="Portal focus">
          <span className="hero__context-label">Portal focus</span>
          <strong>Executive insight. Operational action.</strong>
          <p>
            Designed for PMO teams, project leaders, site teams, executives, and
            auditors.
          </p>
        </aside>
      </section>

      <section
        aria-labelledby="portal-overview-heading"
        className="overview-section"
        id="portal-overview"
      >
        <div className="section-heading">
          <p className="eyebrow">One shared view</p>
          <h2 id="portal-overview-heading">Built for confident project decisions</h2>
        </div>
        <div className="highlight-grid">
          {portalHighlights.map((highlight, index) => (
            <article className="highlight-card" key={highlight.title}>
              <span aria-hidden="true" className="highlight-card__number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
