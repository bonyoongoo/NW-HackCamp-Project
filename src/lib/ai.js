// src/lib/ai.js
// Simple client-side heuristics to simulate "AI Summarize & Tag"

const TAG_KEYWORDS = {
    ai: ['ai','artificial intelligence','machine learning','ml','llm','prompt','gpt','computer vision','nlp','deep learning'],
    finance: ['finance','fintech','investment','stocks','trading','portfolio','quant','valuation'],
    swe: ['software','coding','programming','developer','engineer','web','app','fullstack','frontend','backend','react','python','javascript','typescript','api'],
    entrepreneurship: ['startup','founder','pitch','vc','accelerator','incubator','entrepreneurship','ideation'],
    workshop: ['workshop','hands-on','tutorial','lab','bootcamp'],
    hackathon: ['hackathon','hackcamp','code sprint','coding marathon'],
    networking: ['networking','mixer','meet and greet','coffee chat']
  };
  
  const LEVEL_HINTS = {
    beginner: ['intro','101','no experience','all levels','getting started','basics','for everyone','new to'],
    intermediate: ['intermediate','some experience','prior experience','prerequisite','familiar with'],
    advanced: ['advanced','deep dive','graduate','research','theory-heavy','rigorous']
  };
  
  export function summarize(text = '', maxSentences = 2) {
    // crude sentence split + pick the first 1-2 meaningful lines
    const sentences = text
      .replace(/\s+/g,' ')
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  
    if (sentences.length === 0) return 'No description provided.';
    return sentences.slice(0, maxSentences).join(' ');
  }
  
  export function suggestTags(text = '', max = 5) {
    const t = text.toLowerCase();
    const scores = {};
    for (const [tag, words] of Object.entries(TAG_KEYWORDS)) {
      scores[tag] = words.reduce((sum, w) => sum + (t.includes(w) ? 1 : 0), 0);
    }
    // sort by score desc, then name
    const ranked = Object.entries(scores)
      .sort((a,b) => (b[1]-a[1]) || a[0].localeCompare(b[0]))
      .map(([tag]) => tag)
      .filter(tag => scores[tag] > 0);
    // prioritize core interests first
    const core = ['ai','finance','swe','entrepreneurship'];
    const eventTypes = ['workshop','hackathon','networking'];
    const pick = [
      ...ranked.filter(t => core.includes(t)),
      ...ranked.filter(t => eventTypes.includes(t)),
      ...ranked.filter(t => !core.includes(t) && !eventTypes.includes(t))
    ];
    // unique + limit
    return [...new Set(pick)].slice(0, max);
  }
  
  export function detectLevel(text = '') {
    const t = text.toLowerCase();
    const has = (arr) => arr.some(k => t.includes(k));
    if (has(LEVEL_HINTS.advanced)) return 'advanced';
    if (has(LEVEL_HINTS.intermediate)) return 'intermediate';
    if (has(LEVEL_HINTS.beginner)) return 'beginner';
    // default optimistic for hackathon demos
    return 'beginner';
  }
  
  export function findMissingFields(evt) {
    // minimal required set for a clean submission
    const missing = [];
    if (!evt.title?.trim()) missing.push('title');
    if (!evt.description?.trim()) missing.push('description');
    if (!evt.start) missing.push('start');
    if (!evt.location?.trim()) missing.push('location');
    if (!evt.faculty?.trim()) missing.push('faculty');
    if (!evt.level?.trim()) missing.push('level');
    if (!evt.tags || evt.tags.length === 0) missing.push('tags');
    return missing;
  }
  