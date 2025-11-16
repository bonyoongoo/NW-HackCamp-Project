// src/pages/Submit.jsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import EventCard from '../components/EventCard.jsx'
import { addCustomEvent } from '../lib/custom.js'
import { useToast } from '../components/Toaster.jsx'

const FACULTIES = ['Sauder','Engineering','Science']
const LEVELS = ['beginner','intermediate','advanced']
const KNOWN_TAGS = ['ai','finance','swe','entrepreneurship','workshop','hackathon','networking']

export default function Submit() {
  const nav = useNavigate()
  const toast = useToast()

  // Organizer form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [faculty, setFaculty] = useState('')
  const [level, setLevel] = useState('beginner')
  const [tags, setTags] = useState([])
  const [location, setLocation] = useState('')
  const [start, setStart] = useState('') // datetime-local
  const [end, setEnd] = useState('')
  const [url, setUrl] = useState('')

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  // Build a live preview object (same shape as feed events)
  const eventPreview = useMemo(() => {
    const toISO = (s) => {
      if (!s) return undefined
      // Convert datetime-local (no timezone) to ISO properly
      const dt = new Date(s)
      return Number.isFinite(dt.getTime()) ? dt.toISOString() : undefined
    }
    return {
      id: 'preview_' + Math.random().toString(36).slice(2),
      title: title || 'Untitled Event',
      description: description || '',
      faculty: faculty || 'All',
      tags,
      level: level || 'beginner',
      start: toISO(start),
      end: toISO(end),
      location,
      url,
      organizer: 'Submitted via UI',
      isCustom: true
    }
  }, [title, description, faculty, tags, level, start, end, url])

  // Simple validation for required fields
  const missing = useMemo(() => {
    const m = []
    if (!title.trim()) m.push('title')
    if (!faculty.trim()) m.push('faculty')
    if (!location.trim()) m.push('location')
    if (!start.trim()) m.push('start')
    return m
  }, [title, faculty, location, start])

  function copyJSON() {
    const { id: _drop, ...clean } = eventPreview
    const json = JSON.stringify(clean, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      toast.success('Event JSON copied to clipboard.')
    }, () => {
      toast.error('Could not copy. Try again.')
    })
  }

  function publishToFeed() {
    if (missing.length) {
      toast.error('Please fill: ' + missing.join(', '))
      return
    }
    const { id: _drop, ...clean } = eventPreview
    addCustomEvent(clean)
    toast.success('Published to your feed: ' + (clean.title || 'Event'))
    nav('/feed')
  }

  return (
    <div>
      <div className="h1">Submit an event</div>

      {/* Organizer form */}
      <Card className="space-bottom">
        <div className="h2" style={{marginTop:0}}>Basics</div>
        <input
          className="input"
          placeholder="Event title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{marginBottom:12}}
        />
        <textarea
          className="textarea"
          placeholder="Event description (who it’s for, topics, requirements, etc.)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div className="row space-top">
          <div style={{minWidth:220, flex:1}}>
            <div className="h2">Faculty</div>
            <div className="chips">
              {FACULTIES.map(f => (
                <Chip key={f} active={faculty===f} onClick={() => setFaculty(f)}>{f}</Chip>
              ))}
            </div>
          </div>

          <div style={{minWidth:220, flex:1}}>
            <div className="h2">Level</div>
            <div className="chips">
              {LEVELS.map(l => (
                <Chip key={l} active={level===l} onClick={() => setLevel(l)}>{l}</Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="h2 space-top">Time & place</div>
        <div className="row">
          <input className="input" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
          <input className="input" type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
          <input className="input" placeholder="Location (e.g., ICICS X350)" value={location} onChange={e=>setLocation(e.target.value)} />
        </div>

        <div className="h2 space-top">Link (optional)</div>
        <input className="input" placeholder="Registration or info URL" value={url} onChange={e=>setUrl(e.target.value)} />

        <div className="h2 space-top">Tags</div>
        <div className="chips">
          {KNOWN_TAGS.map(t => (
            <Chip key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
          ))}
        </div>

        <div className="row space-top">
          <Button kind="ghost" onClick={copyJSON}>Copy JSON</Button>
          <Button kind="accent" onClick={publishToFeed}>Publish to Feed</Button>
        </div>
      </Card>

      {/* Validation */}
      <Card className="space-bottom">
        <div className="h2" style={{marginTop:0}}>Submission check</div>
        {missing.length ? (
          <p><strong>Missing:</strong> {missing.map(m => <Badge key={m}>{m}</Badge>)}</p>
        ) : (
          <p><strong>Looks complete ✓</strong> This event has all key fields.</p>
        )}
      </Card>

      {/* Live preview */}
      <Card>
        <div className="h2" style={{marginTop:0}}>Live preview</div>
        <p className="muted">This is how your event will look in the feed.</p>
        <div className="space-top">
          <EventCard evt={eventPreview} onSaveToggle={()=>{}} />
        </div>
      </Card>
    </div>
  )
}
