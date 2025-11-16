// src/pages/Pitch.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toaster.jsx'
import { loadEvents } from '../lib/data.js'
import { addCustomEvent, getCustomEvents } from '../lib/custom.js'
import {
  saveUserPrefs,
  clearAllSaves,
  setSavedIds,
  getUserPrefs
} from '../lib/storage.js'

/**
 * Pitch Mode seeds:
 * - A demo profile (if none).
 * - One polished custom event (future date).
 * - Trending counts for a few events (so the strip looks alive).
 * - Marks a couple as "Saved" for visual cues.
 * Then navigates to /feed.
 */
export default function Pitch() {
  const nav = useNavigate()
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        toast.info('Setting up pitch mode…')

        // 1) Ensure a demo profile exists (don’t overwrite existing user)
        const existing = getUserPrefs()
        if (!existing) {
          saveUserPrefs({
            name: 'UBC Demo',
            faculty: 'Engineering',
            interests: ['ai', 'swe', 'entrepreneurship']
          })
        }

        // 2) Load events (file + any existing custom)
        const fileEvents = await loadEvents().catch(() => [])
        const existingCustom = getCustomEvents()
        let all = [...existingCustom, ...fileEvents]

        // 3) Add a crisp custom event (future date) if not already present
        const hasHero = all.some(e => e.id === 'cust_pitch_hero')
        if (!hasHero) {
          const start = new Date()
          start.setDate(start.getDate() + 3)
          start.setHours(18, 0, 0, 0)
          const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

          const hero = addCustomEvent({
            id: 'cust_pitch_hero',
            title: 'UBC AI × SWE: Launchpad Night',
            description:
              'Lightning talks + hands-on tables on building AI apps with React, APIs, and prompt design. Teams welcome. Pizza and mentors provided.',
            faculty: 'Engineering',
            tags: ['ai', 'swe', 'networking'],
            level: 'beginner',
            start: start.toISOString(),
            end: end.toISOString(),
            location: 'ICICS X350',
            url: 'https://example.com/register',
            organizer: 'UBC AI Club'
          })

          all = [hero, ...all]
        }

        // 4) Seed "Trending" saveCounts directly for a few visible events
        // Trending reads from localStorage key below:
        const SAVE_COUNTS_KEY = 'ubc:saveCounts'
        const counts = {}

        // Make sure we have at least a few event IDs to boost
        const idsToBoost = []
        for (const e of all) {
          if (!e.start) continue
          // Pick events that are likely to pass Engineering + ai/swe/entrepreneurship filters
          const tags = (e.tags || []).map(t => String(t).toLowerCase())
          const passesInterests = tags.some(t => ['ai','swe','entrepreneurship'].includes(t))
          const future = new Date(e.start).getTime() >= Date.now() - 60*60*1000
          const facultyOk = !e.faculty || e.faculty === 'All' || e.faculty === 'Engineering'
          if (passesInterests && future && facultyOk) {
            idsToBoost.push(e.id)
          }
          if (idsToBoost.length >= 3) break
        }

        // Always include the hero event first
        if (!idsToBoost.includes('cust_pitch_hero')) {
          idsToBoost.unshift('cust_pitch_hero')
        }

        // Assign descending counts to make a nice ranking
        const demoCounts = [15, 9, 6, 4, 3]
        idsToBoost.slice(0, demoCounts.length).forEach((id, i) => {
          counts[id] = demoCounts[i]
        })
        localStorage.setItem(SAVE_COUNTS_KEY, JSON.stringify(counts))

        // 5) Reset "Saved" and mark a couple so cards show Saved ✓
        clearAllSaves()
        const toSave = idsToBoost.slice(0, 2) // mark top 2 as saved
        setSavedIds(toSave)

        toast.success('Pitch mode is ready. Opening Feed…', { timeout: 1200 })
      } catch (e) {
        console.error(e)
        toast.error('Pitch setup failed, but the app still works.')
      } finally {
        // Give the toast a moment to show, then go
        setTimeout(() => nav('/feed'), 400)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Minimal placeholder while we seed
  return (
    <div>
      <div className="h1">Pitch Mode</div>
      <p className="muted">Seeding demo profile, trending counts, and a custom highlight…</p>
      <div className="panel" style={{marginTop:12}}>
        <div className="h2" style={{marginTop:0}}>What this does</div>
        <ul style={{margin:0, paddingLeft:18, lineHeight:1.6}}>
          <li>Creates a demo profile (if none)</li>
          <li>Adds a highlight event and boosts trending</li>
          <li>Marks a couple items as Saved ✓</li>
          <li>Navigates to your Feed</li>
        </ul>
      </div>
    </div>
  )
}
