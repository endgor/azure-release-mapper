import type { ReleaseItem } from './types'

function parseItems(data: any): ReleaseItem[] {
  const items = (data.items || []) as any[]
  return items.map(i => ({
    id: String(i.id ?? i.link ?? i.title ?? ''),
    title: String(i.title ?? ''),
    link: String(i.link ?? ''),
    published: String(i.published ?? ''),
    summary: String(i.summary ?? ''),
    categories: Array.isArray(i.categories) ? i.categories : []
  }))
}

export async function fetchRss(): Promise<ReleaseItem[]> {
  // Try the backend API first (works for local dev and Docker)
  try {
    const res = await fetch('/api/rss')
    if (res.ok) {
      const data = await res.json()
      return parseItems(data)
    }
  } catch {
    // API not available, fall through to static JSON
  }

  // Fall back to static JSON (for GitHub Pages)
  const res = await fetch(import.meta.env.BASE_URL + 'data/rss.json')
  if (!res.ok) throw new Error('Failed to fetch RSS data')
  const data = await res.json()
  return parseItems(data)
}
