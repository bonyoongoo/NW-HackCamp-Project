// server/index.js  (ESM)
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const PORT = Number(process.env.PORT || 8787)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// DEBUG: log every request so we SEE what hits this server
app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.url}`)
  next()
})

// Root: proves the API server you’re hitting is THIS file
app.get('/', (_req, res) => {
  res.type('text').send('API server is running. Try GET /api/health')
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(OPENAI_API_KEY),
    model: OPENAI_MODEL,
    envLoaded: Boolean(process.env.OPENAI_API_KEY)
  })
})

// AI summarize endpoint
app.post('/api/ai/summarize', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(400).json({ error: 'Missing OPENAI_API_KEY in .env' })
    }
    const { title = '', description = '' } = req.body || {}
    if (!title && !description) {
      return res.status(400).json({ error: 'Provide title or description' })
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY })
    const prompt = `
You are helping a student events platform. Given the raw event text, return a compact JSON object with:
- summary: 2–3 sentence plain-English summary (no newlines)
- tags: 3–6 lowercase tags (e.g., ai, data science, swe, entrepreneurship, finance, security, robotics, sustainability, health, law, education, quantum, game dev, bioengineering, ux)
- level: one of "beginner", "intermediate", or "advanced"
- missing: array of any missing fields from: ["date", "location", "link", "organizer"]

Event Title: ${title}
Event Description: ${description}

Return ONLY JSON like:
{"summary":"...","tags":["..."],"level":"beginner","missing":["date","link"]}
`.trim()

    const resp = await client.responses.create({
      model: OPENAI_MODEL,
      input: prompt,
      temperature: 0.3
    })

    const text =
      resp?.output_text ||
      resp?.output?.[0]?.content?.[0]?.text ||
      resp?.content?.[0]?.text ||
      resp?.choices?.[0]?.message?.content ||
      ''

    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = {
        summary: (text || '').replace(/\s+/g, ' ').slice(0, 280),
        tags: ['event'],
        level: 'beginner',
        missing: []
      }
    }

    if (!Array.isArray(data.tags)) data.tags = []
    data.tags = data.tags.map(s => String(s).toLowerCase().trim()).slice(0, 8)
    const lvl = String(data.level || '').toLowerCase()
    if (!['beginner','intermediate','advanced'].includes(lvl)) data.level = 'beginner'
    if (!Array.isArray(data.missing)) data.missing = []

    res.json(data)
  } catch (err) {
    console.error('AI error:', err)
    res.status(500).json({ error: 'AI summarize failed' })
  }
})

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: `No route ${req.method} ${req.path}` })
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
