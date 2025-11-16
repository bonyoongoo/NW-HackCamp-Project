// src/pages/Settings.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import {
  getUserPrefs,
  saveUserPrefs,
  clearUserPrefs,
  clearAllSaves
} from '../lib/storage.js'
import { clearCustomEvents } from '../lib/custom.js'
import { useToast } from '../components/Toaster.jsx'

const FACULTIES = ['Sauder','Engineering','Science']
const INTERESTS = ['ai','finance','swe','entrepreneurship']

export default function Settings() {
  const nav = useNavigate()
  const toast = useToast()
  const existing = getUserPrefs()

  const [name, setName] = useState(existing?.name || '')
  const [faculty, setFaculty] = useState(existing?.faculty || '')
  const [interests, setInterests] = useState(existing?.interests || [])

  useEffect(() => {
    if (existing) {
      setName(existing.name || '')
      setFaculty(existing.faculty || '')
      setInterests(existing.interests || [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleInterest(tag) {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const valid = name.trim().length > 0 && faculty && interests.length >= 2

  const initial = useMemo(() => ({
    name: existing?.name || '',
    faculty: existing?.faculty || '',
    interests: existing?.interests || []
  }), [existing])

  const current = useMemo(() => ({ name: name.trim(), faculty, interests }), [name, faculty, interests])
  const dirty = JSON.stringify(initial) !== JSON.stringify(current)

  function handleSave() {
    if (!valid) return
    saveUserPrefs(current)
    toast.success('Preferences saved.')
    nav('/feed')
  }

  function handleRevert() {
    setName(initial.name)
    setFaculty(initial.faculty)
    setInterests(initial.interests)
    toast.info('Reverted changes.')
  }

  function handleClearSaves() {
    clearAllSaves()
    toast.success('Cleared saved events and trending counts.')
  }

  function handleClearCustom() {
    clearCustomEvents()
    toast.success('Cleared your custom (published) events.')
  }

  function handleResetAll() {
    if (!confirm('This will clear preferences, saved events, trending counts, and custom events. Continue?')) return
    clearUserPrefs()
    clearAllSaves()
    clearCustomEvents()
    toast.success('All local data reset.')
    nav('/onboarding')
  }

  return (
    <div>
      <div className="h1">Settings</div>

      {!existing && (
        <Card className="space-bottom">
          <p className="muted">
            You haven’t set your preferences yet. You can set them here or go to{' '}
            <Link className="link" to="/onboarding">Onboarding</Link>.
          </p>
        </Card>
      )}

      <Card className="space-bottom">
        <div className="h2" style={{marginTop:0}}>Your profile</div>
        <input
          className="input"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {(!name.trim()) && <div style={{ color: 'var(--danger)', marginTop: 6 }}>Name is required.</div>}

        <div className="h2 space-top">Faculty</div>
        <div className="chips">
          {FACULTIES.map(f => (
            <Chip key={f} active={faculty === f} onClick={() => setFaculty(f)}>{f}</Chip>
          ))}
        </div>
        {(!faculty) && <div style={{ color: 'var(--danger)', marginTop: 6 }}>Pick a faculty.</div>}

        <div className="h2 space-top">Interests (pick 2–5)</div>
        <div className="chips">
          {INTERESTS.map(tag => (
            <Chip
              key={tag}
              active={interests.includes(tag)}
              onClick={() => toggleInterest(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
        {(interests.length < 2) && <div style={{ color: 'var(--danger)', marginTop: 6 }}>Pick at least 2 interests.</div>}

        <div className="row space-top">
          <Button kind="accent" disabled={!valid || !dirty} onClick={handleSave}>Save changes</Button>
          <Button kind="ghost" disabled={!dirty} onClick={handleRevert}>Revert</Button>
          <Link className="btn btn-ghost" to="/onboarding">Go to Onboarding</Link>
        </div>
      </Card>

      <Card>
        <div className="h2" style={{marginTop:0}}>Data management</div>
        <p className="muted">These actions affect only your browser’s local data.</p>
        <div className="row space-top">
          <Button kind="ghost" onClick={handleClearSaves}>Clear saved events + trending</Button>
          <Button kind="ghost" onClick={handleClearCustom}>Clear custom events</Button>
          <Button kind="primary" onClick={handleResetAll}>Reset everything</Button>
        </div>
      </Card>
    </div>
  )
}
