import express from 'express'
import cors from 'cors'
import { getAzureRss } from './rss'

const app = express()
app.use(cors())

app.get('/api/rss', async (req, res) => {
  try {
    const items = await getAzureRss()
    res.json({ items })
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch RSS' })
  }
})

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

