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
  return (Array.isArray(list) ? list : []).map(e => {
    // Map public/events.json fields into the app's expected event shape.
    // - title: the display title used by UI
    // - description: (optional) summary / details
    // - tags: array of lowercase strings used for interest matching
    // - level: normalized difficulty -> beginner/intermediate/advanced
    // - start / end: ISO date strings used by calendar helpers
    // - url: external details link
    // - faculty: single string (first item or 'All')

    // Normalize tags from category array and include type as a tag
    const categories = Array.isArray(e.category) ? e.category : (e.category ? [e.category] : [])
    const normalizeTag = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const TAG_SYNONYMS = {
      'data science': ['data science','ai'],
      'ai': ['ai'],
      'software': ['swe'],
      'web': ['swe'],
      'entrepreneurship': ['entrepreneurship'],
      'business': ['business'],
      'finance': ['finance']
    }

    const baseCats = categories.map(normalizeTag).filter(Boolean)
    const typeTags = (e.type || '').toLowerCase().split('/').map(x => x.trim()).filter(Boolean)
    const tags = [...new Set([
      ...baseCats,
      ...typeTags,
      ...baseCats.flatMap(c => TAG_SYNONYMS[c] || []),
      ...typeTags.flatMap(c => TAG_SYNONYMS[c] || [])
    ])]

    // Map difficulty to level used by the UI
    const diff = String(e.difficulty || '').toLowerCase()
    const level = diff.includes('easy') ? 'beginner' : diff.includes('medium') ? 'intermediate' : diff.includes('hard') ? 'advanced' : undefined

    // Choose a faculty key: prefer an array first item, or string, else 'All'
    let faculty = 'All'
    if (Array.isArray(e.faculty) && e.faculty.length) faculty = e.faculty[0]
    else if (typeof e.faculty === 'string' && e.faculty.trim()) faculty = e.faculty

    // Build a small description if original missing
    const description = e.description || [e.type, e.price ? `Price: ${e.price}` : null, e.applicationDeadline ? `Apply by ${e.applicationDeadline}` : null].filter(Boolean).join(' · ')

    return {
      // fallback id first, then keep original id
      id: e.id ?? String(Math.random()).slice(2),
      title: e.name || e.title || 'Untitled Event',
      description,
      organizer: e.organizer || undefined,
      faculty,
      level,
      tags,
      start: e.date || e.start || undefined,
      end: e.end || undefined,
      location: e.location || undefined,
      url: e.link || e.url || undefined,
      image: e.image || undefined,
      // keep original fields for reference
      raw: e
    }
  })
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
