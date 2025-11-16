import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Chip from '../components/Chip.jsx';
import Button from '../components/Button.jsx';
import { getUserPrefs, saveUserPrefs } from '../lib/storage.js'
import { useEffect } from 'react'


const FACULTIES = ['Sauder', 'Engineering', 'Science'];
const INTERESTS = ['ai','finance','swe','entrepreneurship'];

export default function Onboarding() {
  const nav = useNavigate();
  // Local UI state only (we will wire saving in Step 5)
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [interests, setInterests] = useState([]);
  const [touched, setTouched] = useState({ name:false, faculty:false, interests:false });

  function toggleInterest(tag) {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const valid = name.trim().length > 0 && faculty && interests.length >= 2;

  function handleContinue() {
    if (!valid) return
    saveUserPrefs({ name: name.trim(), faculty, interests })
    nav('/feed')
  }

  useEffect(() => {
    const existing = getUserPrefs()
    if (existing) {
      setName(existing.name || '')
      setFaculty(existing.faculty || '')
      setInterests(existing.interests || [])
    }
  }, [])
  

  return (
    <div>
      <div className="h1">Personalize your feed 🎯</div>

      <Card className="space-bottom">
        {/* Name */}
        <div className="h2">Your name</div>
        <input
          className="input"
          placeholder="e.g., Alex"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
        />
        {touched.name && !name.trim() && (
          <div style={{ color: 'var(--danger)', marginTop: 6 }}>
            Name is required.
          </div>
        )}

        {/* Faculty chips */}
        <div className="h2 space-top">Your faculty</div>
        <div className="chips">
          {FACULTIES.map(f => (
            <Chip key={f} active={faculty === f} onClick={() => setFaculty(f)}>{f}</Chip>
          ))}
        </div>
        {touched.faculty && !faculty && (
          <div style={{ color: 'var(--danger)', marginTop: 6 }}>
            Pick a faculty.
          </div>
        )}

        {/* Interests chips */}
        <div className="h2 space-top">Pick 2–5 interests</div>
        <div className="chips">
          {INTERESTS.map(tag => (
            <Chip
              key={tag}
              active={interests.includes(tag)}
              onClick={() => setInterests(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
              )}
            >
              {tag}
            </Chip>
          ))}
        </div>
        {touched.interests && interests.length < 2 && (
          <div style={{ color: 'var(--danger)', marginTop: 6 }}>
            Pick at least 2 interests.
          </div>
        )}

        {/* Actions */}
        <div className="row space-top">
          <Button
            // Judges gravitate to a warm accent for “commit” actions
            kind="accent"
            disabled={!valid}
            onClick={() => {
              // mark all as touched to show any missing errors
              setTouched({ name: true, faculty: true, interests: true });
              handleContinue();
            }}
          >
            Save & Continue
          </Button>

          <Button
            kind="ghost"
            onClick={() => {
              setName('');
              setFaculty('');
              setInterests([]);
              setTouched({ name:false, faculty:false, interests:false });
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card>
        <div className="h2" style={{ marginTop: 0 }}>What you'll get</div>
        <p className="muted">
          A personalized event feed for <strong>{faculty || 'your faculty'}</strong>
          {' '}with interests in <strong>{interests.length ? interests.join(', ') : 'your picks'}</strong>.
          Save events and add them to your calendar in one click.
        </p>
      </Card>
    </div>
  );
}
