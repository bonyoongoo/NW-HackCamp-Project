// src/lib/custom.js
const KEY = 'ubc:customEvents';

export function getCustomEvents() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function saveCustomEvents(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addCustomEvent(evt) {
  // Ensure a stable ID + mark as custom
  const id = evt.id && !String(evt.id).startsWith('preview_')
    ? evt.id
    : 'cust_' + (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));

  const withMeta = {
    ...evt,
    id,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  const list = getCustomEvents();
  list.push(withMeta);
  saveCustomEvents(list);
  return withMeta;
}

export function removeCustomEvent(id) {
  const next = getCustomEvents().filter(e => e.id !== id);
  saveCustomEvents(next);
}

export function clearCustomEvents() { // optional helper for debugging
  saveCustomEvents([]);
}
