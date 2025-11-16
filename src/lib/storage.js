// src/lib/storage.js

const PREF_KEY = 'ubc:userprefs'
const SAVES_KEY = 'ubc:saves'
const SAVE_COUNTS_KEY = 'ubc:saveCounts' // map: { [eventId]: number }

/* ---------- User preferences ---------- */
export function saveUserPrefs(prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
}
export function getUserPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || null } catch { return null }
}
export function clearUserPrefs() {
  localStorage.removeItem(PREF_KEY)
}

/* ---------- Saved events (IDs) ---------- */
export function getSavedIds() {
  try { return JSON.parse(localStorage.getItem(SAVES_KEY)) || [] } catch { return [] }
}
export function setSavedIds(ids) {
  localStorage.setItem(SAVES_KEY, JSON.stringify(ids))
}
export function clearSavedIds() {
  localStorage.removeItem(SAVES_KEY)
}

/* ---------- Save counts (for Trending) ---------- */
export function getSaveCounts() {
  try { return JSON.parse(localStorage.getItem(SAVE_COUNTS_KEY)) || {} } catch { return {} }
}
function setSaveCounts(map) {
  localStorage.setItem(SAVE_COUNTS_KEY, JSON.stringify(map))
}
export function clearSaveCounts() {
  localStorage.removeItem(SAVE_COUNTS_KEY)
}
function adjustSaveCount(id, delta) {
  const counts = getSaveCounts()
  const next = Math.max(0, (counts[id] || 0) + delta)
  if (next === 0) delete counts[id]
  else counts[id] = next
  setSaveCounts(counts)
  return next
}

/* Toggle save; also update counts so we can rank Trending */
export function toggleSaveId(id) {
  const current = getSavedIds()
  const has = current.includes(id)
  const next = has ? current.filter(x => x !== id) : [...current, id]
  setSavedIds(next)
  adjustSaveCount(id, has ? -1 : +1)
  return !has
}

/* Convenience: wipe both saved ids and counts */
export function clearAllSaves() {
  clearSavedIds()
  clearSaveCounts()
}
