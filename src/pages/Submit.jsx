import { useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import EventCard from '../components/EventCard.jsx'
import { summarize, suggestTags, detectLevel, findMissingFields } from '../lib/ai.js'

const FACULTIES = ['Sauder','Engineering','Science']
const LEVELS = ['beginner','intermediate','advanced']
const KNOWN_TAGS = ['ai','finance','swe','entrepreneurship','workshop','hackathon','networking']

export default function Submit() {
  // Form fields (organizer fills these)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [faculty, setFaculty] = useState('')
  const [level, setLevel] = useState('')
  const [tags, setTags] = useState([])
  const [location, setLocation] = useState('')
  const [start, setStart] = useState('') // datetime-local string
  const [end, setEnd] = useState('')
  const [url, setUrl] = useState('')

  // "AI" suggestions
  const [aiSummary, setAiSummary] = useState('')
  const [aiTags, setAiTags] = useState([])
  const [aiLevel, setAiLevel] = useState('')

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function runAI() {
    const s = summarize(description, 2)
    const tg = suggestTags(description, 5)
    const lvl = detectLevel(description)
    setAiSummary(s)
    setAiTags(tg)
    setAiLevel(lvl)
  }

  function applyAI() {
    if (aiSummary && aiSummary !== 'No description provided.') {
      // optionally replace long description with cleaner summary at the top
      // Here we keep both: summary is shown on card by truncation anyway.
    }
    if (aiLevel) setLevel(aiLevel)
    if (aiTags?.length) {
      // merge unique
      setTags(prev => [...new Set([...prev, ...aiTags])])
    }
  }

  const eventPreview = useMemo(() => {
    // convert datetime-local to ISO with timezone (assume local)
    const toISO = (s) => s ? new Date(s).toISOString() : undefined
    return {
      id: 'preview_' + Math.random().toString(36).slice(2),
      title: title || 'Untitled Event',
      description: description || aiSummary || '',
      faculty: faculty || 'All',
      tags,
      level: level || aiLevel || 'beginner',
      start: toISO(start),
      end: toISO(end),
      location,
      url,
      organizer: 'Submitted via UI'
    }
  }, [title, description, faculty, tags, level, start, end, url, aiSummary, aiLevel])

  const missing = findMissingFields(eventPreview)

  function copyJSON() {
    const json = JSON.stringify(eventPreview, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      alert('Event JSON copied to clipboard. Paste it into your dataset!')
    })
  }

  return (
    <div>
      <div className="h1">Submit an event (with AI assist) ✨</div>

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
          placeholder="Paste event description here. Include who it's for, topics, and any requirements."
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
          <Button kind="primary" onClick={runAI}>AI Summarize & Tag</Button>
          <Button kind="ghost" onClick={applyAI}>Apply suggestions</Button>
          <Button kind="ghost" onClick={copyJSON}>Copy JSON</Button>
        </div>
      </Card>

      {/* AI suggestions & validation */}
      <div className="row" style={{alignItems:'flex-start'}}>
        <Card className="space-bottom" style={{flex:1, minWidth:280}}>
          <div className="h2" style={{marginTop:0}}>AI suggestions</div>
          {aiSummary ? (
            <>
              <p><strong>Summary:</strong> {aiSummary}</p>
              <p><strong>Suggested level:</strong> <Badge>{aiLevel}</Badge></p>
              <p><strong>Suggested tags:</strong> {aiTags.length ? aiTags.map(t => <Badge key={t}>#{t}</Badge>) : '—'}</p>
              <p className="muted">Click “Apply suggestions” to merge tags/level into the form.</p>
            </>
          ) : (
            <p className="muted">Paste a description above and click “AI Summarize & Tag”.</p>
          )}
        </Card>

        <Card className="space-bottom" style={{flex:1, minWidth:280}}>
          <div className="h2" style={{marginTop:0}}>Submission check</div>
          {missing.length ? (
            <p><strong>Missing:</strong> {missing.map(m => <Badge key={m}>{m}</Badge>)}</p>
          ) : (
            <p><strong>Looks complete ✓</strong> This event has all key fields.</p>
          )}
          <p className="muted">Use “Copy JSON” to hand this to your teammate or paste into your dataset.</p>
        </Card>
      </div>

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
