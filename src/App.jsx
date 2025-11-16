import { Outlet, Link, useLocation } from 'react-router-dom'

export default function App() {
  const { pathname } = useLocation()
  const is = (p) => pathname === p ? 'chip active' : 'chip'
  return (
    <div className="app">
      <header className="nav">
        <div className="nav-inner">
          <Link to="/feed" className="brand">UBC Events</Link>
          <nav className="row">
  <Link className={is('/onboarding')} to="/onboarding">Onboarding</Link>
  <Link className={is('/feed')} to="/feed">Feed</Link>
  <Link className={is('/saved')} to="/saved">Saved</Link>
  <Link className={is('/submit')} to="/submit">Submit</Link> {/* NEW */}
</nav>
        </div>
      </header>
      <div className="container">
        <Outlet />
      </div>
    </div>
  )
}
