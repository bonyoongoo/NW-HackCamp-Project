const PREF_KEY = 'ubc:userprefs'
const SAVES_KEY = 'ubc:saves'

export function saveUserPrefs(prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
}

export function getUserPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || null } catch { return null }
}

export function getSavedIds() {
  try { return JSON.parse(localStorage.getItem(SAVES_KEY)) || [] } catch { return [] }
}

export function setSavedIds(ids) {
  localStorage.setItem(SAVES_KEY, JSON.stringify(ids))
}

export function toggleSaveId(id) {
  const current = getSavedIds()
  const has = current.includes(id)
  const next = has ? current.filter(x => x !== id) : [...current, id]
  setSavedIds(next)
  return !has
}
