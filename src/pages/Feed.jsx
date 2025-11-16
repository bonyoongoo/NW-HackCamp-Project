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

  // NEW: default view shows ALL items (no time filter)
  const [viewMode, setViewMode] = useState('all') // 'all' | 'personalized'

  const [events, setEvents] = useState([])
  const [level, setLevel] = useState('all')
  const [sort, setSort] = useState('trending') // 'trending' | 'date'
  const [q, setQ] = useState('')               // search text
  const [selectedTags, setSelectedTags] = useState([]) // quick tag filters
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0) // bump to re-run memos after save toggles

  useEffect(() => {
    setLoading(true)
    loadEvents()
      .then(fileEvents => {
        const custom = getCustomEvents()
        setEvents([...custom, ...fileEvents]) // custom first so new ones feel “top”
      })
      .catch(e => setError(e.message || 'Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  /**
   * Base pool:
   * - ALL view: return EVERYTHING (no past filtering).
   * - PERSONALIZED view: filter by faculty + interests (still NO date filter).
   */
  const basePool = useMemo(() => {
    if (!events.length) return []

    if (viewMode === 'personalized' && prefs) {
      return events.filter(e => {
        const facultyOk = !e.faculty || e.faculty === 'All' || e.faculty === prefs.faculty
        const interestOk = (e.tags || []).some(t => prefs.interests.includes(t))
        return facultyOk && interestOk
      })
    }

    // 'all' mode — show everything
    return events
  }, [events, prefs, viewMode])

  // Build a tag cloud from current base pool
  const tagCloud = useMemo(() => {
    const counts = {}
    for (const e of basePool) {
      for (const t of (e.tags || [])) counts[t] = (counts[t] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))
  }, [basePool])

  // Trending: top 3 by save count within current base pool
  const trending = useMemo(() => {
    const counts = getSaveCounts()
    if (!counts || !basePool.length) return []
    const idToEvent = new Map(basePool.map(e => [e.id, e]))
    return Object.entries(counts)
      .filter(([id, c]) => c > 0 && idToEvent.has(id))
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, c]) => ({ evt: idToEvent.get(id), count: c }))
  }, [basePool, version])

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

  // Robust date getter for sorting (items without date go last)
  function dateOrInfinity(iso) {
    if (!iso) return Number.POSITIVE_INFINITY
    const t = new Date(iso).getTime()
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY
  }

  // Apply level, tags, and search; then sort
  const filtered = useMemo(() => {
    const withLevel = basePool.filter(e => (level === 'all') || (e.level === level))
    const withTags = selectedTags.length
      ? withLevel.filter(e => (e.tags || []).some(t => selectedTags.includes(t)))
      : withLevel
    const withSearch = withTags.filter(e => matchesQuery(e, q))

    if (sort === 'date') {
      return [...withSearch].sort((a, b) => dateOrInfinity(a.start) - dateOrInfinity(b.start))
    }

    // 'trending': show saved first (demo-friendly)
    const savedSet = new Set(getSavedIds())
    return [...withSearch].sort((a, b) => (savedSet.has(b.id) - savedSet.has(a.id)))
  }, [basePool, level, sort, q, selectedTags, version])

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function clearAllFilters() {
    setLevel('all')
    setSort('trending')
    setQ('')
    setSelectedTags([])
  }

  // Compose heading per mode
  const heading = useMemo(() => {
    if (viewMode === 'personalized') {
      if (!prefs) return 'Personalized (set your profile in Onboarding)'
      return `Personalized for ${prefs.faculty} + ${prefs.interests.join(', ')}`
    }
    return 'All events'
  }, [viewMode, prefs])

  return (
    <div>
      <div className="h1">{heading}</div>

      {/* View mode + quick overview */}
      <Card className="space-bottom">
        <div className="row-between">
          <div>
            <div className="h2" style={{marginTop:0}}>View</div>
            <div className="chips">
              <Chip active={viewMode==='all'} onClick={()=>setViewMode('all')}>All</Chip>
              <Chip
                active={viewMode==='personalized'}
                onClick={() => setViewMode('personalized')}
              >
                Personalized
              </Chip>
            </div>
            {viewMode==='personalized' && !prefs && (
              <div className="muted" style={{marginTop:6}}>
                No profile yet. Go to Onboarding/Settings to set faculty & interests.
              </div>
            )}
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

      {/* Trending strip (based on current base pool) */}
      {trending.length > 0 && (
        <Card className="space-bottom">
          <div className="row-between">
            <div className="h2" style={{marginTop:0}}>🔥 Trending {viewMode==='personalized' ? 'for you' : 'overall'}</div>
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
                    {evt.level || '—'} · {evt.location || 'TBA'}
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
            <div className="h2">Popular tags {viewMode==='personalized' ? '(in your view)' : '(overall)'}</div>
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

      {/* Level filter */}
      <Card className="space-bottom">
        <div className="h2" style={{marginTop:0}}>Level</div>
        <div className="chips">
          <Chip active={level==='all'} onClick={()=>setLevel('all')}>All</Chip>
          {LEVELS.map(l => <Chip key={l} active={level===l} onClick={()=>setLevel(l)}>{l}</Chip>)}
        </div>
      </Card>

      {/* Content */}
      {loading && <Card>Loading events…</Card>}
      {error && <Card>Failed to load events: {error}</Card>}
      {!loading && !error && filtered.length===0 && (
        <Card>No matches. Try clearing filters or switching the view mode.</Card>
      )}

      <div className="grid">
        {filtered.map(evt => (
          <EventCard key={evt.id} evt={evt} onSaveToggle={() => setVersion(v => v+1)} />
        ))}
      </div>
    </div>
  )
}
