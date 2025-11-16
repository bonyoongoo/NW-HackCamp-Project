// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'

export default function NotFound() {
  return (
    <div>
      <div className="h1">404 — Page not found</div>
      <Card>
        <p className="muted">The page you’re looking for doesn’t exist.</p>
        <div className="row space-top">
          <Link className="btn btn-primary" to="/">Go home</Link>
          <Link className="btn btn-ghost" to="/feed">Open Feed</Link>
          <Link className="btn btn-ghost" to="/onboarding">Onboarding</Link>
        </div>
      </Card>
    </div>
  )
}
