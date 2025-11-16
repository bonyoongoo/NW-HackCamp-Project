// src/lib/data.js
// Data helpers for loading events (from public/events.json) and merging with custom events.

import { getCustomEvents } from './custom.js'

/**
 * Load events bundled in the app (public/events.json).
 * Returns an array of event objects.
 */
export async function loadEvents() {
  const res = await fetch('/events.json', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load events.json')
  const list = await res.json()
  // Normalize minimal shape
  return (Array.isArray(list) ? list : []).map(e => ({
    ...e,
    id: e.id ?? String(Math.random()).slice(2) // ensure id exists
  }))
}

/** Merge custom events (localStorage) with file events (custom first). */
export async function getAllEventsMerged() {
  const fileEvents = await loadEvents().catch(() => [])
  const custom = getCustomEvents()
  return [...custom, ...fileEvents]
}

/** Find a single event by ID across both sources, or return null. */
export async function getEventById(id) {
  const all = await getAllEventsMerged()
  return all.find(e => String(e.id) === String(id)) || null
}
