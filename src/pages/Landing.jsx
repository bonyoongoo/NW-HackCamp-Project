// src/pages/Landing.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import EventCard from '../components/EventCard.jsx'
import { loadEvents } from '../lib/data.js'
import { getCustomEvents } from '../lib/custom.js'
import { getSavedIds, getUserPrefs, saveUserPrefs } from '../lib/storage.js'
import { useToast } from '../components/Toaster.jsx'

export default function Landing() {
  const nav = useNavigate()
  const toast = useToast()

  const [allEvents, setAllEvents] = useState([])
  const [savedCount, setSavedCount] = useState(0)
  const [customCount, setCustomCount] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const fileEvents = await loadEvents()
        const custom = getCustomEvents()
        setAllEvents([...custom, ...fileEvents])
        setSavedCount(getSavedIds().length)
        setCustomCount(custom.length)
      } catch {
        setAllEvents([])
      }
    })()
  }, [])

  const sample = useMemo(() => {
    if (allEvents.length) return allEvents[0]
    // Fallback sample (in case events.json is empty during setup)
    const start = new Date()
    start.setDate(start.getDate() + 3)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    return {
      id: 'sample_landing',
      title: 'AI @ UBC: Intro Workshop',
      description:
        'Hands-on intro to building AI-powered apps with prompts and React. No experience required—bring a laptop!',
      faculty: 'Engineering',
      tags: ['ai', 'workshop', 'swe'],
      level: 'beginner',
      start: start.toISOString(),
      end: end.toISOString(),
      location: 'ICICS X350',
      url: 'https://example.com',
      organizer: 'UBC AI Club',
      isCustom: true
    }
  }, [allEvents])

  function startOnboarding() {
    nav('/onboarding')
  }

  function quickDemo() {
    const existing = getUserPrefs()
    const demo = {
      name: 'UBC Demo',
      faculty: 'Engineering',
      interests: ['ai', 'swe', 'entrepreneurship']
    }
    if (!existing) {
      saveUserPrefs(demo)
      toast.success('Demo profile created. Showing personalized Feed.')
    } else {
      toast.info('Using your existing profile. Opening Feed.')
    }
    nav('/feed')
  }

  return (
    <div>
      {/* Hero */}
      <Card className="space-bottom">
        <div className="row-between">
          <div style={{maxWidth: 560}}>
            <div className="h1" style={{marginTop: 0}}>
              Find competitions, workshops, hackathons — tailored for UBC students
            </div>
            <p className="muted">
              Pick your faculty and interests once. Get a live, personalized feed with trending signals,
              AI-cleaned descriptions, and one-click calendar adds.
            </p>
            <div className="row space-top">
              <Button kind="accent" onClick={startOnboarding}>Get started</Button>
              <Link className="btn btn-primary" to="/feed">Explore Feed</Link>
              <Link className="btn btn-ghost" to="/submit">Submit an event</Link>
              <Button kind="ghost" onClick={quickDemo}>Quick demo</Button>
              <Link className="btn btn-ghost" to="/pitch" title="Seeds a great-looking demo automatically">Pitch mode</Link>
            </div>
          </div>

          {/* Preview card */}
          <div style={{minWidth: 300, flex: 1}}>
            <div className="h2" style={{textAlign: 'right'}}>Preview</div>
            <EventCard evt={sample} onSaveToggle={()=>{}} />
          </div>
        </div>
      </Card>

      {/* Quick stats + value props */}
      <div className="row">
        <Card style={{flex: 1, minWidth: 260}}>
          <div className="h2" style={{marginTop: 0}}>Why it’s different</div>
          <ul style={{margin: 0, paddingLeft: 18, lineHeight: 1.6}}>
            <li>Personalized by <strong>faculty</strong> + <strong>interests</strong></li>
            <li>AI summarizer cleans and <strong>auto-tags</strong> events</li>
            <li><strong>Trending</strong> based on peer saves</li>
            <li>One-click <strong>Add to Google</strong> or <strong>.ics</strong></li>
          </ul>
        </Card>

        <Card style={{flex: 1, minWidth: 260}}>
          <div className="h2" style={{marginTop: 0}}>Your local snapshot</div>
          <p className="muted" style={{marginTop: 6}}>
            These numbers are from your browser (no backend yet).
          </p>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop: 12}}>
            <Stat label="Events available" value={allEvents.length} />
            <Stat label="You saved" value={savedCount} />
            <Stat label="Your submitted" value={customCount} />
            <Stat label="Faculties covered" value="Sauder · Engineering · Science" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="panel">
      <div className="h2" style={{marginTop:0}}>{label}</div>
      <div style={{fontSize: 22, fontWeight: 800}}>{String(value)}</div>
    </div>
  )
}
