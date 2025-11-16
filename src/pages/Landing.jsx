// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'

export default function Landing() {
  return (
    <div>
      {/* Top banner: keep rotating background ONLY here */}
      <div className="header-slideshow" aria-hidden="true" />

      <div className="container">
        {/* Static-color hero (no rotating images here) */}
        <section className="hero-card card">
          <h1 className="hero-title">UBC Tech &amp; Student Events</h1>
          <p className="hero-sub">
            Discover hackathons, talks, and workshops across faculties — all in one place.
          </p>
          <div className="row">
            <Link to="/feed" className="btn btn-primary">Browse events</Link>
            <Link to="/submit" className="btn btn-accent">Submit an event</Link>
          </div>
        </section>

        {/* Optional: a small features row */}
        <div className="grid space-top">
          <Card>
            <div className="h2" style={{marginTop:0}}>Personalized feed</div>
            <p className="muted">Filter by faculty, interests, and level.</p>
          </Card>
          <Card>
            <div className="h2" style={{marginTop:0}}>Save &amp; share</div>
            <p className="muted">Bookmark events and share deep links.</p>
          </Card>
          <Card>
            <div className="h2" style={{marginTop:0}}>Quick submit</div>
            <p className="muted">Student clubs can publish in minutes.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
