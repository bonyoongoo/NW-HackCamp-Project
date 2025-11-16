// src/pages/Feed.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import EventCard from '../components/EventCard.jsx'
import { loadEvents } from '../lib/data.js'
import { getCustomEvents } from '../lib/custom.js'
import {
  getUserPrefs,
  getSavedIds,
  getSaveCounts,
  toggleSaveId
} from '../lib/storage.js'

const LEVELS = ['beginner','intermediate','advanced']

export default function Feed() {
  const nav = useNavigate()
  const prefs = getUserPrefs()
  const [events, setEvents] = useState([])
  const [level, setLevel] = useState('all')
  const [sort, setSort] = useState('trending') // or 'date'
  const [q, setQ] = useState('')               // search text
  const [selectedTags, setSelectedTags] = useState([]) // quick tag filters
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0) // bump to re-run memos after save toggles

  useEffect(() => {
    if (!prefs) { nav('/onboarding'); return }
    setLoading(true)
    loadEvents()
      .then(fileEvents => {
        const custom = getCustomEvents()
        setEvents([...custom, ...fileEvents]) // custom first so new ones feel “top”
      })
      .catch(e => setError(e.message || 'Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  // Base filter by prefs (faculty + interests + upcoming). Leave level/search/tag for later.
  const mineAll = useMemo(() => {
    if (!prefs) return []
    return events.filter(e => {
      const facultyOk = !e.faculty || e.faculty==='All' || e.faculty===prefs.faculty
      const interestOk = (e.tags||[]).some(t => prefs.interests.includes(t))
      const upcomingOk = e.start ? new Date(e.start).getTime() >= Date.now() - 60*60*1000 : true
      return facultyOk && interestOk && upcomingOk
    })
  }, [events, prefs])

  // Build a small tag cloud from filtered pool
  const tagCloud = useMemo(() => {
    const counts = {}
    for (const e of mineAll) {
      for (const t of (e.tags || [])) counts[t] = (counts[t] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 10) // top 10 tags
      .map(([tag, count]) => ({ tag, count }))
  }, [mineAll])

  // Trending: top 3 by save count among mineAll
  const trending = useMemo(() => {
    const counts = getSaveCounts()
    if (!counts || !mineAll.length) return []
    const idToEvent = new Map(mineAll.map(e => [e.id, e]))
    return Object.entries(counts)
      .filter(([id, c]) => c > 0 && idToEvent.has(id))
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, c]) => ({ evt: idToEvent.get(id), count: c }))
  }, [mineAll, version])

  // Text match helper (all words must be found somewhere)
  function matchesQuery(e, query) {
    if (!query.trim()) return true
    const hay = [
      e.title, e.description, e.organizer, e.location,
      ...(e.tags || [])
    ].join(' ').toLowerCase()
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return words.every(w => hay.includes(w))
  }

  // Apply level, tags, and search; then sort
  const filtered = useMemo(() => {
    if (!prefs) return []
    const withLevel = mineAll.filter(e => (level==='all') || (e.level===level))
    const withTags = selectedTags.length
      ? withLevel.filter(e => (e.tags || []).some(t => selectedTags.includes(t)))
      : withLevel
    const withSearch = withTags.filter(e => matchesQuery(e, q))

    if (sort==='date') return [...withSearch].sort((a,b) => new Date(a.start) - new Date(b.start))
    // 'trending': show saved first (demo-friendly)
    const savedSet = new Set(getSavedIds())
    return [...withSearch].sort((a,b) => (savedSet.has(b.id) - savedSet.has(a.id)))
  }, [mineAll, prefs, level, sort, q, selectedTags, version])

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function clearAllFilters() {
    setLevel('all')
    setSort('trending')
    setQ('')
    setSelectedTags([])
  }

  if (!prefs) return null

  return (
    <div>
      <div className="h1">Hi {prefs.name}! Hand-picked for {prefs.faculty} + {prefs.interests.join(', ')}</div>

      {/* Trending strip */}
      {trending.length > 0 && (
        <Card className="space-bottom">
          <div className="row-between">
            <div className="h2" style={{marginTop:0}}>🔥 Trending in {prefs.faculty}</div>
            <div className="muted">based on saves</div>
          </div>
          <div className="trend-row">
            {trending.map(({evt, count}, i) => {
              const saved = getSavedIds().includes(evt.id)
              return (
                <div key={evt.id} className="trend-card">
                  <div className="trend-rank">{i+1}</div>
                  <div className="trend-title">{evt.title}</div>
                  <div className="trend-meta">
                    {evt.level} · {evt.location || 'TBA'}
                  </div>
                  <div className="trend-meta">★ {count} save{count===1?'':'s'}</div>
                  <div className="row space-top">
                    {evt.url && (
                      <a className="btn btn-ghost" href={evt.url} target="_blank" rel="noreferrer">
                        Details
                      </a>
                    )}
                    <button
                      className={`btn ${saved ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => { toggleSaveId(evt.id); setVersion(v => v+1) }}
                    >
                      {saved ? 'Saved ✓' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Search + Tag filters */}
      <Card className="space-bottom">
        <div className="row-between">
          <div className="searchbar">
            <span className="search-icon" aria-hidden>🔍</span>
            <input
              className="input search-input"
              placeholder="Search title, description, tags, organizer, or location…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost" onClick={clearAllFilters}>Clear filters</button>
        </div>

        {tagCloud.length > 0 && (
          <>
            <div className="h2">Popular tags</div>
            <div className="chips">
              {tagCloud.map(({tag, count}) => (
                <Chip key={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                  #{tag} ({count})
                </Chip>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Level + Sort */}
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
        <Card>No matches. Try clearing filters or update your interests on <a className="link" href="/onboarding">Onboarding</a>.</Card>
      )}

      <div className="grid">
        {filtered.map(evt => (
          <EventCard key={evt.id} evt={evt} onSaveToggle={() => setVersion(v => v+1)} />
        ))}
      </div>
    </div>
  )
}
