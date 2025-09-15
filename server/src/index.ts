import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { getAzureRss } from './rss.js'
import { analyzeReleaseWithOllama } from './ollama.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/rss', async (req, res) => {
  try {
    const items = await getAzureRss()
    res.json({ items })
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch RSS' })
  }
})

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { release, resourceTypes, model } = req.body || {}
    if (!release || !Array.isArray(resourceTypes)) {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    const matches = await analyzeReleaseWithOllama(release, resourceTypes, model)
    res.json({ matches })
  } catch (e) {
    res.status(502).json({ error: 'AI unavailable' })
  }
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')
app.use(express.static(publicDir))
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port)
