export async function loadEvents() {
    const res = await fetch('/events.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load events.json')
    const data = await res.json()
    return (data || []).map(e => ({
      id: e.id || crypto.randomUUID(),
      title: e.title || 'Untitled Event',
      description: e.description || '',
      faculty: e.faculty || 'All',
      tags: Array.isArray(e.tags) ? e.tags : [],
      level: e.level || 'beginner',
      start: e.start,
      end: e.end,
      location: e.location || 'TBA',
      url: e.url || '',
      organizer: e.organizer || 'Unknown'
    }))
  }
  