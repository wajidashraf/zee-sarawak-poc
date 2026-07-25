export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__title">Sarawak Project Monitoring Portal</p>
          <p className="site-footer__description">
            Clear project oversight for teams across Sarawak.
          </p>
        </div>
        <p className="site-footer__copyright">
          © {new Date().getFullYear()} Sarawak Project Monitoring Portal
        </p>
      </div>
    </footer>
  )
}
