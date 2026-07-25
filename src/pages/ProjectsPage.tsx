import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ProjectsPage() {
  useDocumentTitle('Projects')

  return (
    <div className="page-container">
      <section className="page-intro" aria-labelledby="projects-heading">
        <p className="eyebrow">Project portfolio</p>
        <h1 id="projects-heading">Projects</h1>
        <p>
          Review project progress, delivery health, milestones, and responsible
          teams from one portfolio workspace.
        </p>
      </section>

      <section className="projects-empty-state" aria-labelledby="projects-state-heading">
        <div aria-hidden="true" className="projects-empty-state__icon">
          <svg
            fill="none"
            height="28"
            viewBox="0 0 28 28"
            width="28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 9.5h19v13h-19v-13Zm4-4h11v4h-11v-4Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="M9 14h10M9 18h7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <div>
          <p className="eyebrow">Portfolio workspace</p>
          <h2 id="projects-state-heading">Project records will appear here</h2>
          <p>
            The page structure is ready. Verified Dataverse project records will
            be connected after the target environment and permissions are
            approved.
          </p>
        </div>
        <Link className="button button--secondary" to="/">
          Return home
        </Link>
      </section>
    </div>
  )
}
