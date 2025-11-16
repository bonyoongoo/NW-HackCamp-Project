import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import EventCard from '../components/EventCard.jsx'
import { getUserPrefs, getSavedIds } from '../lib/storage.js'
import { loadEvents } from '../lib/data.js'

const LEVELS = ['beginner','intermediate','advanced']

export default function Feed() {
  const nav = useNavigate()
  const prefs = getUserPrefs()
  const [events, setEvents] = useState([])
  const [level, setLevel] = useState('all')
  const [sort, setSort] = useState('trending') // or 'date'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!prefs) { nav('/onboarding'); return }
    setLoading(true)
    loadEvents()
      .then(setEvents)
      .catch(e => setError(e.message || 'Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!prefs) return []
    const mine = events.filter(e => {
      const facultyOk = !e.faculty || e.faculty==='All' || e.faculty===prefs.faculty
      const interestOk = (e.tags||[]).some(t => prefs.interests.includes(t))
      const upcomingOk = e.start ? new Date(e.start).getTime() >= Date.now() - 60*60*1000 : true
      const levelOk = (level==='all') || (e.level===level)
      return facultyOk && interestOk && upcomingOk && levelOk
    })
    if (sort==='date') return [...mine].sort((a,b) => new Date(a.start) - new Date(b.start))
    // 'trending': show saved first (simple, demo-friendly)
    const savedSet = new Set(getSavedIds())
    return [...mine].sort((a,b) => (savedSet.has(b.id) - savedSet.has(a.id)))
  }, [events, prefs, level, sort])

  if (!prefs) return null

  return (
    <div>
      <div className="h1">Hi {prefs.name}! Hand-picked for {prefs.faculty} + {prefs.interests.join(', ')}</div>

      {/* Filters */}
      <Card className="space-bottom">
        <div className="row-between">
          <div>
            <div className="h2" style={{marginTop:0}}>Level</div>
            <div className="chips">
              <Chip active={level==='all'} onClick={()=>setLevel('all')}>All</Chip>
              {LEVELS.map(l => <Chip key={l} active={level===l} onClick={()=>setLevel(l)}>{l}</Chip>)}
            </div>
          </div>
          <div>
            <div className="h2" style={{marginTop:0}}>Sort</div>
            <div className="chips">
              <Chip active={sort==='trending'} onClick={()=>setSort('trending')}>Trending</Chip>
              <Chip active={sort==='date'} onClick={()=>setSort('date')}>Date</Chip>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading && <Card>Loading events…</Card>}
      {error && <Card>Failed to load events: {error}</Card>}
      {!loading && !error && filtered.length===0 && (
        <Card>No matches. Try changing level or update your interests on <a className="link" href="/onboarding">Onboarding</a>.</Card>
      )}

      <div className="grid">
        {filtered.map(evt => (
          <EventCard key={evt.id} evt={evt} onSaveToggle={() => setSort(s => s)} />
        ))}
      </div>
    </div>
  )
}
