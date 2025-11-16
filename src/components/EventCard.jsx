import Badge from './Badge.jsx'
import Button from './Button.jsx'
import { getSavedIds, toggleSaveId } from '../lib/storage.js'
import { googleCalendarUrl, downloadICS } from '../lib/calendar.js'  // ⬅ NEW

export default function EventCard({ evt, onSaveToggle }) {
  const saved = getSavedIds().includes(evt.id)
  const isTrending = saved // demo trick: saved == trending flair

  const start = evt.start ? new Date(evt.start) : null
  const end = evt.end ? new Date(evt.end) : null
  const when = start
    ? `${start.toLocaleString([], { dateStyle:'medium', timeStyle:'short' })}${end ? ' – ' + end.toLocaleTimeString([], { timeStyle:'short' }) : ''}`
    : 'TBA'

  const hasStart = !!evt.start
  const gcalHref = hasStart ? googleCalendarUrl(evt) : '#'

  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{margin:0}}>{evt.title}</h3>
        {isTrending && <Badge>🔥 Trending</Badge>}
      </div>

      <div className="row space-top">
        <Badge>{evt.faculty || 'All'}</Badge>
        <Badge>{evt.level}</Badge>
        {evt.tags?.slice(0,3).map(t => <Badge key={t}>#{t}</Badge>)}
      </div>

      <p className="space-top line-clamp-3" style={{marginTop:10}}>
        {evt.description}
      </p>

      <div className="row-between space-top">
        <div className="muted">{when} · {evt.location || 'TBA'}</div>
        <div className="row">
          {/* Details link (if provided) */}
          {evt.url && (
            <a className="btn btn-ghost" href={evt.url} target="_blank" rel="noreferrer">
              Details
            </a>
          )}

          {/* Add to Google Calendar */}
          <a
            className={`btn btn-ghost ${hasStart ? '' : 'disabled'}`}
            href={gcalHref}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (!hasStart) {
                e.preventDefault();
                alert('This event is missing a start time.');
              }
            }}
          >
            Add to Google
          </a>

          {/* Download .ics */}
          <Button
            kind="ghost"
            onClick={() => {
              if (!hasStart) { alert('This event is missing a start time.'); return; }
              downloadICS(evt);
            }}
          >
            Download .ics
          </Button>

          {/* Save toggle */}
          <Button onClick={() => { toggleSaveId(evt.id); onSaveToggle?.(evt.id) }}>
            {saved ? 'Saved ✓' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
