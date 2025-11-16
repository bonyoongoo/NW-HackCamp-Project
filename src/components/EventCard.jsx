// src/components/EventCard.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge.jsx'
import Button from './Button.jsx'
import Modal from './Modal.jsx'
import { getSavedIds, toggleSaveId } from '../lib/storage.js'
import { googleCalendarUrl, downloadICS } from '../lib/calendar.js'
import { useToast } from './Toaster.jsx'

export default function EventCard({ evt, onSaveToggle }) {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const saved = getSavedIds().includes(evt.id)
  const isTrending = saved // demo trick: saved == trending flair

  const start = evt.start ? new Date(evt.start) : null
  const end = evt.end ? new Date(evt.end) : null
  const when = start
    ? `${start.toLocaleString([], { dateStyle:'medium', timeStyle:'short' })}${end ? ' – ' + end.toLocaleTimeString([], { timeStyle:'short' }) : ''}`
    : 'TBA'
  const hasStart = !!evt.start
  const gcalHref = hasStart ? googleCalendarUrl(evt) : '#'

  async function shareEvent() {
    const link = `${window.location.origin}/e/${evt.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: evt.title, url: link })
      } else {
        await navigator.clipboard.writeText(link)
        toast.success('Link copied to clipboard.')
      }
    } catch {
      toast.info('Share cancelled.')
    }
  }

  return (
    <>
      <div className="card">
        <div className="row-between">
          <h3 className="card-title" style={{margin:0, cursor:'pointer'}} onClick={() => setOpen(true)} title="Quick view">
            {evt.title}
          </h3>
          <div className="row">
            {isTrending && <Badge>🔥 Trending</Badge>}
            {evt.isCustom && <Badge>🆕 New</Badge>}
          </div>
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
            {/* Quick View (in-app) */}
            <Button kind="ghost" onClick={() => setOpen(true)}>Quick view</Button>

            {/* Open page (deep link) */}
            <Link className="btn btn-ghost" to={`/e/${evt.id}`}>Open page</Link>

            {/* Share link */}
            <Button kind="ghost" onClick={shareEvent}>Share</Button>

            {/* Details link (out-of-app) */}
            {evt.url && (
              <a className="btn btn-ghost" href={evt.url} target="_blank" rel="noreferrer">
                Details
              </a>
            )}

            {/* Add to Google */}
            <a
              className={`btn btn-ghost ${hasStart ? '' : 'disabled'}`}
              href={gcalHref}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!hasStart) {
                  e.preventDefault();
                  toast.error('This event is missing a start time.');
                }
              }}
            >
              Add to Google
            </a>

            {/* Download .ics */}
            <Button
              kind="ghost"
              onClick={() => {
                if (!hasStart) { toast.error('This event is missing a start time.'); return; }
                downloadICS(evt);
                toast.success('Calendar file downloaded.')
              }}
            >
              Download .ics
            </Button>

            {/* Save toggle */}
            <Button
              onClick={() => {
                const wasSaved = saved
                toggleSaveId(evt.id)
                onSaveToggle?.(evt.id)
                toast.info(wasSaved ? 'Removed from Saved' : 'Saved ✓')
              }}
            >
              {saved ? 'Saved ✓' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Quick View */}
      <Modal open={open} onClose={() => setOpen(false)} title={evt.title} wide>
        <div className="row" style={{marginBottom:8}}>
          <Badge>{evt.faculty || 'All'}</Badge>
          <Badge>{evt.level}</Badge>
          {evt.tags?.map(t => <Badge key={t}>#{t}</Badge>)}
          {evt.isCustom && <Badge>🆕 New</Badge>}
          {saved && <Badge>🔥 Trending</Badge>}
        </div>

        <div className="muted" style={{marginBottom:12}}>
          {when} · {evt.location || 'TBA'} {evt.organizer ? `· by ${evt.organizer}` : ''}
        </div>

        <p style={{whiteSpace:'pre-wrap'}}>{evt.description || 'No description provided.'}</p>

        <div className="modal-actions row space-top" style={{justifyContent:'flex-end'}}>
          <Link className="btn btn-ghost" to={`/e/${evt.id}`}>Open page</Link>
          <Button kind="ghost" onClick={shareEvent}>Share</Button>

          {evt.url && (
            <a className="btn btn-ghost" href={evt.url} target="_blank" rel="noreferrer">
              Open details page
            </a>
          )}
          <a
            className={`btn btn-ghost ${hasStart ? '' : 'disabled'}`}
            href={gcalHref}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (!hasStart) { e.preventDefault(); toast.error('This event is missing a start time.'); }
            }}
          >
            Add to Google
          </a>
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (!hasStart) { toast.error('This event is missing a start time.'); return; }
              downloadICS(evt)
              toast.success('Calendar file downloaded.')
            }}
          >
            Download .ics
          </button>
          <button
            className={`btn ${saved ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              const wasSaved = saved
              toggleSaveId(evt.id)
              onSaveToggle?.(evt.id)
              toast.info(wasSaved ? 'Removed from Saved' : 'Saved ✓')
            }}
          >
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </Modal>
    </>
  )
}
