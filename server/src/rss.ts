import Parser from 'rss-parser'

const parser = new Parser({ timeout: 15000 })

type Cache = { ts: number; items: any[] } | null
let cache: Cache = null

export async function getAzureRss(): Promise<any[]> {
  const now = Date.now()
  if (cache && now - cache.ts < 15 * 60_000) {
    return cache.items
  }
  const feed = await parser.parseURL('https://www.microsoft.com/releasecommunications/api/v2/azure/rss')
  const items = (feed.items || []).map(i => ({
    id: (i.guid || i.link || i.title) ?? '',
    title: i.title ?? '',
    link: i.link ?? '',
    published: (i.isoDate || i.pubDate || '') ?? '',
    summary: String((i.contentSnippet || i.content || '')),
    categories: i.categories || []
  }))
  cache = { ts: now, items }
  return items
}

