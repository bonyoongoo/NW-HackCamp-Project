// src/lib/calendar.js

/* Pads numbers to 2 digits (e.g., 7 -> "07") */
function pad(n) { return String(n).padStart(2, '0'); }

/* Convert a date-like value to an ICS-friendly UTC string: YYYYMMDDTHHMMSSZ */
function toICSDate(d) {
  const dt = new Date(d);
  const yyyy = dt.getUTCFullYear();
  const mm   = pad(dt.getUTCMonth() + 1);
  const dd   = pad(dt.getUTCDate());
  const hh   = pad(dt.getUTCHours());
  const mi   = pad(dt.getUTCMinutes());
  const ss   = pad(dt.getUTCSeconds());
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

/* Escape characters that ICS requires */
function escapeICS(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\') // backslash
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/* Build a Google Calendar URL (prefilled) for an event */
export function googleCalendarUrl(evt) {
  if (!evt?.start) return '#';
  const start = toICSDate(evt.start);
  const end = toICSDate(evt.end || (new Date(new Date(evt.start).getTime() + 60 * 60 * 1000))); // +1h default

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evt.title || 'Event',
    dates: `${start}/${end}`,
    details: evt.url || evt.description || '',
    location: evt.location || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* Build the full .ics file contents */
export function buildICS(evt) {
  if (!evt?.start) throw new Error('This event is missing a start time.');
  const dtStart = toICSDate(evt.start);
  const dtEnd   = toICSDate(evt.end || (new Date(new Date(evt.start).getTime() + 60 * 60 * 1000)));
  const now     = toICSDate(new Date());
  const uid     = evt.id || (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));

  const title = escapeICS(evt.title || 'Event');
  const desc  = escapeICS(evt.url || evt.description || '');
  const loc   = escapeICS(evt.location || '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UBC Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
}

/* Trigger a download of the .ics file in the browser */
export function downloadICS(evt) {
  try {
    const ics = buildICS(evt);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const slug = (evt.title || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    a.href = url;
    a.download = `${slug || 'event'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) {
    alert(e.message || 'Unable to generate calendar invite.');
  }
}
