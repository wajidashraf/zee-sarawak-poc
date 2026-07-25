import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
] as const

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink
          aria-label="Sarawak Project Monitoring Portal home"
          className="brand"
          to="/"
        >
          <span aria-hidden="true" className="brand__mark">
            SP
          </span>
          <span className="brand__copy">
            <span className="brand__name">Sarawak</span>
            <span className="brand__descriptor">Project Monitoring Portal</span>
          </span>
        </NavLink>

        <nav aria-label="Primary navigation" className="primary-nav">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `primary-nav__link${isActive ? ' primary-nav__link--active' : ''}`
              }
              end={item.to === '/'}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
